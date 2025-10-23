javascript:(function () {
  if (window.leafSimActive) {
    window.leafSimCleanup();
    return;
  }

  window.leafSimActive = true;

  const c = document.createElement('canvas');
  Object.assign(c.style, {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 999999999,
    pointerEvents: 'none'
  });
  document.body.appendChild(c);

  const x = c.getContext('2d');
  const L = [];
  const n = 60;
  let m = { x: 0, y: 0, px: 0, py: 0, vx: 0, vy: 0 };

  function r() {
    c.width = innerWidth;
    c.height = innerHeight;
  }
  addEventListener('resize', r);
  r();

  function mk() {
    return {
      x: Math.random() * c.width,
      y: Math.random() * c.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: 14 + Math.random() * 20,
      rot: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.1,
      emoji: ['', '', ''][Math.floor(Math.random() * 3)]
    };
  }

  for (let i = 0; i < n; i++) {
    L.push(mk());
  }

  addEventListener('mousemove', function (e) {
    m.px = m.x;
    m.py = m.y;
    m.x = e.clientX;
    m.y = e.clientY;
    m.vx = m.x - m.px;
    m.vy = m.y - m.py;
  });

  function u() {
    x.clearRect(0, 0, c.width, c.height);
    for (let l of L) {
      l.vy += 0.05;
      l.vx *= 0.99;
      l.vy *= 0.99;

      const dx = l.x - m.x,
            dy = l.y - m.y,
            d = Math.hypot(dx, dy);

      if (d < 60) {
        const f = (60 - d) / 60;
        l.vx += m.vx * 0.2 * f;
        l.vy += m.vy * 0.2 * f;
      }

      l.x += l.vx;
      l.y += l.vy;
      l.rot += l.spin;

      if (l.x < 0 || l.x > c.width) {
        l.vx *= -0.7;
        l.x = Math.max(0, Math.min(c.width, l.x));
      }

      if (l.y > c.height) {
        l.vy *= -0.7;
        l.y = c.height;
      }

      x.save();
      x.translate(l.x, l.y);
      x.rotate(l.rot);
      x.font = l.size + 'px serif';
      x.fillText(l.emoji, 0, 0);
      x.restore();
    }

    requestAnimationFrame(u);
  }

  u();

  window.leafSimCleanup = function () {
    window.leafSimActive = false;
    removeEventListener('resize', r);
    c.remove();
  };
})();

