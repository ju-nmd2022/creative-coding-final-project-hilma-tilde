let video;
let model;
let predictions = [];
let previousHandX = null;
let frameSkip = 5;
let responseText = "";
let responseTimer = 0;

function preload() {
  // Load any assets like images or sounds here
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(30);

  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  // Load the hand tracking model
  handTrack.load(handTrackConfig).then((lmodel) => {
    model = lmodel;
  });

  angleMode(DEGREES);
  rectMode(CENTER);
}

function draw() {
  background(0);
  noFill();

  // Little friend drawing
  translate(width / 2, height / 2);
  for (let i = 0; i < 200; i++) {
    push();
    rotate(sin(frameCount + i) * 100);
    let r = map(i, 0, 200, 50, 255);
    let g = map(i, 0, 200, 50, 255);
    let b = map(i, 0, 200, 50, 255);
    stroke(r, g, b);
    rect(0, 0, 600 - i * 3, 600 - i * 3, 200 - i);
    pop();
  }

  // Hand tracking with frame skipping for better performance
  if (model && frameCount % frameSkip === 0) {
    model.detect(video.elt).then((preds) => {
      predictions = preds;
      displayResponse(); // Moved here to ensure we check predictions each frame
    });
  }
}

function displayResponse() {
  if (predictions.length > 0) {
    let hand = predictions[0].bbox;
    let handX = hand[0] + hand[2] / 2;

    // Check for waving gesture
    if (previousHandX !== null) {
      if (Math.abs(handX - previousHandX) > 30) {
        console.log("Wave detected!");
        responseText = getRandomResponse();
        responseTimer = 60; // Reset the timer to 60 frames
      }
    }
    previousHandX = handX;
  }

  // Display the response text if the timer is active
  if (responseTimer > 0) {
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text(responseText, width / 2, height / 2); // Centered text
    responseTimer--; // Decrement the timer
  }
}

function getRandomResponse() {
  const responses = [
    "Hello!",
    "Nice to see you!",
    "Keep waving!",
    "You are awesome!",
    "Smile!",
    "Stay creative!",
    "Wave detected!",
  ];
  return random(responses);
}

// Configuration for handTrack
const handTrackConfig = {
  flipHorizontal: true, // flip e.g for video
  maxNumBoxes: 1, // maximum number of boxes to detect
  iouThreshold: 0.5, // ioU threshold for non-max suppression
  scoreThreshold: 0.6, // confidence threshold for predictions.
};
