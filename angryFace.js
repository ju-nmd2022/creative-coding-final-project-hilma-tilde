function setup() {
  createCanvas(700, 700);
}

function draw() {
  push();

  translate(width / 2, height / 2);

  fill(255);
  rect(-40, -20, 25, 65);
  rect(40, -20, 25, 65);

  noFill();
  stroke(255, 0, 0);
  strokeWeight(20);

  line(-70, -40, -20, -30);
  line(70, -40, 20, -30);

  noFill();
  stroke(255);
  strokeWeight(20);
  arc(15, 150, 400, 100, PI, 0);
  pop();
}
