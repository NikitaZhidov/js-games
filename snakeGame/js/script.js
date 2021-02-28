let SNAKE_NODE = document.querySelector(".snake");
let SNAKE_PIECES = SNAKE_NODE.querySelectorAll(".snake-piece");

const SPEED = 15;
const INTERVAL_TIME = 75;
const COUNT_ADD_POINT = 5;

const GAME_AREA = document.querySelector(".game-area");
const AREA_WIDTH = GAME_AREA.dataset.width;
const AREA_HEIGHT = GAME_AREA.dataset.height;

const RIGHT = "right";
const LEFT = "left";
const UP = "up";
const DOWN = "down";

let POINTS_AREA = document.querySelector(".points-area");
let SCORE = document.querySelector(".score");

function snakeObj(snakeNode) {
  let _firstSnakePiece = snakeNode.firstElementChild;

  let _snakeMoving;
  let _currentDirection;
  let _isPause = false;

  function _movingFunc(direction) {
    _isPause = false;
    clearInterval(_snakeMoving);
    let directionSign = 1;
    let directionCoord = "x";
    let directionStyle = "left";

    switch (direction) {
      case RIGHT:
        directionSign = 1;
        directionCoord = "x";
        directionStyle = "left";
        break;
      case LEFT:
        directionSign = -1;
        directionCoord = "x";
        directionStyle = "left";
        break;
      case DOWN:
        directionSign = 1;
        directionCoord = "y";
        directionStyle = "top";
        break;
      case UP:
        directionSign = -1;
        directionCoord = "y";
        directionStyle = "top";
        break;
      default:
        directionSign = 1;
        directionCoord = "x";
    }

    _snakeMoving = setInterval(() => {
      let currentPoint = document.querySelector(".point");
      // змея съела point
      if (
        _firstSnakePiece.dataset.x == currentPoint.dataset.x &&
        _firstSnakePiece.dataset.y == currentPoint.dataset.y
      ) {
        addPoint(POINTS_AREA, snakeNode, SCORE);
      }

      let currentX = +_firstSnakePiece.dataset.x;
      let currentY = +_firstSnakePiece.dataset.y;

      let lastX = +_firstSnakePiece.dataset.x;
      let lastY = +_firstSnakePiece.dataset.y;

      if (currentX > AREA_WIDTH - SPEED) {
        _firstSnakePiece.dataset.x = -15;
      }
      if (currentX < 0) {
        _firstSnakePiece.dataset.x = AREA_WIDTH;
      }

      if (currentY > AREA_HEIGHT - SPEED) {
        _firstSnakePiece.dataset.y = -15;
      }
      if (currentY < 0) {
        _firstSnakePiece.dataset.y = AREA_HEIGHT;
      }

      _firstSnakePiece.dataset[directionCoord] =
        +_firstSnakePiece.dataset[directionCoord] + SPEED * directionSign;
      _firstSnakePiece.style[directionStyle] =
        +_firstSnakePiece.dataset[directionCoord] + "px";

      let bufX;
      let bufY;
      let bufX_2;
      let bufY_2;

      // Движение кусочков змеи
      for (let i = 1; i < SNAKE_PIECES.length; i++) {
        // Змея съела себя
        if (
          +SNAKE_PIECES[i].dataset.x == _firstSnakePiece.dataset.x &&
          +SNAKE_PIECES[i].dataset.y == _firstSnakePiece.dataset.y
        ) {
          _cutSnake(i);
          _firstSnakePiece.style.backgroundColor = "red";
          _firstSnakePiece.style.boxShadow =
            "0px 0px 46px 8px rgba(255, 5, 5, 0.7)";
          setTimeout(() => {
            _firstSnakePiece.style.backgroundColor = "";
            _firstSnakePiece.style.boxShadow = "";
          }, 500);
        }
        if (i == 1) {
          bufX = lastX;
          bufY = lastY;
          bufX_2 = +SNAKE_PIECES[i].dataset.x;
          bufY_2 = +SNAKE_PIECES[i].dataset.y;
          SNAKE_PIECES[i].dataset.x = bufX;
          SNAKE_PIECES[i].dataset.y = bufY;
          SNAKE_PIECES[i].style.left = bufX + "px";
          SNAKE_PIECES[i].style.top = bufY + "px";
        } else {
          if (i % 2 == 0) {
            bufX = +SNAKE_PIECES[i].dataset.x;
            bufY = +SNAKE_PIECES[i].dataset.y;
            SNAKE_PIECES[i].dataset.x = bufX_2;
            SNAKE_PIECES[i].dataset.y = bufY_2;
            SNAKE_PIECES[i].style.left = bufX_2 + "px";
            SNAKE_PIECES[i].style.top = bufY_2 + "px";
          } else {
            bufX_2 = +SNAKE_PIECES[i].dataset.x;
            bufY_2 = +SNAKE_PIECES[i].dataset.y;
            SNAKE_PIECES[i].dataset.x = bufX;
            SNAKE_PIECES[i].dataset.y = bufY;
            SNAKE_PIECES[i].style.left = bufX + "px";
            SNAKE_PIECES[i].style.top = bufY + "px";
          }
        }
      }
    }, INTERVAL_TIME);
  }

  function goRight() {
    if (_currentDirection == LEFT) return;
    _movingFunc(RIGHT);
    _currentDirection = RIGHT;
  }

  function goLeft() {
    if (_currentDirection == RIGHT) return;
    _movingFunc(LEFT);
    _currentDirection = LEFT;
  }

  function goUp() {
    if (_currentDirection == DOWN) return;
    _movingFunc(UP);
    _currentDirection = UP;
  }

  function goDown() {
    if (_currentDirection == UP) return;
    _movingFunc(DOWN);
    _currentDirection = DOWN;
  }

  function pause() {
    if (!_isPause) {
      _isPause = true;
      clearInterval(_snakeMoving);
    } else {
      _movingFunc(_currentDirection);
    }
  }

  function _cutSnake(num) {
    SNAKE_PIECES = snakeNode.querySelectorAll(".snake-piece");
    for (let i = num; i < SNAKE_PIECES.length; i++) {
      SNAKE_PIECES[i].remove();
      SCORE.innerHTML--;
    }
    SNAKE_PIECES = snakeNode.querySelectorAll(".snake-piece");
  }

  return {
    goRight,
    goLeft,
    goUp,
    goDown,
    pause,
  };
}

function addPoint(pointsArea, snakeNode, score) {
  score.innerHTML = +score.innerHTML + COUNT_ADD_POINT;
  for (let i = 0; i < COUNT_ADD_POINT; i++) {
    snakeNode.insertAdjacentHTML(
      "beforeend",
      `
		<div class="snake-piece" data-x="-15" data-y="-15"></div>
	`
    );
  }

  SNAKE_PIECES = snakeNode.querySelectorAll(".snake-piece");

  pointsArea.innerHTML = "";
  let min = 15;
  let max = 435;
  let point = document.createElement("div");
  point.classList.add("point");

  let randomX = Math.round(Math.random() * (max - min) + min);
  randomX -= randomX % 15;

  let randomY = Math.round(Math.random() * (max - min) + min);
  randomY -= randomY % 15;

  point.style.left = randomX + "px";
  point.dataset.x = randomX;
  point.style.top = randomY + "px";
  point.dataset.y = randomY;

  pointsArea.appendChild(point);
}

const SNAKE = snakeObj(SNAKE_NODE);
addPoint(POINTS_AREA, SNAKE_NODE, SCORE);
SCORE.innerHTML = 0;

// Движение змейки
window.addEventListener("keydown", (e) => {
  if (e.key == "ArrowRight") {
    e.preventDefault();
    SNAKE.goRight();
  }
  if (e.key == "ArrowLeft") {
    e.preventDefault();
    SNAKE.goLeft();
  }
  if (e.key == "ArrowUp") {
    e.preventDefault();
    SNAKE.goUp();
  }
  if (e.key == "ArrowDown") {
    e.preventDefault();
    SNAKE.goDown();
  }
  if (e.key == " ") {
    console.log("pause");
    e.preventDefault();
    SNAKE.pause();
  }
});
