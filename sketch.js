let video;
let model;
let predictions = [];
let friend;

function preload() {
  // Load any assets like images or sounds here
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  
  // Load the hand tracking model
  handTrack.load().then(lmodel => {
    model = lmodel;
  });
  
  friend = new LittleFriend();
}

function draw() {
  background(200);
  
  image(video, 0, 0);

  if (model) {
    model.detect(video.elt).then(preds => {
      predictions = preds;
    });
  }
  
  friend.update(predictions);
  friend.display();
}

class LittleFriend {
  constructor() {
    this.x = width / 2;
    this.y = height / 2;
    this.energy = 100;
  }
  
  update(predictions) {
    if (predictions.length > 0) {
      let hand = predictions[0].bbox;
      this.x = hand[0] + hand[2] / 2;
      this.y = hand[1] + hand[3] / 2;
      
      // Random responses based on hand positions
      if (hand[2] > 100) {
        this.energy = random(50, 150);
      }
    }
  }
  
  display() {
    fill(255, 0, 0);
    ellipse(this.x, this.y, 50, 50);
    fill(0);
    textSize(16);
    textAlign(CENTER, CENTER);
    text('Energy: ' + this.energy.toFixed(2), this.x, this.y + 30);
  }
}
