let floaties = [];
// Controls console instrumentation; keep off in production to avoid noise
const DEBUG = false; // toggle to enable/disable debug logs
// Heuristic mobile detection for lighter rendering configs
const IS_MOBILE = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;
// Cached canvas element reference for efficient class toggling
let cnvEl = null;
// Simple on-canvas status line to diagnose mobile loading issues
let statusMsg = "";

// Create and initialize a new floaty based on a loaded image
function addFloaty(img, url, hoverText) {
  let f = { img, url, hoverText };
  // Use smaller sizes on mobile to reduce decode and draw cost
  f.size = IS_MOBILE ? random(260, 380) : random(400, 600);
  let halfWidth = f.size / 2;
  let halfHeight = (f.size * f.img.height / f.img.width) / 2;

  // Spawn fully visible, avoiding overlaps with already placed floaties
  let safe = false;
  while (!safe) {
    f.x = random(halfWidth, width - halfWidth);
    f.y = random(halfHeight, height - halfHeight);
    safe = true;
    for (let j = 0; j < floaties.length; j++) {
      let other = floaties[j];
      let dx = f.x - other.x;
      let dy = f.y - other.y;
      let distance = sqrt(dx*dx + dy*dy);
      if (distance < (f.size/2 + other.size/2 + 20)) { 
        safe = false;
        break;
      }
    }
  }

  // Initial motion and animation state
  f.dx = random(-0.5, 0.5);
  f.dy = random(-0.5, 0.5);
  f.originalSpeed = { dx: f.dx, dy: f.dy };
  f.rotation = random(TWO_PI);
  f.targetRotation = f.rotation;
  f.baseRotationSpeed = random(-0.002, 0.002);
  f.hoverScale = 1;
  f.opacity = 150;
  f.hoverColor = null;
  f.storedSpeed = null;
  floaties.push(f);
}

// Attempt to load WebP, fall back to PNG if unsupported/slow. Each attempt has a timeout.
function loadImageWithFallback(webpPath, pngPath, url, hoverText, label) {
  // Timeout helper
  function withTimeout(ms, onTimeout) {
    const id = setTimeout(onTimeout, ms);
    return () => clearTimeout(id);
  }

  statusMsg = `Loading ${label} (webp)…`;
  let cleared = null;
  let resolved = false;

  const start = performance.now();
  const clearTimer = withTimeout(2000, () => {
    if (resolved) return;
    // WebP taking too long; try PNG fallback in parallel
    statusMsg = `${label} webp slow → trying png…`;
    const pngStart = performance.now();
    loadImage(pngPath,
      (img) => {
        if (resolved) return;
        resolved = true;
        statusMsg = `${label} loaded PNG in ${(performance.now() - pngStart).toFixed(0)}ms`;
        addFloaty(img, url, hoverText);
      },
      (err) => {
        if (resolved) return;
        // Both failed — insert placeholder to keep UI responsive
        resolved = true;
        statusMsg = `${label} failed (png)`;
        const ph = createImage(10, 10); ph.loadPixels(); ph.updatePixels();
        addFloaty(ph, url, "");
      }
    );
  });

  // Kick off WebP load
  loadImage(webpPath,
    (img) => {
      if (resolved) return;
      resolved = true;
      clearTimer();
      statusMsg = `${label} loaded WEBP in ${(performance.now() - start).toFixed(0)}ms`;
      addFloaty(img, url, hoverText);
    },
    (err) => {
      if (resolved) return;
      // Immediate WebP error → try PNG
      clearTimer();
      statusMsg = `${label} webp error → trying png…`;
      const pngStart = performance.now();
      loadImage(pngPath,
        (img) => {
          if (resolved) return;
          resolved = true;
          statusMsg = `${label} loaded PNG in ${(performance.now() - pngStart).toFixed(0)}ms`;
          addFloaty(img, url, hoverText);
        },
        () => {
          if (resolved) return;
          resolved = true;
          statusMsg = `${label} failed (png)`;
          const ph = createImage(10, 10); ph.loadPixels(); ph.updatePixels();
          addFloaty(ph, url, "");
        }
      );
    }
  );
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  cnvEl = document.querySelector('canvas');

  // Reduce work on mobile devices
  if (IS_MOBILE) {
    try { pixelDensity(1); } catch (_) {}
    try { frameRate(30); } catch (_) {}
  }

  noStroke();
  imageMode(CENTER);

  // Begin image loads asynchronously (non-blocking). The sketch renders a
  // lightweight loading state until at least one image is ready.
  loadImageWithFallback(
    "Cover_v01.webp",
    "Cover_v01.png",
    "#1",
    "PORTFOLIO - PORTFOLIO - PORTFOLIO - PORTFOLIO",
    "Cover_v01"
  );
  loadImageWithFallback(
    "Lampe.webp",
    "Lampe.png",
    "#2",
    "PARAMETRIC LAMP - PARAMETRIC LAMP - PARAMETRIC LAMP - PARAMETRIC LAMP",
    "Lampe"
  );

  // Watchdog: guarantee something renders even if network stalls
  setTimeout(() => {
    if (floaties.length === 0) {
      statusMsg = "Watchdog: inserting placeholder…";
      const ph = createImage(10, 10); ph.loadPixels(); ph.updatePixels();
      addFloaty(ph, "#0", "");
    }
  }, 2500);

  textAlign(CENTER, CENTER);
  textSize(16);
}

// Draw a circular text band around a point with a given radius
function drawCircularText(str, x, y, radius) {
  push();
  translate(x, y);
  let arcAngle = TWO_PI;
  let startAngle = -PI / 2;
  let angleStep = arcAngle / str.length;

  for (let i = 0; i < str.length; i++) {
    push();
    rotate(startAngle + i * angleStep);
    text(str[i], 0, -radius);
    pop();
  }
  pop();
}

// Basic FPS meter and throttled performance log (DEBUG only)
let _fpsLastLog = 0;
let _fpsFrames = 0;

function draw() {
  clear();

  // Lightweight loading UI until first image arrives
  if (floaties.length === 0) {
    noStroke(); fill(0); textAlign(CENTER, CENTER);
    text("Loading…", width / 2, height / 2);
    // Show status line for mobile diagnostics
    if (statusMsg) {
      textSize(12);
      text(statusMsg, width / 2, height / 2 + 24);
      textSize(16);
    }
    return;
  }

  let hovering = false;

  // Update and draw floaties, with hover behavior and gentle animation
  for (let f of floaties) {
    let halfWidth = f.size / 2;
    let halfHeight = (f.size * f.img.height / f.img.width) / 2;

    let isHover = mouseX > f.x - halfWidth &&
                  mouseX < f.x + halfWidth &&
                  mouseY > f.y - halfHeight &&
                  mouseY < f.y + halfHeight;

    if (isHover) {
      hovering = true;
      f.hoverScale = lerp(f.hoverScale, 1.2, 0.1);
      f.opacity = lerp(f.opacity, 255, 0.1);
      f.rotation = lerp(f.rotation, 0, 0.05);

      if (!f.storedSpeed) {
        f.storedSpeed = { dx: f.dx, dy: f.dy };
        f.dx = 0;
        f.dy = 0;
      }

      if (!f.hoverColor) {
        f.hoverColor = color(random(50, 255), random(50, 255), random(50, 255));
      }
      fill(f.hoverColor);

      let radius = max(f.size, f.size * f.img.height / f.img.width) / 2 + 20;
      drawCircularText(f.hoverText, f.x, f.y, radius);

    } else {
      f.hoverScale = lerp(f.hoverScale, 1, 0.1);
      f.opacity = lerp(f.opacity, 150, 0.1);

      if (f.storedSpeed) {
        f.dx = f.storedSpeed.dx;
        f.dy = f.storedSpeed.dy;
        f.storedSpeed = null;
      }

      f.hoverColor = null;
      f.rotation = lerp(f.rotation, f.targetRotation, 0.02);
      f.targetRotation += f.baseRotationSpeed;
    }

    // Render the floaty image with current transforms
    push();
    translate(f.x, f.y);
    rotate(f.rotation);
    scale(f.hoverScale);
    tint(255, f.opacity);
    image(f.img, 0, 0, f.size, f.size * f.img.height / f.img.width);
    pop();
  }

  // Resolve overlaps with a simple separation step (elastic swap of velocity)
  for (let i = 0; i < floaties.length; i++) {
    for (let j = i + 1; j < floaties.length; j++) {
      let f1 = floaties[i];
      let f2 = floaties[j];
      let dx = f2.x - f1.x;
      let dy = f2.y - f1.y;
      let distance = sqrt(dx*dx + dy*dy);
      let minDist = (f1.size/2 + f2.size/2);
      if (distance < minDist) {
        let angle = atan2(dy, dx);
        let overlap = minDist - distance;
        f1.x -= cos(angle) * overlap / 2;
        f1.y -= sin(angle) * overlap / 2;
        f2.x += cos(angle) * overlap / 2;
        f2.y += sin(angle) * overlap / 2;

        let tempDx = f1.dx;
        let tempDy = f1.dy;
        f1.dx = f2.dx;
        f1.dy = f2.dy;
        f2.dx = tempDx;
        f2.dy = tempDy;
      }
    }
  }

  // Integrate positions and bounce at canvas edges
  for (let f of floaties) {
    let halfWidth = f.size / 2;
    let halfHeight = (f.size * f.img.height / f.img.width) / 2;
    f.x += f.dx;
    f.y += f.dy;

    if (f.x - halfWidth < 0 || f.x + halfWidth > width) f.dx *= -1;
    if (f.y - halfHeight < 0 || f.y + halfHeight > height) f.dy *= -1;
  }

  // Enable pointer events only when hovering, to preserve page interactivity
  if (cnvEl) {
    if (!IS_MOBILE) {
      if (hovering) cnvEl.classList.add('has-pointer-events');
      else cnvEl.classList.remove('has-pointer-events');
    } else {
      // Always keep canvas non-interactive on mobile so links remain tappable
      cnvEl.classList.remove('has-pointer-events');
    }
  }

  cursor(hovering ? 'pointer' : 'default');

  // Throttled FPS logging for diagnostics (DEBUG only)
  if (DEBUG) {
    _fpsFrames++;
    const now = performance.now();
    if (!_fpsLastLog) { _fpsLastLog = now; }
    const elapsed = now - _fpsLastLog;
    if (elapsed >= 2000) {
      const fps = (_fpsFrames / (elapsed / 1000)).toFixed(1);
      console.log("Perf", { fps, floaties: floaties.length, canvas: { w: width, h: height }, dpr: window.devicePixelRatio });
      _fpsFrames = 0;
      _fpsLastLog = now;
    }
  }
}

// Open floaty link when the image is tapped/clicked
function mousePressed() {
  for (let f of floaties) {
    let halfWidth = f.size / 2;
    let halfHeight = (f.size * f.img.height / f.img.width) / 2;

    if (mouseX > f.x - halfWidth &&
        mouseX < f.x + halfWidth &&
        mouseY > f.y - halfHeight &&
        mouseY < f.y + halfHeight) {
      window.open(f.url, "_blank");
    }
  }
}

// Keep floaties entirely visible after resizes
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  for (let f of floaties) {
    let halfWidth = f.size / 2;
    let halfHeight = (f.size * f.img.height / f.img.width) / 2;
    f.x = constrain(f.x, halfWidth, width - halfWidth);
    f.y = constrain(f.y, halfHeight, height - halfHeight);
  }
}
