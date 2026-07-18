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

let customPages = {};

function getVisiblePages() {
    if (!isAuthenticated) return ['welcome'];
    const base = ['welcome', 'staff-welcome', 'hr-welcome', 'staff-guide-1', 'high-rank', 'duties', 'expectations', 'resources'];
    if (userRole === 'highrank') {
        if (canEdit()) base.splice(3, 0, 'data-management');
        for (const [id, p] of Object.entries(customPages)) {
            if (p.visibility === 'highrank' || p.visibility === 'staff' || p.visibility === 'auth' || (p.visibility === 'editor' && canEdit())) {
                base.splice(base.indexOf(p.afterPage) + 1, 0, id);
            }
        }
        return base;
    }
    if (userRole === 'staff') {
        const staffBase = ['welcome', 'staff-welcome', 'staff-guide-1'];
        for (const [id, p] of Object.entries(customPages)) {
            if (p.visibility === 'staff' || p.visibility === 'auth') {
                staffBase.splice(staffBase.indexOf(p.afterPage) + 1, 0, id);
            }
        }
        return staffBase;
    }
    if (canEdit()) {
        const editorBase = ['welcome'];
        for (const [id, p] of Object.entries(customPages)) {
            if (p.visibility === 'editor' || p.visibility === 'auth') {
                editorBase.splice(editorBase.indexOf(p.afterPage) + 1, 0, id);
            }
        }
        return editorBase;
    }
    return ['welcome'];
}

function processShortcodes(html) {
    return html.replace(/\[(\w+)\]/g, function(match, key) {
        const c = collapsibles[key];
        if (!c) return match;
        const editBtn = canEdit()
            ? `<button class="collapsible-edit-btn" data-collapsible="${key}" title="Edit section">&#9998;</button>`
            : '';
        return `<div class="collapsible" data-collapsible="${key}">
            <div class="collapsible-header">
                <button class="collapsible-trigger">${c.title}<span class="collapsible-arrow">&#9662;</span></button>
                ${editBtn}
            </div>
            <div class="collapsible-content">${c.content}</div>
        </div>`;
    });
}

function updatePage(pageId) {
    const page = pages[pageId];
    if (!page) return;

    const visiblePages = getVisiblePages();
    if (!visiblePages.includes(pageId)) {
        pageId = visiblePages[0];
    }

    currentPageId = pageId;

    const activePage = pages[pageId];
    const pageTitle = document.querySelector('.page-title');
    const contentBody = document.getElementById('contentBody');
    const nextPageEl = document.getElementById('nextPage');
    const prevPageEl = document.getElementById('prevPage');
    const lastUpdatedEl = document.querySelector('.last-updated');
    const categoryLinkEl = document.getElementById('categoryLink');
    const titleIconEl = document.getElementById('titleIcon');
    const navItems = document.querySelectorAll('.nav-item');
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

    navItems.forEach(nav => {
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

async function loadContent() {
    try {
        const res = await fetch('/api/content');
        if (res.ok) {
            const data = await res.json();
            if (data.deletedPages) {
                for (const pageId of data.deletedPages) {
                    delete pages[pageId];
                    delete defaultPages[pageId];
                    document.querySelectorAll(`.nav-item[data-page="${pageId}"]`).forEach(el => el.remove());
                }
            }
            if (data.pages) {
                for (const [id, page] of Object.entries(data.pages)) {
                    if (pages[id]) {
                        pages[id].content = page.content;
                        if (page.lastUpdated) pages[id].lastUpdated = page.lastUpdated;
                    }
                    if (page.title && pages[id]) pages[id].title = page.title;
                    if (page.icon && pages[id]) pages[id].icon = page.icon;
                }
            }
            if (data.collapsibles) {
                for (const [id, c] of Object.entries(data.collapsibles)) {
                    if (collapsibles[id]) {
                        collapsibles[id].content = c.content;
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
                renderCustomSidebarItems();
            }
            updateSidebarTitles();
        }
    } catch (e) {}
}

function resolveIconPath(icon) {
    if (!icon) return 'assets/icons/wave.svg';
    if (icon.startsWith('assets/') || icon.startsWith('http')) return icon;
    return 'assets/icons/' + icon;
}

function updateSidebarTitles() {
    for (const [id, page] of Object.entries(pages)) {
        const navItem = document.querySelector(`.nav-item[data-page="${id}"]`);
        if (navItem && page.title) {
            const textNode = navItem.childNodes[navItem.childNodes.length - 1];
            if (textNode && textNode.nodeType === 3) {
                textNode.textContent = '\n                        ' + page.title + '\n                    ';
            }
            const img = navItem.querySelector('.nav-icon img');
            if (img && page.icon) {
                img.src = page.icon;
            }
        }
    }
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
    let inBlockquote = false;

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

    const hash = window.location.hash.slice(1);
    const visiblePages = getVisiblePages();
    if (hash && pages[hash] && visiblePages.includes(hash)) {
        updatePage(hash);
    } else {
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
        item.innerHTML = `<div class="search-result-category">${r.category}</div><div class="search-result-title">${r.title}</div>`;
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
        more.textContent = `Show More — ${results.length - 5} Result${results.length - 5 > 1 ? 's' : ''}`;
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

document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            updatePage(this.dataset.page);
        });
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
        updateAuthUI();
    });

    initSearch();

    checkAuth();
});

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
        }
    });
});

function renderCustomSidebarItems() {
    document.querySelectorAll('.nav-item.custom-page-item').forEach(el => el.remove());

    const sections = {
        'Introduction': document.querySelector('.nav-section:not(.staff-required-section):not(.highrank-required-section)'),
        'Staff Guides': document.querySelector('.nav-section.staff-required-section'),
        'High Rank Guides': document.querySelector('.nav-section.highrank-required-section')
    };

    for (const [id, page] of Object.entries(customPages)) {
        const section = sections[page.category];
        if (!section) continue;

        const a = document.createElement('a');
        a.href = '#' + id;
        a.className = 'nav-item custom-page-item';
        a.dataset.page = id;

        let visClass = 'auth-required';
        if (page.visibility === 'staff') visClass = 'staff-required';
        else if (page.visibility === 'highrank') visClass = 'highrank-required';
        else if (page.visibility === 'editor') visClass = 'editor-required';
        a.classList.add(visClass);

        a.innerHTML = `<span class="nav-icon"><img src="${page.icon}" alt=""></span>${page.title}`;
        a.addEventListener('click', function(e) {
            e.preventDefault();
            updatePage(this.dataset.page);
        });

        const navSection = section.classList.contains('nav-section') ? section : section;
        navSection.appendChild(a);
    }
}

function openNewPageModal() {
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
    const categoryFirstPages = {
        'Introduction': 'welcome',
        'Staff Guides': 'staff-guide-1',
        'High Rank Guides': 'high-rank'
    };

    const pageData = {
        title,
        icon,
        category,
        visibility,
        content: '<p>Edit this page to add content.</p>',
        lastUpdated: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        categoryFirstPage: categoryFirstPages[category] || 'welcome',
        afterPage: categoryFirstPages[category] || 'welcome'
    };

    customPages[id] = pageData;
    pages[id] = {
        title,
        content: pageData.content,
        lastUpdated: pageData.lastUpdated,
        category,
        categoryFirstPage: pageData.categoryFirstPage,
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

    renderCustomSidebarItems();
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

    document.querySelectorAll(`.nav-item[data-page="${currentPageId}"]`).forEach(el => el.remove());

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
                isCustom
            })
        });
    } catch (e) {}

    closePageSettingsModal();
    updatePage(currentPageId);
}

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
});
