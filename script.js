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
    }
};

const defaultPages = {
    'welcome': {
        title: 'Welcome',
        content: '<p>As a high-ranking team member, your duties are more elevated. You\'re given more responsibilities for you to handle & monitor. It\'s crucial you do your weekly duties to ensure the community & staff team runs effortlessly.</p>',
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

function getVisiblePages() {
    if (!isAuthenticated) return ['welcome'];
    if (userRole === 'highrank') {
        return ['welcome', 'staff-welcome', 'hr-welcome', 'data-management', 'staff-guide-1', 'high-rank', 'duties', 'expectations', 'resources'];
    }
    if (userRole === 'staff') {
        return ['welcome', 'staff-welcome', 'hr-welcome', 'data-management', 'staff-guide-1'];
    }
    return ['welcome'];
}

function processShortcodes(html) {
    return html.replace(/\[(\w+)\]/g, function(match, key) {
        const c = collapsibles[key];
        if (!c) return match;
        return `<div class="collapsible" data-collapsible="${key}">
            <button class="collapsible-trigger">${c.title}<span class="collapsible-arrow">&#9662;</span></button>
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
            this.parentElement.classList.toggle('open');
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
            if (data.pages) {
                for (const [id, page] of Object.entries(data.pages)) {
                    if (pages[id]) {
                        pages[id].content = page.content;
                        if (page.lastUpdated) pages[id].lastUpdated = page.lastUpdated;
                    }
                }
            }
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

    body.classList.remove('role-staff', 'role-highrank');

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
        updateAuthUI();
    });

    initSearch();

    const editModal = document.getElementById('editModal');
    const editModalClose = document.getElementById('editModalClose');
    const editCancelBtn = document.getElementById('editCancelBtn');
    const editSaveBtn = document.getElementById('editSaveBtn');
    const editContentArea = document.getElementById('editContentArea');

    document.getElementById('editContentBtn').addEventListener('click', function() {
        const page = pages[currentPageId];
        if (!page) return;
        editContentArea.value = htmlToMarkdown(page.content);
        editModal.classList.add('visible');
    });

    editModalClose.addEventListener('click', function() {
        editModal.classList.remove('visible');
    });

    editCancelBtn.addEventListener('click', function() {
        editModal.classList.remove('visible');
    });

    editModal.addEventListener('click', function(e) {
        if (e.target === editModal) editModal.classList.remove('visible');
    });

    editSaveBtn.addEventListener('click', async function() {
        const markdown = editContentArea.value;
        const html = markdownToHtml(markdown);
        const token = getSessionToken();

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

        editModal.classList.remove('visible');
        updatePage(currentPageId);
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            editModal.classList.remove('visible');
        }
    });

    checkAuth();
});
