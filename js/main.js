/* ============================================
   KING'S LANDING TOURS - MAIN JAVASCRIPT
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // --- Equalize Tour Card Rows ---
    function equalizeTourCards() {
        const names = document.querySelectorAll('.tour-name');
        const descs = document.querySelectorAll('.tour-desc');
        const details = document.querySelectorAll('.tour-details');
        [names, descs, details].forEach(group => {
            group.forEach(el => el.style.minHeight = '');
            let max = 0;
            group.forEach(el => { if (el.offsetHeight > max) max = el.offsetHeight; });
            group.forEach(el => el.style.minHeight = max + 'px');
        });
    }
    equalizeTourCards();
    window.addEventListener('resize', equalizeTourCards);

    // --- Navbar Scroll Effect ---
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;
        if (currentScroll > 80) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
    });

    // --- Mobile Navigation Toggle ---
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile nav on link click
    navLinks.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    } // end navToggle guard

    // --- Hero Particles (subtle floating dots) ---
    const particlesContainer = document.getElementById('heroParticles');
    if (particlesContainer) {
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 3 + 1}px;
                height: ${Math.random() * 3 + 1}px;
                background: rgba(200, 169, 81, ${Math.random() * 0.3 + 0.1});
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: particleFloat ${Math.random() * 10 + 10}s ease-in-out infinite;
                animation-delay: ${Math.random() * 5}s;
            `;
            particlesContainer.appendChild(particle);
        }

        // Add particle animation to stylesheet
        const style = document.createElement('style');
        style.textContent = `
            @keyframes particleFloat {
                0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
                25% { transform: translate(${Math.random() * 60 - 30}px, ${Math.random() * 60 - 30}px) scale(1.2); opacity: 0.6; }
                50% { transform: translate(${Math.random() * 60 - 30}px, ${Math.random() * 60 - 30}px) scale(0.8); opacity: 0.2; }
                75% { transform: translate(${Math.random() * 60 - 30}px, ${Math.random() * 60 - 30}px) scale(1.1); opacity: 0.5; }
            }
        `;
        document.head.appendChild(style);
    }

    // --- Scroll Reveal Animations ---
    const revealElements = document.querySelectorAll(
        '.about-grid, .tour-card, .location-card, .gallery-item, .review-card, .faq-item, .booking-grid, .section-header'
    );

    revealElements.forEach(el => el.classList.add('reveal'));

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // --- Route Map: Click Toggle ---
    const routeStops = document.querySelectorAll('.route-stop');
    routeStops.forEach(stop => {
        stop.addEventListener('click', () => {
            const wasActive = stop.classList.contains('active');
            // Close all stops and their fee badges
            routeStops.forEach(s => {
                s.classList.remove('active');
                var badge = s.querySelector('.route-fee-toggle');
                if (badge) badge.classList.remove('active');
            });
            if (!wasActive) {
                stop.classList.add('active');
                var badge = stop.querySelector('.route-fee-toggle');
                if (badge) badge.classList.add('active');
            }
        });
    });

    // --- FAQ Accordion ---
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all
            faqItems.forEach(i => i.classList.remove('active'));
            
            // Toggle current
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // --- Reviews Carousel ---
    const track = document.querySelector('.reviews-track');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');

    if (track && prevBtn && nextBtn) {
    let currentSlide = 0;

    function getCardsPerView() {
        if (window.innerWidth <= 768) return 1;
        if (window.innerWidth <= 1024) return 2;
        return 3;
    }

    function getTotalSlides() {
        const cards = track.querySelectorAll('.review-card');
        return Math.max(0, cards.length - getCardsPerView());
    }

    function updateCarousel() {
        const card = track.querySelector('.review-card');
        const cardWidth = card.getBoundingClientRect().width + 24; // 24 = gap
        track.style.transform = `translateX(-${currentSlide * cardWidth}px)`;
    }

    prevBtn.addEventListener('click', () => {
        if (currentSlide > 0) {
            currentSlide--;
            updateCarousel();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentSlide < getTotalSlides()) {
            currentSlide++;
            updateCarousel();
        }
    });

    window.addEventListener('resize', () => {
        currentSlide = Math.min(currentSlide, getTotalSlides());
        updateCarousel();
    });
    } // end carousel guard

    // --- Locations Carousel (mobile only) ---
    function setupMobileCarousel(gridSelector, prevId, nextId, itemSelector) {
        var grid = document.querySelector(gridSelector);
        var prev = document.getElementById(prevId);
        var next = document.getElementById(nextId);
        if (!grid || !prev || !next) return;
        var idx = 0;

        function getItems() { return grid.querySelectorAll(itemSelector); }
        function isMobile() { return window.innerWidth <= 768; }

        function getItemWidth() {
            var items = getItems();
            if (!items.length) return 0;
            return items[0].getBoundingClientRect().width + 16;
        }

        function update(animate) {
            if (!isMobile()) { grid.style.transform = ''; grid.style.transition = ''; idx = 0; return; }
            var w = getItemWidth();
            if (!w) return;
            grid.style.transition = animate !== false ? 'transform 0.4s ease' : 'none';
            grid.style.transform = 'translateX(-' + (idx * w) + 'px)';
        }

        prev.addEventListener('click', function() {
            if (idx > 0) { idx--; update(); }
        });
        next.addEventListener('click', function() {
            var max = getItems().length - 1;
            if (idx < max) { idx++; update(); }
        });

        // Touch/swipe support
        var startX = 0, startY = 0, currentX = 0, dragging = false, moved = false;

        grid.addEventListener('touchstart', function(e) {
            if (!isMobile()) return;
            // Don't interfere with before/after slider
            if (e.target.closest('.ba-slider')) return;
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            currentX = startX;
            dragging = true;
            moved = false;
            grid.style.transition = 'none';
            // Hide overlays during swipe
            grid.classList.add('swiping');
        }, { passive: true });

        grid.addEventListener('touchmove', function(e) {
            if (!dragging || !isMobile()) return;
            currentX = e.touches[0].clientX;
            var diffX = currentX - startX;
            var diffY = e.touches[0].clientY - startY;
            // Only swipe horizontally
            if (Math.abs(diffX) > 10) moved = true;
            if (!moved && Math.abs(diffY) > Math.abs(diffX)) { dragging = false; grid.classList.remove('swiping'); return; }
            if (moved) e.preventDefault();
            var w = getItemWidth();
            var offset = -(idx * w) + diffX;
            grid.style.transform = 'translateX(' + offset + 'px)';
        }, { passive: false });

        grid.addEventListener('touchend', function() {
            if (!dragging || !isMobile()) { grid.classList.remove('swiping'); return; }
            dragging = false;
            grid.classList.remove('swiping');
            var diffX = currentX - startX;
            var max = getItems().length - 1;
            if (diffX < -50 && idx < max) { idx++; }
            else if (diffX > 50 && idx > 0) { idx--; }
            update(true);
        }, { passive: true });

        window.addEventListener('resize', function() {
            idx = Math.min(idx, getItems().length - 1);
            update();
        });
    }

    setupMobileCarousel('.locations-grid', 'locPrev', 'locNext', '.location-card');
    setupMobileCarousel('.gallery-grid', 'galPrev', 'galNext', '.gallery-item');
    setupMobileCarousel('.tour-gallery-grid', 'tourGalPrev', 'tourGalNext', '.tour-gallery-item');
    setupMobileCarousel('.practical-grid', 'practPrev', 'practNext', '.practical-item');

    // --- Fee Badge Toggle (handled by route-stop click above) ---

    // --- Contact Form ---
    const bookingForm = document.getElementById('bookingForm');

    // --- Explore Tours Scroll ---
    document.querySelectorAll('a[href="#tours"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const toursSection = document.getElementById('tours');
            const navbar = document.querySelector('.navbar');
            const navHeight = navbar ? navbar.offsetHeight : 70;
            const targetY = toursSection.offsetTop - navHeight - 10;
            window.scrollTo({ top: targetY, behavior: 'smooth' });
        });
    });

    if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(bookingForm);
        const data = Object.fromEntries(formData.entries());
        const submitBtn = bookingForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        // Detect form type: booking (has 'date' + 'time') vs contact (has 'message')
        var isBooking = data.date && data.time;
        var endpoint = isBooking ? '/api/booking' : '/api/contact';

        // Validation
        if (isBooking) {
            if (!data.name || !data.email || !data.date || !data.time) {
                showNotification('Please fill in all required fields.', 'error');
                return;
            }
        } else {
            if (!data.name || !data.email || !data.message) {
                showNotification('Please fill in all required fields.', 'error');
                return;
            }
        }

        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        try {
            var res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            var result = await res.json();
            if (result.ok) {
                showNotification(result.message, 'success');
                bookingForm.reset();
            } else {
                showNotification(result.message || 'Something went wrong. Please try again.', 'error');
            }
        } catch (err) {
            showNotification('Connection error. Please email us directly at sales@dubrovnikgameofthronestours.com', 'error');
        }

        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
    }

    // --- Notification System ---
    function showNotification(message, type) {
        // Remove any existing notification
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 24px;
            max-width: 400px;
            padding: 20px 24px;
            border-radius: 8px;
            font-family: 'Inter', sans-serif;
            font-size: 0.9rem;
            line-height: 1.5;
            z-index: 10000;
            animation: slideInRight 0.4s ease forwards;
            cursor: pointer;
            ${type === 'success' 
                ? 'background: #1a2e1a; border: 1px solid #2d5a2d; color: #8fbc8f;' 
                : 'background: #2e1a1a; border: 1px solid #5a2d2d; color: #bc8f8f;'}
        `;

        const closeStyle = document.createElement('style');
        closeStyle.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(closeStyle);

        notification.textContent = message;
        document.body.appendChild(notification);

        notification.addEventListener('click', () => notification.remove());
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                notification.style.opacity = '0';
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    // --- Before/After Slider ---
    // Global BA slider oscillation — all sliders share one position
    let baGlobalDir = 1;
    let baGlobalPct = 50;
    const baSliders = [];

    document.querySelectorAll('.ba-slider').forEach(slider => {
        const beforeWrap = slider.querySelector('.ba-before-wrap');
        const beforeImg  = slider.querySelector('.ba-before');
        const handle     = slider.querySelector('.ba-handle');
        let isDragging   = false;
        let autoPaused   = false;

        function syncWidth() {
            beforeImg.style.width = slider.offsetWidth + 'px';
        }

        function moveTo(clientX) {
            const rect = slider.getBoundingClientRect();
            const pct  = Math.max(2, Math.min(98, ((clientX - rect.left) / rect.width) * 100));
            beforeWrap.style.width = pct + '%';
            handle.style.left      = pct + '%';
        }

        function setPct(pct) {
            beforeWrap.style.width = pct + '%';
            handle.style.left      = pct + '%';
        }

        syncWidth();
        window.addEventListener('resize', syncWidth);

        var card = slider.closest('.location-card');

        function pauseAuto() {
            autoPaused = true;
            if (card) {
                card.classList.add('ba-dragging');
                card.classList.remove('ba-show-overlay');
            }
        }
        function resumeAuto() {
            autoPaused = false;
            if (card) {
                card.classList.remove('ba-dragging');
                if (window.innerWidth <= 768) {
                    card.classList.add('ba-show-overlay');
                }
            }
        }

        baSliders.push({ setPct, isPaused: () => autoPaused });

        slider.addEventListener('mousedown',  e => { isDragging = true; pauseAuto(); moveTo(e.clientX); e.preventDefault(); });
        window.addEventListener('mouseup',    () => { if (isDragging) { isDragging = false; resumeAuto(); } });
        window.addEventListener('mousemove',  e => { if (isDragging) moveTo(e.clientX); });

        slider.addEventListener('touchstart', e => { isDragging = true; pauseAuto(); moveTo(e.touches[0].clientX); }, { passive: true });
        window.addEventListener('touchend',   () => { if (isDragging) { isDragging = false; resumeAuto(); } });
        window.addEventListener('touchmove',  e => { if (isDragging) { e.preventDefault(); moveTo(e.touches[0].clientX); } }, { passive: false });
    });

    function baGlobalStep() {
        baGlobalPct += baGlobalDir * 0.06;
        if (baGlobalPct >= 90) { baGlobalPct = 90; baGlobalDir = -1; }
        if (baGlobalPct <= 10) { baGlobalPct = 10; baGlobalDir =  1; }
        baSliders.forEach(s => { if (!s.isPaused()) s.setPct(baGlobalPct); });
        requestAnimationFrame(baGlobalStep);
    }
    requestAnimationFrame(baGlobalStep);

    // --- Video Loop Smooth Transition ---
    document.querySelectorAll('.tour-image video').forEach(video => {
        const overlay = document.createElement('div');
        overlay.className = 'loop-fade';
        video.parentElement.appendChild(overlay);

        let isFading = false;
        video.addEventListener('timeupdate', () => {
            if (!video.duration || isFading) return;
            const remaining = video.duration - video.currentTime;
            if (remaining < 0.8) {
                isFading = true;
                overlay.classList.add('active');
                setTimeout(() => {
                    overlay.classList.remove('active');
                    setTimeout(() => { isFading = false; }, 600);
                }, 600);
            }
        });
    });

    // --- Smooth scroll for anchor links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = navbar.offsetHeight + 20;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        });
    });

    // --- Active nav link on scroll ---
    const sections = document.querySelectorAll('section[id]');

    function updateActiveNav() {
        const scrollY = window.scrollY + 200;
        
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            const link = document.querySelector(`.nav-link[href="#${id}"]`);
            
            if (link && scrollY >= top && scrollY < top + height) {
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav);

});
