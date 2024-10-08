let video;
let model;
let predictions = [];
let previousHandX = null;
let isWaving = false; // Track if waving is detected

function preload() {
  // Load any assets if needed
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  rectMode(CENTER);
  noLoop(); // Start with the starting screen only

  // Setup the video capture
  video = createCapture(VIDEO);
  video.size(320, 240);
  video.hide();

  // Load the hand tracking model
  handTrack.load(handTrackConfig).then((lmodel) => {
    model = lmodel;
    console.log("Model Loaded!");
    loop(); // Enable drawing once the model is loaded
  });

  frameRate(10);
}

function draw() {
  background(0);
  translate(width / 2, height / 2);

  // Draw based on waving state
  if (isWaving) {
    drawSmilingFace(); // Draw smiling face when waving is detected
  } else {
    drawStartingScreen(); // Draw starting screen otherwise
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
  fill(255, 204, 0); // Yellow face
  ellipse(0, 0, 200, 200); // Face

  fill(0); // Black for eyes
  ellipse(-50, -30, 20, 20); // Left eye
  ellipse(50, -30, 20, 20); // Right eye

  noFill();
  stroke(0); // Black for smile
  strokeWeight(5);
  arc(0, 15, 50, 25, 0, PI); // Smiling arc
}

function detectHand() {
  if (model && frameCount % 10 === 0) {
    // Detect every 5 frames
    model.detect(video.elt).then((preds) => {
      predictions = preds;
      checkWavingGesture();
    });
  }
}

function checkWavingGesture() {
  if (predictions.length > 0) {
    let handX = predictions[0].bbox[0] + predictions[0].bbox[2] / 2; // Get hand's center X position

    if (previousHandX !== null && Math.abs(handX - previousHandX) > 30) {
      console.log("Wave detected!");
      isWaving = true; // Set waving flag to true
    } else {
      isWaving = false; // No wave detected
    }
    previousHandX = handX; // Update previous position
  }
}

// Configuration for handTrack
const handTrackConfig = {
  flipHorizontal: true, // Flip for video
  maxNumBoxes: 1, // Maximum number of boxes to detect
  iouThreshold: 0.5, // IoU threshold for non-max suppression
  scoreThreshold: 0.6, // Confidence threshold for predictions
};
