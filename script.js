document.addEventListener('DOMContentLoaded', () => {

    // Mark body as JS-loaded (enables fade-up animations; without JS, content stays visible)
    document.body.classList.add('js-loaded');

    gsap.registerPlugin(ScrollTrigger);

    // --- 1. Smooth Scroll (Lenis) ---
    const lenis = new Lenis({
        duration: 2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
        smoothTouch: false,
    });
    
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // --- 2. Anchor Link Smooth Scroll via Lenis ---
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                lenis.scrollTo(target, { offset: -80 });

                // Close mobile menu if open
                const mobileMenu = document.getElementById('mobile-menu');
                if (mobileMenu && mobileMenu.classList.contains('active')) {
                    closeMobileMenu();
                }
            }
        });
    });

    // --- 3. Hero Animations ---
    playHeroAnimations();

    function playHeroAnimations() {
        gsap.fromTo('.anim-title', 
            { y: 150, opacity: 0, scale: 0.9, filter: "blur(10px)" }, 
            { y: 0, opacity: 0.8, scale: 1, filter: "blur(0px)", duration: 2, ease: "power4.out" }
        );
        gsap.fromTo('.anim-sub', 
            { x: -100, opacity: 0 }, 
            { x: 0, opacity: 1, duration: 1.5, ease: "power3.out", delay: 0.5, stagger: 0.2 }
        );
    }

    // --- 4. Nav: hide on scroll down, show on scroll up (skip horizontal section) ---
    const navAvant = document.querySelector('.nav-avant');
    const hWrapper = document.querySelector('.horizontal-scroll-wrapper');
    if (navAvant) {
        let lastScrollY = 0;

        lenis.on('scroll', ({ scroll }) => {
            // Check if we're inside the horizontal scroll section — if so, keep nav visible
            if (hWrapper) {
                const rect = hWrapper.getBoundingClientRect();
                if (rect.top <= 0 && rect.bottom >= 0) {
                    navAvant.classList.remove('nav-hidden');
                    lastScrollY = scroll;
                    return;
                }
            }

            if (scroll > lastScrollY && scroll > 100) {
                // Scrolling down — hide
                navAvant.classList.add('nav-hidden');
            } else {
                // Scrolling up — show
                navAvant.classList.remove('nav-hidden');
            }
            lastScrollY = scroll;
        });
    }

    // --- 5. Scroll Indicator — hide after user scrolls ---
    const scrollIndicator = document.querySelector('.scroll-indicator-line');
    if (scrollIndicator) {
        ScrollTrigger.create({
            trigger: document.body,
            start: "top -150px",
            onEnter: () => scrollIndicator.classList.add('hidden'),
            onLeaveBack: () => scrollIndicator.classList.remove('hidden'),
        });
    }

    // --- 6. Horizontal Scroll (Desktop only via matchMedia) ---
    ScrollTrigger.matchMedia({
        "(min-width: 1001px)": function() {
            // All ScrollTriggers created inside this function are automatically
            // cleaned up when the media query no longer matches
            const hPanels = gsap.utils.toArray('.h-panel');
            if (!document.querySelector('.horizontal-scroll-wrapper') || hPanels.length === 0) return;

            let totalScrollWidth = hPanels[0].offsetWidth * (hPanels.length - 1);

            let scrollTween = gsap.to(hPanels, {
                xPercent: -100 * (hPanels.length - 1),
                ease: "none",
                scrollTrigger: {
                    trigger: ".horizontal-scroll-wrapper",
                    pin: true,
                    scrub: 1,
                    end: () => "+=" + totalScrollWidth
                }
            });

            // Active state classes for text reveal
            hPanels.forEach((panel) => {
                ScrollTrigger.create({
                    trigger: panel,
                    containerAnimation: scrollTween,
                    start: "left center",
                    end: "right center",
                    toggleClass: "is-active"
                });
            });

            // Parallax background text
            gsap.to('.h-bg-text', {
                x: -500,
                ease: "none",
                scrollTrigger: {
                    trigger: ".horizontal-scroll-wrapper",
                    scrub: true,
                    start: "top top",
                    end: () => "+=" + totalScrollWidth
                }
            });
        },
        "(max-width: 1000px)": function() {
            // On mobile, show all panels with text revealed
            document.querySelectorAll('.h-panel').forEach(panel => {
                panel.classList.add('is-active');
            });
        }
    });

    // --- 7. Fade Up Animations ---
    const fadeUps = document.querySelectorAll('.fade-up');
    fadeUps.forEach(el => {
        gsap.fromTo(el, 
            { y: 100, opacity: 0 },
            { 
                y: 0, opacity: 1, 
                duration: 1.2, 
                ease: "power3.out",
                scrollTrigger: {
                    trigger: el,
                    start: "top 85%"
                }
            }
        );
    });

    // --- 8. FAQ Accordion ---
    const accHeads = document.querySelectorAll('.acc-head');
    accHeads.forEach(head => {
        head.addEventListener('click', () => {
            const item = head.parentElement;
            const isActive = item.classList.contains('active');

            // Close all
            document.querySelectorAll('.acc-item').forEach(acc => acc.classList.remove('active'));

            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // --- 9. Stats Counters ---
    let countersStarted = false;
    function startCounters() {
        if (countersStarted) return;
        countersStarted = true;

        const counters = document.querySelectorAll('.counter-v3');
        const speed = 200;

        counters.forEach(counter => {
            const updateCount = () => {
                const target = +counter.getAttribute('data-target');
                const count = +counter.innerText;
                const inc = target / speed;

                if (count < target) {
                    counter.innerText = Math.ceil(count + inc);
                    setTimeout(updateCount, 15);
                } else {
                    counter.innerText = target;
                }
            };
            updateCount();
        });
    }

    if (document.querySelector('.resultados-v3')) {
        ScrollTrigger.create({
            trigger: ".resultados-v3",
            start: "top 75%",
            onEnter: startCounters
        });
    }

    // --- 10. Mobile Menu (with close button, ESC, overlay) ---
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileMenu = document.getElementById('mobile-menu');

    function openMobileMenu() {
        if (!mobileMenu) return;
        mobileMenu.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (mobileToggle) {
            mobileToggle.textContent = 'Menu [ × ]';
            mobileToggle.setAttribute('aria-expanded', 'true');
        }
        // Stop Lenis while menu is open
        lenis.stop();
    }

    function closeMobileMenu() {
        if (!mobileMenu) return;
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
        if (mobileToggle) {
            mobileToggle.textContent = 'Menu [ + ]';
            mobileToggle.setAttribute('aria-expanded', 'false');
        }
        // Resume Lenis
        lenis.start();
    }

    function toggleMenu() {
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }

    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', toggleMenu);

        // Close on link click (handled via anchor scroll too, but safety net)
        document.querySelectorAll('.mobile-link').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });

        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
                closeMobileMenu();
            }
        });

        // Close if clicking the overlay background
        mobileMenu.addEventListener('click', (e) => {
            if (e.target === mobileMenu) {
                closeMobileMenu();
            }
        });
    }

});
