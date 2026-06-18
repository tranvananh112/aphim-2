// Smart Splash Loader - Skip for fast-loading pages
(function () {
    'use strict';

    // Pages that don't need splash loader (load very fast)
    const skipSplashPages = [
        'movie-detail.html',
        'watch.html',
        'watch-simple.html',
        'watch-direct.html'
    ];

    // Check if current page should skip splash loader
    function shouldSkipSplash() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        return skipSplashPages.some(page => currentPage.includes(page));
    }

    // If should skip, don't load splash loader
    if (shouldSkipSplash()) {
        console.log('Splash loader skipped for fast-loading page:', window.location.pathname);
        return;
    }

    // Create splash screen HTML
    const splashHTML = `
        <div id="splashLoader">
            <!-- Particles background -->
            <div class="splash-particles">
                <div class="splash-particle"></div>
                <div class="splash-particle"></div>
                <div class="splash-particle"></div>
                <div class="splash-particle"></div>
                <div class="splash-particle"></div>
                <div class="splash-particle"></div>
                <div class="splash-particle"></div>
                <div class="splash-particle"></div>
                <div class="splash-particle"></div>
            </div>

            <!-- Logo with animated rings -->
            <div class="splash-logo-container">
                <div class="splash-ring"></div>
                <div class="splash-ring"></div>
                <div class="splash-ring"></div>
                <img src="/apple-touch-icon.png" alt="A Phim Logo" class="splash-logo">
            </div>

            <!-- Brand name -->
            <div class="splash-brand">
                A <span class="highlight">Phim</span>
            </div>

            <!-- Tagline -->
            <div class="splash-tagline">Cinema</div>

            <!-- Loading bar -->
            <div class="splash-loading-bar">
                <div class="splash-loading-fill"></div>
            </div>

            <!-- Loading text -->
            <div class="splash-loading-text">Đang tải trải nghiệm điện ảnh...</div>
        </div>
    `;

    // Insert splash screen at the beginning of body
    if (document.body) {
        document.body.insertAdjacentHTML('afterbegin', splashHTML);
    } else {
        document.addEventListener('DOMContentLoaded', function () {
            document.body.insertAdjacentHTML('afterbegin', splashHTML);
        });
    }

    // Hide splash screen when page is fully loaded
    function hideSplashScreen() {
        const splash = document.getElementById('splashLoader');
        if (splash) {
            // Add a minimum display time of 800ms for better UX
            const minDisplayTime = 800;
            const startTime = window.splashStartTime || Date.now();
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, minDisplayTime - elapsedTime);

            setTimeout(() => {
                splash.classList.add('hidden');
                // Remove from DOM after transition
                setTimeout(() => {
                    splash.remove();
                }, 500);
            }, remainingTime);
        }
    }

    // Record start time
    window.splashStartTime = Date.now();

    // Hide splash when page is loaded
    if (document.readyState === 'complete') {
        hideSplashScreen();
    } else {
        window.addEventListener('load', hideSplashScreen);
    }

    // Fallback: hide after 5 seconds max
    setTimeout(hideSplashScreen, 5000);

})();

