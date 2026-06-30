/* ═══════════════════════════════════════════════════════════
   ABHISHEK SINGHAL — PORTFOLIO JAVASCRIPT
   Interactions, Animations, Scroll Effects
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    // ──────────── TYPEWRITER EFFECT ────────────
    const designations = [
        'Data Engineer',
        'Big Data Specialist',
        'Cloud Data Solutions Expert'
    ];
    const typewriterEl = document.getElementById('typewriter');
    let designationIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 80;

    function typeWrite() {
        const current = designations[designationIndex];

        if (isDeleting) {
            typewriterEl.textContent = current.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 40;
        } else {
            typewriterEl.textContent = current.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 80;
        }

        if (!isDeleting && charIndex === current.length) {
            typeSpeed = 2000; // Pause at end
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            designationIndex = (designationIndex + 1) % designations.length;
            typeSpeed = 400; // Pause before next word
        }

        setTimeout(typeWrite, typeSpeed);
    }

    typeWrite();

    // ──────────── SCROLL PROGRESS BAR ────────────
    const scrollProgress = document.getElementById('scroll-progress');

    function updateScrollProgress() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        scrollProgress.style.width = scrollPercent + '%';
    }

    // ──────────── NAVBAR SCROLL EFFECT ────────────
    const navbar = document.getElementById('navbar');

    function updateNavbar() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    // ──────────── ACTIVE NAV LINK (SCROLL SPY) ────────────
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    const mobileLinks = document.querySelectorAll('.mobile-menu a');

    function updateActiveLink() {
        const scrollY = window.scrollY + 120;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active');
                    }
                });
                mobileLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // Combined scroll handler
    window.addEventListener('scroll', () => {
        updateScrollProgress();
        updateNavbar();
        updateActiveLink();
    }, { passive: true });

    // Initial calls
    updateScrollProgress();
    updateNavbar();
    updateActiveLink();

    // ──────────── MOBILE MENU ────────────
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileOverlay = document.getElementById('mobile-overlay');

    function toggleMobileMenu() {
        hamburger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        mobileOverlay.classList.toggle('active');
        document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    }

    function closeMobileMenu() {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        mobileOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', toggleMobileMenu);
    mobileOverlay.addEventListener('click', closeMobileMenu);

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
    });

    // ──────────── SCROLL ANIMATIONS (Intersection Observer) ────────────
    const animElements = document.querySelectorAll('.anim');

    const animObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Don't unobserve — keep it one-time
                animObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    animElements.forEach(el => animObserver.observe(el));

    // ──────────── SKILL BAR ANIMATION ────────────
    const skillBars = document.querySelectorAll('.skill-bar-fill');
    const skillPercents = document.querySelectorAll('.skill-percent');
    let skillsAnimated = false;

    const skillsSection = document.getElementById('skills');

    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !skillsAnimated) {
                skillsAnimated = true;
                animateSkillBars();
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    skillObserver.observe(skillsSection);

    function animateSkillBars() {
        skillBars.forEach((bar, index) => {
            const targetWidth = bar.getAttribute('data-width');
            setTimeout(() => {
                bar.style.width = targetWidth + '%';
            }, index * 100);
        });

        // Animate percentage counters
        skillPercents.forEach((el, index) => {
            const target = parseInt(el.getAttribute('data-target'));
            setTimeout(() => {
                animateCounter(el, 0, target, 1200);
            }, index * 100);
        });
    }

    // ──────────── STAT COUNTER ANIMATION ────────────
    const statNumbers = document.querySelectorAll('.stat-number');
    let statsAnimated = false;

    const achievementsSection = document.getElementById('achievements');

    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !statsAnimated) {
                statsAnimated = true;
                statNumbers.forEach((el, index) => {
                    const target = parseInt(el.getAttribute('data-count'));
                    setTimeout(() => {
                        animateCounter(el, 0, target, 1500, '+');
                    }, index * 200);
                });
                statObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    statObserver.observe(achievementsSection);

    // ──────────── COUNTER UTILITY ────────────
    function animateCounter(element, start, end, duration, suffix = '%') {
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (end - start) * eased);

            element.textContent = current + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }

        requestAnimationFrame(update);
    }

    // ──────────── CONTACT FORM (GOOGLE FORM BACKEND) ────────────
    window.handleSubmit = function(event) {
        event.preventDefault();

        // ============================================================================
        // ⚠️ GOOGLE FORM INTEGRATION INSTRUCTIONS:
        // 1. Create a Google Form with 4 text fields: Full Name, Email, Subject, Message
        // 2. Get the "formResponse" URL (from viewform URL change viewform to formResponse)
        // 3. Get the "entry.1234567" IDs for each field by inspecting the Google Form
        // 4. Paste them below:
        // ============================================================================
        
        const GOOGLE_FORM_ACTION_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSf_K3nWRqRUP8gzlRZTUf4fObJBiSe5u2yn5ZC24981GbqAHw/formResponse';
        const ENTRY_ID_NAME = 'entry.2005620554';    // Full Name entry ID
        const ENTRY_ID_EMAIL = 'entry.1045781291';   // Email entry ID
        const ENTRY_ID_SUBJECT = 'entry.839337160'; // Subject entry ID
        const ENTRY_ID_MESSAGE = 'entry.469082551'; // Message entry ID

        const name = document.getElementById('form-name').value;
        const email = document.getElementById('form-email').value;
        const subject = document.getElementById('form-subject').value;
        const message = document.getElementById('form-message').value;

        // Ensure user has updated the placeholders
        if (GOOGLE_FORM_ACTION_URL.includes('YOUR_GOOGLE_FORM_URL_HERE')) {
            alert('Developer Note: Please configure the Google Form URL and Entry IDs in script.js first!');
            return;
        }

        const formData = new FormData();
        formData.append(ENTRY_ID_NAME, name);
        formData.append(ENTRY_ID_EMAIL, email);
        formData.append(ENTRY_ID_SUBJECT, subject);
        formData.append(ENTRY_ID_MESSAGE, message);

        const submitBtn = document.querySelector('.btn-submit');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.style.opacity = '0.8';

        fetch(GOOGLE_FORM_ACTION_URL, {
            method: 'POST',
            mode: 'no-cors', // Bypasses CORS policy for Google Forms
            body: formData
        }).then(() => {
            // Since mode is no-cors, we don't get a proper success response back, 
            // but we assume it sent successfully if no network error occurred.
            submitBtn.textContent = 'Message Sent!';
            submitBtn.style.background = '#10B981'; // Success green
            document.getElementById('contact-form').reset();
            
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.style.background = ''; // Revert to original
                submitBtn.style.opacity = '1';
            }, 4000);
        }).catch(error => {
            console.error('Error submitting form:', error);
            submitBtn.textContent = 'Error! Try Again.';
            setTimeout(() => {
                submitBtn.textContent = originalText;
                submitBtn.style.opacity = '1';
            }, 4000);
        });
    };

    // ──────────── LIGHTBOX ────────────
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    window.openLightbox = function(src) {
        lightboxImg.src = src;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    window.closeLightbox = function() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    };

    // Close lightbox with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeLightbox();
            closeMobileMenu();
        }
    });

    // ──────────── SMOOTH SCROLL for anchor links ────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ──────────── CERT CARD TILT ON HOVER ────────────
    const certCards = document.querySelectorAll('.cert-card');

    certCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -4;
            const rotateY = ((x - centerX) / centerX) * 4;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });

    // ──────────── HIDE SCROLL INDICATOR ON SCROLL ────────────
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                scrollIndicator.style.opacity = '0';
                scrollIndicator.style.pointerEvents = 'none';
            } else {
                scrollIndicator.style.opacity = '';
                scrollIndicator.style.pointerEvents = '';
            }
        }, { passive: true });
    }

});
