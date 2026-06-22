/* ═══════════════════════════════════════════════
   VELUM — Astrology Calculation Engine
   astro.js  (no dependencies)
   ═══════════════════════════════════════════════ */

const ASTRUM = (() => {

  // ── Constants ────────────────────────────────
  const SIGNS = ['Koç','Boğa','İkizler','Yengeç','Aslan','Başak','Terazi','Akrep','Yay','Oğlak','Kova','Balık'];
  const SYMBOLS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];
  const PLANET_SYMBOLS = { sun:'☉', moon:'☽', mercury:'☿', venus:'♀', mars:'♂', jupiter:'♃', saturn:'♄', uranus:'⛢', neptune:'♆', pluto:'♇' };

  // Sun sign cusp days (approximate, ignoring leap years)
  const SUN_CUSPS = [
    { m:1, d:20, sign:0  }, // Koç starts ~Mar 21 → index 0
    { m:3, d:21, sign:0  },
    { m:4, d:20, sign:1  },
    { m:5, d:21, sign:2  },
    { m:6, d:22, sign:3  },
    { m:7, d:23, sign:4  },
    { m:8, d:23, sign:5  },
    { m:9, d:23, sign:6  },
    { m:10,d:24, sign:7  },
    { m:11,d:23, sign:8  },
    { m:12,d:22, sign:9  },
    { m:1, d:20, sign:10 },
    { m:2, d:19, sign:11 },
  ];

  /**
   * Calculate Sun sign from month + day.
   */
  function sunSign(month, day) {
    const cusps = [
      [3,21,0],[4,20,1],[5,21,2],[6,22,3],[7,23,4],[8,23,5],
      [9,23,6],[10,24,7],[11,23,8],[12,22,9],[1,20,10],[2,19,11]
    ];
    let sign = 11; // default Balık
    for (const [m, d, s] of cusps) {
      if (month === m && day >= d) sign = s;
      else if (month === m + 1 && day < d) sign = s;
    }
    // simpler approach
    const table = [
      [1,20,9],[1,31,10],[2,19,10],[2,29,11],[3,20,11],[3,31,0],
      [4,19,0],[4,30,1],[5,20,1],[5,31,2],[6,21,2],[6,30,3],
      [7,22,3],[7,31,4],[8,22,4],[8,31,5],[9,22,5],[9,30,6],
      [10,23,6],[10,31,7],[11,22,7],[11,30,8],[12,21,8],[12,31,9]
    ];
    // Use Julian Day Number approximation
    return calcSunSign(month, day);
  }

  function calcSunSign(month, day) {
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 0;  // Koç
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 1;  // Boğa
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 2;  // İkizler
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 3;  // Yengeç
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 4;  // Aslan
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 5;  // Başak
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 6; // Terazi
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 7; // Akrep
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 8; // Yay
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 9;  // Oğlak
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 10; // Kova
    return 11; // Balık
  }

  /**
   * Moon sign approximation — the Moon moves ~13°/day
   * One full cycle (~27.3 days) starting from a known reference.
   */
  function calcMoonSign(dateStr) {
    // Reference: 2000-01-01 Moon was in Koç (approx)
    const ref = new Date('2000-01-01');
    const date = new Date(dateStr);
    const diffDays = (date - ref) / 86400000;
    // Moon traverses all 12 signs in 27.32 days
    const moonCycle = 27.32166;
    const signPosition = ((diffDays % moonCycle) / moonCycle * 12 + 12) % 12;
    return Math.floor(signPosition);
  }

  /**
   * Ascendant approximation based on birth time and date.
   * The Ascendant changes sign roughly every 2 hours.
   */
  function calcAscendant(month, day, hour, minute) {
    const sunIdx = calcSunSign(month, day);
    const timeOffset = Math.floor((hour * 60 + minute) / 120); // 0–11
    return (sunIdx + timeOffset + 1) % 12;
  }

  /**
   * Approximate planet positions using simplified orbital periods.
   * These are purely illustrative (not ephemeris-accurate).
   * For production: use Swiss Ephemeris WASM or astronomy-engine.
   */
  function calcPlanets(dateStr) {
    const ref = new Date('2000-01-06'); // J2000 ~
    const date = new Date(dateStr);
    const d = (date - ref) / 86400000;

    // Approximate orbital periods in days
    const periods = {
      mercury: 87.97,
      venus:   224.70,
      mars:    686.97,
      jupiter: 4332.59,
      saturn:  10759.22,
      uranus:  30688.50,
      neptune: 60195.00,
      pluto:   90560.00,
    };

    // Starting sign offsets at J2000
    const offsets = { mercury:9, venus:8, mars:2, jupiter:1, saturn:1, uranus:10, neptune:9, pluto:8 };

    return Object.entries(periods).map(([name, period]) => {
      const angle = ((d / period * 360) + (offsets[name] * 30)) % 360;
      const signIdx = Math.floor(((angle % 360) + 360) % 360 / 30);
      const deg = Math.floor(angle % 30);
      return { name: planetTR(name), symbol: PLANET_SYMBOLS[name], sign: SIGNS[signIdx], signSymbol: SYMBOLS[signIdx], deg, signIdx };
    });
  }

  /**
   * Current transiting planets (today's sky).
   */
  function currentTransits() {
    return calcPlanets(new Date().toISOString().split('T')[0]);
  }

  /**
   * Calculate aspects between natal chart and transiting planets.
   * Returns an array of {natal, transit, aspect, orb, nature}.
   */
  function calcAspects(natalPlanets, transitPlanets) {
    const aspectDefs = [
      { name: 'Kavuşum',    angle: 0,   orb: 8, nature: 'neutral' },
      { name: 'Sextil',     angle: 60,  orb: 6, nature: 'harmonik' },
      { name: 'Kare',       angle: 90,  orb: 8, nature: 'zorlayıcı' },
      { name: 'Üçgen',      angle: 120, orb: 8, nature: 'harmonik' },
      { name: 'Zıt',        angle: 180, orb: 8, nature: 'zorlayıcı' },
    ];

    const results = [];
    natalPlanets.forEach(natal => {
      const nDeg = natal.signIdx * 30 + natal.deg;
      transitPlanets.forEach(transit => {
        const tDeg = transit.signIdx * 30 + transit.deg;
        let diff = Math.abs(nDeg - tDeg);
        if (diff > 180) diff = 360 - diff;
        aspectDefs.forEach(asp => {
          if (Math.abs(diff - asp.angle) <= asp.orb) {
            results.push({ natal: natal.name, transit: transit.name, aspect: asp.name, orb: Math.abs(diff - asp.angle).toFixed(1), nature: asp.nature });
          }
        });
      });
    });

    return results.sort((a, b) => parseFloat(a.orb) - parseFloat(b.orb));
  }

  // ── Helper translations ───────────────────────
  function planetTR(name) {
    const map = { mercury:'Merkür', venus:'Venüs', mars:'Mars', jupiter:'Jüpiter', saturn:'Satürn', uranus:'Uranüs', neptune:'Neptün', pluto:'Plüton' };
    return map[name] || name;
  }

  /**
   * Calculate lunar phase for a given date.
   */
  function lunarPhase(dateStr) {
    const date = new Date(dateStr);
    const ref = new Date('2000-01-06'); // Known new moon
    const diff = (date - ref) / 86400000;
    const phase = ((diff % 29.53) + 29.53) % 29.53;
    const phases = ['Yeni Ay','Hilal','İlk Dördün','Şişen Ay','Dolunay','Azalan Ay','Son Dördün','Batan Ay'];
    return { name: phases[Math.floor(phase / 29.53 * 8)], days: phase.toFixed(1) };
  }

  // ── Public API ────────────────────────────────
  return {
    SIGNS,
    SYMBOLS,
    PLANET_SYMBOLS,
    calcSunSign,
    calcMoonSign,
    calcAscendant,
    calcPlanets,
    currentTransits,
    calcAspects,
    lunarPhase,
  };

})();
