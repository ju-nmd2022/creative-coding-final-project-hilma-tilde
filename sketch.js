let video;
let model;
let predictions = [];
let previousHandX = null;
let previousHandY = null;
let frameSkip = 5;
let displayDuration = 80;
let displayCounter = 0;
let lastGestureTime = 0;
let gestureCooldown = 90;
let currentVisual = null;
let inStartingScreen = true;

function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(30);

  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  // Load the hand tracking model
  handTrack.load(handTrackConfig).then((lmodel) => {
    model = lmodel;
    console.log("Model Loaded!");
  });

  angleMode(DEGREES);
  rectMode(CENTER);
}

function draw() {
  background(255);

  if (inStartingScreen) {
    drawLittleFriend(); // Show starting screen
  } else {
    if (model && frameCount % frameSkip === 0) {
      model.detect(video.elt).then((preds) => {
        predictions = preds;
        console.log("Predictions:", predictions); // Log the predictions to see if anything is detected
        detectGestures(); // Process gestures
      });
    }

    // Show visual response if active
    if (displayCounter > 0) {
      if (currentVisual) {
        displayVisual(currentVisual); // Display current visual
      }
      displayCounter--;
    } else {
      inStartingScreen = true; // Go back to starting screen
    }
  }
}

function detectGestures() {
  if (predictions.length > 0) {
    let hand = predictions[0].bbox;
    let handX = hand[0] + hand[2] / 2;
    let handY = hand[1] + hand[3] / 2;
    let handWidth = hand[2];
    let handHeight = hand[3];

    if (handY < height / 2) {
      if (previousHandX !== null && previousHandY !== null) {
        if (
          Math.abs(handX - previousHandX) > 50 &&
          Math.abs(handY - previousHandY) < 50
        ) {
          triggerGesture("wave");
        }
      }
      previousHandX = handX;
      previousHandY = handY;

      // Fist gesture
      if (Math.abs(handWidth - handHeight) < handWidth * 0.2) {
        triggerGesture("fist");
      }

      // Open palm gesture
      if (handWidth > handHeight * 1.2) {
        triggerGesture("openPalm");
      }
    }
  } else {
    console.log("No hand detected.");
    previousHandX = null;
    previousHandY = null;
  }
}

function triggerGesture(gesture) {
  console.log("Gesture detected:", gesture);
  if (frameCount - lastGestureTime > gestureCooldown) {
    currentVisual = getVisualResponse(gesture);
    displayCounter = displayDuration;
    lastGestureTime = frameCount;
    inStartingScreen = false; // Exit starting screen
    console.log("Gesture triggered:", gesture);
  } else {
    console.log("Gesture cooldown active.");
  }
}

function getVisualResponse(gesture) {
  const visuals = {
    wave: "hearts",
    fist: "explosion",
    openPalm: "thumbsUp",
    smile: "smile",
    peace: "peaceSign",
    angry: "angryFace",
    clap: "clap",
    blink: "blinky",
    thumbsUp: "thumbsUp",
    rockSign: "rockSign",
  };
  return visuals[gesture];
}

function displayVisual(visual) {
  switch (visual) {
    case "hearts":
      drawHearts();
      break;
    case "explosion":
      drawExplosion();
      break;
    case "thumbsUp":
      drawThumbsUp();
      break;
    case "smile":
      drawSmile();
      break;
    case "peaceSign":
      drawPeaceSign();
      break;
    case "angryFace":
      drawAngryFace();
      break;
    case "clap":
      drawClap();
      break;
    case "blinky":
      drawBlinky();
      break;
    case "rockSign":
      drawRockSign();
      break;
  }
}

function drawLittleFriend() {
  noFill();
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
}

function drawHearts() {
  fill(255, 0, 0);
  for (let i = 0; i < 5; i++) {
    let x = random(width);
    let y = random(height);
    textSize(48);
    text("❤️", x, y);
  }
}

function drawExplosion() {
  fill(255, 150, 0);
  for (let i = 0; i < 10; i++) {
    ellipse(random(width), random(height), random(50, 150));
  }
}

function drawThumbsUp() {
  textSize(150);
  text("👍", width / 2, height / 2);
}

function drawSmile() {
  textSize(150);
  text("😊", width / 2, height / 2);
}

function drawPeaceSign() {
  textSize(150);
  text("✌️", width / 2, height / 2);
}

function drawAngryFace() {
  textSize(150);
  text("😠", width / 2, height / 2);
}

function drawClap() {
  textSize(150);
  text("👏", width / 2, height / 2);
}

function drawBlinky() {
  fill(0);
  rect(width / 2, height / 2, width, height);
}

function drawRockSign() {
  textSize(150);
  text("🤘", width / 2, height / 2);
}

// Configuration for handTrack
const handTrackConfig = {
  flipHorizontal: true,
  maxNumBoxes: 1,
  iouThreshold: 0.5,
  scoreThreshold: 0.6,
};
