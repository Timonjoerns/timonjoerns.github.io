/* Minimal single-floaty p5 sketch
 - One image floats (PNG fallback if WEBP fails)
 - Desktop: hover shows circular text; click opens link
 - Mobile: first tap shows circular text; second tap opens link
 - Canvas never blocks page links on mobile (pointer-events only when interacting)
*/

let isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || window.innerWidth < 768;
let canvasEl = null;

const floaty = {
  img: null,
  url: '#1',
  hoverText: 'PORTFOLIO - PORTFOLIO - PORTFOLIO - PORTFOLIO',
  x: 0,
  y: 0,
  size: 360,
  dx: 0.3,
  dy: 0.25,
  rotation: 0,
  targetRotation: 0,
  baseRotationSpeed: 0.0015,
  hoverScale: 1,
  opacity: 160,
  showingInfo: false,
  storedSpeed: null,
};

let loadingStatus = '';
let watchdogTimer = null;
let lastFrameTs = 0;
let stallWatcher = null;
let wakeLock = null;

async function requestWakeLock() {
  try {
    if ('wakeLock' in navigator && navigator.wakeLock.request) {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener && wakeLock.addEventListener('release', () => { /* noop */ });
    }
  } catch (_) { /* ignore */ }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  canvasEl = document.querySelector('canvas');

  if (isMobile) {
    try { pixelDensity(1); } catch (_) {}
    try { frameRate(30); } catch (_) {}
  }

  noStroke();
  imageMode(CENTER);

  // Size tuned for device
  floaty.size = isMobile ? 300 : 420;
  const halfW = floaty.size / 2;
  const halfH = floaty.size / 2; // will be updated after image loads
  floaty.x = random(halfW, width - halfW);
  floaty.y = random(halfH, height - halfH);
  floaty.dx = random(-0.4, 0.4);
  floaty.dy = random(-0.4, 0.4);
  floaty.rotation = random(TWO_PI);
  floaty.targetRotation = floaty.rotation;
  floaty.baseRotationSpeed = random(-0.002, 0.002);

  // Non-blocking image loading with PNG fallback and last-resort placeholder
  loadingStatus = 'Loading image (webp)…';
  loadImage('Cover_v01.webp', (img) => {
    floaty.img = img;
    loadingStatus = '';
    if (watchdogTimer) { clearTimeout(watchdogTimer); watchdogTimer = null; }
  }, () => {
    loadingStatus = 'WEBP failed → loading PNG…';
    loadImage('Cover_v01.png', (png) => {
      floaty.img = png;
      loadingStatus = '';
      if (watchdogTimer) { clearTimeout(watchdogTimer); watchdogTimer = null; }
    }, () => {
      loadingStatus = 'Image failed → showing placeholder';
      const ph = createImage(16, 16); ph.loadPixels(); ph.updatePixels();
      floaty.img = ph;
      if (watchdogTimer) { clearTimeout(watchdogTimer); watchdogTimer = null; }
    });
  });

  // Watchdog: if image not ready after 2500ms, force a placeholder so UI never stalls
  watchdogTimer = setTimeout(() => {
    if (!floaty.img) {
      loadingStatus = 'Network slow → placeholder';
      const ph = createImage(16, 16); ph.loadPixels(); ph.updatePixels();
      floaty.img = ph;
    }
  }, 2500);

  // Resume hooks to avoid stalls
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      loop();
    } else {
      // Optional: pause when hidden to save power
      noLoop();
    }
  });
  window.addEventListener('focus', () => { loop(); });
  window.addEventListener('blur', () => { /* keep running or pause if desired */ });

  // Stall watcher: if no frames for > 1200ms while visible, kick the loop
  stallWatcher = setInterval(() => {
    if (document.hidden) return;
    const now = performance.now();
    if (now - lastFrameTs > 1200) {
      loop();
    }
  }, 1500);

  textAlign(CENTER, CENTER);
  textSize(16);
}

function drawCircularText(str, x, y, radius) {
  push();
  translate(x, y);
  const startAngle = -PI / 2;
  const angleStep = TWO_PI / str.length;
  for (let i = 0; i < str.length; i++) {
    push();
    rotate(startAngle + i * angleStep);
    text(str[i], 0, -radius);
    pop();
  }
  pop();
}

function draw() {
  lastFrameTs = performance.now();
  clear();

  // If image not ready yet, show small loading hint and status
  if (!floaty.img) {
    fill(0); textAlign(CENTER, CENTER); text('Loading…', width / 2, height / 2);
    if (loadingStatus) { textSize(12); text(loadingStatus, width / 2, height / 2 + 24); textSize(16); }
    return;
  }

  // Compute half sizes from current image aspect
  const halfW = floaty.size / 2;
  const halfH = (floaty.size * floaty.img.height / floaty.img.width) / 2;

  // Hover detection (desktop move / mobile last touch)
  const isHover = mouseX > floaty.x - halfW && mouseX < floaty.x + halfW && mouseY > floaty.y - halfH && mouseY < floaty.y + halfH;

  // Animate
  if (isHover || floaty.showingInfo) {
    floaty.hoverScale = lerp(floaty.hoverScale, 1.18, 0.12);
    floaty.opacity = lerp(floaty.opacity, 255, 0.12);
    floaty.rotation = lerp(floaty.rotation, 0, 0.06);
    // Pause motion while showing info
    if (!floaty.storedSpeed) { floaty.storedSpeed = { dx: floaty.dx, dy: floaty.dy }; floaty.dx = 0; floaty.dy = 0; }
  } else {
    floaty.hoverScale = lerp(floaty.hoverScale, 1, 0.12);
    floaty.opacity = lerp(floaty.opacity, 160, 0.12);
    if (floaty.storedSpeed) { floaty.dx = floaty.storedSpeed.dx; floaty.dy = floaty.storedSpeed.dy; floaty.storedSpeed = null; }
    floaty.rotation = lerp(floaty.rotation, floaty.targetRotation, 0.02);
    floaty.targetRotation += floaty.baseRotationSpeed;
  }

  // Draw
  push();
  translate(floaty.x, floaty.y);
  rotate(floaty.rotation);
  scale(floaty.hoverScale);
  tint(255, floaty.opacity);
  image(floaty.img, 0, 0, floaty.size, floaty.size * floaty.img.height / floaty.img.width);
  pop();

  // Draw circular info text when active
  if (isHover || floaty.showingInfo) {
    const r = max(halfW, halfH) + 24;
    fill(0);
    drawCircularText(floaty.hoverText, floaty.x, floaty.y, r);
  }

  // Move and bounce
  floaty.x += floaty.dx;
  floaty.y += floaty.dy;
  if (floaty.x - halfW < 0 || floaty.x + halfW > width) floaty.dx *= -1;
  if (floaty.y - halfH < 0 || floaty.y + halfH > height) floaty.dy *= -1;

  // Pointer-events: never block links on mobile; on desktop enable only when interacting
  if (canvasEl) {
    if (!isMobile && (isHover || floaty.showingInfo)) canvasEl.classList.add('has-pointer-events');
    else canvasEl.classList.remove('has-pointer-events');
  }

  cursor(isHover ? 'pointer' : 'default');
}

function handlePress(px, py) {
  // Resume rendering aggressively on interaction
  loop();
  requestWakeLock();

  if (!floaty.img) return;
  const halfW = floaty.size / 2;
  const halfH = (floaty.size * floaty.img.height / floaty.img.width) / 2;
  const inside = px > floaty.x - halfW && px < floaty.x + halfW && py > floaty.y - halfH && py < floaty.y + halfH;
  if (!inside) { floaty.showingInfo = false; return; }

  // First press: show info; second press: open link
  if (!floaty.showingInfo) {
    floaty.showingInfo = true;
  } else {
    window.open(floaty.url, '_blank');
    floaty.showingInfo = false;
  }
}

function mousePressed() {
  handlePress(mouseX, mouseY);
}

function touchStarted() {
  handlePress(touchX, touchY);
  // Briefly enable pointer events so p5 can receive the tap if needed
  if (canvasEl) {
    canvasEl.classList.add('has-pointer-events');
    setTimeout(() => canvasEl.classList.remove('has-pointer-events'), 400);
  }
  return false; // prevent accidental page scroll on quick taps
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Keep floaty fully visible
  if (!floaty.img) return;
  const halfW = floaty.size / 2;
  const halfH = (floaty.size * floaty.img.height / floaty.img.width) / 2;
  floaty.x = constrain(floaty.x, halfW, width - halfW);
  floaty.y = constrain(floaty.y, halfH, height - halfH);
}
