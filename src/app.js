/* ═══════════════════════════════════════════════
   VELUM — Main App Orchestrator
   app.js
   ═══════════════════════════════════════════════ */

// ── Global app state ──────────────────────────
const APP = {
  state: null,   // set after chart creation
  currentPage: 'onboarding',
};

// ── Boot ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  Stars.init();
  bindNavigation();
  bindOnboarding();
  loadSavedState();
});

// ── Onboarding ────────────────────────────────
function bindOnboarding() {
  document.getElementById('create-chart-btn')?.addEventListener('click', createChart);
}

function createChart() {
  const name   = document.getElementById('inp-name')?.value.trim() || 'Misafir';
  const date   = document.getElementById('inp-date')?.value;
  const time   = document.getElementById('inp-time')?.value || '12:00';
  const city   = document.getElementById('inp-city')?.value.trim() || 'Bilinmiyor';

  if (!date) {
    alert('Lütfen doğum tarihini gir!');
    return;
  }

  const d = new Date(date + 'T12:00:00');
  const month = d.getMonth() + 1;
  const day   = d.getDate();
  const [hour, minute] = time.split(':').map(Number);

  const sunIdx  = ASTRUM.calcSunSign(month, day);
  const moonIdx = ASTRUM.calcMoonSign(date);
  const ascIdx  = ASTRUM.calcAscendant(month, day, hour, minute);
  const planets = ASTRUM.calcPlanets(date);

  APP.state = {
    name,
    birthDate: date,
    birthTime: time,
    birthCity: city,
    sun:     ASTRUM.SIGNS[sunIdx],
    sunDeg:  day % 30,
    moon:    ASTRUM.SIGNS[moonIdx],
    moonDeg: (month * 3 + day) % 30,
    asc:     ASTRUM.SIGNS[ascIdx],
    ascDeg:  (hour * 2 + minute / 30) % 30,
    planets,
  };

  // Persist to localStorage
  saveState(APP.state);

  // Build all sections
  initDashboard(APP.state);
  ChartRenderer.render(APP.state);
  initForecasts(APP.state);
  initProfile(APP.state);
  Chat.init(APP.state);

  // Show app
  document.getElementById('main-nav').classList.remove('hidden');
  showPage('dashboard');
}

// ── Dashboard ─────────────────────────────────
function initDashboard(state) {
  const { name, sun, moon, asc } = state;

  document.getElementById('dash-name').textContent = name + ' ✦';

  // Today banner
  const banner = CONTENT.getTodayBanner(state);
  document.getElementById('today-title').textContent = banner.title;
  document.getElementById('today-text').textContent  = banner.text;

  const pillsEl = document.getElementById('today-pills');
  pillsEl.innerHTML = banner.pills.map((p, i) =>
    `<span class="planet-pill ${i === 0 ? 'gold' : ''}">${p}</span>`
  ).join('');

  // Summary cards
  document.getElementById('sun-card').textContent  = sun;
  document.getElementById('sun-deg').textContent   = `${state.sunDeg}° ${sun}'da`;
  document.getElementById('moon-card').textContent = moon;
  document.getElementById('moon-deg').textContent  = `${state.moonDeg}° ${moon}'da`;
  document.getElementById('asc-card').textContent  = asc;
  document.getElementById('asc-deg').textContent   = `${state.ascDeg}° ${asc}'da`;

  // Active transit
  const transits = ASTRUM.currentTransits();
  const featured = transits[new Date().getDay() % transits.length];
  document.getElementById('active-transit').textContent = `${featured.symbol} ${featured.name} △ ${moon}`;
  document.getElementById('active-transit-sub').textContent = 'Genişleme & Sezgi';

  // Transit list
  const items = CONTENT.getTransitList(state);
  document.getElementById('transit-list').innerHTML = items.map(item => `
    <div class="transit-item">
      <div class="transit-symbol">${item.symbol}</div>
      <div class="transit-content">
        <div class="transit-title">${item.title}</div>
        <div class="transit-text">${item.text}</div>
      </div>
      <div class="transit-badge ${item.isChallenge ? 'challenging' : ''}">${item.badge}</div>
    </div>
  `).join('');

  // Weekly snippet
  const weekly = CONTENT.getWeeklyForecast(state);
  document.getElementById('weekly-text').textContent = weekly.main;
}

// ── Forecasts ─────────────────────────────────
function initForecasts(state) {
  // Daily
  const daily = CONTENT.getDailyForecast(state);
  document.getElementById('f-sun-text').textContent  = daily.sun.text;
  document.getElementById('f-moon-text').textContent = daily.moon.text;
  document.getElementById('f-merc-text').textContent = daily.mercury.text;

  setEnergyBar('f-sun',  daily.sun.pct);
  setEnergyBar('f-moon', daily.moon.pct);
  setEnergyBar('f-merc', daily.mercury.pct);

  // Weekly
  const weekly = CONTENT.getWeeklyForecast(state);
  document.getElementById('f-weekly-main').textContent = weekly.main;
  document.getElementById('f-weekly-warn').textContent = weekly.warning;

  // Monthly
  const monthly = CONTENT.getMonthlyForecast(state);
  document.getElementById('f-monthly-main').textContent = monthly.main;
  document.getElementById('f-monthly-dates').innerHTML = monthly.dates.map(d => `
    <div class="tl-item">
      <div class="tl-date">${d.date}</div>
      <div>
        <div class="tl-event">${d.event}</div>
        <div class="tl-type">${d.type}</div>
      </div>
    </div>
  `).join('');

  // Upcoming
  const upcoming = CONTENT.getUpcomingPeriods(state);
  document.getElementById('f-upcoming-intro').textContent = upcoming.intro;
  document.getElementById('f-upcoming-list').innerHTML = upcoming.items.map(u => `
    <div class="tl-item">
      <div class="tl-date">${u.date}</div>
      <div>
        <div class="tl-event">${u.event}</div>
        <div class="tl-type">${u.type}</div>
      </div>
    </div>
  `).join('');
}

function setEnergyBar(prefix, pct) {
  const fill = document.getElementById(`${prefix}-fill`);
  const label = document.getElementById(`${prefix}-pct`);
  if (fill) setTimeout(() => { fill.style.width = pct + '%'; }, 300);
  if (label) label.textContent = pct + '%';
}

// ── Profile ───────────────────────────────────
function initProfile(state) {
  const { name, sun, moon, asc } = state;

  document.getElementById('prof-name').textContent  = name;
  document.getElementById('prof-signs').textContent = `${sun} ☉  ·  ${moon} ☽  ·  ${asc} ↑`;

  const sunSym  = ASTRUM.SYMBOLS[ASTRUM.SIGNS.indexOf(sun)];
  const moonSym = ASTRUM.SYMBOLS[ASTRUM.SIGNS.indexOf(moon)];
  const ascSym  = ASTRUM.SYMBOLS[ASTRUM.SIGNS.indexOf(asc)];

  document.getElementById('sign-trio').innerHTML = [
    { symbol: sunSym,  role: 'Güneş',    name: sun  },
    { symbol: moonSym, role: 'Ay',       name: moon },
    { symbol: ascSym,  role: 'Yükselen', name: asc  },
  ].map(s => `
    <div class="sign-item">
      <div class="sign-symbol">${s.symbol}</div>
      <div class="sign-role">${s.role}</div>
      <div class="sign-name">${s.name}</div>
    </div>
  `).join('');

  // Edit birth data — go back to onboarding
  document.getElementById('btn-edit-birth')?.addEventListener('click', () => {
    showPage('onboarding');
  });
}

// ── Navigation ────────────────────────────────
function bindNavigation() {
  // Nav tab buttons
  document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.addEventListener('click', () => showPage(btn.dataset.page));
  });

  // Nav user avatar → profile
  document.getElementById('nav-user-avatar')?.addEventListener('click', () => showPage('profile'));

  // Card quick-nav
  document.querySelectorAll('[data-navigate]').forEach(el => {
    el.addEventListener('click', () => showPage(el.dataset.navigate));
  });

  // Forecast tabs
  document.querySelectorAll('.f-tab').forEach(btn => {
    btn.addEventListener('click', () => switchForecast(btn.dataset.forecast, btn));
  });
}

function showPage(id) {
  // onboarding has no nav
  if (id === 'onboarding') {
    document.getElementById('main-nav').classList.add('hidden');
  }

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(`page-${id}`);
  if (target) target.classList.add('active');

  // Update nav tabs
  document.querySelectorAll('.nav-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.page === id);
  });

  APP.currentPage = id;

  // Re-render chart on each visit (handles resize)
  if (id === 'chart' && APP.state) {
    requestAnimationFrame(() => ChartRenderer.render(APP.state));
  }
}

function switchForecast(id, btn) {
  document.querySelectorAll('.forecast-content').forEach(f => f.classList.remove('active'));
  document.getElementById(`forecast-${id}`)?.classList.add('active');
  document.querySelectorAll('.f-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
}

// ── Persistence ───────────────────────────────
function saveState(state) {
  try {
    localStorage.setItem('velum_state', JSON.stringify(state));
  } catch (_) {}
}

function loadSavedState() {
  try {
    const raw = localStorage.getItem('velum_state');
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (!saved?.birthDate) return;

    // Re-populate form
    const nameEl = document.getElementById('inp-name');
    const dateEl = document.getElementById('inp-date');
    const timeEl = document.getElementById('inp-time');
    const cityEl = document.getElementById('inp-city');

    if (nameEl) nameEl.value = saved.name || '';
    if (dateEl) dateEl.value = saved.birthDate || '';
    if (timeEl) timeEl.value = saved.birthTime || '';
    if (cityEl) cityEl.value = saved.birthCity || '';

  } catch (_) {}
}
