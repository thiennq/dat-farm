document.addEventListener('DOMContentLoaded', () => {
    const walkthroughNav = document.getElementById('walkthrough-nav');
    const walkthroughViewer = document.getElementById('walkthrough-viewer');
    const chatlogViewer = document.getElementById('chatlog-viewer');
    const toggleLayoutBtn = document.getElementById('toggle-layout-btn');
    const viewportContainer = document.getElementById('viewport-container');

    let globalConfig = null;
    let currentWalkthroughPath = null;
    let isSplitView = true;

    // Helper tạo URL chống cache
    function getCacheBustedUrl(url) {
        const date = new Date();
        const pad = (num) => String(num).padStart(2, '0');
        const timestamp = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`;
        return `${url}?t=${timestamp}`;
    }

    // Cấu hình marked để render markdown chuẩn
    marked.setOptions({
        highlight: function(code, lang) {
            if (Prism.languages[lang]) {
                return Prism.highlight(code, Prism.languages[lang], lang);
            }
            return code;
        },
        breaks: true,
        gfm: true
    });

    // 1. Tải file cấu hình config.json
    fetch(getCacheBustedUrl('config.json'))
        .then(res => {
            if (!res.ok) throw new Error('Không thể tải file config.json');
            return res.json();
        })
        .then(config => {
            globalConfig = config;
            renderSidebar(config.walkthroughs);
            loadChatlog(config.chatlog);
            
            // Mở mặc định walkthrough đầu tiên nếu có
            if (config.walkthroughs && config.walkthroughs.length > 0) {
                loadWalkthrough(config.walkthroughs[0].path, config.walkthroughs[0].name);
            }
        })
        .catch(err => {
            console.error(err);
            walkthroughNav.innerHTML = `<div class="loader-spinner" style="color: #ef4444;">Lỗi: ${err.message}</div>`;
        });

    // 2. Render Sidebar từ cấu hình
    function renderSidebar(walkthroughs) {
        walkthroughNav.innerHTML = '';
        if (!walkthroughs || walkthroughs.length === 0) {
            walkthroughNav.innerHTML = '<div class="loader-spinner">Không có walkthrough nào.</div>';
            return;
        }

        walkthroughs.forEach((wt, idx) => {
            const menuItem = document.createElement('button');
            menuItem.className = 'menu-item';
            menuItem.innerHTML = `
                <h4>${wt.name}</h4>
            `;
            menuItem.addEventListener('click', () => {
                // Remove active class from all items
                document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
                menuItem.classList.add('active');
                loadWalkthrough(wt.path, wt.name);
            });
            
            // Set active class for first item initially
            if (idx === 0) menuItem.classList.add('active');
            
            walkthroughNav.appendChild(menuItem);
        });
    }

    // 3. Tải và hiển thị Walkthrough
    function loadWalkthrough(path, name) {
        currentWalkthroughPath = path;
        walkthroughViewer.innerHTML = '<div class="loader-spinner">Đang tải walkthrough...</div>';
        
        fetch(getCacheBustedUrl(path))
            .then(res => {
                if (!res.ok) throw new Error('Không thể tải file walkthrough');
                return res.text();
            })
            .then(markdown => {
                // Tách bỏ YAML frontmatter để hiển thị nội dung sạch
                const cleanMarkdown = removeFrontmatter(markdown);
                const html = marked.parse(cleanMarkdown);
                walkthroughViewer.innerHTML = html;
                
                // Kích hoạt syntax highlighting của Prism
                Prism.highlightAllUnder(walkthroughViewer);
                
                // Đăng ký sự kiện click link neo để cuộn Chat Log
                setupAnchorLinks();

                // Thiết lập nút mở chi tiết cuộc hội thoại cho các Prompt
                setupPromptButtons();
            })
            .catch(err => {
                console.error(err);
                walkthroughViewer.innerHTML = `<div class="placeholder-message" style="color: #ef4444;"><h3>Không tải được nội dung</h3><p>${err.message}</p></div>`;
            });
    }

    // Helper tách frontmatter
    function removeFrontmatter(markdown) {
        if (markdown.startsWith('---')) {
            const lines = markdown.split('\n');
            let endOfFrontmatter = -1;
            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim() === '---') {
                    endOfFrontmatter = i;
                    break;
                }
            }
            if (endOfFrontmatter !== -1) {
                return lines.slice(endOfFrontmatter + 1).join('\n');
            }
        }
        return markdown;
    }

    // 4. Tải và hiển thị Chat Log Hybrid
    function loadChatlog(path) {
        chatlogViewer.innerHTML = '<div class="loader-spinner">Đang tải chat log...</div>';
        
        fetch(getCacheBustedUrl(path))
            .then(res => {
                if (!res.ok) throw new Error('Không thể tải file chatlog');
                return res.text();
            })
            .then(markdown => {
                const html = marked.parse(markdown);
                chatlogViewer.innerHTML = html;
                Prism.highlightAllUnder(chatlogViewer);

                // Cache các lượt user chat và thiết lập nút prompt
                cacheUserTurns();
                setupPromptButtons();
            })
            .catch(err => {
                console.error(err);
                chatlogViewer.innerHTML = `<div class="loader-spinner" style="color: #ef4444;">Không tải được lịch sử chat: ${err.message}</div>`;
            });
    }

    // 5. Cơ chế xử lý Click Link Neo (Anchor Links)
    function setupAnchorLinks() {
        // Tìm tất cả các thẻ a trong phần Walkthrough
        const links = walkthroughViewer.querySelectorAll('a');
        links.forEach(link => {
            const href = link.getAttribute('href');
            // Nếu href là link neo trỏ đến q1, q2... (ví dụ href="file://...#q1" hoặc chỉ "#q1")
            if (href && (href.includes('#q') || href.startsWith('#q'))) {
                // Trích xuất ID neo (ví dụ: q1)
                const anchorId = href.split('#').pop();
                
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Nếu đang ở chế độ xem đơn (Single View), chuyển sang chế độ song song (Split View)
                    if (!isSplitView) {
                        isSplitView = true;
                        viewportContainer.className = 'app-viewport split-view';
                        toggleLayoutBtn.innerHTML = '<span class="btn-icon">👁️</span> Song song';
                    }
                    
                    // Tìm phần tử đích trong Chat Log cột phải
                    // Link neo trỏ đến <a id="qX"></a> hoặc thẻ h2/h3 chứa ID đó
                    const targetEl = chatlogViewer.querySelector(`#${anchorId}`) || 
                                     chatlogViewer.querySelector(`[id="${anchorId}"]`) ||
                                     findAnchorById(chatlogViewer, anchorId);
                    
                    if (targetEl) {
                        // Tìm heading (h2) chứa hoặc gần kề thẻ anchor đó để cuộn tới và highlight
                        const headingEl = targetEl.closest('h2') || targetEl.closest('h3') || targetEl;
                        
                        // Cuộn mượt mà cột Chat Log tới vị trí phần tử
                        headingEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        
                        // Thêm hiệu ứng highlight nhấp nháy
                        headingEl.classList.remove('highlight-element');
                        void headingEl.offsetWidth; // Trigger reflow
                        headingEl.classList.add('highlight-element');
                    } else {
                        console.warn(`Không tìm thấy phần tử neo với ID: ${anchorId}`);
                    }
                });
            }
        });
    }

    // Helper phụ tìm thẻ neo trong trường hợp đặc biệt
    function findAnchorById(root, id) {
        const anchors = root.querySelectorAll('a[id]');
        for (let a of anchors) {
            if (a.getAttribute('id') === id) return a;
        }
        return null;
    }

    // 6. Xử lý logic cache lượt User Chat và mapping Prompt với câu hỏi
    let userTurnsCache = null;

    function cacheUserTurns() {
        if (!chatlogViewer || chatlogViewer.children.length <= 1) {
            return false;
        }
        
        userTurnsCache = [];
        const h2Elements = chatlogViewer.querySelectorAll('h2');
        h2Elements.forEach(h2 => {
            const anchor = h2.querySelector('a[id^="q"]');
            if (h2.textContent.includes('User') || anchor) {
                const id = anchor ? anchor.getAttribute('id') : null;
                if (id) {
                    let contentText = "";
                    let sibling = h2.nextElementSibling;
                    while (sibling && sibling.tagName !== 'H2') {
                        contentText += " " + sibling.textContent;
                        sibling = sibling.nextElementSibling;
                    }
                    userTurnsCache.push({
                        id: id,
                        element: h2,
                        normalizedText: normalizeText(contentText)
                    });
                }
            }
        });
        return true;
    }

    function normalizeText(text) {
        return text.toLowerCase()
            .replace(/[\s\r\n\t]+/g, '')
            .replace(/[^\p{L}\p{N}]/gu, ''); // Hỗ trợ giữ nguyên ký tự Unicode tiếng Việt có dấu
    }

    function findMatchingQuestionId(promptText) {
        if (!promptText || !userTurnsCache) return null;
        
        let bestMatch = null;
        let bestMatchLen = Infinity;
        
        // Pass 1: Tìm lượt chat của User có chứa toàn bộ nội dung prompt
        for (const turn of userTurnsCache) {
            if (turn.normalizedText.includes(promptText)) {
                if (turn.normalizedText.length < bestMatchLen) {
                    bestMatch = turn.id;
                    bestMatchLen = turn.normalizedText.length;
                }
            }
        }
        
        // Pass 2: Tránh khớp nhầm các từ cực ngắn (ví dụ: "Có", "Ok"). Chỉ cho phép prompt chứa user turn khi user turn đủ dài (> 15 ký tự).
        if (!bestMatch) {
            for (const turn of userTurnsCache) {
                if (turn.normalizedText.length > 15 && promptText.includes(turn.normalizedText)) {
                    if (turn.normalizedText.length < bestMatchLen) {
                        bestMatch = turn.id;
                        bestMatchLen = turn.normalizedText.length;
                    }
                }
            }
        }
        
        // Pass 3: Khớp theo 30 ký tự đầu tiên của prompt (nếu prompt rất dài)
        if (!bestMatch && promptText.length > 30) {
            const shortPrompt = promptText.substring(0, 30);
            for (const turn of userTurnsCache) {
                if (turn.normalizedText.includes(shortPrompt)) {
                    if (turn.normalizedText.length < bestMatchLen) {
                        bestMatch = turn.id;
                        bestMatchLen = turn.normalizedText.length;
                    }
                }
            }
        }
        
        return bestMatch;
    }

    function setupPromptButtons() {
        if (!userTurnsCache) {
            const success = cacheUserTurns();
            if (!success) return;
        }

        const h3Elements = walkthroughViewer.querySelectorAll('h3');
        h3Elements.forEach(h3 => {
            if (h3.textContent.toLowerCase().includes('prompt')) {
                if (h3.querySelector('.btn-open-detail')) return;

                let qId = null;
                const link = h3.querySelector('a');
                if (link) {
                    const href = link.getAttribute('href');
                    if (href && (href.includes('#q') || href.startsWith('#q'))) {
                        qId = href.split('#').pop();
                    }
                }

                if (!qId) {
                    let sibling = h3.nextElementSibling;
                    let blockquote = null;
                    for (let i = 0; i < 3 && sibling; i++) {
                        if (sibling.tagName === 'BLOCKQUOTE') {
                            blockquote = sibling;
                            break;
                        }
                        sibling = sibling.nextElementSibling;
                    }

                    if (blockquote) {
                        const promptText = normalizeText(blockquote.textContent);
                        qId = findMatchingQuestionId(promptText);
                    }
                }

                if (qId) {
                    const btn = document.createElement('button');
                    btn.className = 'btn-open-detail';
                    btn.innerHTML = '💬 Xem chi tiết';
                    btn.setAttribute('data-q-id', qId);
                    
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        openDetailDrawer(qId);
                    });

                    h3.appendChild(btn);
                }
            }
        });
    }

    function openDetailDrawer(qId) {
        const targetEl = chatlogViewer.querySelector(`#${qId}`) || 
                         chatlogViewer.querySelector(`[id="${qId}"]`) ||
                         findAnchorById(chatlogViewer, qId);
                         
        if (targetEl) {
            const userH2 = targetEl.closest('h2');
            if (userH2) {
                const clonedElements = [];
                clonedElements.push(userH2.cloneNode(true));
                
                let sibling = userH2.nextElementSibling;
                while (sibling) {
                    if (sibling.tagName === 'H2' && (sibling.textContent.includes('User') || sibling.querySelector('a[id^="q"]'))) {
                        break;
                    }
                    clonedElements.push(sibling.cloneNode(true));
                    sibling = sibling.nextElementSibling;
                }
                
                const drawerContentViewer = document.getElementById('drawer-content-viewer');
                drawerContentViewer.innerHTML = '';
                clonedElements.forEach(el => drawerContentViewer.appendChild(el));
                
                Prism.highlightAllUnder(drawerContentViewer);
                
                document.getElementById('drawer-q-id').textContent = `#${qId}`;
                
                const detailDrawer = document.getElementById('detail-drawer');
                detailDrawer.classList.add('open');
                
                if (isSplitView) {
                    const headingEl = userH2;
                    headingEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    
                    headingEl.classList.remove('highlight-element');
                    void headingEl.offsetWidth; // Trigger reflow
                    headingEl.classList.add('highlight-element');
                }
            }
        } else {
            console.warn(`Không tìm thấy phần tử cho ID: ${qId}`);
        }
    }

    // 7. Thiết lập sự kiện đóng Drawer
    const detailDrawer = document.getElementById('detail-drawer');
    const closeDrawerBtn = document.getElementById('close-drawer-btn');
    const drawerOverlay = detailDrawer.querySelector('.drawer-overlay');

    const closeDrawer = () => {
        detailDrawer.classList.remove('open');
    };

    closeDrawerBtn.addEventListener('click', closeDrawer);
    drawerOverlay.addEventListener('click', closeDrawer);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && detailDrawer.classList.contains('open')) {
            closeDrawer();
        }
    });

    // 8. Chuyển đổi giao diện (Split-View và Single-View)
    toggleLayoutBtn.addEventListener('click', () => {
        isSplitView = !isSplitView;
        if (isSplitView) {
            viewportContainer.className = 'app-viewport split-view';
            toggleLayoutBtn.innerHTML = '<span class="btn-icon">👁️</span> Song song';
        } else {
            viewportContainer.className = 'app-viewport single-view';
            toggleLayoutBtn.innerHTML = '<span class="btn-icon">📝</span> Chỉ tóm tắt';
        }
    });
});
