let video;
let model;
let canvas;
let isModelLoaded = false;

let shapes = [];
let score = 0;
let shapeCreationInterval;
let shapeTypes = ["circle", "rectangle", "triangle"]; // Random shape types
let maxShapes = 20; // Maximum shapes on the screen
let shapeCreationRate = 2000; // Time interval for shape creation in ms

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0);

  video = createCapture(VIDEO, (stream) => {
    video.size(windowWidth, windowHeight);
    video.hide();
    console.log("Video capture initialized");
    loadHandTrackingModel();
  });

  // Start creating shapes
  shapeCreationInterval = setInterval(() => {
    if (shapes.length < maxShapes) {
      generateRandomShapes(1); // Add one random shape at a time
    }
  }, shapeCreationRate); // Generate a shape every 2 seconds
}

function loadHandTrackingModel() {
  const options = {
    flipHorizontal: true,
    maxNumBoxes: 1,
    iouThreshold: 0.3,
    scoreThreshold: 0.5,
  };

  handTrack
    .load(options)
    .then((l) => {
      model = l;
      isModelLoaded = true;
      console.log("Model loaded");
      startVideo();
    })
    .catch((error) => {
      console.error("Model loading failed:", error);
    });
}

function startVideo() {
  video.loop();
  video.volume(0);
  detectHands();
}

function detectHands() {
  if (isModelLoaded) {
    model
      .detect(video.elt)
      .then((predictions) => {
        drawPredictions(predictions);
        requestAnimationFrame(detectHands);
      })
      .catch((error) => {
        console.error("Hand detection failed:", error);
      });
  }
}

function drawPredictions(predictions) {
  background(245, 245, 220);

  updateShapes(predictions);
  drawShapes();

  if (predictions.length > 0) {
    const prediction = predictions[0];
    const { bbox } = prediction;

    const centerX = bbox[0] + bbox[2] / 2;
    const centerY = bbox[1] + bbox[3] / 2;

    stroke(255, 0, 0);
    strokeWeight(4);
    noFill();
    ellipse(centerX, centerY, 50, 50);

    checkCatchingShapes(centerX, centerY);
  } else {
    displayInstruction();
  }
}

function displayInstruction() {
  fill(0);
  textSize(60);
  textAlign(CENTER, CENTER);
  text("PUT YOUR HAND IN THE AIR", width / 2, height / 2);
  stroke(255, 0, 0, 100);
  strokeWeight(4);
  noFill();
  ellipse(width / 2, height / 2, 50, 50);
}

function generateRandomShapes(num) {
  for (let i = 0; i < num; i++) {
    let behavior = random(["static", "random", "escape"]); // Random behavior
    let shape = {
      x: random(width),
      y: random(height),
      size: random(30, 70),
      color: color(random(255), random(255), random(255)),
      type: random(shapeTypes), // Randomly select from the available types
      caught: false,
      behavior: behavior,
      vx: behavior === "random" ? random(-2, 2) : 0,
      vy: behavior === "random" ? random(-2, 2) : 0,
    };
    shapes.push(shape);
  }
}

function updateShapes(predictions) {
  for (let shape of shapes) {
    if (!shape.caught) {
      if (shape.behavior === "random") {
        shape.x += shape.vx;
        shape.y += shape.vy;

        // Bounce off the edges
        if (shape.x < 0 || shape.x > width) shape.vx *= -1;
        if (shape.y < 0 || shape.y > height) shape.vy *= -1;
      } else if (shape.behavior === "escape" && predictions.length > 0) {
        const prediction = predictions[0];
        const { bbox } = prediction;

        const centerX = bbox[0] + bbox[2] / 2;
        const centerY = bbox[1] + bbox[3] / 2;

        let dx = shape.x - centerX;
        let dy = shape.y - centerY;
        let distance = dist(shape.x, shape.y, centerX, centerY);

        if (distance < 100) {
          // If hand is close to the shape
          let angle = atan2(dy, dx);
          shape.vx = cos(angle) * 3; // Move away from the hand
          shape.vy = sin(angle) * 3;
        } else {
          shape.vx = 0;
          shape.vy = 0;
        }

        shape.x += shape.vx;
        shape.y += shape.vy;
      }

      // Randomly change color and size over time
      if (random() < 0.01) {
        shape.color = color(random(255), random(255), random(255));
        shape.size = random(30, 70);
      }

      // Occasionally change shape type
      if (random() < 0.01) {
        shape.type = random(shapeTypes);
      }
    }
  }
}

function drawShapes() {
  for (let shape of shapes) {
    if (!shape.caught) {
      fill(shape.color);
      noStroke();
      drawShape(shape);
    }
  }

  displayScore();
}

function drawShape(shape) {
  if (shape.type === "circle") {
    ellipse(shape.x, shape.y, shape.size);
  } else if (shape.type === "rectangle") {
    rect(shape.x, shape.y, shape.size, shape.size);
  } else if (shape.type === "triangle") {
    drawTriangle(shape.x, shape.y, shape.size);
  }
}

function drawTriangle(x, y, size) {
  beginShape();
  vertex(x, y - size / 2);
  vertex(x - size / 2, y + size / 2);
  vertex(x + size / 2, y + size / 2);
  endShape(CLOSE);
}

function displayScore() {
  fill(0);
  textSize(32);
  textAlign(LEFT, TOP);
  text(`Score: ${score}`, 10, 10);
}

function checkCatchingShapes(handX, handY) {
  for (let shape of shapes) {
    if (!shape.caught) {
      let d = dist(handX, handY, shape.x, shape.y);
      if (d < shape.size / 2) {
        shape.caught = true;
        score++;
        console.log(`Shape caught! Score: ${score}`);
        playSoundEffect(); // Sound effect when a shape is caught
      }
    }
  }
}

function playSoundEffect() {
  // Placeholder function for sound effect
  console.log("Sound effect played");
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
