let lightning = [];
let maxLightning = 10; 
let lightningInterval = 200; 
let fadeSpeed = 5; 

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  frameRate(30);
  // Call lightning function at intervals
  setInterval(generateLightning, lightningInterval);
}

function draw() {
  background(0, 20);

  // Draw each lightning flash
  for (let i = lightning.length - 1; i >= 0; i--) {
    let bolt = lightning[i];
    stroke(255, 255, 0, bolt.alpha);
    strokeWeight(4);
    line(bolt.x1, bolt.y1, bolt.x2, bolt.y2);

    bolt.alpha -= fadeSpeed;
    if (bolt.alpha <= 0) {
      lightning.splice(i, 1);
    }
  }
}

// Function to generate lightning
function generateLightning() {
  if (lightning.length < maxLightning) {
    let x1 = random(width);
    let y1 = random(height / 4); 
    let x2 = random(width);
    let y2 = random(height); 

    lightning.push({
      x1: x1,
      y1: y1,
      x2: x2,
      y2: y2,
      alpha: 255,
    });
  }
}
