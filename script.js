const authPages = ['welcome'];
const allPages = ['welcome', 'staff-welcome', 'hr-welcome', 'high-rank', 'duties', 'expectations', 'resources'];

let isAuthenticated = false;
let currentUser = null;

function getSessionToken() {
    return localStorage.getItem('crp-session');
}

function setSessionToken(token) {
    localStorage.setItem('crp-session', token);
}

function clearSessionToken() {
    localStorage.removeItem('crp-session');
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
    updateAuthUI();
}

function updateAuthUI() {
    const loginBtn = document.getElementById('loginBtn');
    const userMenu = document.getElementById('userMenu');
    const userAvatar = document.getElementById('userAvatar');
    const body = document.body;

    if (isAuthenticated && currentUser) {
        loginBtn.style.display = 'none';
        userMenu.style.display = 'block';
        userAvatar.src = currentUser.avatar;
        body.classList.add('authenticated');
    } else {
        loginBtn.style.display = 'inline-block';
        userMenu.style.display = 'none';
        body.classList.remove('authenticated');
    }

    const hash = window.location.hash.slice(1);
    if (hash && pages[hash] && (isAuthenticated || authPages.includes(hash))) {
        updatePage(hash);
    } else {
        updatePage('welcome');
    }
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

const pageOrder = ['welcome', 'staff-welcome', 'hr-welcome', 'high-rank', 'duties', 'expectations', 'resources'];

document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');
    const pageTitle = document.querySelector('.page-title');
    const contentBody = document.querySelector('.content-body');
    const nextPageEl = document.getElementById('nextPage');
    const prevPageEl = document.getElementById('prevPage');
    const lastUpdatedEl = document.querySelector('.last-updated');
    const categoryLinkEl = document.getElementById('categoryLink');
    const titleIconEl = document.getElementById('titleIcon');

    function updatePage(pageId) {
        const page = pages[pageId];
        if (!page) return;

        if (!isAuthenticated && pageId !== 'welcome') {
            pageId = 'welcome';
        }

        const activePage = pages[pageId];
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

        const visiblePages = isAuthenticated ? allPages : authPages;
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

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            updatePage(this.dataset.page);
        });
    });

    nextPageEl.addEventListener('click', function() {
        updatePage(this.dataset.page);
    });

    prevPageEl.addEventListener('click', function() {
        updatePage(this.dataset.page);
    });

    categoryLinkEl.addEventListener('click', function(e) {
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
        isAuthenticated = false;
        currentUser = null;
        updateAuthUI();
    });

    checkAuth();
});