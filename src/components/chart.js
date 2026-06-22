/* ═══════════════════════════════════════════════
   VELUM — Birth Chart Canvas Renderer
   chart.js
   ═══════════════════════════════════════════════ */

const ChartRenderer = (() => {

  function render(state) {
    const canvas = document.getElementById('birth-chart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Set logical size — fallback to 480 if parent not yet laid out
    const parentWidth = canvas.parentElement?.clientWidth || 480;
    const logicalSize = Math.max(200, Math.min(parentWidth, 480));
    canvas.style.width  = logicalSize + 'px';
    canvas.style.height = logicalSize + 'px';
    canvas.width  = logicalSize * dpr;
    canvas.height = logicalSize * dpr;
    ctx.scale(dpr, dpr);

    const W = logicalSize, H = logicalSize;
    const cx = W / 2, cy = H / 2;
    const R = Math.min(W, H) / 2 - 16;

    ctx.clearRect(0, 0, W, H);

    // ── Background ────────────────────────────
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
    bgGrad.addColorStop(0,   'rgba(22, 12, 55, 0.95)');
    bgGrad.addColorStop(0.5, 'rgba(15, 8, 40, 0.90)');
    bgGrad.addColorStop(1,   'rgba(8,  4, 28, 0.85)');
    ctx.fillStyle = bgGrad;
    ctx.fill();

    // ── Rings ─────────────────────────────────
    const ringRadii = [R * 0.90, R * 0.72, R * 0.52, R * 0.32];
    ringRadii.forEach((r, i) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = i === 0 ? 'rgba(147,112,219,0.35)' : 'rgba(147,112,219,0.15)';
      ctx.lineWidth = i === 0 ? 1 : 0.5;
      ctx.stroke();
    });

    // ── 12 House Lines ────────────────────────
    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 - 90) * Math.PI / 180;
      const isCusp = i % 3 === 0;
      ctx.beginPath();
      ctx.moveTo(cx + R * 0.32 * Math.cos(angle), cy + R * 0.32 * Math.sin(angle));
      ctx.lineTo(cx + R * 0.90 * Math.cos(angle), cy + R * 0.90 * Math.sin(angle));
      ctx.strokeStyle = isCusp ? 'rgba(200,168,75,0.45)' : 'rgba(147,112,219,0.12)';
      ctx.lineWidth = isCusp ? 1.2 : 0.5;
      ctx.stroke();
    }

    // ── Zodiac Symbols (outer ring) ───────────
    const startSignIdx = ASTRUM.SIGNS.indexOf(state.asc);
    ASTRUM.SYMBOLS.forEach((sym, i) => {
      const signIdx = (startSignIdx + i) % 12;
      const angle = (i * 30 + 15 - 90) * Math.PI / 180;
      const r = R * 0.81;
      ctx.font = `${Math.max(12, R * 0.038)}px serif`;
      ctx.fillStyle = 'rgba(180,148,240,0.75)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(ASTRUM.SYMBOLS[signIdx], cx + r * Math.cos(angle), cy + r * Math.sin(angle));
    });

    // ── Build planet positions ────────────────
    const allPlanets = [
      { name:'Güneş',   symbol:'☉', signIdx: ASTRUM.SIGNS.indexOf(state.sun),  deg: state.sunDeg,  color:'#e8c870' },
      { name:'Ay',      symbol:'☽', signIdx: ASTRUM.SIGNS.indexOf(state.moon), deg: state.moonDeg, color:'#c8d8e8' },
      { name:'Yükselen',symbol:'↑', signIdx: ASTRUM.SIGNS.indexOf(state.asc),  deg: state.ascDeg,  color:'#b494f0' },
      ...(state.planets || []).map((p, i) => ({
        ...p, signIdx: ASTRUM.SIGNS.indexOf(p.sign),
        color: ['#6ee7b7','#f9a8d4','#fca5a5','#86efac','#fde68a','#a5f3fc','#ddd6fe','#fed7aa'][i % 8],
      })),
    ];

    // Spread planets radially so they don't overlap
    const radiiOptions = [0.60, 0.55, 0.65, 0.58, 0.62, 0.56, 0.63, 0.57, 0.61, 0.59, 0.64];

    // ── Aspect Lines ──────────────────────────
    const aspectPairs = findAspects(allPlanets);
    aspectPairs.forEach(({ a, b, color, dash }) => {
      const angA = ((a.signIdx * 30 + a.deg) - 90) * Math.PI / 180;
      const angB = ((b.signIdx * 30 + b.deg) - 90) * Math.PI / 180;
      const rA = R * radiiOptions[a._idx % radiiOptions.length];
      const rB = R * radiiOptions[b._idx % radiiOptions.length];

      ctx.beginPath();
      ctx.moveTo(cx + rA * Math.cos(angA), cy + rA * Math.sin(angA));
      ctx.lineTo(cx + rB * Math.cos(angB), cy + rB * Math.sin(angB));
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.7;
      ctx.setLineDash(dash);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // ── Planet Glyphs ─────────────────────────
    allPlanets.forEach((p, i) => {
      p._idx = i;
      const totalAngle = p.signIdx * 30 + p.deg;
      const angle = (totalAngle - 90) * Math.PI / 180;
      const r = R * radiiOptions[i % radiiOptions.length];
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);

      // Glow halo
      const halo = ctx.createRadialGradient(x, y, 0, x, y, 10);
      halo.addColorStop(0, p.color + '44');
      halo.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fillStyle = halo;
      ctx.fill();

      // Dot
      ctx.beginPath();
      ctx.arc(x, y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = p.color + 'aa';
      ctx.fill();

      // Symbol
      ctx.font = `bold ${Math.max(11, R * 0.032)}px serif`;
      ctx.fillStyle = p.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.symbol, x, y);
    });

    // ── Centre Symbol ─────────────────────────
    ctx.font = `${Math.max(18, R * 0.06)}px serif`;
    ctx.fillStyle = 'rgba(200,168,75,0.55)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦', cx, cy);

    // ── Planet Cards ──────────────────────────
    renderPlanetCards(allPlanets, state);
  }

  // ── Aspect finder ─────────────────────────────
  function findAspects(planets) {
    const defs = [
      { angle: 0,   color: 'rgba(240,240,120,0.22)', dash: [] },
      { angle: 60,  color: 'rgba(100,220,180,0.22)', dash: [3,4] },
      { angle: 90,  color: 'rgba(255,120,120,0.18)', dash: [2,5] },
      { angle: 120, color: 'rgba(100,220,180,0.28)', dash: [4,3] },
      { angle: 180, color: 'rgba(180,100,240,0.20)', dash: [1,4] },
    ];

    const results = [];
    planets.forEach((a, i) => {
      planets.slice(i + 1).forEach((b, j) => {
        const aA = a.signIdx * 30 + a.deg;
        const aB = b.signIdx * 30 + b.deg;
        let diff = Math.abs(aA - aB);
        if (diff > 180) diff = 360 - diff;

        defs.forEach(def => {
          if (Math.abs(diff - def.angle) < 9) {
            results.push({ a, b, ...def });
          }
        });
      });
    });

    return results.slice(0, 8); // max 8 lines to avoid visual clutter
  }

  // ── Planet grid cards ─────────────────────────
  function renderPlanetCards(planets, state) {
    const grid = document.getElementById('planets-grid');
    if (!grid) return;

    grid.innerHTML = planets.map(p => `
      <div class="planet-card">
        <div class="planet-symbol">${p.symbol}</div>
        <div class="planet-name">${p.name}</div>
        <div class="planet-sign">${p.sign || ASTRUM.SIGNS[p.signIdx]}</div>
        <div class="planet-deg">${p.deg}°</div>
      </div>
    `).join('');
  }

  return { render };

})();
