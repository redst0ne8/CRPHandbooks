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

let searchAllExpanded = false;
let lastSearchResults = [];

function handleSearch() {
    const input = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('searchResults');
    const query = input.value;

    searchAllExpanded = false;

    if (!query.trim()) {
        resultsContainer.classList.remove('visible');
        resultsContainer.innerHTML = '';
        lastSearchResults = [];
        return;
    }

    const results = searchPages(query);
    lastSearchResults = results;
    renderSearchResults(resultsContainer, results);
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
            searchAllExpanded = true;
            renderSearchResults(resultsContainer, lastSearchResults, true);
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

let isAuthenticated = false;
let currentUser = null;
let userRole = null;

const GUILD_ID = '1317032666331353099';
const STAFF_ROLE_ID = '1460812651168010304';
const HIGH_RANK_ROLE_ID = '1460812635846086656';

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
        return ['welcome', 'staff-welcome', 'hr-welcome', 'staff-guide-1', 'high-rank', 'duties', 'expectations', 'resources'];
    }
    if (userRole === 'staff') {
        return ['welcome', 'staff-welcome', 'hr-welcome', 'staff-guide-1'];
    }
    return ['welcome'];
}

const pages = {
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
    }
};

function updatePage(pageId) {
    const page = pages[pageId];
    if (!page) return;

    const visiblePages = getVisiblePages();
    if (!visiblePages.includes(pageId)) {
        pageId = visiblePages[0];
    }

    const activePage = pages[pageId];
    const pageTitle = document.querySelector('.page-title');
    const contentBody = document.querySelector('.content-body');
    const nextPageEl = document.getElementById('nextPage');
    const prevPageEl = document.getElementById('prevPage');
    const lastUpdatedEl = document.querySelector('.last-updated');
    const categoryLinkEl = document.getElementById('categoryLink');
    const titleIconEl = document.getElementById('titleIcon');
    const navItems = document.querySelectorAll('.nav-item');

    pageTitle.textContent = activePage.title;
    contentBody.innerHTML = activePage.content;
    lastUpdatedEl.textContent = 'Last Updated: ' + activePage.lastUpdated;
    categoryLinkEl.textContent = activePage.category;
    categoryLinkEl.dataset.page = activePage.categoryFirstPage;
    titleIconEl.src = activePage.icon;

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
            updateAuthUI();
        } else {
            showWelcomeOverlay();
        }
    } else {
        updateAuthUI();
    }
}

function showWelcomeOverlay() {
    const overlay = document.getElementById('welcomeOverlay');
    const avatar = document.getElementById('welcomeAvatar');
    const username = document.getElementById('welcomeUsername');

    avatar.src = currentUser.avatar;
    username.textContent = currentUser.username;
    overlay.classList.add('show');

    sessionStorage.setItem('crp-welcomed', '1');

    setTimeout(async () => {
        await checkRoles();
        overlay.classList.remove('show');
        overlay.classList.add('hiding');
        overlay.addEventListener('animationend', function handler() {
            overlay.classList.remove('hiding');
            overlay.removeEventListener('animationend', handler);
        });
        updateAuthUI();
    }, 2000);
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
    }

    const hash = window.location.hash.slice(1);
    const visiblePages = getVisiblePages();
    if (hash && pages[hash] && visiblePages.includes(hash)) {
        updatePage(hash);
    } else {
        updatePage(visiblePages[0]);
    }
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

    userMenuTrigger.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });

    document.addEventListener('click', function() {
        dropdownMenu.classList.remove('show');
    });

    dropdownMenu.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        clearSessionToken();
        sessionStorage.removeItem('crp-welcomed');
        isAuthenticated = false;
        currentUser = null;
        userRole = null;
        updateAuthUI();
    });

    initSearch();
    checkAuth();
});