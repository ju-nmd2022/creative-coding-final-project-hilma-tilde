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
let explosionStartTime = null;
const explosionDuration = 2000;
let thumbsUpDetectedTime = null;
const minThumbsUpDuration = 500;

// Configuration for handTrack
const handTrackConfig = {
  flipHorizontal: true,
  maxNumBoxes: 1,
  iouThreshold: 0.5,
  scoreThreshold: 0.6,
};

// Randomized surprise elements
let surpriseEvents = [
  {
    name: "colorChange",
    probability: 0.05,
    duration: 3000,
    active: false,
    startTime: null,
  },
  {
    name: "randomShape",
    probability: 0.03,
    duration: 3000,
    active: false,
    startTime: null,
  },
];

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
  initializeHearts();
}

function draw() {
  background(0);
  translate(width / 2, height / 2);

  push();
  fill(255);
  textSize(60);
  textAlign(CENTER, CENTER);
  text("👋🏻 or 👍🏻", -720, -370);
  pop();

  handleSurpriseEvents();

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
    drawHearts();
  } else {
    drawStartingScreen();
  }

  detectHand();

  // Reset explosion after duration
  if (explosionTriggered && millis() - explosionStartTime > explosionDuration) {
    explosionTriggered = false;
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
    model
      .detect(video.elt)
      .then((preds) => {
        predictions = preds;
        checkWavingGesture();
        checkThumbsUpGesture();
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

          triggerSurpriseEvent();
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
  explosionTriggered = true;
  explosionStartTime = millis();
  for (let heart of hearts) {
    heart.explode();
  }
}

function drawHearts() {
  for (let heart of hearts) {
    heart.update();
    heart.show();
  }
}

class Heart {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.size = random(20, 40);
    this.vel = createVector(0, 0);
    this.speed = random(0.5, 3);
    this.resetPosition();
  }

  resetPosition() {
    this.x = random(-width / 2, width / 2);
    this.y = random(-height / 2, height / 2);
  }

  explode() {
    let angle = random(TWO_PI);
    let speed = random(2, 5);
    this.vel = p5.Vector.fromAngle(angle).mult(speed);
  }

  update() {
    this.x += this.vel.x;
    this.y += this.vel.y;

    if (
      this.x > width / 2 ||
      this.x < -width / 2 ||
      this.y > height / 2 ||
      this.y < -height / 2
    ) {
      this.resetPosition();
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

// Surprise event functions
function handleSurpriseEvents() {
  surpriseEvents.forEach((event) => {
    if (event.active) {
      if (millis() - event.startTime > event.duration) {
        event.active = false;
      } else {
        if (event.name === "colorChange") {
          changeBackgroundColor();
        } else if (event.name === "randomShape") {
          drawRandomShape();
        }
      }
    }
  });
}

function triggerSurpriseEvent() {
  surpriseEvents.forEach((event) => {
    if (random() < event.probability) {
      event.active = true;
      event.startTime = millis();
      console.log(`${event.name} event triggered!`);
    }
  });
}

function changeBackgroundColor() {
  background(random(255), random(255), random(255));
}

function drawRandomShape() {
  push();
  fill(random(255), random(255), random(255));
  translate(random(-width / 2, width / 2), random(-height / 2, height / 2));
  rotate(random(360));
  rect(0, 0, random(50, 150), random(50, 150));
  pop();
}
