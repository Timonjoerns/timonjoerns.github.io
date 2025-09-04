let floaties = [];
const DEBUG = false;
let cnvEl = null;

// --- FLOATY CREATION ---
function addFloaty(img, url, hoverText) {
  let f = { img, url, hoverText };
  f.size = random(260, 380); // mobile-first: smaller default
  let halfWidth = f.size / 2;
  let halfHeight = (f.size * f.img.height / f.img.width) / 2;

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

  f.dx = random(-0.5, 0.5);
  f.dy = random(-0.5, 0.5);
  f.rotation = random(TWO_PI);
  f.targetRotation = f.rotation;
  f.baseRotationSpeed = random(-0.002, 0.002);
  f.hoverScale = 1;
  f.opacity = 150;
  f.hoverColor = null;
  f.storedSpeed = null;
  floaties.push(f);
}

// --- SETUP ---
function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1); // always
  cnvEl = document.querySelector('canvas');

  noStroke();
  imageMode(CENTER);

  // ✅ Load PNG only
  loadImage("Cover_v01.png", img => {
    addFloaty(img, "#1", "PORTFOLIO - PORTFOLIO - PORTFOLIO - PORTFOLIO");
  });

  loadImage("Lampe.png", img => {
    addFloaty(img, "#2", "PARAMETRIC LAMP - PARAMETRIC LAMP - PARAMETRIC LAMP - PARAMETRIC LAMP");
  });

  textAlign(CENTER, CENTER);
  textSize(16);
}

// --- CIRCULAR TEXT ---
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

// --- DRAW LOOP ---
function draw() {
  clear();

  if (floaties.length === 0) {
    noStroke(); fill(0); textAlign(CENTER, CENTER);
    text("Loading…", width / 2, height / 2);
    return;
  }

  let hovering = false;

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

    push();
    translate(f.x, f.y);
    rotate(f.rotation);
    scale(f.hoverScale);
    tint(255, f.opacity);
    image(f.img, 0, 0, f.size, f.size * f.img.height / f.img.width);
    pop();
  }

  // simple separation collisions
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

  // move and bounce
  for (let f of floaties) {
    let halfWidth = f.size / 2;
    let halfHeight = (f.size * f.img.height / f.img.width) / 2;
    f.x += f.dx;
    f.y += f.dy;

    if (f.x - halfWidth < 0 || f.x + halfWidth > width) f.dx *= -1;
    if (f.y - halfHeight < 0 || f.y + halfHeight > height) f.dy *= -1;
  }

  if (cnvEl) {
    if (hovering) cnvEl.classList.add('has-pointer-events');
    else cnvEl.classList.remove('has-pointer-events');
  }

  cursor(hovering ? 'pointer' : 'default');
}

// --- INPUT HANDLERS ---
function handleClickOrTap() {
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

function mousePressed() {
  handleClickOrTap();
}

function touchStarted() {
  handleClickOrTap();
  return false; // prevent page scroll
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  for (let f of floaties) {
    let halfWidth = f.size / 2;
    let halfHeight = (f.size * f.img.height / f.img.width) / 2;
    f.x = constrain(f.x, halfWidth, width - halfWidth);
    f.y = constrain(f.y, halfHeight, height - halfHeight);
  }
}
