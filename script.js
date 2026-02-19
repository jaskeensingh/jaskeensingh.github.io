document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    const menuBtn = document.getElementById('menu-btn');
    const dropdownContent = document.querySelector('.dropdown-content');
    const nameText = document.getElementById('name-text');
    const carousel_1 = document.querySelector('.project-carousel');
    const prevButton = document.querySelector('.carousel-prev');
    const nextButton = document.querySelector('.carousel-next');
    const languageToggle = document.getElementById('language-toggle');

    // Theme toggle functionality
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('light-theme');
    });

    let isPunjabi = false;

    languageToggle.addEventListener('click', () => {
        isPunjabi = !isPunjabi;

        // Toggle button text to show current language
        languageToggle.textContent = isPunjabi ? 'EN | ਪੰ' : 'ਪੰ | EN';

        // Find all elements with data-en and data-pa attributes
        document.querySelectorAll('[data-en][data-pa]').forEach(element => {
            element.innerHTML = isPunjabi ? element.getAttribute('data-pa') : element.getAttribute('data-en');
        });
    });


    // Menu toggle functionality
    menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('open');
        dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
    });

    // Initially hide the text
    nameText.classList.add('hidden');

    // Show the video and fade in the text after the video animation
    setTimeout(() => {
        nameText.classList.remove('hidden'); // Remove hidden class to show text
        nameText.classList.add('visible'); // Add visible class to fade in
    }, 1500); // Delay to match video container animation duration

    const names = ["Jaskeen Singh", "ਜਸਕੀਨ ਸਿੰਘ"];
    let index = 0;

    function toggleName() {
        // Fade out
        nameText.classList.remove('visible'); // Remove visible class to fade out
        nameText.classList.add('hidden'); // Add hidden class

        // Wait for the fade-out transition to complete
        setTimeout(() => {
            index = (index + 1) % names.length; // Cycle index
            nameText.textContent = names[index]; // Update text content
            // Fade in
            nameText.classList.remove('hidden'); // Remove hidden class
            nameText.classList.add('visible'); // Add visible class to fade in
        }, 1000); // Delay to match the fade-out time
    }

    // Toggle name every 3s (already defined) - keep reference for potential cancel
    const nameInterval = setInterval(toggleName, 3000);

    // Carousel functionality
    const carousel = document.querySelector('.carousel');
    const cards = Array.from(document.querySelectorAll('.card'));
    let isAnimating = false;
    const totalCards = cards.length;
    let currentIndex = 0; // Track the currently centered card

    function updateCardPosition(card, position) {
        // Normalize the position for circular rotation
        let normalizedPosition = position;

        // Wrap the positions so they rotate around
        while (normalizedPosition < -(totalCards / 2)) {
            normalizedPosition += totalCards;
        }
        while (normalizedPosition > (totalCards / 2)) {
            normalizedPosition -= totalCards;
        }

        // Calculate the visible position
        let displayPosition = Math.max(Math.min(normalizedPosition, 3), -3);

        // Update the card's attributes and style for visible positioning
        card.setAttribute('data-position', displayPosition.toString());
        card.setAttribute('data-actual-position', normalizedPosition.toString());

        // Make sure the far cards don't disappear but become smaller and less opaque
        if (Math.abs(displayPosition) <= 3) {
            card.style.opacity = '1';
            card.style.display = 'block';
        }
    }


    function rotateCarousel(direction) {
        if (isAnimating) return;
        isAnimating = true;

        // Get current positions
        const currentPositions = cards.map(card => parseInt(card.getAttribute('data-actual-position') || '0'));

        // Update all positions
        cards.forEach((card, index) => {
            const currentPosition = currentPositions[index];
            const newPosition = currentPosition + (direction === 'left' ? 1 : -1);
            updateCardPosition(card, newPosition);
        });

        setTimeout(() => {
            isAnimating = false;
            cards.forEach(card => {
                const pos = parseInt(card.getAttribute('data-actual-position') || '0');
                updateCardPosition(card, pos);
            });
        }, 400);
    }

    // Initialize carousel
    function initializeCarousel() {
        const centerIndex = Math.floor(cards.length / 2);
        cards.forEach((card, index) => {
            let initialPosition = index - centerIndex;
            updateCardPosition(card, initialPosition);
        });
    }

    // Click handlers
    cards.forEach((card) => {
        card.addEventListener('click', () => {
            const position = parseInt(card.getAttribute('data-position') || '0');
            if (Math.abs(position) === 1) {
                rotateCarousel(position > 0 ? 'right' : 'left');
            }
        });
    });

    // Carousel nav buttons
    const navLeft = document.querySelector('.carousel-nav--left');
    const navRight = document.querySelector('.carousel-nav--right');
    if (navLeft) navLeft.addEventListener('click', () => rotateCarousel('left'));
    if (navRight) navRight.addEventListener('click', () => rotateCarousel('right'));

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            rotateCarousel(e.key === 'ArrowLeft' ? 'left' : 'right');
        }
    });

    // Touch support
    let touchStartX = 0;
    let touchEndX = 0;

    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });

    carousel.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].clientX;
        const difference = touchStartX - touchEndX;

        if (Math.abs(difference) > 50) {
            rotateCarousel(difference > 0 ? 'left' : 'right');
        }
    }, { passive: true });

    // Handle continuous rotation with proper tracking
    // Less frequent sync (every 1.5s) to reduce layout work
    setInterval(() => {
        if (!isAnimating) {
            cards.forEach(card => {
                const pos = parseInt(card.getAttribute('data-actual-position') || '0');
                updateCardPosition(card, pos);
            });
        }
    }, 1500);

    // Initialize
    initializeCarousel();

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(initializeCarousel, 120);
    }, { passive: true });

    // Initialize other functionalities (smooth scrolling, etc.)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, { passive: false });
    });

    // Optional horizontal project carousel (guard missing elements)
    if (carousel_1 && prevButton && nextButton) {
        let scrollPosition = 0;
        const cardWidth = 320; // card width + gap
        const visibleCards = 2;

        function updateCarousel() {
            carousel_1.style.transform = `translateX(-${scrollPosition}px)`;
            prevButton.disabled = scrollPosition === 0;
            const maxScroll = (carousel_1.children.length - visibleCards) * cardWidth;
            nextButton.disabled = scrollPosition >= maxScroll;
        }

        nextButton.addEventListener('click', () => {
            const maxScroll = (carousel_1.children.length - visibleCards) * cardWidth;
            if (scrollPosition < maxScroll) {
                scrollPosition += cardWidth;
                updateCarousel();
            }
        });
        prevButton.addEventListener('click', () => {
            if (scrollPosition > 0) {
                scrollPosition = Math.max(0, scrollPosition - cardWidth);
                updateCarousel();
            }
        });
        updateCarousel();
        window.addEventListener('resize', () => {
            if (window.innerWidth <= 800) scrollPosition = 0;
            updateCarousel();
        }, { passive: true });
    }

    // Lazy load gallery card backgrounds using IntersectionObserver
    const galleryObserver = ('IntersectionObserver' in window) ? new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const bg = el.getAttribute('data-bg');
                if (bg) {
                    el.style.backgroundImage = `url('${bg}')`;
                    el.removeAttribute('data-bg');
                }
                galleryObserver.unobserve(el);
            }
        });
    }, { rootMargin: '200px 0px' }) : null;

    if (galleryObserver) {
        document.querySelectorAll('.carousel .card[data-bg]').forEach(card => galleryObserver.observe(card));
    } else {
        // fallback: load immediately
        document.querySelectorAll('.carousel .card[data-bg]').forEach(card => {
            card.style.backgroundImage = `url('${card.getAttribute('data-bg')}')`;
            card.removeAttribute('data-bg');
        });
    }

    // Scroll progress bar
    const scrollProgressEl = document.querySelector('.scroll-progress');
    scrollProgressEl.style.opacity = '0';
    function updateScrollProgress() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = docHeight > 0 ? scrollTop / docHeight : 0;
        scrollProgressEl.style.transform = `scaleX(${scrollPercent})`;
        scrollProgressEl.style.opacity = scrollTop > 5 ? '1' : '0';
    }
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    updateScrollProgress();

    // Section reveal animations
    const sections = document.querySelectorAll('#about, #blog, #projects, #gallery, #contact');
    sections.forEach(sec => sec.classList.add('reveal-section'));

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    sections.forEach(sec => revealObserver.observe(sec));
});