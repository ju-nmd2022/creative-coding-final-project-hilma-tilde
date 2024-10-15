// This code is from this video https://www.youtube.com/watch?v=ktPnruyC6cc
function setup() {
createCanvas(windowWidth, windowHeight);

angleMode(DEGREES);
rectMode(CENTER);
}

function draw() {
    background(0, 0, 0);
    noFill();

    translate(width / 2, height / 2);

    for (var i = 0; i < 200; i++) {
        push();

        rotate(sin(frameCount + i) * 100);

        var r = map(sin(frameCount), -1, 1, 50, 255);
        var g = map(sin(frameCount / 2), -1, 1, 50, 255);
        var b = map(sin(frameCount/ 4), -1, 1, 50, 255);

        stroke(r, g, b);

        rect(0, 0, 600 - i * 3, 600 - i * 3, 200 -i);

        pop();
    }
}