let video;
let handpose;
let predictions = [];

let grid = [];
let cols, rows;
let size = 30;
let eduWords = ["教", "育", "科", "技", "學", "網", "數", "資", "電", "程"];

let score = 0;
let gameDuration = 30; // 秒
let startTime;
let gameState = "start"; // start, playing, gameover

const scoreBoard = document.getElementById('scoreBoard');
const timeBoard = document.getElementById('timeBoard');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');

function setup() {
  let cnv = createCanvas(640, 480);
  cnv.parent("gameArea");
  textFont('Microsoft JhengHei');

  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  handpose = ml5.handpose(video, () => {
    console.log("Handpose model ready!");
  });
  handpose.on("predict", (results) => {
    predictions = results;
  });

  cols = floor(width / size);
  rows = floor(height / size);
  for (let i = 0; i < cols; i++) {
    grid[i] = [];
    for (let j = 0; j < rows; j++) {
      grid[i][j] = null;
    }
  }

  noLoop();

  startButton.onclick = () => {
    startGame();
  };

  restartButton.onclick = () => {
    resetGame();
    startGame();
  };
}

function draw() {
  background(0);
  if (gameState === "playing") {
    playGame();
  }
}

function playGame() {
  // 顯示鏡像畫面
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);
  pop();

  let elapsed = floor((millis() - startTime) / 1000);
  let timeLeft = max(0, gameDuration - elapsed);
  timeBoard.textContent = `時間: ${timeLeft} 秒`;

  if (timeLeft <= 0) {
    gameOver();
    return;
  }

  // 每40幀新增3個文字
  if (frameCount % 40 === 0) {
    for (let i = 0; i < 3; i++) {
      addWord(floor(random(cols)), 0);
    }
  }

  // 用雙手食指點擊文字
  for (let hand of predictions) {
    const tips = [
      hand.annotations.indexFinger[3],
      hand.annotations.middleFinger[3] // 可擴充更多點
    ];

    for (let tip of tips) {
      let x = width - tip[0];
      let y = tip[1];

      fill(255, 0, 0);
      noStroke();
      ellipse(x, y, 20);

      let gridX = floor(x / size);
      let gridY = floor(y / size);

      if (
        gridX >= 0 &&
        gridX < cols &&
        gridY >= 0 &&
        gridY < rows &&
        grid[gridX][gridY] !== null
      ) {
        grid[gridX][gridY] = null;
        score += 10;
        scoreBoard.textContent = `分數: ${score}`;
      }
    }
  }

  // 下落邏輯
  let nextGrid = [];
  for (let i = 0; i < cols; i++) {
    nextGrid[i] = [];
    for (let j = 0; j < rows; j++) {
      nextGrid[i][j] = null;
    }
  }

  for (let i = 0; i < cols; i++) {
    for (let j = rows - 1; j >= 0; j--) {
      if (grid[i][j]) {
        if (j + 1 < rows && grid[i][j + 1] === null) {
          nextGrid[i][j + 1] = grid[i][j];
        } else {
          nextGrid[i][j] = grid[i][j];
        }
      }
    }
  }

  grid = nextGrid;

  // 畫出文字
  textAlign(CENTER, CENTER);
  fill(255);
  textSize(size);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (grid[i][j]) {
        text(grid[i][j], i * size + size / 2, j * size + size / 2);
      }
    }
  }
}

function addWord(x, y) {
  if (grid[x][y] === null) {
    grid[x][y] = random(eduWords);
  }
}

function startGame() {
  gameState = "playing";
  score = 0;
  scoreBoard.textContent = "分數: 0";
  startTime = millis();
  loop();
  startButton.style.display = "none";
  restartButton.style.display = "none";
}

function gameOver() {
  gameState = "gameover";
  noLoop();
  restartButton.style.display = "inline-block";
  alert(`遊戲結束！\n你的分數：${score}`);
}

function resetGame() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      grid[i][j] = null;
    }
  }
  score = 0;
  scoreBoard.textContent = "分數: 0";
  timeBoard.textContent = `時間: ${gameDuration} 秒`;
  startButton.style.display = "inline-block";
  restartButton.style.display = "none";
}
