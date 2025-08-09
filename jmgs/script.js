const menuToggle = document.getElementById('menu-toggle');
const sideMenu = document.getElementById('side-menu');
const menuClose = document.getElementById('menu-close');
const themeToggle = document.getElementById('theme-toggle');
const siteLogo = document.getElementById('site-logo');
const yearEl = document.getElementById('year');

yearEl.textContent = new Date().getFullYear();

// 메뉴 열기
menuToggle.addEventListener('click', () => {
  sideMenu.classList.add('open');
});

// 메뉴 닫기
menuClose.addEventListener('click', () => {
  sideMenu.classList.remove('open');
});

// 테마 전환 + 로고 변경
function updateLogo() {
  const theme = document.documentElement.getAttribute('data-theme');
  siteLogo.src = theme === 'dark' ? './assets/logo-light.png' : './assets/logo-dark.png';
}

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const nextTheme = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', nextTheme);
  updateLogo();
});

updateLogo();
