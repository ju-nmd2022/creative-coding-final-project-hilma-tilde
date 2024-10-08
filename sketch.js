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

  // Load the hand tracking model
  handTrack.load(handTrackConfig).then((lmodel) => {
    model = lmodel;
    console.log("Model Loaded!");
    loop();
  });

  frameRate(10);
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
  } else {
    drawStartingScreen();
  }

  detectHand();
}

function drawStartingScreen() {
  for (let i = 0; i < 100; i++) {
    push();
    rotate(sin(frameCount + i) * 100);
    stroke(
      map(sin(frameCount), -1, 1, 50, 255),
      map(sin(frameCount / 2), -1, 1, 50, 255),
      map(sin(frameCount / 4), -1, 1, 50, 255)
    );
    rect(0, 0, 300 - i * 1.5, 300 - i * 1.5, 100 - i);
    pop();
  }
}

function drawSmilingFace() {
  fill(255, 204, 0);
  ellipse(0, 0, 200, 200);

  fill(0);
  ellipse(-40, -20, 25, 25);
  ellipse(40, -20, 25, 25);

  noFill();
  stroke(0);
  strokeWeight(5);
  arc(0, 20, 100, 50, 0, 170);
}

function drawAngryFace() {
  fill(255, 204, 0);
  ellipse(0, 0, 200, 200);

  fill(0);
  ellipse(-40, -20, 25, 25);
  ellipse(40, -20, 25, 25);

  noFill();
  stroke(255, 0, 0);
  strokeWeight(5);

  line(-60, -40, -20, -20);
  line(60, -40, 20, -20);

  noFill();
  stroke(0);
  strokeWeight(5);
  arc(0, 20, 100, 50, PI, 0);
}

function detectHand() {
  if (model) {
    model.detect(video.elt).then((preds) => {
      predictions = preds;
      checkWavingGesture();
    });
  }
}

function checkWavingGesture() {
  if (predictions.length > 0) {
    let handX = predictions[0].bbox[0] + predictions[0].bbox[2] / 2;

    if (previousHandX !== null && Math.abs(handX - previousHandX) > 30) {
      if (Math.abs(handX - previousHandX) > waveDeadband) {
        // Check if a wave has been detected for a minimum duration
        if (!isWaving) {
          console.log("Wave detected!");
          isWaving = true;
          waveStartTime = millis();
          waveCount++;
          console.log("Wave count: " + waveCount);
        }
      }
    } else {
      // If the waving gesture has been detected for longer than the minimum duration, reset
      if (isWaving && millis() - waveStartTime > minWaveDuration) {
        isWaving = false;
      }
    }
    previousHandX = handX;
  } else {
    isWaving = false;
  }
}

// Configuration for handTrack
const handTrackConfig = {
  flipHorizontal: true, // Flip for video
  maxNumBoxes: 1, // Maximum number of boxes to detect
  iouThreshold: 0.5, // IoU threshold for non-max suppression
  scoreThreshold: 0.6, // Confidence threshold for predictions
};
