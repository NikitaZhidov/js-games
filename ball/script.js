let canvas = document.getElementById("canvas");
canvas.width = (window.innerWidth * 7) / 8;
canvas.height = (window.innerHeight * 7) / 8;
let context = canvas.getContext("2d");

let dx = 3;
let dy = -3;

let score = 0;

const BALL_RADIUS = 10;

let x = canvas.width / 2;
let y = canvas.height - 50;

let paddleHeight = 10;
let paddleWidth = canvas.width / 4;
let paddleX = (canvas.width - paddleWidth) / 2;

let rightPressed = false;
let leftPressed = false;

// bricks
let brickRowCount = 3;
let brickWidth = 75;
let brickColumnCount = Math.floor(canvas.width / brickWidth);
let brickHeight = 20;
let brickPadding = 10;
let brickOffsetTop = 30;
let brickOffsetLeft = 18;

let bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
  bricks[c] = [];
  for (let r = 0; r < brickRowCount; r++) {
    bricks[c][r] = { x: 0, y: 0, status: 1 };
  }
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
  if (e.key == "Right" || e.key == "ArrowRight") {
    rightPressed = true;
  } else if (e.key == "Left" || e.key == "ArrowLeft") {
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.key == "Right" || e.key == "ArrowRight") {
    rightPressed = false;
  } else if (e.key == "Left" || e.key == "ArrowLeft") {
    leftPressed = false;
  }
}

function collisionDetection() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      let b = bricks[c][r];
      if (b.status == 1) {
        if (
          x > b.x &&
          x < b.x + brickWidth &&
          y > b.y &&
          y < b.y + brickHeight
        ) {
          if (dy < -0.5) {
            dy += 0.5;
          }
          dy = -dy;
          score++;
          b.status = 0;
          if (score == brickRowCount * brickColumnCount) {
            alert("YOU WIN, CONGRATULATIONS!");
            document.location.reload();
            clearInterval(interval); // Needed for Chrome to end game
          }
        }
      }
    }
  }
}

window.onload = () => {
  draw();
};

function drawBricks() {
  for (let c = 0; c < brickColumnCount; c++) {
    for (let r = 0; r < brickRowCount; r++) {
      if (bricks[c][r].status == 1) {
        let brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
        let brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
        bricks[c][r].x = brickX;
        bricks[c][r].y = brickY;
        context.beginPath();
        context.rect(brickX, brickY, brickWidth, brickHeight);
        context.fillStyle = "#0095DD";
        context.fill();
        context.closePath();
      }
    }
  }
}

function drawPaddle() {
  context.beginPath();
  context.rect(
    paddleX,
    canvas.height - paddleHeight,
    paddleWidth,
    paddleHeight
  );
  context.fillStyle = "#0095DD";
  context.fill();
  context.closePath();
}

function drawBall(x, y, ballRadius) {
  context.beginPath();
  context.arc(x, y, ballRadius, 0, Math.PI * 2);
  context.fillStyle = "#0095DD";
  context.fill();
  context.closePath();
}

function drawScore() {
  context.font = "16px Arial";
  context.fillStyle = "#0095DD";
  context.fillText("Score: " + score, 8, 20);
}

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawBall(x, y, 10);
  drawPaddle();
  drawBricks();
  drawScore();
  collisionDetection();

  if (x + dx > canvas.width - BALL_RADIUS || x + dx < BALL_RADIUS) {
    dx = -dx;
  }

  if (y + dy < BALL_RADIUS) {
    dy = -dy;
  } else if (y + dy / 6 > canvas.height - BALL_RADIUS) {
    if (x > paddleX && x < paddleX + paddleWidth) {
      if (dy < 10) {
        dy++;
      }
      dx++;
      dy = -dy;
    } else {
      alert("GAME OVER");
      document.location.reload();
      clearInterval(interval); // Needed for Chrome to end game
    }
  }

  if (rightPressed && paddleX < canvas.width - paddleWidth) {
    paddleX += 7;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= 7;
  }

  x += dx;
  y += dy;
}

let interval = setInterval(draw, 10);
