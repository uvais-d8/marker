function playLoaderToHeroTransition() {
    const loaderLetters = Array.from(document.querySelectorAll('.loader-content .willem__letter'));
    const heroTitle = document.querySelector('.hero__title');
    const heroSpan = heroTitle.querySelector('span');

    if (!loaderLetters.length || !heroSpan) {
        console.warn('Loader letters or hero title not found.');
        endLoaderContext();
        return;
    }

    // 1. Prepare Hero Letters
    // Split hero text into letters to get their positions
    const heroText = heroSpan.textContent.trim();
    heroSpan.innerHTML = '';
    const heroLetters = [];
    
    heroText.split('').forEach(char => {
        const s = document.createElement('span');
        s.textContent = char;
        s.style.opacity = '0'; // Hide initially
        s.style.display = 'inline-block';
        heroSpan.appendChild(s);
        heroLetters.push(s);
    });

    // 2. Get Coordinates
    // We need to measure *after* a slight layout cycle or ensure they are rendered.
    // Since hero is visible (just under overlay), we can measure.
    
    const loaderRects = loaderLetters.map(el => el.getBoundingClientRect());
    const heroRects = heroLetters.map(el => el.getBoundingClientRect());

    // 3. Create Flying Proxies
    // We will create fixed position clones of the loader letters to animate
    const proxies = [];
    
    loaderLetters.forEach((el, i) => {
        const rect = loaderRects[i];
        const proxy = el.cloneNode(true);
        
        // Match styles
        const computed = window.getComputedStyle(el);
        proxy.style.position = 'fixed';
        proxy.style.left = rect.left + 'px';
        proxy.style.top = rect.top + 'px';
        proxy.style.width = rect.width + 'px';
        proxy.style.height = rect.height + 'px';
        proxy.style.margin = '0';
        proxy.style.color = computed.color;
        proxy.style.fontFamily = computed.fontFamily;
        proxy.style.fontSize = computed.fontSize;
        proxy.style.fontWeight = computed.fontWeight;
        proxy.style.lineHeight = computed.lineHeight;
        proxy.style.zIndex = '9999';
        proxy.style.transition = 'none';
        proxy.style.transform = 'none'; // Reset any transform from loader
        
        document.body.appendChild(proxy);
        proxies.push(proxy);
        
        // Hide original loader letter
        el.style.opacity = '0';
    });

    // Hide the loader container background but keep it technically visible until animation ends
    // or just let the proxies fly over everything.
    // We can fade out the loader screen *background* now.
    gsap.to('.loader-screen', { opacity: 0, duration: 0.8, pointerEvents: 'none' });

    // 4. Animate Proxies to Hero Positions
    const tl = gsap.timeline({
        onComplete: () => {
            // Cleanup
            proxies.forEach(p => p.remove());
            heroLetters.forEach(l => l.style.opacity = '1');
            document.body.classList.remove('is-loading');
            document.querySelector('.loader-screen').style.display = 'none';
            ScrollTrigger.refresh();
        }
    });

    proxies.forEach((proxy, i) => {
        if (!heroRects[i]) return;
        
        const target = heroRects[i];
        
        tl.to(proxy, {
            left: target.left,
            top: target.top,
            width: target.width,
            height: target.height,
            fontSize: window.getComputedStyle(heroLetters[i]).fontSize,
            color: window.getComputedStyle(heroLetters[i]).color, // Interpolate color if different
            duration: 1.2,
            ease: "power3.inOut"
        }, i === 0 ? 0 : "<0.05"); // Stagger slightly
    });
}

function endLoaderContext() {
     document.body.classList.remove('is-loading');
     gsap.to('.loader-screen', {
         opacity: 0,
         display: 'none',
         duration: 0.5,
         onComplete: () => ScrollTrigger.refresh()
     });
}
