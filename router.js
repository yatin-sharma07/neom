
document.addEventListener('DOMContentLoaded', () => {
    console.log('Router initialized');

    let navigationData = null;

    // Fetch navigation data to help with routing and titles
    fetch('/en-us.navigation.json')
        .then(response => response.json())
        .then(data => {
            navigationData = data;
            console.log('Navigation data loaded');
        })
        .catch(err => console.error('Failed to load navigation data:', err));

    // Handle internal links
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (link) {
            const href = link.getAttribute('href');
            if (href && (href.startsWith('/en-us') || href.startsWith('/ar-sa'))) {
                // Check if it's actually an internal link and not a full URL to another domain
                if (href.startsWith('http')) return;

                e.preventDefault();
                console.log('Navigating to:', href);

                // Update URL without reloading
                window.history.pushState({}, '', href);

                handleRoute(href);
            }
        }
    });

    // Handle back/forward buttons
    window.addEventListener('popstate', () => {
        handleRoute(window.location.pathname);
    });

    function findPageInNavigation(items, path) {
        if (!items) return null;
        for (const item of items) {
            if (item.href === path) return item;
            if (item.items) {
                const found = findPageInNavigation(item.items, path);
                if (found) return found;
            }
        }
        return null;
    }

    function handleRoute(path) {
        console.log('Handling route:', path);
        
        // If it's the home page, we're already here
        if (path === '/' || path === '/en-us' || path === '/en-us/') {
            const mainContent = document.getElementById('app-content');
            if (window.homeContent && mainContent) {
                mainContent.innerHTML = window.homeContent;
                // Re-initialize any JS if needed (complex for a static dump)
            }
            window.scrollTo(0, 0);
            return;
        }

        // For other pages, we can show a placeholder since we don't have the content
        const mainContent = document.getElementById('app-content');
        if (mainContent) {
            // Store original content if not already stored
            if (!window.homeContent) {
                window.homeContent = mainContent.innerHTML;
            }

            let pageTitle = path.split('/').pop().replace(/-/g, ' ').toUpperCase();
            let pageDescription = 'This page is part of the NEOM website structure.';

            // Try to find more info in navigation data
            if (navigationData && navigationData.navigationContent && navigationData.navigationContent.navigation) {
                const pageInfo = findPageInNavigation(navigationData.navigationContent.navigation.main, path);
                if (pageInfo) {
                    pageTitle = pageInfo.label || pageTitle;
                    if (pageInfo.copy) pageDescription = pageInfo.copy;
                }
            }

            // Create a themed placeholder for the new page
            mainContent.innerHTML = `
                <div style="padding: 150px 20px; text-align: center; font-family: 'Brown', sans-serif; background: #fff; color: #000; min-height: 60vh;">
                    <h1 style="font-size: 3rem; margin-bottom: 20px; letter-spacing: 2px;">${pageTitle}</h1>
                    <p style="font-size: 1.2rem; color: #666; max-width: 600px; margin: 0 auto 40px;">${pageDescription}</p>
                    <div style="margin-top: 40px;">
                        <button onclick="window.history.back()" style="padding: 12px 30px; cursor: pointer; background: #c1a162; color: #fff; border: none; font-size: 1rem; text-transform: uppercase; letter-spacing: 1px;">Go Back</button>
                    </div>
                    <div style="margin-top: 50px;">
                        <a href="/en-us" style="color: #c1a162; text-decoration: none; border-bottom: 1px solid #c1a162; padding-bottom: 5px;">Return to Home</a>
                    </div>
                </div>
            `;
            
            // Scroll to top
            window.scrollTo(0, 0);
        }
    }
    
    // Initial check for the current path
    if (window.location.pathname !== '/' && window.location.pathname !== '/en-us' && window.location.pathname !== '/en-us/') {
        // Wait a bit for navigation data to load before initial route handling
        setTimeout(() => handleRoute(window.location.pathname), 500);
    }
});
