let hearts = [];
let explosionTriggered = false;

function setup() {
  createCanvas(800, 600);
  noStroke();
  initializeHearts();

  // Trigger the explosion after a short delay
  setTimeout(triggerExplosion, 1000); // Adjust the time (in milliseconds) as needed
}

function draw() {
  background(0);
  for (let heart of hearts) {
    if (explosionTriggered) {
      heart.update(); // Update position after explosion
    } else {
      heart.move(); // Move hearts randomly before explosion
    }
    heart.show();
  }
}

function initializeHearts() {
  for (let i = 0; i < 100; i++) {
    hearts.push(new Heart(random(width), random(height)));
  }
}

function triggerExplosion() {
  explosionTriggered = true; // Start the explosion
  for (let heart of hearts) {
    heart.explode(); // Trigger explosion for each heart
  }
}

class Heart {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = random(10, 30);
    this.vel = createVector(0, 0);
    this.speed = random(0.5, 2); // Speed for random movement
  }

  explode() {
    let angle = random(TWO_PI);
    let speed = random(1, 5); // Speed of explosion
    this.vel = p5.Vector.fromAngle(angle).mult(speed); // Set velocity based on random angle
  }

  update() {
    this.x += this.vel.x; // Update position based on velocity
    this.y += this.vel.y;
  }

  move() {
    this.x += random(-this.speed, this.speed); // Random movement
    this.y += random(-this.speed, this.speed);
  }

  show() {
    fill(255, 0, 0);
    beginShape();
    vertex(this.x, this.y);
    bezierVertex(
      this.x - this.size / 2,
      this.y - this.size / 2,
      this.x - this.size,
      this.y + this.size / 3,
      this.x,
      this.y + this.size
    );
    bezierVertex(
      this.x + this.size,
      this.y + this.size / 3,
      this.x + this.size / 2,
      this.y - this.size / 2,
      this.x,
      this.y
    );
    endShape(CLOSE);
  }
}
