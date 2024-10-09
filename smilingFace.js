function setup() {
  createCanvas(700, 700);
}

function draw() {
  push();
  translate(width / 2, height / 2);

  fill(255, 255, 255);
  rect(-40, -20, 25, 65); // Left eye
  rect(40, -20, 25, 65); // Right eye

  noFill();
  stroke(255, 255, 255);
  strokeWeight(20);
  arc(15, 100, 500, 200, 0, PI); // Smile

  pop();
}
