// Splash Screen Loader - Show beautiful loading screen while page loads
(function () {
    'use strict';

    // Skip loader optimization removed per user request: preloader should show on every F5
    // const hasLoadedThisSession = sessionStorage.getItem('splashLoaded');

    // Create splash screen HTML
    const splashHTML = `
        <style>
            @media (max-width: 768px) {
                .splash-background-image {
                    height: 50vh !important;
                    background-size: cover !important;
                    background-position: top !important;
                    background-repeat: no-repeat !important;
                    background-color: #000;
                    -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.75) 50%, rgba(0, 0, 0, 0) 100%) !important;
                    mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.75) 50%, rgba(0, 0, 0, 0) 100%) !important;
                }
            }
        </style>
        <div id="splashLoader">
            <!-- Background Warner Media Image -->
            <div class="splash-background-image" style="position: absolute; inset: 0; width: 100%; height: 100%; background-image: url('https://beam-images.warnermediacdn.com/2026-05/image_3.png?host=wbd-dotcom-drupal-prd-us-east-1.s3.amazonaws.com&w=2000'); background-size: cover; background-position: center; opacity: 1;"></div>
            
            <!-- Dark gradient covering more area and making the whole screen darker -->
            <div class="splash-bottom-gradient" style="position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0.85) 45%, #000000 75%, #000000 100%); z-index: 2;"></div>

            <!-- Particles background -->
            <div class="splash-particles" style="z-index: 3;"></div>

            <!-- Logo with animated rings (elevated z-index) -->
            <div class="splash-content-container" style="position: relative; z-index: 4; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <div class="splash-logo-container">
                    <div class="splash-ring"></div>
                    <div class="splash-ring"></div>
                    <div class="splash-ring"></div>
                    <img src="/apple-touch-icon.png" alt="A Phim Logo" class="splash-logo" style="opacity: 0; transition: opacity 0.3s;" onload="this.style.opacity = '1'">
                </div>

                <!-- Brand name -->
                <div class="splash-brand">
                    A <span class="highlight">Phim</span>
                </div>

                <!-- Tagline -->
                <div class="splash-tagline">Cinema</div>

                <!-- Loading bar -->
                <div class="splash-loading-bar">
                    <div class="splash-loading-fill" style="width: 5%; animation: none !important; transition: width 0.4s cubic-bezier(0.1, 0.8, 0.2, 1) !important;"></div>
                </div>

                <!-- Loading text -->
                <div class="splash-loading-text">Đang tải trải nghiệm điện ảnh...</div>
            </div>
        </div>
    `;

    // Insert splash screen at the beginning of body
    if (document.body) {
        document.body.insertAdjacentHTML('afterbegin', splashHTML);
        document.body.classList.add('splash-ready');
        const logoImg = document.querySelector('#splashLoader .splash-logo');
        if (logoImg && logoImg.complete) {
            logoImg.style.opacity = '1';
        }
    } else {
        document.addEventListener('DOMContentLoaded', function () {
            document.body.insertAdjacentHTML('afterbegin', splashHTML);
            document.body.classList.add('splash-ready');
            const logoImg = document.querySelector('#splashLoader .splash-logo');
            if (logoImg && logoImg.complete) {
                logoImg.style.opacity = '1';
            }
        });
    }

    // Record start time
    window.splashStartTime = Date.now();

    let isLoaded = false;
    let loaderActive = true;
    let lastProgress = 5;

    // Track active fetch requests (APIs)
    let fetchesStarted = 0;
    let fetchesCompleted = 0;

    const originalFetch = window.fetch;
    window.fetch = function (...args) {
        if (loaderActive) {
            fetchesStarted++;
            updateProgress();
        }
        return originalFetch.apply(window, args)
            .then(response => {
                if (loaderActive) {
                    fetchesCompleted++;
                    updateProgress();
                }
                return response;
            })
            .catch(error => {
                if (loaderActive) {
                    fetchesCompleted++;
                    updateProgress();
                }
                throw error;
            });
    };

    // Calculate real page load progress
    function getProgressPercentage() {
        // 1. DOM progress (up to 40%)
        let domProgress = 10;
        if (document.readyState === 'interactive' || document.readyState === 'complete') {
            domProgress = 40;
        }

        // 2. Resource progress (up to 40%)
        // Scan for stylesheets, scripts, and key images
        const resources = Array.from(document.querySelectorAll('link[rel="stylesheet"], script[src], img:not([loading="lazy"])'));
        let resProgress = 0;
        if (resources.length > 0) {
            let loadedCount = 0;
            resources.forEach(res => {
                if (res.tagName === 'IMG') {
                    if (res.complete) loadedCount++;
                } else {
                    const url = res.href || res.src;
                    if (url && (performance.getEntriesByName(url).length > 0 || res.sheet)) {
                        loadedCount++;
                    }
                }
            });
            resProgress = (loadedCount / resources.length) * 40;
        } else {
            resProgress = 40;
        }

        // 3. API progress (up to 20%)
        let apiProgress = 20;
        if (fetchesStarted > 0) {
            apiProgress = (fetchesCompleted / fetchesStarted) * 20;
        }

        let total = domProgress + resProgress + apiProgress;

        // Don't reach 100% until window.onload fires
        if (total >= 95 && !isLoaded) {
            total = 95;
        }

        return Math.min(100, Math.round(total));
    }

    // Update DOM loading bar fill width
    function updateProgress() {
        if (!loaderActive) return;
        
        const currentProgress = getProgressPercentage();
        if (currentProgress > lastProgress) {
            lastProgress = currentProgress;
            const fillBar = document.querySelector('#splashLoader .splash-loading-fill');
            if (fillBar) {
                fillBar.style.width = currentProgress + '%';
            }
        }
    }

    // Set up a low-overhead interval to poll resource progress during load
    const progressInterval = setInterval(updateProgress, 150);

    // Removed buildCollage() per user request

    // Build floating star particles dynamically
    function buildParticles() {
        const container = document.querySelector('#splashLoader .splash-particles');
        if (!container) return;

        const isMobile = window.innerWidth <= 768;
        const particleCount = isMobile ? 45 : 85; // 85 stars on desktop, 45 stars on mobile for rich density

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'splash-particle';
            
            // Randomize position, size, float duration, and starting delay
            const size = Math.random() * 2.8 + 1.2; // size between 1.2px and 4.0px
            const left = Math.random() * 100; // random horizontal distribution (0% to 100%)
            const duration = Math.random() * 4 + 3.5; // animation float duration between 3.5s and 7.5s
            
            // Use negative delay so particles start instantly at various vertical positions instead of rising from bottom together
            const delay = Math.random() * -8;
            
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${left}%`;
            particle.style.animationDuration = `${duration}s`;
            particle.style.animationDelay = `${delay}s`;
            
            // Premium bright yellow glow effect (box-shadow)
            particle.style.background = '#f2f20d';
            particle.style.boxShadow = `0 0 ${size * 2.2}px #f2f20d, 0 0 ${size * 4.5}px rgba(242, 242, 13, 0.85)`;
            
            container.appendChild(particle);
        }
    }

    // Trigger loader finish
    function triggerLoadComplete() {
        if (isLoaded) return;
        isLoaded = true;
        
        clearInterval(progressInterval);
        
        // Push progress bar to 100%
        const fillBar = document.querySelector('#splashLoader .splash-loading-fill');
        if (fillBar) {
            fillBar.style.width = '100%';
            fillBar.classList.add('filled');
        }
        
        // Hide splash screen after a short delay so user sees full load
        setTimeout(hideSplashScreen, 100);
    }

    // Listen to load events - Trigger on DOMContentLoaded for instant accessibility
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
        setTimeout(triggerLoadComplete, 250);
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(triggerLoadComplete, 250);
        });
        window.addEventListener('load', triggerLoadComplete);
    }

    // Fallback safety timeout (1.5 seconds)
    const safetyTimeout = setTimeout(() => {
        console.warn('Splash Loader: Safety timeout reached, forcing page display.');
        triggerLoadComplete();
    }, 1500);

    // Hide splash screen with smooth fade out
    function hideSplashScreen() {
        if (!loaderActive) return;
        loaderActive = false;
        
        clearInterval(progressInterval);
        clearTimeout(safetyTimeout);

        // Store loaded state in sessionStorage so we don't show the splash screen on subnavigation
        try {
            sessionStorage.setItem('splashLoaded', 'true');
        } catch (e) {
            console.warn('Failed to write to sessionStorage:', e);
        }

        const splash = document.getElementById('splashLoader');
        if (splash) {
            // Restore original fetch to cleanup
            try {
                window.fetch = originalFetch;
            } catch (e) {
                console.warn('Failed to restore original fetch:', e);
            }

            // Trigger premium blur and scale fade out
            splash.classList.add('splash-fade-out');

            // Remove from DOM after smooth transition completes
            setTimeout(() => {
                if (splash && splash.parentNode) {
                    splash.parentNode.removeChild(splash);
                }
            }, 500); // Allow transition to complete fully
        }
    }

    // Initialize particles & base progress
    function initSplashEffects() {
        buildParticles();

        // Dismiss splash screen instantly when user clicks/taps on it
        const splash = document.getElementById('splashLoader');
        if (splash) {
            const dismissSplash = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('⚡ User clicked splash screen - dismissing instantly');
                triggerLoadComplete();
            };
            splash.addEventListener('click', dismissSplash);
            splash.addEventListener('touchstart', dismissSplash, { passive: false });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSplashEffects);
    } else {
        initSplashEffects();
    }
    setTimeout(updateProgress, 50);

})();

