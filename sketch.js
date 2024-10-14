let video;
let model;
let predictions = [];
let previousHandX = null;
let isWaving = false;
let waveStartTime = 0;
const waveDisplayDuration = 2000;
const minWaveDuration = 500;
const waveDeadband = 20;

let waveCount = 0;
let angryFaceDisplayTime = 3000;
let angryFaceStartTime = null;
let thumbsUpActive = false;

// Heart explosion variables
let hearts = [];
let explosionTriggered = false;
let explosionStartTime = null; // Track when the explosion starts
const explosionDuration = 2000; // Duration for heart explosion in milliseconds
let thumbsUpDetectedTime = null; // Track the time when thumbs up is detected
const minThumbsUpDuration = 500; // Minimum time for thumbs up to be considered valid

// Configuration for handTrack
const handTrackConfig = {
  flipHorizontal: true, // Flip for video
  maxNumBoxes: 1, // Maximum number of boxes to detect
  iouThreshold: 0.5, // IoU threshold for non-max suppression
  scoreThreshold: 0.6, // Confidence threshold for predictions
};

function preload() {
  // Load any assets if needed
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  rectMode(CENTER);

  video = createCapture(VIDEO);
  video.size(320, 240);
  video.hide();

  // Wait for the video to load before loading the model
  video.elt.addEventListener("loadeddata", () => {
    handTrack.load(handTrackConfig).then((lmodel) => {
      model = lmodel;
      console.log("Model Loaded!");
      loop();
    });
  });

  frameRate(10);
  initializeHearts(); // Initialize hearts on setup
}

function draw() {
  background(0);
  translate(width / 2, height / 2);

  if (
    angryFaceStartTime &&
    millis() - angryFaceStartTime < angryFaceDisplayTime
  ) {
    drawAngryFace();
  } else if (waveCount >= 10) {
    angryFaceStartTime = millis();
    waveCount = 0;
  } else if (isWaving || millis() - waveStartTime < waveDisplayDuration) {
    drawSmilingFace();
  } else if (explosionTriggered) {
    drawHearts(); // Draw hearts if explosion is triggered
  } else {
    drawStartingScreen();
  }

  detectHand();

  // Reset explosion after duration
  if (explosionTriggered && millis() - explosionStartTime > explosionDuration) {
    explosionTriggered = false; // Reset explosion trigger
  }
}

function drawStartingScreen() {
  for (let i = 0; i < 200; i++) {
    push();
    rotate(sin(frameCount + i) * 100);
    stroke(
      map(sin(frameCount), -1, 1, 50, 255),
      map(sin(frameCount / 2), -1, 1, 50, 255),
      map(sin(frameCount / 4), -1, 1, 50, 255)
    );
    rect(0, 0, 600 - i * 3, 600 - i * 3, 200 - i);
    pop();
  }
}

function drawSmilingFace() {
  push();
  fill(255);
  rect(-40, 0, 25, 45);
  rect(40, 0, 25, 45);

  noFill();
  stroke(255);
  strokeWeight(20);
  arc(15, 100, 500, 200, 0, 180);
  pop();
}

function drawAngryFace() {
  push();
  fill(255);
  rect(-40, -20, 25, 45);
  rect(40, -20, 25, 45);

  noFill();
  stroke(255, 0, 0);
  strokeWeight(20);

  line(-70, -40, -20, -30);
  line(70, -40, 20, -30);

  noFill();
  stroke(255);
  strokeWeight(20);
  arc(15, 150, 400, 100, 0, -180);
  pop();
}

function detectHand() {
  if (model && video.loadedmetadata) {
    // Ensure video is ready
    model
      .detect(video.elt)
      .then((preds) => {
        predictions = preds;
        checkWavingGesture();
        checkThumbsUpGesture(); // Check for thumbs up gesture
      })
      .catch((err) => {
        console.error("Error detecting hand: ", err);
      });
  }
}

function checkWavingGesture() {
  if (predictions.length > 0) {
    let handX = predictions[0].bbox[0] + predictions[0].bbox[2] / 2;

    if (previousHandX !== null && Math.abs(handX - previousHandX) > 30) {
      if (Math.abs(handX - previousHandX) > waveDeadband) {
        if (!isWaving) {
          console.log("Wave detected!");
          isWaving = true;
          waveStartTime = millis();
          waveCount++;
          console.log("Wave count: " + waveCount);
        }
      }
    } else {
      if (isWaving && millis() - waveStartTime > minWaveDuration) {
        isWaving = false;
      }
    }
    previousHandX = handX;
  } else {
    isWaving = false;
  }
}

function checkThumbsUpGesture() {
  if (
    predictions.length > 0 &&
    predictions[0].score > handTrackConfig.scoreThreshold
  ) {
    let handY = predictions[0].bbox[1];
    let handHeight = predictions[0].bbox[3];

    if (handY < height / 2 && predictions[0].bbox[2] > handHeight * 0.8) {
      if (!thumbsUpDetectedTime) {
        thumbsUpDetectedTime = millis();
      } else if (
        millis() - thumbsUpDetectedTime > minThumbsUpDuration &&
        !thumbsUpActive
      ) {
        console.log("Thumbs up detected!");
        triggerHearts();
        thumbsUpActive = true;
      }
    } else {
      thumbsUpDetectedTime = null;
      thumbsUpActive = false;
    }
  }
}

// Heart explosion functions
function initializeHearts() {
  for (let i = 0; i < 100; i++) {
    hearts.push(new Heart(random(width), random(height)));
  }
}

function triggerHearts() {
  explosionTriggered = true; // Start the explosion
  explosionStartTime = millis(); // Record the start time of the explosion
  for (let heart of hearts) {
    heart.explode(); // Trigger explosion for each heart
  }
}

function drawHearts() {
  for (let heart of hearts) {
    heart.update(); // Update position after explosion
    heart.show();
  }
}

class Heart {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = random(20, 40); // Increase size for visibility
    this.vel = createVector(0, 0);
    this.speed = random(0.5, 3); // Speed for random movement
    this.resetPosition(); // Randomize position in the canvas
  }

  resetPosition() {
    // Randomly position the heart within the canvas bounds
    this.x = random(-width / 2, width / 2);
    this.y = random(-height / 2, height / 2);
  }

  explode() {
    let angle = random(TWO_PI);
    let speed = random(2, 5); // Speed of explosion
    this.vel = p5.Vector.fromAngle(angle).mult(speed); // Set velocity based on random angle
  }

  update() {
    this.x += this.vel.x; // Update position based on velocity
    this.y += this.vel.y;

    // Wrap around the screen if heart goes off screen
    if (
      this.x > width / 2 ||
      this.x < -width / 2 ||
      this.y > height / 2 ||
      this.y < -height / 2
    ) {
      this.resetPosition(); // Reset position if out of bounds
    }
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
