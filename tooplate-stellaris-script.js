/*

Tooplate 2140 Stellaris Research

https://www.tooplate.com/view/2140-stellaris-research

*/

// JavaScript Document

// Starfield Background Animation
        const canvas = document.getElementById('starfield');
        const ctx = canvas.getContext('2d');
        let stars = [];

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        class Star {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.z = Math.random() * 1000;
                this.prevX = this.x;
                this.prevY = this.y;
            }

            update() {
                this.z -= 2;
                if (this.z <= 0) {
                    this.x = Math.random() * canvas.width;
                    this.y = Math.random() * canvas.height;
                    this.z = 1000;
                    this.prevX = this.x;
                    this.prevY = this.y;
                }

                this.prevX = this.x;
                this.prevY = this.y;

                this.x = (this.x - canvas.width / 2) * (1000 / this.z) + canvas.width / 2;
                this.y = (this.y - canvas.height / 2) * (1000 / this.z) + canvas.height / 2;
            }

            draw() {
                const opacity = Math.max(0, 1 - this.z / 1000);
                const size = Math.max(0, (1000 - this.z) / 1000 * 3);

                ctx.save();
                ctx.globalAlpha = opacity;
                ctx.beginPath();
                ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
                ctx.fillStyle = '#f8fafc';
                ctx.fill();

                // Draw trail
                if (size > 1) {
                    ctx.beginPath();
                    ctx.moveTo(this.prevX, this.prevY);
                    ctx.lineTo(this.x, this.y);
                    ctx.strokeStyle = '#8b5cf6';
                    ctx.lineWidth = size * 0.5;
                    ctx.stroke();
                }
                ctx.restore();
            }
        }

        function initStars() {
            stars = [];
            for (let i = 0; i < 800; i++) {
                stars.push(new Star());
            }
        }

        function animate() {
            ctx.fillStyle = 'rgba(15, 15, 35, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            stars.forEach(star => {
                star.update();
                star.draw();
            });

            requestAnimationFrame(animate);
        }

        // Create floating cosmic particles
        function createCosmicParticles() {
            for (let i = 0; i < 15; i++) {
                const particle = document.createElement('div');
                particle.className = 'cosmic-particle';
                particle.style.width = Math.random() * 6 + 2 + 'px';
                particle.style.height = particle.style.width;
                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 8 + 's';
                particle.style.animationDuration = Math.random() * 4 + 6 + 's';
                document.body.appendChild(particle);
            }
        }

        // Mission Tabs Functionality
        const missionTabs = document.querySelectorAll('.mission-tab');
        const missionContents = document.querySelectorAll('.mission-content');

        missionTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs and contents
                missionTabs.forEach(t => t.classList.remove('active'));
                missionContents.forEach(c => c.classList.remove('active'));

                // Add active class to clicked tab
                tab.classList.add('active');

                // Show corresponding content
                const tabId = tab.getAttribute('data-tab');
                document.getElementById(tabId).classList.add('active');
            });
        });

        // Initialize animations
        initStars();
        animate();
        createCosmicParticles();

        // Handle window resize
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initStars();
        });

        // Mobile menu toggle
        const mobileToggle = document.getElementById('mobile-toggle');
        const navMenu = document.getElementById('nav-menu');

        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Smooth scroll
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const navbar = document.getElementById('navbar');
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }

            // Fade in sections
            const sections = document.querySelectorAll('.fade-in');
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                if (rect.top < window.innerHeight * 0.8) {
                    section.classList.add('visible');
                }
            });
        });

        // Form submission
        document.querySelector('.contact-form').addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Research proposal submitted! 🌌 (This is a demo)');
        });
		
		// Active menu highlighting based on scroll position
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav ul a');
    
    // Create an Intersection Observer
    const observerOptions = {
        root: null, // viewport is the root
        rootMargin: '-30% 0px -70% 0px', // consider section visible when it's 30% from the top and 70% from the bottom
        threshold: 0
    };
    
    function onIntersect(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Get the id of the section that's in view
                const activeId = entry.target.getAttribute('id');
                
                // Remove active class from all links
                navLinks.forEach(link => {
                    link.classList.remove('active');
                });
                
                // Add active class to the link that corresponds to the section in view
                const activeLink = document.querySelector(`nav ul a[href="#${activeId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }
    
    const observer = new IntersectionObserver(onIntersect, observerOptions);
    
    // Observe all sections
    sections.forEach(section => {
        observer.observe(section);
    });
    
    // Set home as active by default when page loads
    document.addEventListener('DOMContentLoaded', () => {
        navLinks[0].classList.add('active');
    });
    
    // Update active state when clicking on navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });