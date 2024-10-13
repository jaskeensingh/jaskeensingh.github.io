document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    const logo = document.getElementById('logo');
    const jLetter = logo.querySelector('.letter');
    const galleryContainer = document.querySelector('.gallery-container');
    const menuBtn = document.getElementById('menu-btn');
    const dropdownContent = document.querySelector('.dropdown-content');

    // Theme toggle
    const updateThemeIcon = () => {
        const icon = themeToggle.querySelector('i');
        icon.classList.toggle('fa-moon');
        icon.classList.toggle('fa-sun');
    };

    themeToggle.addEventListener('click', () => {
        body.classList.toggle('light-theme');
        updateThemeIcon();
        localStorage.setItem('theme', body.classList.contains('light-theme') ? 'light' : 'dark');
    });

    // Apply saved theme
    if (localStorage.getItem('theme') === 'light') {
        body.classList.add('light-theme');
        updateThemeIcon();
    }

    // Menu toggle
    menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('open');
        dropdownContent.classList.toggle('open');
    });

    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.menu-toggle') && !event.target.closest('.dropdown-content')) {
            menuBtn.classList.remove('open');
            dropdownContent.classList.remove('open');
        }
    });

    // Close menu when clicking on a menu item
    dropdownContent.addEventListener('click', (event) => {
        if (event.target.tagName === 'A') {
            menuBtn.classList.remove('open');
            dropdownContent.classList.remove('open');
        }
    });

    // Logo animation
    logo.addEventListener('mouseover', () => jLetter.style.transform = 'translateY(-5px)');
    logo.addEventListener('mouseout', () => jLetter.style.transform = 'translateY(0)');
    logo.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Dynamic gallery
    const handleGalleryClick = (event) => {
        if (event.target.matches('.gallery-img')) {
            event.target.classList.toggle('expanded');
        } else if (!event.target.closest('.gallery-img')) {
            document.querySelectorAll('.gallery-img.expanded').forEach(img => img.classList.remove('expanded'));
        }
    };

    galleryContainer.addEventListener('click', handleGalleryClick);
    document.addEventListener('click', handleGalleryClick);

    // Animated cards
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

    // Video controls (if you decide to add them)
    const video = document.getElementById('bg-video');
    const videoControl = document.getElementById('video-control');
    if (videoControl) {
        videoControl.addEventListener('click', () => {
            if (video.paused) {
                video.play();
                videoControl.innerHTML = '<i class="fas fa-pause" aria-hidden="true"></i>';
            } else {
                video.pause();
                videoControl.innerHTML = '<i class="fas fa-play" aria-hidden="true"></i>';
            }
        });
    }
});