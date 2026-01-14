// ===== Cursor Glow Effect =====
const cursorGlow = document.getElementById('cursorGlow');

document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
});

// ===== Dynamic Floating Cards =====
const floatingSkills = [
    { icon: 'fa-brain', label: 'Deep Learning' },
    { icon: 'fa-robot', label: 'AI Systems' },
    { icon: 'fa-database', label: 'Vector DBs' },
    { icon: 'fa-code', label: 'Python' },
    { icon: 'fa-sitemap', label: 'RAG Systems' },
    { icon: 'fa-microchip', label: 'LLMs' },
    { icon: 'fa-cloud', label: 'AWS' },
    { icon: 'fa-cube', label: 'Docker' },
    { icon: 'fa-code-branch', label: 'Git' },
    { icon: 'fa-server', label: 'FastAPI' },
    { icon: 'fa-fire', label: 'PyTorch' },
    { icon: 'fa-language', label: 'NLP' },
    { icon: 'fa-eye', label: 'Computer Vision' },
    { icon: 'fa-link', label: 'LangChain' },
    { icon: 'fa-cubes', label: 'Microservices' },
    { icon: 'fa-cogs', label: 'CI/CD' },
    { icon: 'fa-layer-group', label: 'TensorFlow' },
    { icon: 'fa-project-diagram', label: 'GNNs' },
    { icon: 'fa-comments', label: 'Chatbots' },
    { icon: 'fa-shield-alt', label: 'Web3 Security' }
];

const NUM_CARDS = 5;

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Pre-defined zones to ensure no overlap - each zone is exclusive
const cardZones = [
    { top: '2%', left: '5%' },
    { top: '8%', right: '8%' },
    { top: '45%', left: '2%' },
    { top: '50%', right: '3%' },
    { bottom: '8%', left: '15%' },
];

function generateFloatingCards() {
    const container = document.getElementById('floatingCards');
    if (!container) return;

    const shuffledSkills = shuffleArray(floatingSkills);
    const shuffledZones = shuffleArray(cardZones);
    const selectedSkills = shuffledSkills.slice(0, NUM_CARDS);

    container.innerHTML = '';

    selectedSkills.forEach((skill, index) => {
        const zone = shuffledZones[index];

        const card = document.createElement('div');
        card.className = `float-card`;
        card.style.position = 'absolute';

        // Apply zone position
        if (zone.top) card.style.top = zone.top;
        if (zone.bottom) card.style.bottom = zone.bottom;
        if (zone.left) card.style.left = zone.left;
        if (zone.right) card.style.right = zone.right;

        // Random animation delay for varied floating
        card.style.animationDelay = `${Math.random() * 4}s`;

        card.innerHTML = `
            <i class="fas ${skill.icon}"></i>
            <span>${skill.label}</span>
        `;

        container.appendChild(card);
    });
}

// Generate cards on page load
generateFloatingCards();

// Regenerate cards every 10 seconds for dynamic effect
setInterval(() => {
    const container = document.getElementById('floatingCards');
    if (!container) return;

    // Fade out
    container.style.opacity = '0';
    container.style.transition = 'opacity 0.5s ease';

    setTimeout(() => {
        generateFloatingCards();
        container.style.opacity = '1';
    }, 500);
}, 10000);

// ===== Theme Toggle =====
const themeToggle = document.getElementById('themeToggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Check for saved theme preference or use system preference
function getThemePreference() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        return savedTheme;
    }
    return prefersDarkScheme.matches ? 'dark' : 'light';
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Update icon
    const icon = themeToggle.querySelector('i');
    if (theme === 'dark') {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

// Initialize theme
setTheme(getThemePreference());

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
});

// ===== Navigation =====
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

// Scroll behavior
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    // Add scrolled class
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    lastScrollY = window.scrollY;
});

// Mobile menu toggle
navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
});

// Close menu on link click
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// Active link on scroll
const sections = document.querySelectorAll('section[id]');

function highlightNavLink() {
    const scrollY = window.scrollY;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', highlightNavLink);

// ===== Typing Animation =====
const typingText = document.getElementById('typingText');
const roles = [
    'AI/ML Engineer',
    'Deep Learning Enthusiast',
    'RAG Systems Architect',
    'Full-Stack Developer',
    'Research Scholar'
];

let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 100;

function typeRole() {
    const currentRole = roles[roleIndex];

    if (isDeleting) {
        typingText.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50;
    } else {
        typingText.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 100;
    }

    if (!isDeleting && charIndex === currentRole.length) {
        isDeleting = true;
        typingSpeed = 2000; // Pause at end
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        typingSpeed = 500; // Pause before next word
    }

    setTimeout(typeRole, typingSpeed);
}

// Start typing animation
setTimeout(typeRole, 1000);

// ===== Counter Animation =====
const statNumbers = document.querySelectorAll('.stat-number');
let hasAnimated = false;

function animateCounters() {
    if (hasAnimated) return;

    const heroSection = document.getElementById('home');
    const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;

    if (window.scrollY + window.innerHeight > heroSection.offsetTop + 200) {
        hasAnimated = true;

        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-count'));
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    stat.textContent = Math.floor(current).toLocaleString();
                    requestAnimationFrame(updateCounter);
                } else {
                    stat.textContent = target.toLocaleString() + (target >= 1000 ? '+' : '+');
                }
            };

            updateCounter();
        });
    }
}

window.addEventListener('scroll', animateCounters);
// Trigger on load in case already in view
animateCounters();

// ===== Scroll Animations (AOS-like) =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('aos-animate');
        }
    });
}, observerOptions);

document.querySelectorAll('[data-aos]').forEach(el => {
    observer.observe(el);
});

// ===== Smooth Scroll =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== Skill Tags Hover Effect =====
const skillTags = document.querySelectorAll('.skill-tag');

skillTags.forEach(tag => {
    tag.addEventListener('mouseenter', function() {
        this.style.transform = `translateY(-2px) rotate(${Math.random() * 4 - 2}deg)`;
    });

    tag.addEventListener('mouseleave', function() {
        this.style.transform = '';
    });
});

// ===== Project Card Tilt Effect =====
const projectCards = document.querySelectorAll('.project-card');

projectCards.forEach(card => {
    card.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
    });

    card.addEventListener('mouseleave', function() {
        this.style.transform = '';
    });
});

// ===== Timeline Animation =====
const timelineItems = document.querySelectorAll('.timeline-item');

const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateX(0)';
            }, index * 100);
        }
    });
}, { threshold: 0.2 });

timelineItems.forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateX(-20px)';
    item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    timelineObserver.observe(item);
});

// ===== Floating Cards Animation Enhancement =====
const floatCards = document.querySelectorAll('.float-card');

floatCards.forEach((card, index) => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-30px) scale(1.05)';
        this.style.boxShadow = '0 20px 40px rgba(99, 102, 241, 0.3)';
    });

    card.addEventListener('mouseleave', function() {
        this.style.transform = '';
        this.style.boxShadow = '';
    });
});

// ===== Page Load Animation =====
window.addEventListener('load', () => {
    document.body.classList.add('loaded');

    // Animate hero elements
    const heroElements = document.querySelectorAll('.hero-badge, .hero-title, .hero-subtitle, .hero-description, .hero-cta, .hero-stats');
    heroElements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.1}s`;
    });
});

// ===== Form Validation (if contact form is added later) =====
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ===== Keyboard Navigation =====
document.addEventListener('keydown', (e) => {
    // ESC to close mobile menu
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }

    // T to toggle theme
    if (e.key === 't' && !e.ctrlKey && !e.metaKey && document.activeElement.tagName !== 'INPUT') {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    }
});

// ===== Console Easter Egg =====
console.log('%c Welcome to my portfolio! ', 'background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; font-size: 16px; padding: 10px 20px; border-radius: 8px;');
console.log('%c Built with vanilla HTML, CSS & JS ', 'color: #6366f1; font-size: 12px;');
console.log('%c Press "T" to toggle dark mode! ', 'color: #8b5cf6; font-size: 12px;');

// ===== Performance: Lazy load images if any =====
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            }
        });
    });

    document.querySelectorAll('img.lazy').forEach(img => {
        imageObserver.observe(img);
    });
}
