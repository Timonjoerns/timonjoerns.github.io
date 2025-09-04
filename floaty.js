/* Ultra-minimal p5 sketch
   - One circle floats and bounces within the viewport
   - Mobile-friendly: pixelDensity(1), frameRate(60) (falls back to 30 if choppy)
   - No text, no interactions, no images
*/

let x = 0;
let y = 0;
let dx = 0.4;
let dy = 0.35;
let d = 260; // circle diameter
let framesChecked = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  // Mobile-friendly defaults
  try { pixelDensity(1); } catch (_) {}
  try { frameRate(60); } catch (_) {}

  noStroke();

  // Start near center with a bit of randomness
  x = width * 0.5 + random(-50, 50);
  y = height * 0.5 + random(-50, 50);
  d = min(min(width, height) * 0.35, 320);

  // Gentle random velocity
  dx = random(0.25, 0.5) * (random() < 0.5 ? -1 : 1);
  dy = random(0.2, 0.45) * (random() < 0.5 ? -1 : 1);
}

function draw() {
  // Use solid background to verify rendering on mobile
  background(255);

  // Draw circle
  fill(30, 144, 255, 180); // semi-transparent blue
  circle(x, y, d);

  // Move
  x += dx;
  y += dy;

  // Bounce at edges
  const r = d / 2;
  if (x - r < 0 || x + r > width) dx *= -1;
  if (y - r < 0 || y + r > height) dy *= -1;

  // After a few frames, if too slow, reduce FPS
  framesChecked++;
  if (framesChecked === 120) {
    // crude heuristic
    try { frameRate(30); } catch (_) {}
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Keep circle fully visible after resize/orientation change
  const r = d / 2;
  x = constrain(x, r, width - r);
  y = constrain(y, r, height - r);
  // Adjust diameter to screen
  d = min(min(width, height) * 0.35, 320);
}
