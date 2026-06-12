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
        arrowSpan.className = 'arrow-icon';
        arrowSpan.innerHTML = node.type === 'directory' ? '▸' : '';
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
            childrenContainer.className = 'tree-children';
            
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
        viewer.innerHTML = marked.parse(text);
        
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
});
