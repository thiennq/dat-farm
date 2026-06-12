// File Tree Structure Definition
const fileTreeData = [
    {
        name: "chatlog.md",
        type: "file",
        path: "md/chatlog.md"
    },
    {
        name: "tasks",
        type: "directory",
        children: [
            {
                name: "backlog",
                type: "directory",
                children: [] // empty
            },
            {
                name: "done",
                type: "directory",
                children: [
                    {
                        name: "2026-06-12-01-setup-project-and-assets.md",
                        type: "file",
                        path: "md/tasks/done/2026-06-12-01-setup-project-and-assets.md"
                    },
                    {
                        name: "2026-06-12-02-create-tilemap-and-player.md",
                        type: "file",
                        path: "md/tasks/done/2026-06-12-02-create-tilemap-and-player.md"
                    },
                    {
                        name: "2026-06-12-03-add-farm-animals-animations.md",
                        type: "file",
                        path: "md/tasks/done/2026-06-12-03-add-farm-animals-animations.md"
                    }
                ]
            }
        ]
    }
];

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

// Render the tree DOM
function createTreeDOM(nodes, container) {
    nodes.forEach(node => {
        const nodeEl = document.createElement('div');
        nodeEl.className = 'tree-node';

        const rowEl = document.createElement('div');
        rowEl.className = 'tree-row';
        
        const arrowSpan = document.createElement('span');
        arrowSpan.className = 'arrow-icon' + (node.type === 'directory' ? ' open' : '');
        arrowSpan.innerHTML = node.type === 'directory' ? '▾' : '';
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
            childrenContainer.className = 'tree-children open';
            
            if (node.children && node.children.length > 0) {
                createTreeDOM(node.children, childrenContainer);
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
                loadFileContent(node);
                
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

// Load markdown content and parse it
async function loadFileContent(fileNode) {
    const viewer = document.getElementById('doc-viewer');
    const loader = document.getElementById('loader');
    const pathLabel = document.getElementById('active-path');
    const badge = document.getElementById('file-type-badge');

    // Show loading indicator
    viewer.style.display = 'none';
    loader.style.display = 'block';
    pathLabel.innerText = fileNode.path;
    badge.innerText = fileNode.name.endsWith('.md') ? 'MARKDOWN' : 'FILE';

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
                    // Strip quotes or brackets if present
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
        
        if (fileNode.name === 'chatlog.md') {
            makeSectionsCollapsible(viewer);
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
    } finally {
        loader.style.display = 'none';
        viewer.style.display = 'block';
    }
}

// Initialize tree
document.addEventListener('DOMContentLoaded', () => {
    const treeContainer = document.getElementById('file-tree');
    createTreeDOM(fileTreeData, treeContainer);

    // Mobile Sidebar Toggles
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
});

// Helper to group everything under ## Antigravity into collapsible containers
function makeSectionsCollapsible(viewer) {
    const children = Array.from(viewer.children);
    let currentContainer = null;
    
    children.forEach(child => {
        if (child.tagName === 'H2') {
            // Stop grouping if we hit any H2
            currentContainer = null;
            
            if (child.innerText.includes('Antigravity')) {
                // Style the header as collapsible
                child.classList.add('collapsible-header');
                child.innerHTML = `<span class="collapse-toggle-icon">▾</span> ` + child.innerHTML;
                
                // Create container for section contents
                currentContainer = document.createElement('div');
                currentContainer.className = 'collapsible-section open';
                
                // Insert container after H2
                child.parentNode.insertBefore(currentContainer, child.nextSibling);
                
                // Capture container reference in block scope to fix closure bug
                const targetContainer = currentContainer;
                
                // Click to toggle collapse
                child.addEventListener('click', () => {
                    const isOpen = targetContainer.classList.toggle('open');
                    child.querySelector('.collapse-toggle-icon').innerText = isOpen ? '▾' : '▸';
                    child.classList.toggle('collapsed', !isOpen);
                });
            }
        } else if (currentContainer && child.className !== 'collapsible-section') {
            // Append following elements into container
            currentContainer.appendChild(child);
        }
    });
}
