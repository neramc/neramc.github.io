// Basic interactivity: nav toggle, theme toggle, form validation, year filler, smooth scroll.

(() => {
  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');
  const themeToggle = document.getElementById('theme-toggle');
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');
  const yearEl = document.getElementById('year');

  // set year
  yearEl.textContent = new Date().getFullYear();

  // Mobile nav toggle
  navToggle.addEventListener('click', () => {
    mainNav.classList.toggle('open');
    navToggle.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', mainNav.classList.contains('open'));
  });

  // Close nav on link click (mobile)
  Array.from(mainNav.querySelectorAll('a')).forEach(a => {
    a.addEventListener('click', () => {
      if (mainNav.classList.contains('open')) {
        mainNav.classList.remove('open');
        navToggle.classList.remove('open');
      }
    });
  });

  // Theme toggle: persists to localStorage
  const current = localStorage.getItem('theme');
  if (current === 'dark') document.documentElement.setAttribute('data-theme', 'dark');

  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.removeItem('theme');
      themeToggle.textContent = '다크모드';
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      themeToggle.textContent = '라이트모드';
    }
  });

  // Smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Simple client-side validation + fake submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    feedback.textContent = '';
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();

    if (name.length < 2) {
      feedback.textContent = '이름을 2자 이상 입력하세요.';
      feedback.style.color = 'crimson';
      form.name.focus();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      feedback.textContent = '유효한 이메일을 입력하세요.';
      feedback.style.color = 'crimson';
      form.email.focus();
      return;
    }
    if (message.length < 5) {
      feedback.textContent = '메시지는 최소 5자 이상이어야 합니다.';
      feedback.style.color = 'crimson';
      form.message.focus();
      return;
    }

    // Simulate async send (no real backend). Show success and reset.
    feedback.style.color = 'green';
    feedback.textContent = '전송 중...';
    // fake delay
    setTimeout(() => {
      feedback.textContent = '메시지가 성공적으로 전송되었습니다. 감사합니다! ✅';
      form.reset();
    }, 700);
  });

  // Accessibility: close nav with ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mainNav.classList.contains('open')) {
      mainNav.classList.remove('open');
      navToggle.classList.remove('open');
    }
  });
})();
