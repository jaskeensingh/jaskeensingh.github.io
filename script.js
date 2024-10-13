document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    const logo = document.getElementById('logo');
    const menuBtn = document.getElementById('menu-btn');
    const dropdownContent = document.querySelector('.dropdown-content');
    const moonIcon = document.getElementById('moon-icon');
    const sunIcon = document.getElementById('sun-icon');

    // Theme toggle
    function setTheme(theme) {
        if (theme === 'light') {
            body.classList.add('light-theme');
        } else {
            body.classList.remove('light-theme');
        }
    }

    // Apply saved theme or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);

    themeToggle.addEventListener('click', () => {
        const newTheme = body.classList.contains('light-theme') ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Menu toggle
    menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('open');
        dropdownContent.style.display = menuBtn.classList.contains('open') ? 'block' : 'none';
    });

    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.menu-toggle') && !event.target.closest('.dropdown-content')) {
            menuBtn.classList.remove('open');
            dropdownContent.style.display = 'none';
        }
    });

    // Logo animation
    //
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