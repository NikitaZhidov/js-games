// Helper
let coinsAreaHTML = document.querySelector(".coins_count");

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; //Максимум не включается, минимум включается
}

function getRandomDirection() {
  var indicator = getRandomInt(0, 4);
  switch (indicator) {
    case 0:
      return UP;
    case 1:
      return RIGHT;
    case 2:
      return LEFT;
    case 3:
      return DOWN;
  }
}

function getOppositeDirection(direction) {
  if (direction == LEFT) return RIGHT;
  if (direction == RIGHT) return LEFT;
  if (direction == UP) return DOWN;
  if (direction == DOWN) return UP;
}

function reloadToNextLvl() {
  _randomBeginAreaBlock = getRandomInt(0, COUNT_AREA_BLOCKS_IN_ROW);

  begin_block_row = Math.floor(
    _randomBeginAreaBlock / COUNT_AREA_BLOCKS_IN_ROW
  );
  begin_block_column = Math.floor(
    _randomBeginAreaBlock % COUNT_AREA_BLOCKS_IN_ROW
  );

  beginCoords = {
    x: begin_block_row * 3,
    y: begin_block_column * 3 + 1,
  };

  coinsState = {
    coins: [],
    maxCoinsCount: 4,
    framesCount: 10,
    currentFrame: 0,
  };

  enemiesState.enemies = [];

  archerState.currentDirection = DOWN;
  archerState.x = beginCoords.y * BLOCK_SIZE;
  archerState.y = beginCoords.x * BLOCK_SIZE;

  portalState.isOpen = false;
  portalState.x = 0;
  portalState.y = 0;
  portalState.countCoinsForOpen = 0;
  portalState.collectedCoinsInLVL = 0;

  portalState.beginPortalX = archerState.x;
  portalState.beginPortalY = archerState.y;

  generateMap();
}

function reloadGame() {
  archerState.countPickedCoins = 0;
  coinsAreaHTML.innerHTML = `Coins: ${archerState.countPickedCoins}`;
  reloadToNextLvl();
}

const DOWN = "DOWN";
const UP = "UP";
const LEFT = "LEFT";
const RIGHT = "RIGHT";

const GAME_SPEED = 50;

// Helper

// ==== assets
let treeImg = new Image();
treeImg.src = "./assets/map/tree3.jpg";

let landImg = new Image();
landImg.src = "./assets/map/grass1.jpg";

let archerSprite = new Image();
archerSprite.src = "./assets/archer/archer.png";

let coinsSprite = new Image();
coinsSprite.src = "./assets/coins/coinsSprite.png";

let arrowUpDownSprite = new Image();
arrowUpDownSprite.src = "./assets/archer/arrowUpDown.png";

let arrowRightLeftSprite = new Image();
arrowRightLeftSprite.src = "./assets/archer/arrowRightLeft.png";

let orkSprite = new Image();
orkSprite.src = "./assets/ork/orkSprite.png";

let beginPortalImage = new Image();
beginPortalImage.src = "./assets/portals/beginPortal.png";

let endPortalImage = new Image();
endPortalImage.src = "./assets/portals/endPortal.png";

// ==== assets

let canvas = document.getElementById("canvas");
canvas.width = 840;
canvas.height = 840;
let context = canvas.getContext("2d");

// buffer

const BLOCK_SIZE = 40;

const BLOCK_AREA_SIZE = 3;

const MAP_SIZE = canvas.width / BLOCK_SIZE;

const COUNT_AREA_BLOCKS_IN_ROW = MAP_SIZE / BLOCK_AREA_SIZE;

let _randomBeginAreaBlock = getRandomInt(0, COUNT_AREA_BLOCKS_IN_ROW);
let begin_block_row = Math.floor(
  _randomBeginAreaBlock / COUNT_AREA_BLOCKS_IN_ROW
);
let begin_block_column = Math.floor(
  _randomBeginAreaBlock % COUNT_AREA_BLOCKS_IN_ROW
);

let beginCoords = {
  x: begin_block_row * 3,
  y: begin_block_column * 3 + 1,
};

let maxVertNumForLastCoords = 0;
let currentVertNumInDfs = -1;

let lastCoodrs = {
  x: null,
  y: null,
};

let map = new Array(MAP_SIZE);

function generateMap() {
  let adjacencyMatrixBlockArea = new Array(BLOCK_AREA_SIZE);

  for (let i = 0; i < MAP_SIZE; i++) {
    map[i] = [];
    for (let j = 0; j < MAP_SIZE; j++) {
      map[i][j] = 1;
    }
  }

  // initialization adjacencyMatrix

  for (
    let i = 0;
    i < COUNT_AREA_BLOCKS_IN_ROW * COUNT_AREA_BLOCKS_IN_ROW;
    i++
  ) {
    adjacencyMatrixBlockArea[i] = new Array(
      COUNT_AREA_BLOCKS_IN_ROW * COUNT_AREA_BLOCKS_IN_ROW
    ).fill(0);
    if (
      i % COUNT_AREA_BLOCKS_IN_ROW != COUNT_AREA_BLOCKS_IN_ROW - 1 ||
      i == 0
    ) {
      adjacencyMatrixBlockArea[i][i + 1] = 1;
    }
    if (i % COUNT_AREA_BLOCKS_IN_ROW != 0) {
      adjacencyMatrixBlockArea[i][i - 1] = 1;
    }
    if (i / COUNT_AREA_BLOCKS_IN_ROW < COUNT_AREA_BLOCKS_IN_ROW - 1) {
      adjacencyMatrixBlockArea[i][i + COUNT_AREA_BLOCKS_IN_ROW] = 1;
    }
    if (i / COUNT_AREA_BLOCKS_IN_ROW > 1) {
      adjacencyMatrixBlockArea[i][i - COUNT_AREA_BLOCKS_IN_ROW] = 1;
    }
  }

  // visited for dfc
  let visited = new Array(
    COUNT_AREA_BLOCKS_IN_ROW * COUNT_AREA_BLOCKS_IN_ROW
  ).fill(false);

  // generate main Map
  mapDfs(_randomBeginAreaBlock, true);

  function mapDfs(current_block_area, isInit = false) {
    currentVertNumInDfs++;

    let block_row = Math.floor(current_block_area / COUNT_AREA_BLOCKS_IN_ROW);
    let block_column = Math.floor(
      current_block_area % COUNT_AREA_BLOCKS_IN_ROW
    );

    map[block_row * 3 + 1][block_column * 3 + 1] = 0;
    if (isInit) {
      map[block_row * 3][block_column * 3 + 1] = 0;
    }

    let counter = 0;

    for (
      let i = 0;
      i < COUNT_AREA_BLOCKS_IN_ROW * COUNT_AREA_BLOCKS_IN_ROW;
      i++
    ) {
      if (adjacencyMatrixBlockArea[current_block_area][i] == 1 && !visited[i]) {
        counter++;
      }
      let randomIndicator = getRandomInt(0, counter);
      counter = 0;

      // add cycles
      if (getRandomInt(0, 3) != 2) {
        visited[current_block_area] = true;
      }

      for (
        let i = 0;
        i < COUNT_AREA_BLOCKS_IN_ROW * COUNT_AREA_BLOCKS_IN_ROW;
        i++
      ) {
        if (
          adjacencyMatrixBlockArea[current_block_area][i] == 1 &&
          !visited[i]
        ) {
          if (counter == randomIndicator) {
            let isAddCoin = false;
            if (
              getRandomInt(0, 5) == 4 &&
              current_block_area > COUNT_AREA_BLOCKS_IN_ROW * 2 &&
              current_block_area <
                COUNT_AREA_BLOCKS_IN_ROW * (COUNT_AREA_BLOCKS_IN_ROW - 2) &&
              coinsState.coins.length < coinsState.maxCoinsCount
            ) {
              isAddCoin = true;
              portalState.countCoinsForOpen++;
            }
            switch (current_block_area - i) {
              case 1:
                map[block_row * 3 + 1][block_column * 3] = 0;
                map[block_row * 3 + 1][block_column * 3 - 1] = 0;
                if (isAddCoin) {
                  let coinX = block_column * 3 * BLOCK_SIZE;
                  let coinY = (block_row * 3 + 1) * BLOCK_SIZE;
                  enemiesState.enemies.push({
                    x: coinX,
                    y: coinY,
                    direction: UP,
                  });
                  coinsState.coins.push({
                    y: coinY,
                    x: coinX,
                  });
                }
                break;
              case -1:
                map[block_row * 3 + 1][block_column * 3 + 2] = 0;
                map[block_row * 3 + 1][block_column * 3 + 3] = 0;
                if (isAddCoin) {
                  coinsState.coins.push({
                    y: (block_row * 3 + 1) * BLOCK_SIZE,
                    x: (block_column * 3 + 3) * BLOCK_SIZE,
                  });
                  enemiesState.enemies.push({
                    y: (block_row * 3 + 1) * BLOCK_SIZE,
                    x: (block_column * 3 + 3) * BLOCK_SIZE,
                    direction: UP,
                  });
                }
                break;
              case COUNT_AREA_BLOCKS_IN_ROW:
                map[block_row * 3][block_column * 3 + 1] = 0;
                map[block_row * 3 - 1][block_column * 3 + 1] = 0;
                if (isAddCoin) {
                  coinsState.coins.push({
                    y: block_row * 3 * BLOCK_SIZE,
                    x: (block_column * 3 + 1) * BLOCK_SIZE,
                  });
                  enemiesState.enemies.push({
                    y: block_row * 3 * BLOCK_SIZE,
                    x: (block_column * 3 + 1) * BLOCK_SIZE,
                    direction: UP,
                  });
                }
                break;
              case -COUNT_AREA_BLOCKS_IN_ROW:
                map[block_row * 3 + 2][block_column * 3 + 1] = 0;
                map[block_row * 3 + 3][block_column * 3 + 1] = 0;
                if (isAddCoin) {
                  coinsState.coins.push({
                    y: (block_row * 3 + 3) * BLOCK_SIZE,
                    x: (block_column * 3 + 1) * BLOCK_SIZE,
                  });
                  enemiesState.enemies.push({
                    y: (block_row * 3 + 3) * BLOCK_SIZE,
                    x: (block_column * 3 + 1) * BLOCK_SIZE,
                    direction: UP,
                  });
                }
                break;
              default:
                break;
            }
            mapDfs(i);
            if (maxVertNumForLastCoords < currentVertNumInDfs) {
              maxVertNumForLastCoords = currentVertNumInDfs;
              portalState.x =
                (Math.floor(i / COUNT_AREA_BLOCKS_IN_ROW) * 3 + 1) * BLOCK_SIZE;
              portalState.y =
                (Math.floor(i % COUNT_AREA_BLOCKS_IN_ROW) * 3 + 1) * BLOCK_SIZE;
            }
          }
          counter++;
        }
      }
    }
  }

  // additional generate
  for (let i = 0; i < MAP_SIZE; i++) {
    for (let j = 0; j < MAP_SIZE; j++) {
      if (getRandomInt(0, 4) == 3 && !visited[i * MAP_SIZE + j]) {
        map[i][j] = 0;
      }
    }
  }
}

function drawMap() {
  for (let i = 0; i < MAP_SIZE; i++) {
    for (let j = 0; j < MAP_SIZE; j++) {
      if (map[j][i] == 1) {
        context.drawImage(treeImg, BLOCK_SIZE * i, BLOCK_SIZE * j);
      }
      if (map[j][i] == 0) {
        context.drawImage(landImg, BLOCK_SIZE * i, BLOCK_SIZE * j);
      }
    }
  }
}

let coinsState = {
  coins: [],
  maxCoinsCount: 4,
  framesCount: 10,
  currentFrame: 0,
};

function drawCoins() {
  coinsState.coins.forEach((coin) => {
    context.drawImage(
      coinsSprite,
      coinsState.currentFrame * 40,
      0,
      BLOCK_SIZE,
      BLOCK_SIZE,
      coin.x,
      coin.y,
      BLOCK_SIZE,
      BLOCK_SIZE
    );
  });
  if (coinsState.currentFrame >= coinsState.framesCount - 1) {
    coinsState.currentFrame = 0;
  } else {
    coinsState.currentFrame++;
  }
}

let archerState = {
  x: beginCoords.y * BLOCK_SIZE,
  y: beginCoords.x * BLOCK_SIZE,
  dx: 10,
  dy: 10,
  rightPressed: false,
  leftPressed: false,
  upPressed: false,
  downPressed: false,
  currentSprite: 1,
  currentDirection: DOWN,
  countPickedCoins: 0,
  isShooting: false,
  currentShootingFrame: 0,
  countShootingFrames: 13,
  archerWidth: 30,
};

function drawArcher() {
  if (archerState.currentSprite > 6) {
    archerState.currentSprite = 1;
  }
  if (archerState.currentShootingFrame >= archerState.countShootingFrames - 1) {
    archerState.isShooting = false;
    archerState.currentShootingFrame = 0;
  }
  if (archerState.isShooting) {
    switch (archerState.currentDirection) {
      case DOWN:
        context.drawImage(
          archerSprite,
          16 + 64 * archerState.currentShootingFrame,
          1152,
          36,
          64,
          archerState.x + 7,
          archerState.y,
          29,
          52
        );
        break;
      case RIGHT:
        context.drawImage(
          archerSprite,
          16 + 64 * archerState.currentShootingFrame,
          1223,
          36,
          64,
          archerState.x + 7,
          archerState.y,
          29,
          52
        );
        break;
      case LEFT:
        context.drawImage(
          archerSprite,
          10 + 64 * archerState.currentShootingFrame,
          1095,
          36,
          64,
          archerState.x + 7,
          archerState.y,
          29,
          52
        );
        break;
      case UP:
        context.drawImage(
          archerSprite,
          10 + 64 * archerState.currentShootingFrame,
          1030,
          36,
          64,
          archerState.x + 7,
          archerState.y,
          29,
          52
        );
        break;
      default:
        break;
    }
    archerState.currentShootingFrame++;
  } else if (archerState.downPressed) {
    context.drawImage(
      archerSprite,
      16 + 64 * archerState.currentSprite,
      650,
      36,
      64,
      archerState.x + 7,
      archerState.y,
      29,
      52
    );
  } else if (archerState.leftPressed) {
    context.drawImage(
      archerSprite,
      16 + 64 * archerState.currentSprite,
      586,
      36,
      60,
      archerState.x + 7,
      archerState.y,
      29,
      52
    );
  } else if (archerState.rightPressed) {
    context.drawImage(
      archerSprite,
      16 + 64 * archerState.currentSprite,
      712,
      36,
      64,
      archerState.x + 7,
      archerState.y,
      29,
      52
    );
  } else if (archerState.upPressed) {
    context.drawImage(
      archerSprite,
      16 + 64 * archerState.currentSprite,
      522,
      36,
      64,
      archerState.x + 7,
      archerState.y,
      29,
      52
    );
  } else {
    switch (archerState.currentDirection) {
      case DOWN:
        context.drawImage(
          archerSprite,
          12 + 64 * archerState.currentSprite,
          132,
          40,
          64,
          archerState.x + 7,
          archerState.y - 3,
          29,
          52
        );
        break;
      case LEFT:
        context.drawImage(
          archerSprite,
          12 + 64 * archerState.currentSprite,
          70,
          40,
          64,
          archerState.x + 7,
          archerState.y - 3,
          29,
          52
        );
        break;
      case RIGHT:
        context.drawImage(
          archerSprite,
          12 + 64 * archerState.currentSprite,
          197,
          40,
          64,
          archerState.x + 7,
          archerState.y - 3,
          29,
          52
        );
        break;
      case UP:
        context.drawImage(
          archerSprite,
          12 + 64 * archerState.currentSprite,
          11,
          40,
          64,
          archerState.x + 7,
          archerState.y - 3,
          29,
          52
        );
        break;

      default:
        break;
    }
  }

  if (
    archerState.y <= portalState.y &&
    archerState.y + portalState.size > portalState.y &&
    archerState.x + archerState.archerWidth / 2 >= portalState.x &&
    archerState.x + archerState.archerWidth / 2 <=
      portalState.x + portalState.size &&
    portalState.isOpen
  ) {
    reloadToNextLvl();
  }

  enemiesState.enemies.forEach((enemy) => {
    if (
      archerState.y <= enemy.y &&
      archerState.y + enemiesState.enemyWidth > enemy.y &&
      archerState.x + archerState.archerWidth / 2 >= enemy.x &&
      archerState.x + archerState.archerWidth / 2 <=
        enemy.x + enemiesState.enemyWidth
    ) {
      reloadGame();
    }
  });

  archerState.currentSprite++;
}

let arrowsState = {
  arrows: [],
  arrowWidth: 4,
  arrowLength: BLOCK_SIZE,
};

function drawArrows() {
  arrowsState.arrows.forEach((arrow) => {
    switch (arrow.direction) {
      case UP:
        context.drawImage(
          arrowUpDownSprite,
          0,
          0,
          arrowsState.arrowWidth,
          arrowsState.arrowLength,
          arrow.x,
          arrow.y,
          arrowsState.arrowWidth,
          arrowsState.arrowLength
        );
        arrow.endArrowCoords = {
          x: arrow.x + arrowsState.arrowWidth / 2,
          y: arrow.y,
        };
        break;
      case RIGHT:
        context.drawImage(
          arrowRightLeftSprite,
          0,
          0,
          arrowsState.arrowLength,
          arrowsState.arrowWidth,
          arrow.x,
          arrow.y,
          arrowsState.arrowLength,
          arrowsState.arrowWidth
        );
        arrow.endArrowCoords = {
          x: arrow.x + arrowsState.arrowLength,
          y: arrow.y + arrowsState.arrowWidth / 2,
        };
        break;
      case LEFT:
        context.drawImage(
          arrowRightLeftSprite,
          arrowsState.arrowLength,
          0,
          arrowsState.arrowLength,
          arrowsState.arrowWidth,
          arrow.x,
          arrow.y,
          arrowsState.arrowLength,
          arrowsState.arrowWidth
        );
        arrow.endArrowCoords = {
          x: arrow.x,
          y: arrow.y + arrowsState.arrowWidth / 2,
        };
        break;
      case DOWN:
        context.drawImage(
          arrowUpDownSprite,
          0,
          0,
          arrowsState.arrowWidth,
          arrowsState.arrowLength,
          arrow.x,
          arrow.y,
          arrowsState.arrowWidth,
          arrowsState.arrowLength
        );
        arrow.endArrowCoords = {
          x: arrow.x + arrowsState.arrowWidth / 2,
          y: arrow.y + arrowsState.arrowLength,
        };
        break;

      default:
        break;
    }

    let isBorderMap =
      arrow.endArrowCoords.x > canvas.width ||
      arrow.endArrowCoords.x < 0 ||
      arrow.endArrowCoords.y > canvas.height ||
      arrow.endArrowCoords.y < 0;

    let arrowCollisionBlock;
    if (isBorderMap) {
      arrowCollisionBlock = { isExist: false };
    } else {
      arrowCollisionBlock = {
        isExist:
          map[Math.floor(arrow.endArrowCoords.y / BLOCK_SIZE)][
            Math.floor(arrow.endArrowCoords.x / BLOCK_SIZE)
          ] == 1,
      };
    }

    if (isBorderMap || arrowCollisionBlock.isExist) {
      arrowsState.arrows = arrowsState.arrows.filter(
        (stateArrow) => arrow != stateArrow
      );
    }

    arrow.x += arrow.dx;
    arrow.y += arrow.dy;
  });
}

let enemiesState = {
  enemies: [],
  enemyWidth: BLOCK_SIZE,
  enemyHeight: BLOCK_SIZE,
  dx: 5,
  dy: 5,
  directions: {
    x: {
      LEFT: -1,
      RIGHT: 1,
      UP: 0,
      DOWN: 0,
    },
    y: {
      UP: -1,
      DOWN: 1,
      LEFT: 0,
      RIGHT: 0,
    },
  },
  currentSprite: 0,
  countCollisionFrames: 0,
};

function drawEnemies() {
  enemiesState.enemies.forEach((enemy) => {
    enemiesState.enemies.forEach((stateEnemy) => {
      if (stateEnemy != enemy) {
        if (
          (enemy.y + BLOCK_SIZE >= stateEnemy.y &&
            enemy.y <= stateEnemy.y &&
            enemy.x >= stateEnemy.x &&
            enemy.x <= stateEnemy.x + BLOCK_SIZE) ||
          (enemy.y >= stateEnemy.y &&
            enemy.y <= stateEnemy.y + BLOCK_SIZE &&
            enemy.x >= stateEnemy.x &&
            enemy.x <= stateEnemy.x + BLOCK_SIZE) ||
          (enemy.y >= stateEnemy.y &&
            enemy.y <= stateEnemy.y + BLOCK_SIZE &&
            enemy.x + BLOCK_SIZE >= stateEnemy.x &&
            enemy.x <= stateEnemy.x) ||
          (enemy.y + BLOCK_SIZE >= stateEnemy.y &&
            enemy.y <= stateEnemy.y &&
            enemy.x >= stateEnemy.x &&
            enemy.x <= stateEnemy.x + BLOCK_SIZE)
        ) {
          if (enemiesState.countCollisionFrames < 15) {
            enemiesState.countCollisionFrames++;
            enemy.direction = getOppositeDirection(enemy.direction);
            stateEnemy.direction = getOppositeDirection(stateEnemy.direction);
          } else if (enemiesState.countCollisionFrames > 25) {
            enemiesState.countCollisionFrames = 0;
          } else {
            enemiesState.countCollisionFrames++;
          }
        }
      }
    });

    if (enemy.x + BLOCK_SIZE > canvas.width - BLOCK_SIZE) {
      enemy.direction = LEFT;
    }
    if (enemy.x < BLOCK_SIZE) {
      enemy.direction = RIGHT;
    }
    if (enemy.y < BLOCK_SIZE) {
      enemy.direction = DOWN;
    }
    if (enemy.y + BLOCK_SIZE > canvas.height + BLOCK_SIZE) {
      enemy.direction = UP;
    } else if (enemy.x % BLOCK_SIZE == 0 && enemy.y % BLOCK_SIZE == 0) {
      let enemyBlockCoord = {
        x: enemy.x / BLOCK_SIZE,
        y: enemy.y / BLOCK_SIZE,
      };

      if (enemyBlockCoord)
        if (
          (enemy.direction == UP &&
            enemyBlockCoord.y > 0 &&
            map[enemyBlockCoord.y - 1][enemyBlockCoord.x] != 1) ||
          (enemy.direction == DOWN &&
            enemyBlockCoord.y < 20 &&
            map[enemyBlockCoord.y + 1][enemyBlockCoord.x] != 1) ||
          (enemy.direction == LEFT &&
            enemyBlockCoord.x > 0 &&
            map[enemyBlockCoord.y][enemyBlockCoord.x - 1] != 1) ||
          (enemy.direction == RIGHT &&
            enemyBlockCoord.x < 20 &&
            map[enemyBlockCoord.y][enemyBlockCoord.x + 1] != 1)
        ) {
          enemy.x +=
            enemiesState.dx * enemiesState.directions.x[enemy.direction];
          enemy.y +=
            enemiesState.dy * enemiesState.directions.y[enemy.direction];
        } else {
          enemy.direction = getRandomDirection();
        }
    } else {
      enemy.x += enemiesState.dx * enemiesState.directions.x[enemy.direction];
      enemy.y += enemiesState.dy * enemiesState.directions.y[enemy.direction];
    }

    arrowsState.arrows.forEach((arrow) => {
      if (
        arrow.endArrowCoords.x > enemy.x &&
        arrow.endArrowCoords.x < enemy.x + enemiesState.enemyWidth &&
        arrow.endArrowCoords.y > enemy.y &&
        arrow.endArrowCoords.y < enemy.y + enemiesState.enemyHeight
      ) {
        console.log("hello!");
        enemiesState.enemies = enemiesState.enemies.filter(
          (stateEnemy) => enemy != stateEnemy
        );
        arrowsState.arrows = arrowsState.arrows.filter(
          (stateArrow) => arrow != stateArrow
        );
      }
    });

    if (enemiesState.currentSprite > 6) {
      enemiesState.currentSprite = 0;
    }

    if (enemy.direction == DOWN) {
      context.drawImage(
        orkSprite,
        16 + 64 * enemiesState.currentSprite,
        650,
        36,
        64,
        enemy.x + 7,
        enemy.y,
        29,
        52
      );
    } else if (enemy.direction == LEFT) {
      context.drawImage(
        orkSprite,
        16 + 64 * enemiesState.currentSprite,
        586,
        36,
        60,
        enemy.x + 7,
        enemy.y,
        29,
        52
      );
    } else if (enemy.direction == RIGHT) {
      context.drawImage(
        orkSprite,
        16 + 64 * enemiesState.currentSprite,
        712,
        36,
        64,
        enemy.x + 7,
        enemy.y,
        29,
        52
      );
    } else if (enemy.direction == UP) {
      context.drawImage(
        orkSprite,
        16 + 64 * enemiesState.currentSprite,
        522,
        36,
        64,
        enemy.x + 7,
        enemy.y,
        29,
        52
      );
    }
  });

  enemiesState.currentSprite++;
}

let portalState = {
  isOpen: false,
  x: 0,
  y: 0,
  beginPortalX: archerState.x,
  beginPortalY: archerState.y,
  countCoinsForOpen: 0,
  collectedCoinsInLVL: 0,
  size: BLOCK_SIZE,
};

function drawPortal() {
  context.drawImage(
    beginPortalImage,
    portalState.beginPortalX,
    portalState.beginPortalY
  );

  portalState.isOpen =
    portalState.countCoinsForOpen == portalState.collectedCoinsInLVL;

  if (portalState.isOpen) {
    context.drawImage(endPortalImage, portalState.x, portalState.y);
  }
}

const keyDownHandler = (e) => {
  if (e.key == "Right" || e.key == "ArrowRight") {
    e.preventDefault();
    archerState.rightPressed = true;
    archerState.currentDirection = RIGHT;
  } else if (e.key == "Left" || e.key == "ArrowLeft") {
    e.preventDefault();
    archerState.leftPressed = true;
    archerState.currentDirection = LEFT;
  } else if (e.key == "Up" || e.key == "ArrowUp") {
    e.preventDefault();
    archerState.upPressed = true;
    archerState.currentDirection = UP;
  } else if (e.key == "Down" || e.key == "ArrowDown") {
    e.preventDefault();
    archerState.downPressed = true;
    archerState.currentDirection = DOWN;
  } else if (e.key == " " || e.key == "Spacebar") {
    e.preventDefault();
    archerState.isShooting = true;
    archerState.currentShootingFrame = 0;

    setTimeout(() => {
      let arrowDX = 0;
      let arrowDY = 0;
      let arrowX =
        archerState.x +
        archerState.archerWidth / 2 +
        arrowsState.arrowWidth / 2;
      let arrowY =
        archerState.y +
        archerState.archerWidth / 2 +
        arrowsState.arrowWidth / 2;

      let arrowDirection = archerState.currentDirection;

      const ARROW_SPEED = 30;

      switch (archerState.currentDirection) {
        case UP:
          arrowDY = -ARROW_SPEED;
          arrowDX = 0;
          break;
        case DOWN:
          arrowDY = ARROW_SPEED;
          arrowDX = 0;
          break;
        case LEFT:
          arrowDY = 0;
          arrowDX = -ARROW_SPEED;
          break;
        case RIGHT:
          arrowDY = 0;
          arrowDX = ARROW_SPEED;
          break;
        default:
          break;
      }
      arrowsState.arrows.push({
        x: arrowX,
        y: arrowY,
        dx: arrowDX,
        dy: arrowDY,
        direction: arrowDirection,
      });
    }, (archerState.countShootingFrames / 2) * GAME_SPEED);
  }
};

const keyUpHandler = (e) => {
  if (e.key == "Right" || e.key == "ArrowRight") {
    archerState.rightPressed = false;
  } else if (e.key == "Left" || e.key == "ArrowLeft") {
    archerState.leftPressed = false;
  } else if (e.key == "Up" || e.key == "ArrowUp") {
    archerState.upPressed = false;
  } else if (e.key == "Down" || e.key == "ArrowDown") {
    archerState.downPressed = false;
  }
};

document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("keydown", keyDownHandler, false);

let archerBlockCoord = {
  x: Math.floor(archerState.x / BLOCK_SIZE),
  y: Math.floor(archerState.y / BLOCK_SIZE),
};

function collisionDetection() {
  archerBlockCoord = {
    x: Math.floor(archerState.x / BLOCK_SIZE),
    y: Math.floor(archerState.y / BLOCK_SIZE),
  };

  if (archerState.rightPressed && archerState.x < canvas.width - BLOCK_SIZE) {
    let right_block_1 = {
      isExist: 1 == map[archerBlockCoord.y][archerBlockCoord.x + 1],
      x: (archerBlockCoord.x + 1) * BLOCK_SIZE,
      y: archerBlockCoord.y * BLOCK_SIZE,
    };

    let right_block_2;

    if (archerBlockCoord.y >= 20) {
      right_block_2 = { isExist: false };
    } else {
      right_block_2 = {
        isExist: 1 == map[archerBlockCoord.y + 1][archerBlockCoord.x + 1],
        x: (archerBlockCoord.x + 1) * BLOCK_SIZE,
        y: (archerBlockCoord.y + 1) * BLOCK_SIZE,
      };
    }

    let right_block_3;
    if (archerBlockCoord.y <= 0) {
      right_block_3 = { isExist: false };
    } else {
      right_block_3 = {
        isExist: 1 == map[archerBlockCoord.y - 1][archerBlockCoord.x + 1],
        x: (archerBlockCoord.x + 1) * BLOCK_SIZE,
        y: (archerBlockCoord.y - 1) * BLOCK_SIZE,
      };
    }

    if (
      !right_block_1.isExist ||
      right_block_1.x - archerState.archerWidth > archerState.x
    ) {
      if (
        !right_block_2.isExist ||
        archerState.y <= right_block_2.y - BLOCK_SIZE ||
        archerState.x < right_block_2.x - archerState.archerWidth
      ) {
        if (
          !right_block_3.isExist ||
          archerState.y >= right_block_3.y + BLOCK_SIZE
        ) {
          archerState.x += archerState.dx;
        }
      }
    }
  }

  if (archerState.leftPressed && archerState.x > 0) {
    archerBlockCoord = {
      x: Math.ceil(archerState.x / BLOCK_SIZE),
      y: Math.floor(archerState.y / BLOCK_SIZE),
    };

    let left_block_1 = {
      isExist: 1 == map[archerBlockCoord.y][archerBlockCoord.x - 1],
      x: (archerBlockCoord.x - 1) * BLOCK_SIZE,
      y: archerBlockCoord.y * BLOCK_SIZE,
    };

    let left_block_2;
    if (archerBlockCoord.y >= 20) {
      left_block_2 = { isExist: false };
    } else {
      left_block_2 = {
        isExist: 1 == map[archerBlockCoord.y + 1][archerBlockCoord.x - 1],
        x: (archerBlockCoord.x - 1) * BLOCK_SIZE,
        y: (archerBlockCoord.y + 1) * BLOCK_SIZE,
      };
    }

    let left_block_3;

    if (archerBlockCoord.y <= 0) {
      left_block_3 = { isExist: false };
    } else {
      left_block_3 = {
        isExist: 1 == map[archerBlockCoord.y - 1][archerBlockCoord.x - 1],
        x: (archerBlockCoord.x - 1) * BLOCK_SIZE,
        y: (archerBlockCoord.y - 1) * BLOCK_SIZE,
      };
    }

    if (
      !left_block_1.isExist ||
      left_block_1.x + archerState.archerWidth < archerState.x
    ) {
      if (
        !left_block_2.isExist ||
        archerState.y <= left_block_2.y - BLOCK_SIZE ||
        archerState.x > left_block_2.x + archerState.archerWidth
      ) {
        if (
          !left_block_3.isExist ||
          archerState.y >= left_block_3.y + archerState.archerWidth
        ) {
          archerState.x -= archerState.dx;
        }
      }
    }
  }
  if (archerState.upPressed && archerState.y > 0) {
    archerBlockCoord = {
      x: Math.floor(archerState.x / BLOCK_SIZE),
      y: Math.ceil(archerState.y / BLOCK_SIZE),
    };

    let top_block_1;
    if (archerBlockCoord.y <= 0) {
      top_block_1 = { isExist: false };
    } else {
      top_block_1 = {
        isExist: 1 == map[archerBlockCoord.y - 1][archerBlockCoord.x],
        x: archerBlockCoord.x * BLOCK_SIZE,
        y: (archerBlockCoord.y - 1) * BLOCK_SIZE,
      };
    }

    let top_block_2;
    if (archerBlockCoord.y <= 0) {
      top_block_2 = { isExist: false };
    } else {
      top_block_2 = {
        isExist: 1 == map[archerBlockCoord.y - 1][archerBlockCoord.x + 1],
        x: (archerBlockCoord.x + 1) * BLOCK_SIZE,
        y: (archerBlockCoord.y - 1) * BLOCK_SIZE,
      };
    }

    let top_block_3;
    if (archerBlockCoord.y <= 0) {
      top_block_3 = { isExist: false };
    } else {
      top_block_3 = {
        isExist: 1 == map[archerBlockCoord.y - 1][archerBlockCoord.x - 1],
        x: (archerBlockCoord.x - 1) * BLOCK_SIZE,
        y: (archerBlockCoord.y - 1) * BLOCK_SIZE,
      };
    }

    if (
      !top_block_1.isExist ||
      top_block_1.y + BLOCK_SIZE < archerState.y ||
      top_block_1.x + archerState.archerWidth <= archerState.x
    ) {
      if (
        !top_block_2.isExist ||
        archerState.x <= top_block_2.x - archerState.archerWidth
      ) {
        if (
          !top_block_3.isExist ||
          archerState.x >= top_block_3.x + archerState.archerWidth
        ) {
          archerState.y -= archerState.dy;
        }
      }
    }
  }
  if (archerState.downPressed && archerState.y < canvas.height - BLOCK_SIZE) {
    let bot_block_1 = {
      isExist: 1 == map[archerBlockCoord.y + 1][archerBlockCoord.x],
      x: archerBlockCoord.x * BLOCK_SIZE,
      y: (archerBlockCoord.y + 1) * BLOCK_SIZE,
    };

    let bot_block_2 = {
      isExist: 1 == map[archerBlockCoord.y + 1][archerBlockCoord.x + 1],
      x: (archerBlockCoord.x + 1) * BLOCK_SIZE,
      y: (archerBlockCoord.y + 1) * BLOCK_SIZE,
    };

    let bot_block_3 = {
      isExist: 1 == map[archerBlockCoord.y + 1][archerBlockCoord.x - 1],
      x: (archerBlockCoord.x - 1) * BLOCK_SIZE,
      y: (archerBlockCoord.y + 1) * BLOCK_SIZE,
    };

    if (
      !bot_block_1.isExist ||
      bot_block_1.y - BLOCK_SIZE > archerState.y ||
      bot_block_1.x + archerState.archerWidth <= archerState.x
    ) {
      if (
        !bot_block_2.isExist ||
        archerState.x <= bot_block_2.x - archerState.archerWidth
      ) {
        if (!bot_block_3.isExist || archerState.x >= bot_block_3.x) {
          archerState.y += archerState.dy;
        }
      }
    }
  }

  coinsState.coins.forEach((coin) => {
    if (
      coin.x <= archerState.x + BLOCK_SIZE / 3 &&
      archerState.x < coin.x + BLOCK_SIZE / 3 &&
      coin.y <= archerState.y + BLOCK_SIZE / 3 &&
      coin.y + BLOCK_SIZE / 3 > archerState.y
    ) {
      coinsState.coins = coinsState.coins.filter(
        (stateCoin) => !(coin.x == stateCoin.x && coin.y == stateCoin.y)
      );
      archerState.countPickedCoins++;
      portalState.collectedCoinsInLVL++;
      console.log("COINS!");
      coinsAreaHTML.innerHTML = `Coins: ${archerState.countPickedCoins}`;
    }
  });
}

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  drawMap();
  drawPortal();
  drawCoins();
  drawArcher();
  drawArrows();
  drawEnemies();
  collisionDetection();
}

generateMap();
let game;
treeImg.onload = () => {
  landImg.onload = () => {
    coinsSprite.onload = () => {
      arrowUpDownSprite.onload = () => {
        arrowRightLeftSprite.onload = () => {
          beginPortalImage.onload = () => {
            orkSprite.onload = () => {
              archerSprite.onload = () => {
                window.onload = () => {
                  game = setInterval(() => draw(), GAME_SPEED);
                };
              };
            };
          };
        };
      };
    };
  };
};
