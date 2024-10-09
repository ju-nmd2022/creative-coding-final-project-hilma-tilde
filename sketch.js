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

  // Wait for the video to load before loading the model
  video.elt.addEventListener("loadeddata", () => {
    handTrack.load(handTrackConfig).then((lmodel) => {
      model = lmodel;
      console.log("Model Loaded!");
      loop();
    });
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
