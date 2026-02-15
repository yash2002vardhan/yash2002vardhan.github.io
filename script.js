// ===== Cursor Glow Effect =====
const cursorGlow = document.getElementById('cursorGlow');

document.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
});

// ===== 3D Knowledge Graph Animation =====
(function () {
    const canvas = document.getElementById('embeddingCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W = 540, H = 540;
    const FOV = 500;
    const SPHERE_R = 180;

    function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        W = rect.width;
        H = rect.height;
    }
    resize();
    window.addEventListener('resize', resize);

    // --- Node definitions ---
    const nodeDefs = [
        // AI/ML core — teal
        { label: 'LLM',         cat: 0 },
        { label: 'RAG',         cat: 0 },
        { label: 'NLP',         cat: 0 },
        { label: 'Embeddings',  cat: 0 },
        { label: 'Transformers',cat: 0 },
        { label: 'Agents',      cat: 0 },
        { label: 'Fine-tuning', cat: 0 },
        { label: 'Deep Learning', cat: 0 },
        // Frameworks — green
        { label: 'LangChain',   cat: 1 },
        { label: 'PyTorch',     cat: 1 },
        { label: 'FastAPI',     cat: 1 },
        { label: 'TensorFlow',  cat: 1 },
        { label: 'Agno',        cat: 1 },
        { label: 'Streamlit',   cat: 1 },
        // Infrastructure — violet
        { label: 'AWS',         cat: 2 },
        { label: 'Docker',      cat: 2 },
        { label: 'Redis',       cat: 2 },
        { label: 'CI/CD',       cat: 2 },
        { label: 'Microservices', cat: 2 },
        { label: 'SQS/SNS',    cat: 2 },
        // Data — amber
        { label: 'Milvus',      cat: 3 },
        { label: 'FAISS',       cat: 3 },
        { label: 'Pinecone',    cat: 3 },
        { label: 'PostgreSQL',  cat: 3 },
        { label: 'Vector DB',   cat: 3 },
        // Research — rose
        { label: 'GNN',         cat: 4 },
        { label: 'BERT',        cat: 4 },
        { label: 'Computer Vision', cat: 4 },
    ];

    const catColors = [
        [14, 165, 160],   // teal-jade (AI/ML — brand accent)
        [74, 222, 128],   // green
        [167, 139, 250],  // violet (Infra)
        [251, 191, 36],   // amber
        [251, 113, 133],  // rose
    ];

    // Distribute nodes on a sphere using golden-angle spiral
    const nodes = [];
    const N = nodeDefs.length;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < N; i++) {
        const y = 1 - (i / (N - 1)) * 2;          // -1 to 1
        const radiusAtY = Math.sqrt(1 - y * y);
        const theta = goldenAngle * i;

        nodes.push({
            ...nodeDefs[i],
            // Base position on sphere
            bx: Math.cos(theta) * radiusAtY * SPHERE_R,
            by: y * SPHERE_R,
            bz: Math.sin(theta) * radiusAtY * SPHERE_R,
            // Current 3D position (set each frame after rotation)
            x3: 0, y3: 0, z3: 0,
            // Projected 2D
            px: 0, py: 0, scale: 1,
            // Pulse state
            pulseT: 0, pulsing: false,
        });
    }

    // --- Edges: connect semantically related nodes ---
    const edgePairs = [
        ['LLM', 'RAG'], ['LLM', 'NLP'], ['LLM', 'Transformers'], ['LLM', 'Fine-tuning'],
        ['LLM', 'Agents'], ['LLM', 'LangChain'],
        ['RAG', 'Embeddings'], ['RAG', 'Vector DB'], ['RAG', 'LangChain'], ['RAG', 'Milvus'],
        ['NLP', 'BERT'], ['NLP', 'Transformers'], ['NLP', 'Deep Learning'],
        ['Embeddings', 'FAISS'], ['Embeddings', 'Pinecone'], ['Embeddings', 'Milvus'],
        ['Agents', 'LangChain'], ['Agents', 'Agno'], ['Agents', 'FastAPI'],
        ['LangChain', 'FastAPI'], ['LangChain', 'Streamlit'],
        ['PyTorch', 'Deep Learning'], ['PyTorch', 'TensorFlow'],
        ['Deep Learning', 'Computer Vision'], ['Deep Learning', 'GNN'], ['Deep Learning', 'BERT'],
        ['AWS', 'Docker'], ['AWS', 'SQS/SNS'], ['AWS', 'CI/CD'], ['AWS', 'Microservices'],
        ['Docker', 'CI/CD'], ['Docker', 'Microservices'],
        ['Microservices', 'FastAPI'], ['Microservices', 'Redis'], ['Microservices', 'SQS/SNS'],
        ['Milvus', 'Vector DB'], ['FAISS', 'Vector DB'], ['Pinecone', 'Vector DB'],
        ['PostgreSQL', 'Redis'],
        ['GNN', 'BERT'],
        ['Streamlit', 'FastAPI'],
        ['Fine-tuning', 'BERT'], ['Fine-tuning', 'PyTorch'],
    ];

    // Build edge index list
    const labelToIdx = {};
    nodes.forEach((n, i) => labelToIdx[n.label] = i);
    const edges = edgePairs
        .map(([a, b]) => [labelToIdx[a], labelToIdx[b]])
        .filter(([a, b]) => a !== undefined && b !== undefined);

    // --- New edge spark animation ---
    let sparkEdge = null; // { a, b, progress, opacity }
    let sparkTimer = 0;
    const SPARK_INTERVAL = 4000;
    const SPARK_DURATION = 1500;

    // Pool of potential new edges (not in the permanent set)
    const extraEdges = [
        ['Computer Vision', 'TensorFlow'], ['GNN', 'PyTorch'], ['BERT', 'LangChain'],
        ['Redis', 'FastAPI'], ['Agents', 'AWS'], ['RAG', 'FAISS'],
        ['NLP', 'LLM'], ['Streamlit', 'Deep Learning'], ['Agno', 'Microservices'],
        ['SQS/SNS', 'Redis'], ['CI/CD', 'FastAPI'], ['PostgreSQL', 'Milvus'],
    ].map(([a, b]) => [labelToIdx[a], labelToIdx[b]])
     .filter(([a, b]) => a !== undefined && b !== undefined);

    // --- Rotation state ---
    let rotY = 0;           // auto-rotation angle
    let tiltX = 0.15;       // slight default tilt
    let tiltY = 0;
    let mouseInfluenceX = 0;
    let mouseInfluenceY = 0;

    // Mouse parallax
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseInfluenceX = ((e.clientX - rect.left) / rect.width - 0.5) * 0.4;
        mouseInfluenceY = ((e.clientY - rect.top) / rect.height - 0.5) * 0.3;
    });
    canvas.addEventListener('mouseleave', () => {
        mouseInfluenceX = 0;
        mouseInfluenceY = 0;
    });

    // Random pulse timer
    let pulseTimer = 0;

    function isDark() {
        return document.documentElement.getAttribute('data-theme') === 'dark';
    }

    function rotateY(x, y, z, angle) {
        const c = Math.cos(angle), s = Math.sin(angle);
        return [x * c + z * s, y, -x * s + z * c];
    }

    function rotateX(x, y, z, angle) {
        const c = Math.cos(angle), s = Math.sin(angle);
        return [x, y * c - z * s, y * s + z * c];
    }

    function project(x3, y3, z3) {
        const scale = FOV / (FOV + z3);
        return {
            px: W / 2 + x3 * scale,
            py: H / 2 + y3 * scale,
            scale,
        };
    }

    let lastTime = performance.now();

    function animate(now) {
        const dt = Math.min(now - lastTime, 50); // cap to prevent jumps
        lastTime = now;
        const dark = isDark();

        ctx.clearRect(0, 0, W, H);

        // Auto-rotate
        rotY += 0.0003 * dt;

        // Smooth mouse influence
        tiltX += (0.15 + mouseInfluenceY - tiltX) * 0.03;
        tiltY += (mouseInfluenceX - tiltY) * 0.03;

        // Transform all nodes
        for (const n of nodes) {
            let [x, y, z] = rotateY(n.bx, n.by, n.bz, rotY);
            [x, y, z] = rotateX(x, y, z, tiltX);
            [x, y, z] = rotateY(x, y, z, tiltY);
            n.x3 = x; n.y3 = y; n.z3 = z;
            const p = project(x, y, z);
            n.px = p.px; n.py = p.py; n.scale = p.scale;
        }

        // --- Draw edges (back-to-front not critical for lines, draw all) ---
        const edgeAlphaBase = dark ? 0.18 : 0.12;
        for (const [ai, bi] of edges) {
            const a = nodes[ai], b = nodes[bi];
            const avgDepth = (a.z3 + b.z3) / 2;
            const depthFactor = (avgDepth + SPHERE_R) / (2 * SPHERE_R); // 0 (far) to 1 (near)
            const alpha = edgeAlphaBase * (0.3 + depthFactor * 0.7);
            const lineColor = dark ? `rgba(148,163,184,${alpha})` : `rgba(100,116,139,${alpha})`;

            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.px, a.py);
            ctx.lineTo(b.px, b.py);
            ctx.stroke();
        }

        // --- Spark edge animation ---
        sparkTimer += dt;
        if (!sparkEdge && sparkTimer >= SPARK_INTERVAL && extraEdges.length > 0) {
            const idx = Math.floor(Math.random() * extraEdges.length);
            const [a, b] = extraEdges[idx];
            sparkEdge = { a, b, progress: 0 };
            sparkTimer = 0;
        }

        if (sparkEdge) {
            sparkEdge.progress += dt / SPARK_DURATION;
            if (sparkEdge.progress >= 1) {
                sparkEdge = null;
            } else {
                const a = nodes[sparkEdge.a], b = nodes[sparkEdge.b];
                const t = sparkEdge.progress;

                // Draw the forming edge
                const drawLen = Math.min(t * 3, 1); // edge draws in first third
                const fadeAlpha = t > 0.6 ? 1 - (t - 0.6) / 0.4 : 1;
                const ex = a.px + (b.px - a.px) * drawLen;
                const ey = a.py + (b.py - a.py) * drawLen;

                // Glow line
                ctx.strokeStyle = `rgba(14,165,160,${0.08 * fadeAlpha})`;
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.moveTo(a.px, a.py);
                ctx.lineTo(ex, ey);
                ctx.stroke();

                // Core line
                ctx.strokeStyle = `rgba(14,165,160,${0.5 * fadeAlpha})`;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(a.px, a.py);
                ctx.lineTo(ex, ey);
                ctx.stroke();

                // Traveling particle along the edge
                if (drawLen >= 1) {
                    const particleT = ((t - 0.33) / 0.67) % 1;
                    const ppx = a.px + (b.px - a.px) * particleT;
                    const ppy = a.py + (b.py - a.py) * particleT;
                    const pGrad = ctx.createRadialGradient(ppx, ppy, 0, ppx, ppy, 8);
                    pGrad.addColorStop(0, `rgba(14,165,160,${0.7 * fadeAlpha})`);
                    pGrad.addColorStop(1, `rgba(14,165,160,0)`);
                    ctx.fillStyle = pGrad;
                    ctx.beginPath();
                    ctx.arc(ppx, ppy, 8, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }

        // --- Random pulse ---
        pulseTimer += dt;
        if (pulseTimer > 2500) {
            pulseTimer = 0;
            const ri = Math.floor(Math.random() * nodes.length);
            nodes[ri].pulsing = true;
            nodes[ri].pulseT = 0;
        }

        // --- Sort nodes by depth for back-to-front rendering ---
        const sortedIndices = nodes.map((_, i) => i).sort((a, b) => nodes[a].z3 - nodes[b].z3);

        for (const i of sortedIndices) {
            const n = nodes[i];
            const depthNorm = (n.z3 + SPHERE_R) / (2 * SPHERE_R); // 0=far, 1=near
            const [r, g, b] = catColors[n.cat];

            const nodeRadius = 3 + depthNorm * 4;
            const alphaBase = dark ? (0.3 + depthNorm * 0.6) : (0.25 + depthNorm * 0.5);

            // Pulse animation
            let pulseGlow = 0;
            if (n.pulsing) {
                n.pulseT += dt / 1000;
                if (n.pulseT > 1.2) { n.pulsing = false; }
                pulseGlow = Math.sin(n.pulseT * Math.PI / 1.2) * 0.6;
            }

            const totalAlpha = Math.min(alphaBase + pulseGlow, 1);

            // Outer glow
            const glowR = nodeRadius * 4 + pulseGlow * 12;
            const gGrad = ctx.createRadialGradient(n.px, n.py, 0, n.px, n.py, glowR);
            gGrad.addColorStop(0, `rgba(${r},${g},${b},${totalAlpha * 0.2})`);
            gGrad.addColorStop(1, `rgba(${r},${g},${b},0)`);
            ctx.fillStyle = gGrad;
            ctx.beginPath();
            ctx.arc(n.px, n.py, glowR, 0, Math.PI * 2);
            ctx.fill();

            // Core node
            ctx.fillStyle = `rgba(${r},${g},${b},${totalAlpha})`;
            ctx.beginPath();
            ctx.arc(n.px, n.py, nodeRadius, 0, Math.PI * 2);
            ctx.fill();

            // Bright center
            ctx.fillStyle = `rgba(255,255,255,${totalAlpha * 0.35})`;
            ctx.beginPath();
            ctx.arc(n.px, n.py, nodeRadius * 0.4, 0, Math.PI * 2);
            ctx.fill();

            // Label (only for nodes that are near enough to be legible)
            if (depthNorm > 0.3) {
                const labelAlpha = (depthNorm - 0.3) / 0.7;
                const fontSize = Math.round(8 + depthNorm * 3);
                ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
                ctx.textAlign = 'center';
                ctx.fillStyle = dark
                    ? `rgba(${r},${g},${b},${labelAlpha * 0.7})`
                    : `rgba(${Math.max(r - 30, 0)},${Math.max(g - 30, 0)},${Math.max(b - 30, 0)},${labelAlpha * 0.6})`;
                ctx.fillText(n.label, n.px, n.py - nodeRadius - 6);
            }
        }

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
})();

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
console.log('%c Welcome to my portfolio! ', 'background: linear-gradient(135deg, #0F766E 0%, #0EA5A0 100%); color: white; font-size: 16px; padding: 10px 20px; border-radius: 8px;');
console.log('%c Built with vanilla HTML, CSS & JS ', 'color: #0EA5A0; font-size: 12px;');
console.log('%c Press "T" to toggle dark mode! ', 'color: #14B8A6; font-size: 12px;');

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
