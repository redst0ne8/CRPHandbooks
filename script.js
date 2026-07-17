const pages = {
    'welcome': {
        title: 'Welcome',
        content: '<p>As a high-ranking team member, your duties are more elevated. You\'re given more responsibilities for you to handle & monitor. It\'s crucial you do your weekly duties to ensure the community & staff team runs effortlessly.</p>',
        lastUpdated: 'July 17th, 2026'
    },
    'high-rank': {
        title: 'High Rank Intro',
        content: '<p>Welcome to the High Rank documentation section. Here you will find detailed information about your responsibilities and expectations.</p>',
        lastUpdated: 'July 17th, 2026'
    },
    'duties': {
        title: 'Weekly Duties',
        content: '<p>Complete your assigned duties on time to maintain team efficiency and community standards.</p>',
        lastUpdated: 'July 17th, 2026'
    },
    'guidelines': {
        title: 'Guidelines',
        content: '<p>Follow these guidelines to ensure consistent behavior and decision-making across the team.</p>',
        lastUpdated: 'July 17th, 2026'
    },
    'resources': {
        title: 'Resources',
        content: '<p>Access helpful resources, templates, and tools to assist you in your role.</p>',
        lastUpdated: 'July 17th, 2026'
    }
};

const pageOrder = ['welcome', 'high-rank', 'duties', 'guidelines', 'resources'];

document.addEventListener('DOMContentLoaded', function() {
    const navItems = document.querySelectorAll('.nav-item');
    const pageTitle = document.querySelector('.page-title');
    const contentBody = document.querySelector('.content-body');
    const nextPageEl = document.getElementById('nextPage');
    const prevPageEl = document.getElementById('prevPage');
    const lastUpdatedEl = document.querySelector('.last-updated');

    function updatePage(pageId) {
        const page = pages[pageId];
        if (!page) return;

        pageTitle.textContent = page.title;
        contentBody.innerHTML = page.content;
        lastUpdatedEl.textContent = 'Last Updated: ' + page.lastUpdated;

        navItems.forEach(nav => {
            nav.classList.remove('active');
            if (nav.dataset.page === pageId) {
                nav.classList.add('active');
            }
        });

        const currentIndex = pageOrder.indexOf(pageId);
        const nextIndex = currentIndex + 1;
        const prevIndex = currentIndex - 1;

        if (nextIndex < pageOrder.length) {
            const nextPageId = pageOrder[nextIndex];
            const nextPage = pages[nextPageId];
            nextPageEl.style.display = 'flex';
            nextPageEl.dataset.page = nextPageId;
            nextPageEl.querySelector('.pagination-title').textContent = nextPage.title;
        } else {
            nextPageEl.style.display = 'none';
        }

        if (prevIndex >= 0) {
            const prevPageId = pageOrder[prevIndex];
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
        } else if (nextIndex >= pageOrder.length) {
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

    const hash = window.location.hash.slice(1);
    if (hash && pages[hash]) {
        updatePage(hash);
    }
});