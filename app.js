/* Mobile-first, vanilla-canvas floaties
   - PNG only (robust on iOS/Android)
   - Pointer Events (tap/click) unified
   - DPR fixed to 1 for performance (sharper text tradeoff)
   - Respects prefers-reduced-motion
*/

(() => {
    const canvas = document.getElementById('bg');
    const ctx = canvas.getContext('2d', { alpha: true });
    const DPR = 1; // keep 1 for speed; increase to devicePixelRatio for sharper text (heavier)
    const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
    // ---- Floaty data ----
    const ITEMS = [
      {
        src: 'Cover_v01.png',
        url: '#1',
        hoverText: 'PORTFOLIO - PORTFOLIO - PORTFOLIO - PORTFOLIO'
      },
      {
        src: 'Lampe.png',
        url: '#2',
        hoverText: 'PARAMETRIC LAMP - PARAMETRIC LAMP - PARAMETRIC LAMP - PARAMETRIC LAMP'
      }
    ];
  
    // ---- State ----
    let w = 0, h = 0;
    let running = true;
    let pointer = { x: -9999, y: -9999, down: false };
    const floaties = [];
    let imagesLoaded = 0;
    let rafId = 0;
  
    // ---- Utils ----
    const rand = (a, b) => a + Math.random() * (b - a);
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  
    function resize() {
      const cssW = canvas.clientWidth;
      const cssH = canvas.clientHeight;
      canvas.width  = Math.max(1, Math.floor(cssW * DPR));
      canvas.height = Math.max(1, Math.floor(cssH * DPR));
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      w = cssW;
      h = cssH;
  
      // Keep floaties fully visible
      for (const f of floaties) {
        const halfW = f.size / 2;
        const halfH = (f.size * f.img.height / f.img.width) / 2;
        f.x = clamp(f.x, halfW, w - halfW);
        f.y = clamp(f.y, halfH, h - halfH);
      }
    }
  
    // ---- Floaty creation ----
    function makeFloaty(img, url, hoverText) {
      const sizeMin = Math.min(w, h) * 0.35; // mobile-first sizing
      const sizeMax = Math.min(w, h) * 0.5;
      const size = clamp(rand(sizeMin, sizeMax), 220, 520);
  
      // spawn avoiding overlaps
      let f = { img, url, hoverText, size };
      let halfW = size / 2;
      let halfH = (size * img.height / img.width) / 2;
  
      let attempts = 0;
      do {
        f.x = rand(halfW, w - halfW);
        f.y = rand(halfH, h - halfH);
        attempts++;
      } while (overlaps(f) && attempts < 100);
  
      // motion
      f.dx = rand(-0.5, 0.5);
      f.dy = rand(-0.5, 0.5);
      f.rotation = rand(0, Math.PI * 2);
      f.targetRotation = f.rotation;
      f.baseRotationSpeed = rand(-0.002, 0.002);
      f.hoverScale = 1;
      f.opacity = 0.6; // 0..1
      f.storedSpeed = null;
      f.hoverColor = null;
  
      floaties.push(f);
    }
  
    function overlaps(fNew) {
      for (const f of floaties) {
        const dx = fNew.x - f.x;
        const dy = fNew.y - f.y;
        const dist = Math.hypot(dx, dy);
        if (dist < (fNew.size / 2 + f.size / 2 + 16)) return true;
      }
      return false;
    }
  
    // ---- Drawing helpers ----
    function drawCircularText(ctx, str, x, y, radius) {
      ctx.save();
      ctx.translate(x, y);
      const arcAngle = Math.PI * 2;
      const startAngle = -Math.PI / 2;
      const step = arcAngle / str.length;
      for (let i = 0; i < str.length; i++) {
        ctx.save();
        ctx.rotate(startAngle + i * step);
        ctx.fillText(str[i], 0, -radius);
        ctx.restore();
      }
      ctx.restore();
    }
  
    function isPointerInside(f) {
      const halfW = f.size / 2;
      const halfH = (f.size * f.img.height / f.img.width) / 2;
      return (
        pointer.x > f.x - halfW &&
        pointer.x < f.x + halfW &&
        pointer.y > f.y - halfH &&
        pointer.y < f.y + halfH
      );
    }
  
    // ---- Render loop ----
    function render() {
      ctx.clearRect(0, 0, w, h);
  
      if (floaties.length === 0) {
        // lightweight loading UI
        ctx.save();
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || '#111';
        ctx.font = '16px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Loading…', w / 2, h / 2);
        ctx.restore();
        rafId = requestAnimationFrame(render);
        return;
      }
  
      let hoveringAny = false;
  
      for (const f of floaties) {
        const halfW = f.size / 2;
        const halfH = (f.size * f.img.height / f.img.width) / 2;
        const hovering = isPointerInside(f);
        if (hovering) hoveringAny = true;
  
        if (hovering) {
          f.hoverScale += (1.2 - f.hoverScale) * 0.1;
          f.opacity += (1.0 - f.opacity) * 0.1;
          f.rotation += (0 - f.rotation) * 0.05;
  
          if (!f.storedSpeed) {
            f.storedSpeed = { dx: f.dx, dy: f.dy };
            f.dx = 0; f.dy = 0;
          }
          if (!f.hoverColor) {
            // pastel-ish random
            const r = Math.floor(rand(50, 255));
            const g = Math.floor(rand(50, 255));
            const b = Math.floor(rand(50, 255));
            f.hoverColor = `rgba(${r},${g},${b},0.9)`;
          }
  
          // circular text
          ctx.save();
          ctx.fillStyle = f.hoverColor;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = '16px system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif';
          const radius = Math.max(halfW, halfH) + 20;
          drawCircularText(ctx, f.hoverText, f.x, f.y, radius);
          ctx.restore();
  
        } else {
          f.hoverScale += (1 - f.hoverScale) * 0.1;
          f.opacity += (0.6 - f.opacity) * 0.1;
          if (f.storedSpeed) {
            f.dx = f.storedSpeed.dx;
            f.dy = f.storedSpeed.dy;
            f.storedSpeed = null;
          }
          f.hoverColor = null;
          f.rotation += (f.targetRotation - f.rotation) * 0.02;
          f.targetRotation += f.baseRotationSpeed;
        }
  
        // draw image
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.rotation);
        ctx.scale(f.hoverScale, f.hoverScale);
        ctx.globalAlpha = clamp(f.opacity, 0, 1);
        ctx.drawImage(f.img, -halfW, -halfH, f.size, f.size * f.img.height / f.img.width);
        ctx.restore();
      }
  
      // simple separation & movement
      for (let i = 0; i < floaties.length; i++) {
        for (let j = i + 1; j < floaties.length; j++) {
          const a = floaties[i], b = floaties[j];
          const dx = b.x - a.x, dy = b.y - a.y;
          const dist = Math.hypot(dx, dy);
          const minDist = (a.size / 2 + b.size / 2);
          if (dist < minDist && dist > 0) {
            const overlap = (minDist - dist);
            const nx = dx / dist, ny = dy / dist;
            a.x -= nx * overlap * 0.5; a.y -= ny * overlap * 0.5;
            b.x += nx * overlap * 0.5; b.y += ny * overlap * 0.5;
            // swap velocity
            const tdx = a.dx, tdy = a.dy;
            a.dx = b.dx; a.dy = b.dy; b.dx = tdx; b.dy = tdy;
          }
        }
      }
  
      // integrate & bounce
      const speedScale = prefersReduce ? 0.3 : 1; // slower if user prefers reduced motion
      for (const f of floaties) {
        const halfW = f.size / 2;
        const halfH = (f.size * f.img.height / f.img.width) / 2;
  
        f.x += f.dx * speedScale;
        f.y += f.dy * speedScale;
  
        if (f.x - halfW < 0 || f.x + halfW > w) f.dx *= -1;
        if (f.y - halfH < 0 || f.y + halfH > h) f.dy *= -1;
      }
  
      // pointer cursor hint (desktop)
      canvas.style.cursor = hoveringAny ? 'pointer' : 'default';
  
      rafId = requestAnimationFrame(render);
    }
  
    // ---- Input (Pointer Events unify mouse/touch/stylus) ----
    function canvasPointFromEvent(e) {
      const rect = canvas.getBoundingClientRect();
      // Use clientX/Y; account for scroll
      return {
        x: (e.clientX - rect.left),
        y: (e.clientY - rect.top)
      };
    }
  
    canvas.addEventListener('pointermove', (e) => {
      const p = canvasPointFromEvent(e);
      pointer.x = p.x; pointer.y = p.y;
    }, { passive: true });
  
    canvas.addEventListener('pointerleave', () => {
      pointer.x = -9999; pointer.y = -9999;
    });
  
    canvas.addEventListener('pointerdown', (e) => {
      pointer.down = true;
      const p = canvasPointFromEvent(e);
      pointer.x = p.x; pointer.y = p.y;
  
      // If tapping a floaty, open link
      for (const f of floaties) {
        if (isPointerInside(f)) {
          // Avoid blocking native gestures if not necessary
          try { e.preventDefault(); } catch {}
          window.open(f.url, '_blank');
          break;
        }
      }
    });
  
    canvas.addEventListener('pointerup', () => {
      pointer.down = false;
    });
  
    // ---- Load images & start ----
    function loadImages(list) {
      return Promise.all(list.map(item => new Promise((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.loading = 'eager';
        img.src = item.src;
        img.onload = () => resolve({ ...item, img });
        img.onerror = () => {
          // fallback to a tiny placeholder to keep UI consistent
          const ph = document.createElement('canvas');
          ph.width = ph.height = 10;
          const ctx2 = ph.getContext('2d');
          ctx2.fillStyle = '#ccc'; ctx2.fillRect(0, 0, 10, 10);
          resolve({ ...item, img: ph });
        };
      })));
    }
  
    function start() {
      resize();
      loadImages(ITEMS).then(results => {
        results.forEach(r => makeFloaty(r.img, r.url, r.hoverText));
        if (running) rafId = requestAnimationFrame(render);
      });
    }
  
    // ---- Lifecycle ----
    window.addEventListener('resize', () => {
      resize();
    });
  
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(rafId);
      } else {
        running = true;
        rafId = requestAnimationFrame(render);
      }
    });
  
    // Kick off
    start();
  })();
  