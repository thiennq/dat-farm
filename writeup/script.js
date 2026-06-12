// Configure marked to render code blocks with syntax highlighting
marked.setOptions({
    highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(code, { language: lang }).value;
            } catch (__) {}
        }
        return code;
    }
});

class WriteupDashboard {
    constructor(options = {}) {
        this.configPath = options.configPath || 'config.json';
        this.config = null;
        this.activeScrollspyListener = null;
    }

    async init() {
        try {
            const response = await fetch(this.configPath);
            if (!response.ok) {
                throw new Error(`Failed to fetch config from ${this.configPath}`);
            }
            this.config = await response.json();
            
            this.applyTheme();
            this.applyHeaderInfo();
            this.initSidebarToggles();
            this.renderFileTree();
            
        } catch (error) {
            console.error("Dashboard initialization error:", error);
            const viewer = document.getElementById('doc-viewer');
            if (viewer) {
                viewer.innerHTML = `
                    <div style="color: #ef4444; padding: 20px; border: 1px solid rgba(239, 68, 68, 0.2); background-color: rgba(239, 68, 68, 0.05); border-radius: 8px;">
                        <h3>⚠️ Error Initializing Dashboard</h3>
                        <p>${error.message}</p>
                    </div>
                `;
            }
        }
    }

    applyTheme() {
        if (this.config.theme) {
            const root = document.documentElement;
            for (const [key, value] of Object.entries(this.config.theme)) {
                root.style.setProperty(`--${key}`, value);
            }
        }
    }

    applyHeaderInfo() {
        const logoEl = document.querySelector('.sidebar-logo span');
        if (logoEl && this.config.logo && this.config.title) {
            logoEl.innerHTML = `${this.config.logo} ${this.config.title}`;
        }
        const subtitleEl = document.querySelector('.sidebar-subtitle');
        if (subtitleEl && this.config.subtitle) {
            subtitleEl.innerText = this.config.subtitle;
        }
    }

    initSidebarToggles() {
        const menuToggle = document.getElementById('menu-toggle');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebar-overlay');

        if (menuToggle && sidebar && overlay) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
                overlay.classList.toggle('active');
            });

            overlay.addEventListener('click', () => {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
            });
        }
    }

    renderFileTree() {
        const treeContainer = document.getElementById('file-tree');
        if (treeContainer && this.config.fileTree) {
            treeContainer.innerHTML = '';
            this.createTreeDOM(this.config.fileTree, treeContainer);
        }
    }

    createTreeDOM(nodes, container) {
        nodes.forEach(node => {
            const nodeEl = document.createElement('div');
            nodeEl.className = 'tree-node';

            const rowEl = document.createElement('div');
            rowEl.className = 'tree-row';
            
            const arrowSpan = document.createElement('span');
            const defaultExpanded = this.config.defaultExpanded !== false;
            
            arrowSpan.className = 'arrow-icon' + (node.type === 'directory' && defaultExpanded ? ' open' : '');
            arrowSpan.innerHTML = node.type === 'directory' ? (defaultExpanded ? '▾' : '▸') : '';
            rowEl.appendChild(arrowSpan);

            const iconSpan = document.createElement('span');
            iconSpan.className = node.type === 'directory' ? 'dir-icon' : 'file-icon';
            iconSpan.innerHTML = node.type === 'directory' ? '📁' : '📄';
            rowEl.appendChild(iconSpan);

            const nameSpan = document.createElement('span');
            nameSpan.className = 'node-name';
            nameSpan.innerText = node.name;
            rowEl.appendChild(nameSpan);

            nodeEl.appendChild(rowEl);

            if (node.type === 'directory') {
                const childrenContainer = document.createElement('div');
                childrenContainer.className = 'tree-children' + (defaultExpanded ? ' open' : '');
                
                if (node.children && node.children.length > 0) {
                    this.createTreeDOM(node.children, childrenContainer);
                } else {
                    const emptyEl = document.createElement('div');
                    emptyEl.className = 'tree-row';
                    emptyEl.style.color = 'var(--text-muted)';
                    emptyEl.style.fontSize = '12px';
                    emptyEl.innerHTML = '<span class="arrow-icon"></span><span></span><i>(empty)</i>';
                    childrenContainer.appendChild(emptyEl);
                }
                nodeEl.appendChild(childrenContainer);

                // Toggle Expand/Collapse
                rowEl.addEventListener('click', (e) => {
                    const isOpen = childrenContainer.classList.toggle('open');
                    arrowSpan.innerHTML = isOpen ? '▾' : '▸';
                    arrowSpan.classList.toggle('open', isOpen);
                });
            } else if (node.type === 'file') {
                rowEl.addEventListener('click', (e) => {
                    // Clear active states
                    document.querySelectorAll('.tree-row').forEach(el => el.classList.remove('active'));
                    rowEl.classList.add('active');
                    this.loadFileContent(node);
                    
                    // Hide sidebar on mobile
                    const sidebar = document.getElementById('sidebar');
                    const overlay = document.getElementById('sidebar-overlay');
                    if (sidebar) sidebar.classList.remove('active');
                    if (overlay) overlay.classList.remove('active');
                });
            }

            container.appendChild(nodeEl);
        });
    }

    async loadFileContent(fileNode) {
        const viewer = document.getElementById('doc-viewer');
        const loader = document.getElementById('loader');
        const pathLabel = document.getElementById('active-path');
        const viewerPane = document.getElementById('viewer-pane');
        const timelineContainer = document.getElementById('timeline-container');

        if (viewerPane) {
            viewerPane.scrollTop = 0;
        }

        // Clear URL hash to prevent automatic scrolling
        if (window.location.hash) {
            history.replaceState(null, null, ' ');
        }

        // Show loading indicator
        viewer.style.display = 'none';
        loader.style.display = 'block';
        pathLabel.innerText = fileNode.path;

        try {
            const response = await fetch(fileNode.path);
            if (!response.ok) {
                throw new Error(`Failed to load ${fileNode.name}`);
            }
            const text = await response.text();
            
            // Parse Frontmatter
            const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
            const match = text.match(frontmatterRegex);
            let htmlContent = "";
            
            if (match) {
                const rawYaml = match[1];
                const markdownBody = text.slice(match[0].length);
                
                // Parse simple key-values
                const lines = rawYaml.split('\n');
                const metadata = {};
                lines.forEach(line => {
                    const idx = line.indexOf(':');
                    if (idx !== -1) {
                        const key = line.slice(0, idx).trim();
                        let value = line.slice(idx + 1).trim();
                        if (value.startsWith('"') && value.endsWith('"')) {
                            value = value.slice(1, -1);
                        } else if (value.startsWith("'") && value.endsWith("'")) {
                            value = value.slice(1, -1);
                        }
                        metadata[key] = value;
                    }
                });
                
                // Render frontmatter nicely
                let metadataHtml = '<div class="metadata-card">';
                for (const [key, val] of Object.entries(metadata)) {
                    metadataHtml += `
                        <div class="metadata-row">
                            <span class="metadata-key">${key}:</span>
                            <span class="metadata-value">${val}</span>
                        </div>`;
                }
                metadataHtml += '</div>';
                
                htmlContent = metadataHtml + marked.parse(markdownBody);
            } else {
                htmlContent = marked.parse(text);
            }
            
            viewer.innerHTML = htmlContent;
            
            // Collapsible turns for chat logs
            const isCollapsibleFile = fileNode.name === (this.config.collapsibleFile || 'chatlog.md');
            if (isCollapsibleFile) {
                this.makeSectionsCollapsible(viewer);
            }
            
            // Count user questions and build timeline
            const userHeaders = Array.from(viewer.querySelectorAll('h2')).filter(h2 => h2.innerText.includes('User'));
            
            if (userHeaders.length > 0) {
                timelineContainer.style.display = 'flex';
                let navHtml = '<div class="timeline-nav">';
                userHeaders.forEach((header, index) => {
                    const qId = `q${index + 1}`;
                    header.id = qId;
                    if (index > 0) {
                        navHtml += `<span class="timeline-line" id="line-${qId}"></span>`;
                    }
                    navHtml += `<a href="#${qId}" class="timeline-step" id="step-${qId}" data-target="${qId}">${index + 1}</a>`;
                });
                navHtml += '</div>';
                timelineContainer.innerHTML = navHtml;
                
                // Add click events for smooth scroll
                timelineContainer.querySelectorAll('.timeline-step').forEach(step => {
                    step.addEventListener('click', (e) => {
                        e.preventDefault();
                        const targetId = step.getAttribute('data-target');
                        const targetEl = document.getElementById(targetId);
                        if (targetEl) {
                            const relativeTop = targetEl.getBoundingClientRect().top - viewerPane.getBoundingClientRect().top + viewerPane.scrollTop;
                            const topOffset = relativeTop - 20;
                            viewerPane.scrollTo({
                                top: topOffset,
                                behavior: 'smooth'
                            });
                            history.replaceState(null, null, '#' + targetId);
                            this.updateActiveStep(targetId);
                        }
                    });
                });
                
                // Hide loader and show viewer so offsetTop values are computed correctly
                loader.style.display = 'none';
                viewer.style.display = 'block';
                
                this.setupScrollspy(userHeaders);
            } else {
                timelineContainer.style.display = 'none';
                timelineContainer.innerHTML = '';
                
                // Hide loader and show viewer
                loader.style.display = 'none';
                viewer.style.display = 'block';
            }
            
            // Apply syntax highlight
            viewer.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
            
        } catch (error) {
            viewer.innerHTML = `
                <div style="color: #ef4444; padding: 20px; border: 1px solid rgba(239, 68, 68, 0.2); background-color: rgba(239, 68, 68, 0.05); border-radius: 8px;">
                    <h3>⚠️ Error Loading File</h3>
                    <p>${error.message}</p>
                </div>
            `;
            loader.style.display = 'none';
            viewer.style.display = 'block';
        }
    }

    makeSectionsCollapsible(viewer) {
        const children = Array.from(viewer.children);
        let currentContainer = null;
        
        children.forEach(child => {
            if (child.tagName === 'H2') {
                currentContainer = null;
                
                if (child.innerText.includes('Antigravity')) {
                    child.classList.add('collapsible-header');
                    child.innerHTML = `<span class="collapse-toggle-icon">▾</span> ` + child.innerHTML;
                    
                    currentContainer = document.createElement('div');
                    currentContainer.className = 'collapsible-section open';
                    child.parentNode.insertBefore(currentContainer, child.nextSibling);
                    
                    const targetContainer = currentContainer;
                    child.addEventListener('click', () => {
                        const isOpen = targetContainer.classList.toggle('open');
                        child.querySelector('.collapse-toggle-icon').innerText = isOpen ? '▾' : '▸';
                        child.classList.toggle('collapsed', !isOpen);
                    });
                }
            } else if (currentContainer && child.className !== 'collapsible-section') {
                currentContainer.appendChild(child);
            }
        });
    }

    setupScrollspy(questions) {
        const viewerPane = document.getElementById('viewer-pane');
        
        if (this.activeScrollspyListener) {
            viewerPane.removeEventListener('scroll', this.activeScrollspyListener);
        }
        
        const getOffsets = () => {
            return questions.map(header => ({
                id: header.id,
                top: header.getBoundingClientRect().top - viewerPane.getBoundingClientRect().top + viewerPane.scrollTop
            }));
        };
        
        let questionOffsets = getOffsets();
        
        window.addEventListener('resize', () => {
            questionOffsets = getOffsets();
        });
        
        this.activeScrollspyListener = () => {
            const scrollTop = viewerPane.scrollTop;
            let currentQId = null;
            
            if (scrollTop < 15) {
                currentQId = 'q1';
                this.updateActiveStep(currentQId);
                if (window.location.hash !== '') {
                    history.replaceState(null, null, ' ');
                }
                return;
            }
            
            const scrollPos = scrollTop + 30;
            for (let i = 0; i < questionOffsets.length; i++) {
                const item = questionOffsets[i];
                if (scrollPos >= item.top) {
                    currentQId = item.id;
                } else {
                    break;
                }
            }
            
            if (!currentQId && questions.length > 0) {
                currentQId = questions[0].id;
            }
            
            if (currentQId) {
                this.updateActiveStep(currentQId);
                
                if (window.location.hash !== '#' + currentQId) {
                    history.replaceState(null, null, '#' + currentQId);
                }
            }
        };
        
        viewerPane.addEventListener('scroll', this.activeScrollspyListener);
        this.activeScrollspyListener();
    }

    updateActiveStep(activeId) {
        const stepElements = document.querySelectorAll('.timeline-step');
        const lineElements = document.querySelectorAll('.timeline-line');
        
        stepElements.forEach(step => {
            const target = step.getAttribute('data-target');
            if (target === activeId) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
        
        lineElements.forEach(line => {
            const nextStepId = line.id.replace('line-', '');
            const nextStepNum = parseInt(nextStepId.replace('q', ''));
            const activeNum = parseInt(activeId.replace('q', ''));
            if (nextStepNum <= activeNum) {
                line.classList.add('active');
            } else {
                line.classList.remove('active');
            }
        });
    }
}

// Export the class globally so index.html can initialize it
window.WriteupDashboard = WriteupDashboard;
