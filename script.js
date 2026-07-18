let isAuthenticated = false;
let currentUser = null;
let userRole = null;
let userJoinedAt = null;
let userRoles = [];
let currentPageId = 'welcome';

const GUILD_ID = '1317032666331353099';
const STAFF_ROLE_ID = '1460812651168010304';
const HIGH_RANK_ROLE_ID = '1460812635846086656';
const EXECUTIVE_ROLE_ID = '1460812466454921358';
const OWNERSHIP_ROLE_ID = '1522036995726250015';
const EDITOR_USER_ID = '802937980897067059';

const collapsibles = {
    'staff_infractions_matrix': {
        title: 'Staff Infractions Matrix',
        content: '<p>Content for the Staff Infractions Matrix coming soon.</p>'
    },
    'chain_of_command': {
        title: 'Chain of Command',
        content: '<p>Content for the Chain of Command coming soon.</p>'
    },
    'task_staffapps': {
        title: 'Staff Applications Task',
        content: '<p>placeholder</p>'
    },
    'task_gameappeals': {
        title: 'Game Appeals Task',
        content: '<p>placeholder</p>'
    },
    'task_dcbanappeals': {
        title: 'Discord Ban Appeals Task',
        content: '<p>placeholder</p>'
    },
    'task_interntest': {
        title: 'Intern Phase 2 Test Reading Task',
        content: '<p>placeholder</p>'
    },
    'task_inactivitynotices': {
        title: 'Inactivity Notices Task',
        content: '<p>placeholder</p>'
    },
    'task_evaluations': {
        title: 'Staff Evaluations Task',
        content: '<p>placeholder</p>'
    },
};

const defaultPages = {
    'welcome': {
        title: 'Welcome',
        content: '<p>Welcome to the Colorado Roleplay Staff &amp; High Rank Guidebooks. In order to access the guides, you are <strong>required</strong> to authenticate using your <em>staff Discord Account</em>. Failure to do so will result in you not being able to access the guides.</p><blockquote>Log in <strong>should</strong> persist.</blockquote><p>The log in button is in the top right.</p><h2>I\'m already authenticated?</h2><p>You should see the rest of your guides! Look in the left tab bar, or at the bottom page buttons.</p>',
        lastUpdated: 'July 17th, 2026',
        category: 'Introduction',
        categoryFirstPage: 'welcome',
        icon: 'assets/icons/wave.svg'
    },
    'staff-welcome': {
        title: 'Staff Welcome',
        content: '<p>Welcome to the staff team! This guide will help you understand your role and responsibilities as a staff member.</p>',
        lastUpdated: 'July 17th, 2026',
        category: 'Introduction',
        categoryFirstPage: 'welcome',
        icon: 'assets/icons/wave.svg'
    },
    'hr-welcome': {
        title: 'HR Welcome',
        content: '<p>As a high-ranking staff member, you have additional responsibilities and privileges. This page outlines what to expect in your role.</p>',
        lastUpdated: 'July 17th, 2026',
        category: 'Introduction',
        categoryFirstPage: 'welcome',
        icon: 'assets/icons/wave.svg'
    },
    'staff-guide-1': {
        title: 'Staff Guide Overview',
        content: '<p>This is a placeholder for the Staff Guides section. Content coming soon.</p>',
        lastUpdated: 'July 17th, 2026',
        category: 'Staff Guides',
        categoryFirstPage: 'staff-guide-1',
        icon: 'assets/icons/guidelines.svg'
    },
    'high-rank': {
        title: 'High Rank Intro',
        content: '<p>Welcome to the High Rank documentation section. Here you will find detailed information about your responsibilities and expectations.</p>',
        lastUpdated: 'July 17th, 2026',
        category: 'High Rank Guides',
        categoryFirstPage: 'high-rank',
        icon: 'assets/icons/high-rank.svg'
    },
    'duties': {
        title: 'Weekly Duties',
        content: '<p>Complete your assigned duties on time to maintain team efficiency and community standards.</p>',
        lastUpdated: 'July 17th, 2026',
        category: 'High Rank Guides',
        categoryFirstPage: 'high-rank',
        icon: 'assets/icons/duties.svg'
    },
    'expectations': {
        title: 'Expectations',
        content: '<p>Follow these guidelines to ensure consistent behavior and decision-making across the team.</p>',
        lastUpdated: 'July 17th, 2026',
        category: 'High Rank Guides',
        categoryFirstPage: 'high-rank',
        icon: 'assets/icons/expectations.svg'
    },
    'resources': {
        title: 'Resources',
        content: '<p>Access helpful resources, templates, and tools to assist you in your role.</p>',
        lastUpdated: 'July 17th, 2026',
        category: 'High Rank Guides',
        categoryFirstPage: 'high-rank',
        icon: 'assets/icons/resources.svg'
    },
    'data-management': {
        title: 'Data Management',
        content: '<p>This page is used to manage and reference staff data within the community.</p><h2>Data Guidelines</h2><p>All staff data should be handled with care. Below are the collapsible sections for key reference materials.</p><h3>Infractions</h3><p>[staff_infractions_matrix]</p><h3>Structure</h3><p>[chain_of_command]</p>',
        lastUpdated: 'July 17th, 2026',
        category: 'Introduction',
        categoryFirstPage: 'welcome',
        icon: 'assets/icons/clipboard.svg'
    }
};

let pages = JSON.parse(JSON.stringify(defaultPages));
const defaultCollapsibles = JSON.parse(JSON.stringify(collapsibles));
let customPages = {};
let pageOrder = {};
let categoryOrder = {};
let categories = [];

const defaultCategories = [
    { name: 'Introduction', visibility: 'auth' },
    { name: 'Staff Guides', visibility: 'staff' },
    { name: 'High Rank Guides', visibility: 'highrank' }
];

function canEdit() {
    if (!currentUser) return false;
    if (currentUser.id === EDITOR_USER_ID) return true;
    if (userRoles.includes(EXECUTIVE_ROLE_ID)) return true;
    if (userRoles.includes(OWNERSHIP_ROLE_ID)) return true;
    return false;
}

function getRoleLabel() {
    if (userRoles.includes(OWNERSHIP_ROLE_ID)) return 'Ownership';
    if (userRoles.includes(EXECUTIVE_ROLE_ID)) return 'Executive';
    if (userRole === 'highrank') return 'High Rank';
    if (userRole === 'staff') return 'Staff';
    return 'Not Staff';
}

function getSessionToken() {
    return localStorage.getItem('crp-session');
}

function setSessionToken(token) {
    localStorage.setItem('crp-session', token);
}

function clearSessionToken() {
    localStorage.removeItem('crp-session');
}

function isCategoryVisible(cat) {
    if (!isAuthenticated) return cat.visibility === 'auth';
    if (canEdit()) return true;
    switch (cat.visibility) {
        case 'auth': return true;
        case 'staff': return userRole === 'staff' || userRole === 'highrank';
        case 'highrank': return userRole === 'highrank';
        case 'editor': return canEdit();
        default: return false;
    }
}

function isPageVisible(id) {
    if (id === 'welcome') return isAuthenticated;
    if (!pages[id]) return false;

    const cp = customPages[id];
    if (cp) {
        switch (cp.visibility) {
            case 'auth': return isAuthenticated;
            case 'staff': return userRole === 'staff' || userRole === 'highrank';
            case 'highrank': return userRole === 'highrank';
            case 'editor': return canEdit();
            default: return false;
        }
    }

    switch (id) {
        case 'staff-welcome': return userRole === 'staff' || userRole === 'highrank';
        case 'hr-welcome': return userRole === 'highrank';
        case 'staff-guide-1': return userRole === 'staff' || userRole === 'highrank';
        case 'high-rank': return userRole === 'highrank';
        case 'duties': return userRole === 'highrank';
        case 'expectations': return userRole === 'highrank';
        case 'resources': return userRole === 'highrank';
        case 'data-management': return canEdit() && userRole === 'highrank';
        default: return isAuthenticated;
    }
}

function getActiveCategories() {
    if (categories.length > 0) return categories;
    return defaultCategories;
}

function renderSidebar() {
    const sidebarNav = document.getElementById('sidebarNav');
    const activeCats = getActiveCategories();
    const catOrder = categoryOrder;

    const sortedCats = [...activeCats].sort((a, b) => {
        const posA = catOrder[a.name] != null ? catOrder[a.name] : 9999;
        const posB = catOrder[b.name] != null ? catOrder[b.name] : 9999;
        return posA - posB;
    });

    sidebarNav.innerHTML = '';

    for (const cat of sortedCats) {
        if (!isCategoryVisible(cat)) continue;

        const catPages = [];
        for (const [id, page] of Object.entries(pages)) {
            if (page.category !== cat.name) continue;
            if (!isPageVisible(id)) continue;
            catPages.push({ id, ...page });
        }

        catPages.sort((a, b) => {
            const posA = pageOrder[a.id] != null ? pageOrder[a.id] : 9999;
            const posB = pageOrder[b.id] != null ? pageOrder[b.id] : 9999;
            if (posA !== posB) return posA - posB;
            const allIds = Object.keys(pages);
            return allIds.indexOf(a.id) - allIds.indexOf(b.id);
        });

        const section = document.createElement('div');
        section.className = 'nav-section';
        section.dataset.category = cat.name;

        const title = document.createElement('div');
        title.className = 'nav-section-title';
        title.textContent = cat.name;
        if (canEdit()) {
            title.setAttribute('draggable', 'true');
            title.dataset.category = cat.name;
        }
        section.appendChild(title);

        for (const p of catPages) {
            const a = document.createElement('a');
            a.href = '#' + p.id;
            a.className = 'nav-item';
            a.dataset.page = p.id;
            a.setAttribute('draggable', 'true');
            a.innerHTML = '<span class="nav-icon"><img src="' + (p.icon || 'assets/icons/wave.svg') + '" alt=""></span>' + p.title;
            section.appendChild(a);
        }

        sidebarNav.appendChild(section);
    }
}

function getVisiblePages() {
    if (!isAuthenticated) return [];

    const visible = [];
    for (const id of Object.keys(pages)) {
        if (isPageVisible(id)) visible.push(id);
    }

    visible.sort((a, b) => {
        const posA = pageOrder[a] != null ? pageOrder[a] : 9999;
        const posB = pageOrder[b] != null ? pageOrder[b] : 9999;
        if (posA !== posB) return posA - posB;
        const allIds = Object.keys(pages);
        return allIds.indexOf(a) - allIds.indexOf(b);
    });

    return visible;
}

function processShortcodes(html) {
    return html.replace(/\[(\w+)\]/g, function(match, key) {
        const c = collapsibles[key];
        if (!c) return match;
        const editBtn = canEdit()
            ? '<button class="collapsible-edit-btn" data-collapsible="' + key + '" title="Edit section">&#9998;</button>'
            : '';
        return '<div class="collapsible" data-collapsible="' + key + '">' +
            '<div class="collapsible-header">' +
            '<button class="collapsible-trigger">' + c.title + '<span class="collapsible-arrow">&#9662;</span></button>' +
            editBtn +
            '</div>' +
            '<div class="collapsible-content">' + c.content + '</div>' +
            '</div>';
    });
}

function updatePage(pageId) {
    const page = pages[pageId];
    if (!page) return;

    const visiblePages = getVisiblePages();
    if (!visiblePages.includes(pageId)) {
        pageId = visiblePages[0];
    }
    if (!pageId) return;

    currentPageId = pageId;

    const activePage = pages[pageId];
    const pageTitle = document.querySelector('.page-title');
    const contentBody = document.getElementById('contentBody');
    const nextPageEl = document.getElementById('nextPage');
    const prevPageEl = document.getElementById('prevPage');
    const lastUpdatedEl = document.querySelector('.last-updated');
    const categoryLinkEl = document.getElementById('categoryLink');
    const titleIconEl = document.getElementById('titleIcon');
    const editBtn = document.getElementById('editContentBtn');

    pageTitle.textContent = activePage.title;
    contentBody.innerHTML = processShortcodes(activePage.content);

    contentBody.querySelectorAll('.collapsible-trigger').forEach(trigger => {
        trigger.addEventListener('click', function() {
            this.closest('.collapsible').classList.toggle('open');
        });
    });

    contentBody.querySelectorAll('.collapsible-edit-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const key = this.dataset.collapsible;
            const c = collapsibles[key];
            if (!c) return;
            openCollapsibleEditModal(key, c);
        });
    });
    lastUpdatedEl.textContent = 'Last Updated: ' + activePage.lastUpdated;
    categoryLinkEl.textContent = activePage.category;
    categoryLinkEl.dataset.page = activePage.categoryFirstPage;
    titleIconEl.src = activePage.icon;

    if (canEdit()) {
        editBtn.style.display = 'inline-block';
    } else {
        editBtn.style.display = 'none';
    }

    const editPageBtn = document.getElementById('editPageBtn');
    if (canEdit()) {
        editPageBtn.style.display = 'inline-block';
    } else {
        editPageBtn.style.display = 'none';
    }

    const deleteBtn = document.getElementById('deletePageBtn');
    if (canEdit()) {
        deleteBtn.style.display = 'block';
    } else {
        deleteBtn.style.display = 'none';
    }

    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.classList.remove('active');
        if (nav.dataset.page === pageId) {
            nav.classList.add('active');
        }
    });

    const currentIndex = visiblePages.indexOf(pageId);
    const nextIndex = currentIndex + 1;
    const prevIndex = currentIndex - 1;

    if (nextIndex < visiblePages.length) {
        const nextPageId = visiblePages[nextIndex];
        const nextPage = pages[nextPageId];
        nextPageEl.style.display = 'flex';
        nextPageEl.dataset.page = nextPageId;
        nextPageEl.querySelector('.pagination-title').textContent = nextPage.title;
    } else {
        nextPageEl.style.display = 'none';
    }

    if (prevIndex >= 0) {
        const prevPageId = visiblePages[prevIndex];
        const prevPage = pages[prevPageId];
        prevPageEl.style.display = 'flex';
        prevPageEl.dataset.page = prevPageId;
        prevPageEl.querySelector('.pagination-title').textContent = prevPage.title;
    } else {
        prevPageEl.style.display = 'none';
    }

    if (prevIndex < 0) {
        nextPageEl.style.gridColumn = '1 / -1';
        nextPageEl.style.alignItems = 'flex-end';
    } else if (nextIndex >= visiblePages.length) {
        prevPageEl.style.gridColumn = '1 / -1';
        prevPageEl.style.alignItems = 'flex-start';
    } else {
        nextPageEl.style.gridColumn = '';
        nextPageEl.style.alignItems = '';
        prevPageEl.style.gridColumn = '';
        prevPageEl.style.alignItems = '';
    }

    window.location.hash = pageId;
}

function resolveIconPath(icon) {
    if (!icon) return 'assets/icons/wave.svg';
    if (icon.startsWith('assets/') || icon.startsWith('http')) return icon;
    return 'assets/icons/' + icon;
}

function populateCategorySelect() {
    const select = document.getElementById('newPageCategory');
    if (!select) return;
    select.innerHTML = '';
    const cats = getActiveCategories();
    for (const cat of cats) {
        const opt = document.createElement('option');
        opt.value = cat.name;
        opt.textContent = cat.name;
        select.appendChild(opt);
    }
}

async function loadContent() {
    try {
        const res = await fetch('/api/content');
        if (res.ok) {
            const data = await res.json();
            if (data.deletedPages) {
                for (const pageId of data.deletedPages) {
                    delete pages[pageId];
                    delete defaultPages[pageId];
                }
            }
            if (data.collapsibles) {
                for (const [id, c] of Object.entries(data.collapsibles)) {
                    if (collapsibles[id]) {
                        collapsibles[id].content = c.content;
                        if (c.title) collapsibles[id].title = c.title;
                    } else {
                        collapsibles[id] = { title: c.title || id, content: c.content || '' };
                    }
                }
            }
            if (data.customPages) {
                customPages = data.customPages;
                for (const [id, cp] of Object.entries(customPages)) {
                    pages[id] = {
                        title: cp.title,
                        content: cp.content || '<p>This page has no content yet.</p>',
                        lastUpdated: cp.lastUpdated || 'July 17th, 2026',
                        category: cp.category,
                        categoryFirstPage: cp.categoryFirstPage || 'welcome',
                        icon: cp.icon
                    };
                }
            }
            if (data.pages) {
                for (const [id, page] of Object.entries(data.pages)) {
                    if (pages[id]) {
                        if (page.content !== undefined) pages[id].content = page.content;
                        if (page.lastUpdated) pages[id].lastUpdated = page.lastUpdated;
                        if (page.title) pages[id].title = page.title;
                        if (page.icon) pages[id].icon = page.icon;
                    }
                }
            }
            if (data.pageOrder) {
                pageOrder = data.pageOrder;
            }
            if (data.categories) {
                categories = data.categories;
            }
            if (data.categoryOrder) {
                categoryOrder = data.categoryOrder;
            }
            renderSidebar();
        }
    } catch (e) {}
}

function htmlToMarkdown(html) {
    let md = html;
    md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n');
    md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n');
    md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n');
    md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
    md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
    md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
    md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
    md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
    md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
    md = md.replace(/<br\s*\/?>/gi, '\n');
    md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
    md = md.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, '> $1\n');
    md = md.replace(/<hr\s*\/?>/gi, '---\n');
    md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');
    md = md.replace(/<[^>]+>/g, '');
    md = md.replace(/&amp;/g, '&');
    md = md.replace(/&lt;/g, '<');
    md = md.replace(/&gt;/g, '>');
    md = md.replace(/&quot;/g, '"');
    md = md.replace(/&#39;/g, "'");
    md = md.replace(/\n{3,}/g, '\n\n');
    return md.trim();
}

function markdownToHtml(md) {
    let html = md;
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/`(.+?)`/g, '<code>$1</code>');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');
    html = html.replace(/^---$/gm, '<hr>');
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');

    const lines = html.split('\n');
    let result = '';
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith('<li>')) {
            if (!inList) {
                result += '<ul>\n';
                inList = true;
            }
            result += line + '\n';
        } else {
            if (inList) {
                result += '</ul>\n';
                inList = false;
            }
            if (line.startsWith('<blockquote>')) {
                result += line + '\n';
            } else if (line.startsWith('<h') || line.startsWith('<hr') || line.startsWith('<ul')) {
                result += line + '\n';
            } else if (line.trim() === '') {
                result += '\n';
            } else {
                result += '<p>' + line + '</p>\n';
            }
        }
    }

    if (inList) result += '</ul>\n';
    result = result.replace(/\n{3,}/g, '\n\n');
    return result.trim();
}

async function checkAuth() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionFromUrl = urlParams.get('session');
    if (sessionFromUrl) {
        setSessionToken(sessionFromUrl);
        window.history.replaceState({}, '', window.location.pathname + window.location.hash);
    }

    const token = getSessionToken();
    if (!token) {
        isAuthenticated = false;
        updateAuthUI();
        return;
    }

    try {
        const res = await fetch('/api/auth/me', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (res.ok) {
            const data = await res.json();
            isAuthenticated = true;
            currentUser = data.user;
            userJoinedAt = data.user.joinedAt || null;
            userRoles = data.user.roles || [];
            if (data.user.role === 'High Rank') {
                userRole = 'highrank';
            } else if (data.user.role === 'Staff') {
                userRole = 'staff';
            }
        } else {
            clearSessionToken();
            isAuthenticated = false;
        }
    } catch (e) {
        isAuthenticated = false;
    }

    if (isAuthenticated && currentUser) {
        if (sessionStorage.getItem('crp-welcomed')) {
            await checkRoles();
        } else {
            await showWelcomeOverlay();
        }
    }

    await loadContent();
    updateAuthUI();
}

function showWelcomeOverlay() {
    return new Promise(async (resolve) => {
        const overlay = document.getElementById('welcomeOverlay');
        const avatar = document.getElementById('welcomeAvatar');
        const username = document.getElementById('welcomeUsername');

        avatar.src = currentUser.avatar;
        username.textContent = currentUser.username;
        overlay.classList.add('show');

        sessionStorage.setItem('crp-welcomed', '1');

        await checkRoles();

        setTimeout(() => {
            overlay.classList.remove('show');
            overlay.classList.add('hiding');
            overlay.addEventListener('animationend', function handler() {
                overlay.classList.remove('hiding');
                overlay.removeEventListener('animationend', handler);
            });
            resolve();
        }, 2000);
    });
}

async function checkRoles() {
    const token = getSessionToken();
    if (!token) return;

    try {
        const res = await fetch('/api/auth/roles', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (res.ok) {
            const data = await res.json();
            userRoles = data.roles || [];
            if (data.isHighRank) {
                userRole = 'highrank';
            } else if (data.isStaff) {
                userRole = 'staff';
            } else {
                userRole = null;
            }
        }
    } catch (e) {
        userRole = null;
    }
}

function updateAuthUI() {
    const loginBtn = document.getElementById('loginBtn');
    const userMenu = document.getElementById('userMenu');
    const userAvatar = document.getElementById('userAvatar');
    const body = document.body;

    body.classList.remove('role-staff', 'role-highrank', 'role-editor');

    if (isAuthenticated && currentUser) {
        loginBtn.style.display = 'none';
        userMenu.style.display = 'block';
        userAvatar.src = currentUser.avatar;
        body.classList.add('authenticated');

        if (userRole === 'staff') {
            body.classList.add('role-staff');
        } else if (userRole === 'highrank') {
            body.classList.add('role-highrank');
        }

        if (canEdit()) {
            body.classList.add('role-editor');
        }
    } else {
        loginBtn.style.display = 'inline-block';
        userMenu.style.display = 'none';
        body.classList.remove('authenticated');
        userRole = null;
        userRoles = [];
    }

    renderSidebar();
    populateCategorySelect();

    const hash = window.location.hash.slice(1);
    const visiblePages = getVisiblePages();
    if (hash && pages[hash] && visiblePages.includes(hash)) {
        updatePage(hash);
    } else if (visiblePages.length > 0) {
        updatePage(visiblePages[0]);
    }
}

function searchPages(query) {
    const results = [];
    const q = query.toLowerCase().trim();
    if (!q) return results;

    const visiblePages = getVisiblePages();

    for (const [id, page] of Object.entries(pages)) {
        if (!visiblePages.includes(id)) continue;
        const titleMatch = page.title.toLowerCase().includes(q);
        const contentText = page.content.replace(/<[^>]+>/g, '').toLowerCase();
        const contentMatch = contentText.includes(q);
        if (titleMatch || contentMatch) {
            results.push({ id, title: page.title, category: page.category, titleMatch });
        }
    }

    results.sort((a, b) => (b.titleMatch ? 1 : 0) - (a.titleMatch ? 1 : 0));
    return results;
}

let lastSearchResults = [];

function handleSearch() {
    const input = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('searchResults');
    const query = input.value;

    if (!query.trim()) {
        resultsContainer.classList.remove('visible');
        resultsContainer.innerHTML = '';
        lastSearchResults = [];
        return;
    }

    const results = searchPages(query);
    lastSearchResults = results;
    renderSearchResults(resultsContainer, results, false);
}

function renderSearchResults(resultsContainer, results, expanded) {
    resultsContainer.innerHTML = '';

    if (results.length === 0) {
        resultsContainer.innerHTML = '<div class="search-no-results">No results found.</div>';
        resultsContainer.classList.add('visible');
        return;
    }

    const toShow = expanded ? results : results.slice(0, 5);
    toShow.forEach(r => {
        const item = document.createElement('div');
        item.className = 'search-result-item';
        item.innerHTML = '<div class="search-result-category">' + r.category + '</div><div class="search-result-title">' + r.title + '</div>';
        item.addEventListener('click', () => {
            updatePage(r.id);
            document.getElementById('searchInput').value = '';
            resultsContainer.classList.remove('visible');
            resultsContainer.innerHTML = '';
        });
        resultsContainer.appendChild(item);
    });

    if (!expanded && results.length > 5) {
        const more = document.createElement('div');
        more.className = 'search-more';
        more.textContent = 'Show More — ' + (results.length - 5) + ' Result' + (results.length - 5 > 1 ? 's' : '');
        more.addEventListener('click', (e) => {
            e.stopPropagation();
            renderSearchResults(resultsContainer, results, true);
        });
        resultsContainer.appendChild(more);
    }

    resultsContainer.classList.add('visible');
}

let searchTimeout;
function initSearch() {
    const input = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('searchResults');

    input.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(handleSearch, 200);
    });

    input.addEventListener('focus', () => {
        if (input.value.trim()) handleSearch();
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            resultsContainer.classList.remove('visible');
        }
    });
}

let editMode = 'page';
let editingCollapsibleKey = null;

function openEditModal(title, label, markdownContent) {
    const modal = document.getElementById('editModal');
    modal.querySelector('h3').textContent = title;
    modal.querySelector('.edit-field label').textContent = label;
    document.getElementById('editContentArea').value = markdownContent;
    modal.classList.add('visible');
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('visible');
}

function openCollapsibleEditModal(key, c) {
    editMode = 'collapsible';
    editingCollapsibleKey = key;
    openEditModal('Edit ' + c.title, 'Content (Markdown)', htmlToMarkdown(c.content));
}

function openPageEditModal() {
    const page = pages[currentPageId];
    if (!page) return;
    editMode = 'page';
    editingCollapsibleKey = null;
    openEditModal('Edit Content', 'Page Content (Markdown)', htmlToMarkdown(page.content));
}

function openNewPageModal() {
    populateCategorySelect();
    document.getElementById('newPageTitle').value = '';
    document.getElementById('newPageIcon').value = 'wave.svg';
    document.getElementById('newPageCategory').value = 'Introduction';
    document.getElementById('newPageVisibility').value = 'auth';
    document.getElementById('newPageModal').classList.add('visible');
}

function closeNewPageModal() {
    document.getElementById('newPageModal').classList.remove('visible');
}

async function createNewPage() {
    const title = document.getElementById('newPageTitle').value.trim();
    const iconInput = document.getElementById('newPageIcon').value.trim() || 'wave.svg';
    const icon = resolveIconPath(iconInput);
    const category = document.getElementById('newPageCategory').value;
    const visibility = document.getElementById('newPageVisibility').value;

    if (!title) return;

    const id = 'custom-' + Date.now();
    const cats = getActiveCategories();
    const firstPageInCategory = Object.keys(pages).find(pid => pages[pid].category === category) || 'welcome';

    const pageData = {
        title,
        icon,
        category,
        visibility,
        content: '<p>Edit this page to add content.</p>',
        lastUpdated: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        categoryFirstPage: firstPageInCategory
    };

    customPages[id] = pageData;
    pages[id] = {
        title,
        content: pageData.content,
        lastUpdated: pageData.lastUpdated,
        category,
        categoryFirstPage: firstPageInCategory,
        icon
    };

    const token = getSessionToken();
    try {
        await fetch('/api/content', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ type: 'customPage', pageId: id, pageData })
        });
    } catch (e) {}

    renderSidebar();
    closeNewPageModal();
    updatePage(id);
}

async function deleteCurrentPage() {
    if (!currentPageId) return;
    if (!confirm('Delete this page? This cannot be undone.')) return;

    const token = getSessionToken();
    const isCustom = currentPageId.startsWith('custom-');

    try {
        await fetch('/api/content', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                type: isCustom ? 'deleteCustomPage' : 'deletePage',
                pageId: currentPageId
            })
        });
    } catch (e) {}

    delete pages[currentPageId];
    if (isCustom) delete customPages[currentPageId];

    renderSidebar();
    const visiblePages = getVisiblePages();
    updatePage(visiblePages[0]);
}

function openPageSettingsModal() {
    const page = pages[currentPageId];
    if (!page) return;
    document.getElementById('pageSettingsTitle').value = page.title;
    const iconVal = page.icon ? page.icon.replace('assets/icons/', '') : 'wave.svg';
    document.getElementById('pageSettingsIcon').value = iconVal;
    document.getElementById('pageSettingsModal').classList.add('visible');
}

function closePageSettingsModal() {
    document.getElementById('pageSettingsModal').classList.remove('visible');
}

async function savePageSettings() {
    const title = document.getElementById('pageSettingsTitle').value.trim();
    const iconInput = document.getElementById('pageSettingsIcon').value.trim() || 'wave.svg';
    const icon = resolveIconPath(iconInput);
    if (!title) return;

    const isCustom = currentPageId.startsWith('custom-');
    const token = getSessionToken();

    pages[currentPageId].title = title;
    pages[currentPageId].icon = icon;

    if (isCustom && customPages[currentPageId]) {
        customPages[currentPageId].title = title;
        customPages[currentPageId].icon = icon;
    }

    try {
        await fetch('/api/content', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({
                type: 'updatePageMeta',
                pageId: currentPageId,
                title,
                icon,
                isCustom,
                pageOrder
            })
        });
    } catch (e) {}

    closePageSettingsModal();
    renderSidebar();
    updatePage(currentPageId);
}

function openNewCollapsibleModal() {
    document.getElementById('newCollapsibleId').value = '';
    document.getElementById('newCollapsibleTitle').value = '';
    document.getElementById('newCollapsibleModal').classList.add('visible');
}

function closeNewCollapsibleModal() {
    document.getElementById('newCollapsibleModal').classList.remove('visible');
}

async function createNewCollapsible() {
    const key = document.getElementById('newCollapsibleId').value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const title = document.getElementById('newCollapsibleTitle').value.trim();
    if (!key || !title) return;

    if (collapsibles[key]) {
        alert('A collapsible with this ID already exists.');
        return;
    }

    const newCollapsible = { title, content: '<p>Edit this section to add content.</p>' };
    collapsibles[key] = newCollapsible;

    const token = getSessionToken();
    try {
        await fetch('/api/content', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ type: 'createCollapsible', collapsibleId: key, title })
        });
    } catch (e) {}

    closeNewCollapsibleModal();
    updatePage(currentPageId);
    alert('Collapsible created! Use [' + key + '] in any page content to embed it.');
}

function openNewCategoryModal() {
    document.getElementById('newCategoryName').value = '';
    document.getElementById('newCategoryVisibility').value = 'auth';
    document.getElementById('newCategoryModal').classList.add('visible');
}

function closeNewCategoryModal() {
    document.getElementById('newCategoryModal').classList.remove('visible');
}

async function createNewCategory() {
    const name = document.getElementById('newCategoryName').value.trim();
    const visibility = document.getElementById('newCategoryVisibility').value;
    if (!name) return;

    const cats = getActiveCategories();
    if (cats.some(c => c.name === name)) {
        alert('A category with this name already exists.');
        return;
    }

    const newCat = { name, visibility };
    categories.push(newCat);

    const token = getSessionToken();
    try {
        await fetch('/api/content', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ type: 'createCategory', category: newCat })
        });
    } catch (e) {}

    closeNewCategoryModal();
    renderSidebar();
    populateCategorySelect();
}

function syncPageOrderFromDOM() {
    pageOrder = {};
    let index = 0;
    document.querySelectorAll('.nav-item').forEach(item => {
        const id = item.dataset.page;
        if (id) {
            pageOrder[id] = index;
            index++;
        }
    });
}

function syncCategoryOrderFromDOM() {
    categoryOrder = {};
    let index = 0;
    document.querySelectorAll('.nav-section').forEach(section => {
        const catName = section.dataset.category;
        if (catName) {
            categoryOrder[catName] = index;
            index++;
        }
    });
}

async function savePageOrderToServer() {
    const token = getSessionToken();
    try {
        await fetch('/api/content', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ type: 'pageOrder', pageOrder })
        });
    } catch (e) {}
}

async function saveCategoryOrderToServer() {
    const token = getSessionToken();
    try {
        await fetch('/api/content', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ type: 'categoryOrder', categoryOrder })
        });
    } catch (e) {}
}

let draggedPageId = null;
let draggedCategoryName = null;
let dragType = null;

function initDragAndDrop() {
    const sidebarNav = document.getElementById('sidebarNav');

    sidebarNav.addEventListener('dragstart', function(e) {
        const pageItem = e.target.closest('.nav-item');
        const sectionTitle = e.target.closest('.nav-section-title');

        if (sectionTitle && sectionTitle.dataset.category) {
            draggedCategoryName = sectionTitle.dataset.category;
            dragType = 'category';
            sectionTitle.closest('.nav-section').classList.add('dragging-section');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', draggedCategoryName);
            return;
        }

        if (pageItem && pageItem.dataset.page) {
            draggedPageId = pageItem.dataset.page;
            dragType = 'page';
            pageItem.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', draggedPageId);
        }
    });

    sidebarNav.addEventListener('dragend', function(e) {
        const pageItem = e.target.closest('.nav-item');
        const sectionTitle = e.target.closest('.nav-section-title');
        if (pageItem) pageItem.classList.remove('dragging');
        if (sectionTitle) {
            const section = sectionTitle.closest('.nav-section');
            if (section) section.classList.remove('dragging-section');
        }
        document.querySelectorAll('.nav-section').forEach(s => s.classList.remove('drag-over-section'));
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('drag-over'));
        draggedPageId = null;
        draggedCategoryName = null;
        dragType = null;
    });

    sidebarNav.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (dragType === 'category') {
            document.querySelectorAll('.nav-section').forEach(s => s.classList.remove('drag-over-section'));
            const section = e.target.closest('.nav-section');
            if (section && section.dataset.category !== draggedCategoryName) {
                section.classList.add('drag-over-section');
            }
            return;
        }

        if (dragType === 'page') {
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('drag-over'));
            const item = e.target.closest('.nav-item');
            if (item && item.dataset.page !== draggedPageId) {
                const draggedEl = document.querySelector('.nav-item[data-page="' + draggedPageId + '"]');
                if (draggedEl && draggedEl.parentElement === item.parentElement) {
                    item.classList.add('drag-over');
                }
            }
        }
    });

    sidebarNav.addEventListener('dragleave', function(e) {
        const item = e.target.closest('.nav-item');
        if (item) item.classList.remove('drag-over');
        const section = e.target.closest('.nav-section');
        if (section && !section.contains(e.relatedTarget)) {
            section.classList.remove('drag-over-section');
        }
    });

    sidebarNav.addEventListener('drop', function(e) {
        e.preventDefault();

        if (dragType === 'category') {
            document.querySelectorAll('.nav-section').forEach(s => s.classList.remove('drag-over-section'));
            const toSection = e.target.closest('.nav-section');
            if (!toSection || !draggedCategoryName) return;
            const toCategory = toSection.dataset.category;
            if (!toCategory || toCategory === draggedCategoryName) return;

            const fromEl = document.querySelector('.nav-section[data-category="' + draggedCategoryName + '"]');
            if (!fromEl) return;

            const rect = toSection.getBoundingClientRect();
            const midY = rect.top + rect.height / 2;
            if (e.clientY < midY) {
                toSection.parentElement.insertBefore(fromEl, toSection);
            } else {
                toSection.parentElement.insertBefore(fromEl, toSection.nextSibling);
            }

            syncCategoryOrderFromDOM();
            saveCategoryOrderToServer();
            return;
        }

        if (dragType === 'page') {
            const item = e.target.closest('.nav-item');
            if (!item) return;
            item.classList.remove('drag-over');
            const toId = item.dataset.page;
            if (!draggedPageId || !toId || draggedPageId === toId) return;

            const fromEl = document.querySelector('.nav-item[data-page="' + draggedPageId + '"]');
            if (!fromEl) return;
            if (fromEl.parentElement !== item.parentElement) return;

            const rect = item.getBoundingClientRect();
            const midY = rect.top + rect.height / 2;
            if (e.clientY < midY) {
                item.parentElement.insertBefore(fromEl, item);
            } else {
                item.parentElement.insertBefore(fromEl, item.nextSibling);
            }

            syncPageOrderFromDOM();
            savePageOrderToServer();
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const sidebarNav = document.getElementById('sidebarNav');

    sidebarNav.addEventListener('click', function(e) {
        const navItem = e.target.closest('.nav-item');
        if (navItem) {
            e.preventDefault();
            updatePage(navItem.dataset.page);
        }
    });

    document.getElementById('nextPage').addEventListener('click', function() {
        updatePage(this.dataset.page);
    });

    document.getElementById('prevPage').addEventListener('click', function() {
        updatePage(this.dataset.page);
    });

    document.getElementById('categoryLink').addEventListener('click', function(e) {
        e.preventDefault();
        updatePage(this.dataset.page);
    });

    const userMenuTrigger = document.getElementById('userMenuTrigger');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const profileCard = document.getElementById('profileCard');
    const myProfileBtn = document.getElementById('myProfileBtn');

    userMenuTrigger.addEventListener('click', function(e) {
        e.stopPropagation();
        if (profileCard.classList.contains('visible')) {
            profileCard.classList.remove('visible');
        }
        dropdownMenu.classList.toggle('show');
    });

    myProfileBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        dropdownMenu.classList.remove('show');

        if (currentUser) {
            profileCard.querySelector('.profile-card-avatar').src = currentUser.avatar;
            profileCard.querySelector('.profile-card-username').textContent = currentUser.username;
            profileCard.querySelector('.profile-card-id').textContent = currentUser.id;
            profileCard.querySelector('.profile-card-role').textContent = getRoleLabel();

            if (userJoinedAt) {
                const d = new Date(userJoinedAt);
                profileCard.querySelector('.profile-card-joined').textContent = 'Joined ' + d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            } else {
                profileCard.querySelector('.profile-card-joined').textContent = '';
            }
        }

        profileCard.classList.add('visible');
    });

    document.addEventListener('click', function() {
        dropdownMenu.classList.remove('show');
        profileCard.classList.remove('visible');
    });

    dropdownMenu.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    profileCard.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        clearSessionToken();
        sessionStorage.removeItem('crp-welcomed');
        isAuthenticated = false;
        currentUser = null;
        userRole = null;
        userRoles = [];
        userJoinedAt = null;
        profileCard.classList.remove('visible');
        pages = JSON.parse(JSON.stringify(defaultPages));
        Object.assign(collapsibles, JSON.parse(JSON.stringify(defaultCollapsibles)));
        pageOrder = {};
        categoryOrder = {};
        customPages = {};
        categories = [];
        updateAuthUI();
    });

    initSearch();
    checkAuth();
});

document.addEventListener('DOMContentLoaded', function() {
    const editModal = document.getElementById('editModal');

    document.getElementById('editContentBtn').addEventListener('click', openPageEditModal);

    document.getElementById('editModalClose').addEventListener('click', closeEditModal);
    document.getElementById('editCancelBtn').addEventListener('click', closeEditModal);

    editModal.addEventListener('click', function(e) {
        if (e.target === editModal) closeEditModal();
    });

    document.getElementById('editSaveBtn').addEventListener('click', async function() {
        const markdown = document.getElementById('editContentArea').value;
        const html = markdownToHtml(markdown);
        const token = getSessionToken();

        if (editMode === 'collapsible' && editingCollapsibleKey) {
            collapsibles[editingCollapsibleKey].content = html;
            try {
                await fetch('/api/content', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({ type: 'collapsible', collapsibleId: editingCollapsibleKey, content: html })
                });
            } catch (e) {}
            closeEditModal();
            updatePage(currentPageId);
        } else {
            pages[currentPageId].content = html;
            try {
                await fetch('/api/content', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({ pageId: currentPageId, content: html })
                });
            } catch (e) {}
            closeEditModal();
            updatePage(currentPageId);
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'escape' || e.key === 'Escape') {
            closeEditModal();
            closeNewPageModal();
            closePageSettingsModal();
            closeNewCollapsibleModal();
            closeNewCategoryModal();
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('newPageBtn').addEventListener('click', openNewPageModal);
    document.getElementById('newPageModalClose').addEventListener('click', closeNewPageModal);
    document.getElementById('newPageCancelBtn').addEventListener('click', closeNewPageModal);
    document.getElementById('newPageSaveBtn').addEventListener('click', createNewPage);
    document.getElementById('deletePageBtn').addEventListener('click', deleteCurrentPage);

    document.getElementById('newPageModal').addEventListener('click', function(e) {
        if (e.target === this) closeNewPageModal();
    });

    document.getElementById('editPageBtn').addEventListener('click', openPageSettingsModal);
    document.getElementById('pageSettingsModalClose').addEventListener('click', closePageSettingsModal);
    document.getElementById('pageSettingsCancelBtn').addEventListener('click', closePageSettingsModal);
    document.getElementById('pageSettingsSaveBtn').addEventListener('click', savePageSettings);

    document.getElementById('pageSettingsModal').addEventListener('click', function(e) {
        if (e.target === this) closePageSettingsModal();
    });

    document.getElementById('newCollapsibleBtn').addEventListener('click', openNewCollapsibleModal);
    document.getElementById('newCollapsibleModalClose').addEventListener('click', closeNewCollapsibleModal);
    document.getElementById('newCollapsibleCancelBtn').addEventListener('click', closeNewCollapsibleModal);
    document.getElementById('newCollapsibleSaveBtn').addEventListener('click', createNewCollapsible);

    document.getElementById('newCollapsibleModal').addEventListener('click', function(e) {
        if (e.target === this) closeNewCollapsibleModal();
    });

    document.getElementById('newCategoryBtn').addEventListener('click', openNewCategoryModal);
    document.getElementById('newCategoryModalClose').addEventListener('click', closeNewCategoryModal);
    document.getElementById('newCategoryCancelBtn').addEventListener('click', closeNewCategoryModal);
    document.getElementById('newCategorySaveBtn').addEventListener('click', createNewCategory);

    document.getElementById('newCategoryModal').addEventListener('click', function(e) {
        if (e.target === this) closeNewCategoryModal();
    });

    initDragAndDrop();
});
