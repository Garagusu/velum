/* ═══════════════════════════════════════════════
   VELUM — Stars Background
   stars.js
   ═══════════════════════════════════════════════ */

const Stars = (() => {

  let animFrame = null;

  function init() {
    const canvas = document.getElementById('stars-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', resize);

    // Generate stars
    const stars = Array.from({ length: 220 }, () => ({
      x:  Math.random(),   // 0–1 normalized
      y:  Math.random(),
      r:  Math.random() * 1.4 + 0.3,
      o:  Math.random() * 0.65 + 0.1,
      s:  Math.random() * 0.004 + 0.001,  // twinkle speed
      t:  Math.random() * Math.PI * 2,    // phase offset
    }));

    // Generate a few larger "feature" stars
    const featureStars = Array.from({ length: 12 }, () => ({
      x:  Math.random(),
      y:  Math.random(),
      r:  Math.random() * 2 + 1.5,
      o:  Math.random() * 0.5 + 0.3,
      s:  Math.random() * 0.002 + 0.0005,
      t:  Math.random() * Math.PI * 2,
      cross: true,
    }));

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Regular stars
      stars.forEach(s => {
        s.t += s.s;
        const opacity = s.o * (0.55 + 0.45 * Math.sin(s.t));
        ctx.beginPath();
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240, 244, 255, ${opacity})`;
        ctx.fill();
      });

      // Feature stars — render as small crosses/sparkles
      featureStars.forEach(s => {
        s.t += s.s;
        const opacity = s.o * (0.4 + 0.6 * Math.sin(s.t));
        const x = s.x * canvas.width;
        const y = s.y * canvas.height;
        const r = s.r * (0.8 + 0.2 * Math.sin(s.t * 1.5));

        // Centre dot
        ctx.beginPath();
        ctx.arc(x, y, r * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240, 244, 255, ${opacity})`;
        ctx.fill();

        // Cross arms
        ctx.strokeStyle = `rgba(240, 244, 255, ${opacity * 0.6})`;
        ctx.lineWidth = 0.6;
        [[r*2.5, 0], [0, r*2.5], [-r*2.5, 0], [0, -r*2.5]].forEach(([dx, dy]) => {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + dx, y + dy);
          ctx.stroke();
        });
      });

      animFrame = requestAnimationFrame(draw);
    }

    draw();
  }

  function destroy() {
    if (animFrame) cancelAnimationFrame(animFrame);
  }

  return { init, destroy };

})();
