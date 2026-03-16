document.addEventListener('DOMContentLoaded', () => {

    gsap.registerPlugin(ScrollTrigger);

    // --- 1. Smooth Scroll (Lenis) ---
    const lenis = new Lenis({
        duration: 2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
        smoothTouch: false,
    });
    
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time)=>{
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    // --- 2. Play Hero Animations Instantly ---
    playHeroAnimations();



    // --- 4. Hero Reveal Animations ---
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

    // --- 5. Mind-Blowing Horizontal Scroll ---
    const hContainer = document.getElementById('h-container');
    const hPanels = gsap.utils.toArray('.h-panel');

    // Calculate total scroll width
    let totalScrollWidth = 0;
    if (hPanels.length > 0) {
        totalScrollWidth = hPanels[0].offsetWidth * (hPanels.length - 1);
    }

    // Horizontal Scroll tween tied to vertical scroll
    if (document.querySelector('.horizontal-scroll-wrapper') && hPanels.length > 0) {
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

        // Active state classes for the horizontal panels (triggers the text reveal)
        hPanels.forEach((panel, i) => {
            ScrollTrigger.create({
                trigger: panel,
                containerAnimation: scrollTween,
                start: "left center",
                end: "right center",
                toggleClass: "is-active"
            });
        });

        // Parallax background text inside horizontal section
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
    }

    // --- 6. Fade Up Animations ---
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

    // --- 7. FAQ Accordion ---
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

    // --- 8. Stats Counters ---
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

    // --- 9. Mobile Menu ---
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (mobileToggle && mobileMenu) {
        function toggleMenu() {
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        }

        mobileToggle.addEventListener('click', toggleMenu);

        mobileLinks.forEach(link => {
            link.addEventListener('click', toggleMenu);
        });
    }

});
