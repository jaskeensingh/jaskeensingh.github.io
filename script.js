document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    const menuBtn = document.getElementById('menu-btn');
    const dropdownContent = document.querySelector('.dropdown-content');
    const carousel_1 = document.querySelector('.project-carousel');
    const prevButton = document.querySelector('.carousel-prev');
    const nextButton = document.querySelector('.carousel-next');

    // Theme toggle functionality
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('light-theme');
    });

    // Menu toggle functionality
    menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('open');
        dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
    });

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
    setInterval(() => {
        if (!isAnimating) {
            cards.forEach(card => {
                const pos = parseInt(card.getAttribute('data-actual-position') || '0');
                updateCardPosition(card, pos);
            });
        }
    }, 500);

    // Initialize
    initializeCarousel();

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(initializeCarousel, 100);
    });

    // Initialize other functionalities (smooth scrolling, etc.)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href'))?.scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Set the initial scroll position
    let scrollPosition = 0;
    const cardWidth = 320; // card width + gap
    const visibleCards = 2; // Number of cards visible at once

    function updateCarousel() {
        carousel_1.style.transform = `translateX(-${scrollPosition}px)`;
        
        // Enable/disable buttons based on scroll position
        prevButton.disabled = scrollPosition === 0;

        // Calculate the maximum scroll position based on visible cards
        const maxScroll = (carousel_1.children.length - visibleCards) * cardWidth;
        nextButton.disabled = scrollPosition >= maxScroll;
        
    }
    // Next button click handler
    nextButton.addEventListener('click', () => {
        const maxScroll = (carousel_1.children.length - visibleCards) * cardWidth;
                if (scrollPosition < maxScroll) {
                    scrollPosition += cardWidth;
                    updateCarousel();
                }
    });
    // Previous button click handler
    prevButton.addEventListener('click', () => {
        if (scrollPosition > 0) {
            scrollPosition -= cardWidth;
            scrollPosition = Math.max(0, scrollPosition);
            updateCarousel();
        }
    });
    // Initial button state
    updateCarousel();

    // Update on window resize
    window.addEventListener('resize', () => {
        // Reset position when switching to mobile view
        if (window.innerWidth <= 800) {
            scrollPosition = 0;
        }
        updateCarousel();
    });

    document.getElementById('logo').addEventListener('click', function() {
        if (window.location.pathname === '/') {
            // If already on the homepage, scroll to the top
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
            // If not on the homepage, navigate to the homepage
            window.location.href = '/';
        }
    });
});