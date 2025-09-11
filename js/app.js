// Hybrid implementation (clean, stable):
// - Mobile: DOM feed (stacked cards, breathing animation, tap opens link).
// - Desktop: Pixi.js floaties with smooth hover and click.

// ---------- Config ----------
const FLOATIES = [
  { src: 'assets/images/Cover_v01.png', url: 'portfolio.html', title: 'Portfolio', hoverText: '- PORTFOLIO - PORTFOLIO - PORTFOLIO - PORTFOLIO ' }
];

const IS_MOBILE = window.innerWidth < 768;
const DESKTOP_MAX_SIZE = 420; // Increased from 350 for bigger floaties
const MOBILE_MAX_SIZE = Math.min(window.innerWidth, window.innerHeight) * 0.4;

// If user crosses breakpoint, reload to re-init cleanly
let _initialIsMobile = IS_MOBILE;
window.addEventListener('resize', () => {
  const nowMobile = window.innerWidth < 768;
  if (nowMobile !== _initialIsMobile) location.reload();
});

// ---------- Mobile feed (DOM) ----------
if (IS_MOBILE) {
  const feed = document.getElementById('mobile-feed');

  FLOATIES.forEach((f, i) => {
    const a = document.createElement('a');
    a.className = 'feed-item breathe';
    a.href = f.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';

    const img = document.createElement('img');
    img.src = f.src;
    img.alt = f.title || f.hoverText.replace(/-|\s+/g, ' ').trim();

    const caption = document.createElement('div');
    caption.className = 'feed-caption';
    // Use title on mobile instead of hoverText
    caption.textContent = f.title || f.hoverText.replace(/-+/g, '').trim();

    a.appendChild(img);
    a.appendChild(caption);

    // Stagger breathing animation start for organic feel
    a.style.animationDelay = `${(i * 0.6) % 3.6}s`;

    feed.appendChild(a);
  });

  // add bottom padding to main so last card isn't hidden by mobile UI chrome
  document.querySelector('main').style.paddingBottom = '120px';
  console.log('Mobile feed initialized with', FLOATIES.length, 'items.');
  // skip Pixi on mobile
} else {
  // ---------- Desktop Pixi implementation ----------
  if (typeof PIXI === 'undefined') {
    document.querySelector('main').insertAdjacentHTML('beforeend',
      '<div style="color:#c00;margin-top:10px;">Error: Pixi.js not found. Include it in index.html.</div>');
    throw new Error('PIXI not found');
  }

  // Create Pixi app with optimized settings for 60fps
  const app = new PIXI.Application({ 
    resizeTo: window, 
    backgroundAlpha: 0,
    antialias: true, // Better visual quality
    powerPreference: "high-performance" // Use dedicated GPU if available
  });
  // Append canvas (CSS keeps it behind main)
  document.body.appendChild(app.view);

  // Runtime parameters
  let MAX_SIZE = DESKTOP_MAX_SIZE; // desktop-only
  const sprites = [];

  // custom pointer
  let pointer = { x: -9999, y: -9999 };
  window.addEventListener('pointermove', (e) => {
    const rect = app.view.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
  });
  window.addEventListener('pointerleave', () => {
    pointer.x = -9999; pointer.y = -9999;
  });
  window.addEventListener('pointerdown', () => {
    for (const s of sprites) {
      const dx = pointer.x - s.x;
      const dy = pointer.y - s.y;
      const r = Math.max(s.width, s.height) / 2;
      if (Math.hypot(dx,dy) < r) {
        window.open(s.url, '_blank');
        break;
      }
    }
  });

  function createSpriteFromSrc(src, url, hoverText) {
    const tex = PIXI.Texture.from(src);
    const s = new PIXI.Sprite(tex);
    s.anchor.set(0.5);

    const scale = Math.min(MAX_SIZE / tex.width, MAX_SIZE / tex.height);
    s.baseScale = scale;
    s.scale.set(scale);

    const margin = 60;
    s.x = Math.random() * (window.innerWidth - margin*2) + margin;
    s.y = Math.random() * (window.innerHeight - margin*2) + margin;

    s.vx = (Math.random() - 0.5) * 0.5;
    s.vy = (Math.random() - 0.5) * 0.5;

    s.rotation = Math.random() * Math.PI * 2;
    s.targetRotation = s.rotation;
    s.baseRotationSpeed = (Math.random() - 0.5) * 0.002;
    s.currentRotationSpeed = s.baseRotationSpeed;

    s.alpha = 0.6;
    s.hoverText = hoverText;
    s.url = url;
    s.hoverColor = null;
    s.hoverProgress = 0;

    s.textContainer = new PIXI.Container();
    app.stage.addChild(s.textContainer);

    s.interactive = true;
    s.cursor = 'pointer';

    app.stage.addChild(s);
    sprites.push(s);
  }

  async function loadAll() {
    try {
      await Promise.all(FLOATIES.map(f => PIXI.Assets.load(f.src)));
      FLOATIES.forEach(f => createSpriteFromSrc(f.src, f.url, f.hoverText));
      app.ticker.add(tick);
      console.log('Pixi floaties ready');
    } catch (err) {
      console.error('Error loading textures', err);
    }
  }

  function resolveSeparation() {
    for (let i = 0; i < sprites.length; i++) {
      for (let j = i+1; j < sprites.length; j++) {
        const a = sprites[i], b = sprites[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.hypot(dx,dy);
        if (d === 0) continue;
        const minDist = (Math.max(a.width,a.height)/2 + Math.max(b.width,b.height)/2) + 8;
        if (d < minDist) {
          const overlap = minDist - d;
          const nx = dx/d, ny = dy/d;
          a.x -= nx * overlap * 0.5;
          a.y -= ny * overlap * 0.5;
          b.x += nx * overlap * 0.5;
          b.y += ny * overlap * 0.5;

          const tx = a.vx, ty = a.vy;
          a.vx = b.vx; a.vy = b.vy;
          b.vx = tx; b.vy = ty;
        }
      }
    }
  }

  function drawCircularText(container, text, radius, color = 0xffffff) {
    container.removeChildren();
    const len = text.length;
    const charSize = Math.min(24, Math.max(12, radius * 0.12));
    for (let i=0;i<len;i++){
      const angle = (i / len) * Math.PI*2 - Math.PI/2;
      const ch = new PIXI.Text(text[i], {
        fontFamily: 'IBM Plex Sans',
        fontWeight: '300',
        fontSize: charSize,
        fill: color,
        resolution: Math.min(window.devicePixelRatio * 2, 3), // Cap resolution for performance
      });
      ch.anchor.set(0.5);
      ch.x = Math.cos(angle) * radius;
      ch.y = Math.sin(angle) * radius;
      ch.rotation = angle + Math.PI/2;
      container.addChild(ch);
    }
  }

  function tick() {
    resolveSeparation();

    for (const s of sprites) {
      s.x += s.vx;
      s.y += s.vy;

      const hw = s.width/2, hh = s.height/2;
      if (s.x - hw < 0) { s.x = hw; s.vx *= -1; }
      if (s.x + hw > window.innerWidth) { s.x = window.innerWidth - hw; s.vx *= -1; }
      if (s.y - hh < 0) { s.y = hh; s.vy *= -1; }
      if (s.y + hh > window.innerHeight) { s.y = window.innerHeight - hh; s.vy *= -1; }

      s.rotation += s.currentRotationSpeed;

      const dx = pointer.x - s.x, dy = pointer.y - s.y;
      const hovering = Math.hypot(dx,dy) < Math.max(s.width,s.height)/2;

      const targetHover = hovering ? 1 : 0;
      s.hoverProgress += (targetHover - s.hoverProgress) * 0.15; // Slightly faster for smoother response

      const hoverScale = s.baseScale * (1 + 0.4 * s.hoverProgress);
      s.scale.set(s.scale.x + (hoverScale - s.scale.x) * 0.15); // Smoother scaling
      const targetAlpha = hovering ? 1 : 0.6;
      s.alpha += (targetAlpha - s.alpha) * 0.15; // Smoother alpha transitions

      s.currentRotationSpeed = s.baseRotationSpeed * (1 - s.hoverProgress);
      const targetRot = hovering ? 0 : s.targetRotation;
      s.rotation += (targetRot - s.rotation) * 0.12 * s.hoverProgress; // Increased from 0.06 for faster rotation to origin

      if (s.hoverProgress > 0.12 && hovering) {
        // Generate a new color on each new hover
        if (!s._wasHovering) {
          s.hoverColor = PIXI.utils.rgb2hex([
            0.2 + Math.random() * 0.5,
            0.2 + Math.random() * 0.5,
            0.2 + Math.random() * 0.5
          ]);
        }
        drawCircularText(s.textContainer, s.hoverText, Math.max(s.width, s.height) / 2, s.hoverColor);
        s.textContainer.x = s.x;
        s.textContainer.y = s.y;
        s._wasHovering = true;
      } else {
        s.textContainer.removeChildren();
        s._wasHovering = false;
      }
    }
  }

  window.addEventListener('resize', () => {
    MAX_SIZE = DESKTOP_MAX_SIZE;
    for (const s of sprites) {
      const tex = s.texture;
      const newScale = Math.min(MAX_SIZE / (tex?.width || s.width), MAX_SIZE / (tex?.height || s.height));
      s.baseScale = newScale;
      s.scale.set(newScale);
      s.x = Math.min(Math.max(s.x, s.width/2), window.innerWidth - s.width/2);
      s.y = Math.min(Math.max(s.y, s.height/2), window.innerHeight - s.height/2);
    }
  });

  loadAll();
}
