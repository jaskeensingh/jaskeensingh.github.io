document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    const menuBtn = document.getElementById('menu-btn');
    const dropdownContent = document.querySelector('.dropdown-content');

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

    function updateCardPosition(card, position) {
        // Ensure proper wrapping for position values
        let wrappedPosition = position;
        const halfLength = Math.floor(totalCards / 2);
        
        if (position > halfLength) {
            wrappedPosition = position - totalCards;
        } else if (position < -halfLength) {
            wrappedPosition = position + totalCards;
        }
        
        // Clamp visible positions between -2 and 2
        const displayPosition = Math.max(Math.min(wrappedPosition, 2), -2);
        card.setAttribute('data-position', displayPosition.toString());
        card.setAttribute('data-actual-position', position.toString());
        card.style.pointerEvents = Math.abs(displayPosition) <= 1 ? 'auto' : 'none';
    }

    function rotateCarousel(direction) {
        if (isAnimating) return;
        isAnimating = true;

        // Get current positions and sort cards by their actual position
        const cardPositions = cards.map((card, index) => ({
            card,
            position: parseInt(card.getAttribute('data-actual-position') || '0'),
            index
        }));

        // Update positions
        cardPositions.forEach(({card}) => {
            let currentPosition = parseInt(card.getAttribute('data-actual-position') || '0');
            let newPosition = currentPosition + (direction === 'left' ? 1 : -1);
            
            // Ensure proper wrapping
            if (newPosition > Math.floor(totalCards / 2)) {
                newPosition -= totalCards;
            } else if (newPosition < -Math.floor(totalCards / 2)) {
                newPosition += totalCards;
            }
            
            updateCardPosition(card, newPosition);
        });

        setTimeout(() => {
            isAnimating = false;
        }, 400);
    }

    // Initialize carousel
    function initializeCarousel() {
        const centerIndex = Math.floor(cards.length / 2);
        cards.forEach((card, index) => {
            let initialPosition = index - centerIndex;
            // Ensure positions wrap properly
            
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
        const positions = cards.map(card => 
            parseInt(card.getAttribute('data-actual-position') || '0')
        );
        
        // Check if any card needs repositioning
        positions.forEach((pos, idx) => {
            if (Math.abs(pos) > Math.floor(totalCards / 2)) {
                const newPos = pos > 0 ? pos - totalCards : pos + totalCards;
                updateCardPosition(cards[idx], newPos);
            }
        });
    }, 1000);

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

    // Animated cards observer
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animated-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(card);
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