// 현재 연도 표시
document.getElementById('year').textContent = new Date().getFullYear();

// 모바일 메뉴 토글
const menuBtn = document.getElementById('menuBtn');
const navList = document.getElementById('navList');
menuBtn.addEventListener('click', () => {
  const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
  menuBtn.setAttribute('aria-expanded', String(!expanded));
  navList.classList.toggle('show');
});

// 다크/라이트 테마 토글 (로컬 저장)
const themeToggle = document.getElementById('themeToggle');
const STORAGE_KEY = 'mysite-theme';

function applyTheme(t) {
  document.documentElement.dataset.theme = t; // 필요 시 CSS에서 [data-theme="dark"] 로 커스터마이즈 가능
}
function getSystemPrefersDark() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}
function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  const theme = saved || (getSystemPrefersDark() ? 'dark' : 'light');
  applyTheme(theme);
  themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
}
themeToggle.addEventListener('click', () => {
  const isDark = themeToggle.getAttribute('aria-pressed') === 'true';
  const newTheme = isDark ? 'light' : 'dark';
  themeToggle.setAttribute('aria-pressed', String(!isDark));
  localStorage.setItem(STORAGE_KEY, newTheme);
  applyTheme(newTheme);
});
initTheme();

// 간단한 폼 유효성 검사 + 데모 제출 처리
const form = document.getElementById('contactForm');
const formMsg = document.getElementById('formMsg');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  // 기본 HTML5 검증 사용 + 간단 보강
  if (!form.reportValidity()) return;

  const data = Object.fromEntries(new FormData(form));
  // 여기서 실제 백엔드로 fetch POST 하면 됩니다.
  // fetch('/api/contact', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) })

  formMsg.hidden = false;
  formMsg.textContent = '메시지를 잘 받았습니다! (데모)';
  form.reset();
  // 접근성: 라이브 리전으로 화면읽기기에 알림
});
