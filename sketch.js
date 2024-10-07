let video;
let model;
let predictions = [];
let previousHandX = null;
let previousHandY = null;
let frameSkip = 5;
let responseText = "";
let displayDuration = 80; // Frames to display the response
let displayCounter = 0; // Counter for the response display duration
let lastGestureTime = 0; // Frame count when the last gesture was detected
let gestureCooldown = 90; // Cooldown period for gestures (in frames, approx. 3 seconds at 30 FPS)

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
      detectGestures(); // Process the gestures
    });
  }

  // Display the response text if the counter is active
  if (displayCounter > 0) {
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text(responseText, width / 4, height / 4); // Centered text
    displayCounter--; // Decrement the counter
  }
}

function detectGestures() {
  if (predictions.length > 0) {
    let hand = predictions[0].bbox;
    let handX = hand[0] + hand[2] / 2;
    let handY = hand[1] + hand[3] / 2;
    let handWidth = hand[2];
    let handHeight = hand[3];

    // Check if the hand is within a reasonable vertical range for gestures
    if (handY < height / 2) {
      // Only consider gestures if the hand is in the upper half of the screen
      // Check for waving gesture
      if (previousHandX !== null && previousHandY !== null) {
        // Ensure the hand moves significantly and stays within a certain vertical range
        if (
          Math.abs(handX - previousHandX) > 50 &&
          Math.abs(handY - previousHandY) < 50
        ) {
          // Trigger the response only if enough time has passed since the last gesture
          if (frameCount - lastGestureTime > gestureCooldown) {
            console.log("Wave detected!");
            responseText = getRandomResponse("wave");
            displayCounter = displayDuration; // Reset the counter
            lastGestureTime = frameCount; // Update last gesture time
          }
        }
      }
      previousHandX = handX;
      previousHandY = handY;

      // Check for fist gesture (simple heuristic: hand width is approximately equal to hand height)
      if (Math.abs(handWidth - handHeight) < handWidth * 0.2) {
        // Trigger the response only if enough time has passed since the last gesture
        if (frameCount - lastGestureTime > gestureCooldown) {
          console.log("Fist detected!");
          responseText = getRandomResponse("fist");
          displayCounter = displayDuration; // Reset the counter
          lastGestureTime = frameCount; // Update last gesture time
        }
      }

      // Check for open palm gesture (simple heuristic: hand width is greater than hand height)
      if (handWidth > handHeight * 1.2) {
        // Trigger the response only if enough time has passed since the last gesture
        if (frameCount - lastGestureTime > gestureCooldown) {
          console.log("Open palm detected!");
          responseText = getRandomResponse("openPalm");
          displayCounter = displayDuration; // Reset the counter
          lastGestureTime = frameCount; // Update last gesture time
        }
      }
    }
  } else {
    previousHandX = null;
    previousHandY = null;
  }
}

function getRandomResponse(gesture) {
  const responses = {
    wave: ["Hello!", "Nice to see you!", "Wave detected!"],
    fist: ["Fist bump!", "Power up!", "Stay strong!"],
    openPalm: ["High five!", "Palm detected!", "Great job!"],
    // Add more gestures and responses as needed
  };
  return random(responses[gesture]);
}

// Configuration for handTrack
const handTrackConfig = {
  flipHorizontal: true, // flip e.g for video
  maxNumBoxes: 1, // maximum number of boxes to detect
  iouThreshold: 0.5, // ioU threshold for non-max suppression
  scoreThreshold: 0.6, // confidence threshold for predictions.
};
