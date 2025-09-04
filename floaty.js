/* Minimal single-floaty p5 sketch
 - One image floats (PNG fallback if WEBP fails)
 - Desktop: hover shows circular text; click opens link
 - Mobile: first tap shows circular text (pauses floaty); second tap opens link
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
  loadImage('Cover_v01.webp', (img) => {
    floaty.img = img;
  }, () => {
    loadImage('Cover_v01.png', (png) => {
      floaty.img = png;
    }, () => {
      // Placeholder (never block rendering)
      const ph = createImage(16, 16); ph.loadPixels(); ph.updatePixels();
      floaty.img = ph;
    });
  });

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
  clear();

  // If image not ready yet, show tiny loading hint once
  if (!floaty.img) {
    fill(0); textAlign(CENTER, CENTER); text('Loading…', width / 2, height / 2);
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

  // Pointer-events: never block links on mobile; on desktop enable only when hovering
  if (canvasEl) {
    if (!isMobile && (isHover || floaty.showingInfo)) canvasEl.classList.add('has-pointer-events');
    else canvasEl.classList.remove('has-pointer-events');
  }

  cursor(isHover ? 'pointer' : 'default');
}

function handlePress(px, py) {
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
