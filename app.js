// --- PIXI APP SETUP ---
const app = new PIXI.Application({
    resizeTo: window,
    backgroundAlpha: 0
  });
  document.body.appendChild(app.view);
  
  // --- MOBILE DETECTION ---
  const IS_MOBILE = window.innerWidth < 768;
  const DESKTOP_MAX_SIZE = 350;
  const MOBILE_MAX_SIZE = Math.min(window.innerWidth, window.innerHeight) * 0.4;
  let MAX_SIZE = IS_MOBILE ? MOBILE_MAX_SIZE : DESKTOP_MAX_SIZE;
  
  // --- FLOATY CONFIG ---
  const floatyData = [
    { src: 'Cover_v01.png', url: '#1', hoverText: 'PORTFOLIO - PORTFOLIO - PORTFOLIO - PORTFOLIO' },
    { src: 'Lampe.png', url: '#2', hoverText: 'PARAMETRIC LAMP - PARAMETRIC LAMP - PARAMETRIC LAMP - PARAMETRIC LAMP' }
  ];
  
  const floaties = [];
  
  // --- CREATE FLOATY ---
  async function createFloaty(texture, url, hoverText) {
    const sprite = new PIXI.Sprite(texture);
  
    // Normalize size
    const scale = Math.min(MAX_SIZE / texture.width, MAX_SIZE / texture.height);
    sprite.baseScale = scale;
    sprite.scale.set(scale);
  
    sprite.anchor.set(0.5);
    sprite.x = Math.random() * window.innerWidth;
    sprite.y = Math.random() * window.innerHeight;
  
    // Rotation
    sprite.rotation = Math.random() * Math.PI * 2;
    sprite.targetRotation = sprite.rotation; // original orientation
    sprite.baseRotationSpeed = (Math.random() - 0.5) * 0.002; // small permanent rotation
    sprite.currentRotationSpeed = sprite.baseRotationSpeed;
  
    // Movement
    sprite.vx = (Math.random() - 0.5) * 0.5;
    sprite.vy = (Math.random() - 0.5) * 0.5;
  
    sprite.hoverText = hoverText;
    sprite.url = url;
    sprite.hovering = false;
    sprite.hoverColor = null;
  
    // Initial opacity
    sprite.alpha = 0.6;
  
    // Text container
    sprite.textContainer = new PIXI.Container();
    app.stage.addChild(sprite.textContainer);
  
    app.stage.addChild(sprite);
    floaties.push(sprite);
  }
  
  // --- LOAD TEXTURES ---
  async function loadTextures() {
    try {
      const textures = await Promise.all(
        floatyData.map(f => PIXI.Assets.load(f.src))
      );
      textures.forEach((texture, index) => {
        const { url, hoverText } = floatyData[index];
        createFloaty(texture, url, hoverText);
      });
    } catch (error) {
      console.error("Error loading textures:", error);
    }
  }
  
  loadTextures();
  
  // --- POINTER SETUP ---
  let pointer = { x: -9999, y: -9999 };
  app.view.addEventListener('pointermove', e => {
    const rect = app.view.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
  });
  app.view.addEventListener('pointerdown', () => {
    floaties.forEach(f => {
      const dx = pointer.x - f.x;
      const dy = pointer.y - f.y;
      const radius = Math.max(f.width, f.height) / 2;
      if (Math.hypot(dx, dy) < radius) {
        window.open(f.url, '_blank');
      }
    });
  });
  
  // --- CIRCULAR TEXT ---
  function drawCircularText(container, text, radius, color = 0xffffff) {
    container.removeChildren();
    const len = text.length;
    for (let i = 0; i < len; i++) {
      const angle = (i / len) * 2 * Math.PI - Math.PI / 2;
      const char = new PIXI.Text(text[i], {
        fontSize: 24,
        fill: color,
        resolution: window.devicePixelRatio * 2 // high res for sharp text
      });
      char.anchor.set(0.5);
      char.x = Math.cos(angle) * radius;
      char.y = Math.sin(angle) * radius;
      char.rotation = angle + Math.PI / 2; // tangent
      container.addChild(char);
    }
  }
  
  // --- REPEL FLOATIES ---
  function repelFloaties() {
    for (let i = 0; i < floaties.length; i++) {
      for (let j = i + 1; j < floaties.length; j++) {
        const f1 = floaties[i];
        const f2 = floaties[j];
  
        const dx = f2.x - f1.x;
        const dy = f2.y - f1.y;
        const dist = Math.hypot(dx, dy);
        const minDist = (Math.max(f1.width, f1.height) / 2 + Math.max(f2.width, f2.height) / 2) + 10;
  
        if (dist < minDist && dist > 0) {
          const overlap = minDist - dist;
          const offsetX = (dx / dist) * overlap * 0.5;
          const offsetY = (dy / dist) * overlap * 0.5;
  
          f1.x -= offsetX;
          f1.y -= offsetY;
          f2.x += offsetX;
          f2.y += offsetY;
        }
      }
    }
  }
  
  // --- ANIMATION LOOP ---
  app.ticker.add(() => {
    repelFloaties();
  
    floaties.forEach(f => {
      // Move
      f.x += f.vx;
      f.y += f.vy;
  
      // Clamp to viewport
      const hw = f.width / 2, hh = f.height / 2;
      if (f.x - hw < 0) { f.x = hw; f.vx *= -1; }
      if (f.x + hw > window.innerWidth) { f.x = window.innerWidth - hw; f.vx *= -1; }
      if (f.y - hh < 0) { f.y = hh; f.vy *= -1; }
      if (f.y + hh > window.innerHeight) { f.y = window.innerHeight - hh; f.vy *= -1; }
  
      // Rotation
      f.rotation += f.currentRotationSpeed;
  
      // Hover detection
      const dx = pointer.x - f.x;
      const dy = pointer.y - f.y;
      const radius = Math.max(f.width, f.height) / 2;
      const hovering = Math.hypot(dx, dy) < radius;
      f.hovering = hovering;
  
      // Smooth hover scale
      const targetScale = hovering ? f.baseScale * 1.4 : f.baseScale;
      f.scale.set(f.scale.x + (targetScale - f.scale.x) * 0.1);
  
      // Smooth opacity
      const targetAlpha = hovering ? 1 : 0.6;
      f.alpha += (targetAlpha - f.alpha) * 0.1;
  
      // Pause rotation on hover
      f.currentRotationSpeed = hovering ? 0 : f.baseRotationSpeed;
  
      // Smooth rotation to original orientation
      const targetRot = hovering ? 0 : f.targetRotation;
      f.rotation += (targetRot - f.rotation) * 0.05;
  
      // Circular text with random hover color
      if (hovering) {
        if (!f.hoverColor) {
          f.hoverColor = PIXI.utils.rgb2hex([
            0.2 + Math.random() * 0.8,
            0.2 + Math.random() * 0.8,
            0.2 + Math.random() * 0.8
          ]);
        }
        drawCircularText(f.textContainer, f.hoverText, radius + 20, f.hoverColor);
        f.textContainer.x = f.x;
        f.textContainer.y = f.y;
      } else {
        f.textContainer.removeChildren();
        f.hoverColor = null;
      }
    });
  });
  
  // --- RESIZE HANDLING ---
  window.addEventListener('resize', () => {
    const newMobileSize = Math.min(window.innerWidth, window.innerHeight) * 0.4;
    MAX_SIZE = IS_MOBILE ? newMobileSize : DESKTOP_MAX_SIZE;
  
    floaties.forEach(f => {
      const scale = Math.min(MAX_SIZE / f.texture.width, MAX_SIZE / f.texture.height);
      f.baseScale = scale;
      f.scale.set(scale);
  
      // Keep floaty fully visible
      f.x = Math.min(Math.max(f.x, f.width / 2), window.innerWidth - f.width / 2);
      f.y = Math.min(Math.max(f.y, f.height / 2), window.innerHeight - f.height / 2);
    });
  });
  