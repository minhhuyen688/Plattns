// Canvas Setup
const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
canvas.width = 900;
canvas.height = 600;

const darkGrey = "#222831";
const midGrey = "#393E46";
const lightGrey = "#EEEEEE";
const yellow = "#FFD369";
const green = "#6EBF8B";
const red = "#D82148";
const orange = "#FFAD60";

// Global Variables
const cellSize = 50;
const cellGap = 3;
const gameGrid = [];
const defenders = [];
const enemies = [];
const enemyPositions = [];
const projectiles = [];
const resources = [];
let score = 0;
const winningScore = 500;
let numberOfResources = 300;
let enemiesInterval = 600;
let frame = 0;
let gameOver = false;

// Mouse
const mouse = {
  x: undefined,
  y: undefined,
  width: 0.01,
  height: 0.01,
};
let canvasPosition = canvas.getBoundingClientRect();
canvas.addEventListener("mousemove", function (event) {
  mouse.x = event.x - canvasPosition.left;
  mouse.y = event.y - canvasPosition.top;
});
canvas.addEventListener("mouseleave", function () {
  mouse.y = undefined;
  mouse.x = undefined;
});

// Game Board
const controlsBar = {
  width: canvas.width,
  height: cellSize,
};

class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = cellSize;
    this.height = cellSize;
  }
  draw() {
    if (mouse.x && mouse.y && collision(this, mouse)) {
      ctx.strokeStyle = yellow;
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
  }
}

function createGameGrid() {
  for (let y = cellSize; y < canvas.height; y += cellSize) {
    for (let x = 0; x < canvas.width; x += cellSize) {
      gameGrid.push(new Cell(x, y));
    }
  }
}
createGameGrid();
function handleGameGrid() {
  for (let i = 0; i < gameGrid.length; i++) {
    gameGrid[i].draw();
  }
}

// Defenders
class Defender {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = cellSize;
    this.height = cellSize;
    this.shooting = false;
    this.health = 100;
    this.projectiles = [];
    this.timer = 0;
  }
  update() {
    if (this.shooting) {
      this.timer++;
      if (this.timer % 100 === 0) {
        projectiles.push(new Projectile(this.x + this.height / 2, this.y + this.height / 2));
      }
    } else {
      this.timer = 0;
    }
  }
  draw() {
    ctx.fillStyle = green;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = "black";
    ctx.font = "16px Teko";
    ctx.fillText(Math.floor(this.health), this.x + 2, this.y + 14);
  }
}

canvas.addEventListener("click", function () {
  const gridPositionX = mouse.x - (mouse.x % cellSize);
  const gridPositionY = mouse.y - (mouse.y % cellSize);
  if (gridPositionY < cellSize) return;
  for (let i = 0; i < defenders.length; i++) {
    let { x, y } = defenders[i];
    if (x === gridPositionX && y === gridPositionY) return;
  }
  let defenderCost = 100;
  if (numberOfResources >= defenderCost) {
    defenders.push(new Defender(gridPositionX, gridPositionY));
    numberOfResources -= defenderCost;
  }
});

function handleDefenders() {
  for (let i = 0; i < defenders.length; i++) {
    defenders[i].update();
    defenders[i].draw();
    if (enemyPositions.indexOf(defenders[i].y) !== -1) {
      defenders[i].shooting = true;
    } else {
      defenders[i].shooting = false;
    }
    for (let j = 0; j < enemies.length; j++) {
      if (defenders[i] && enemies[j] && collision(defenders[i], enemies[j])) {
        enemies[j].movement = 0;
        defenders[i].health -= 0.2;
      }
      if (defenders[i] && defenders[i].health <= 0) {
        defenders.splice(i, 1);
        i--;
        enemies[j].movement = enemies[j].speed;
      }
    }
  }
}

// Enemy
class Enemy {
  constructor(verticalPosition) {
    this.x = canvas.width;
    this.y = verticalPosition;
    this.width = cellSize;
    this.height = cellSize;
    this.speed = Math.random() * 0.2 + 0.4;
    this.movement = this.speed;
    this.health = 100;
    this.maxHealth = this.health;
  }
  update() {
    this.x -= this.movement;
  }
  draw() {
    ctx.fillStyle = red;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = "black";
    ctx.font = "16px Teko";
    ctx.fillText(Math.floor(this.health), this.x + 2, this.y + 14);
  }
}

function handleEnemies() {
  for (let i = 0; i < enemies.length; i++) {
    enemies[i].update();
    enemies[i].draw();
    if (enemies[i].x < 0) {
      gameOver = true;
    }
    if (enemies[i].health <= 0) {
      let gainedResources = enemies[i].maxHealth / 10;
      numberOfResources += gainedResources;
      score += gainedResources;
      const findEnemyPosIndex = enemyPositions.indexOf(enemies[i].y);
      enemyPositions.splice(findEnemyPosIndex, 1);
      enemies.splice(i, 1);
      i--;
    }
  }
  if (frame % enemiesInterval === 0 && score < winningScore) {
    let verticalPosition = Math.floor(Math.random() * 11 + 1) * cellSize;
    enemies.push(new Enemy(verticalPosition));
    enemyPositions.push(verticalPosition);
    if (enemiesInterval > 120) enemiesInterval -= 50;
  }
}

// Projectile
class Projectile {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 10;
    this.height = 10;
    this.power = 20;
    this.speed = 5;
  }
  update() {
    this.x += this.speed;
  }
  draw() {
    ctx.fillStyle = yellow;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
    ctx.fill();
  }
}

function handleProjectiles() {
  for (let i = 0; i < projectiles.length; i++) {
    projectiles[i].update();
    projectiles[i].draw();

    for (let j = 0; j < enemies.length; j++) {
      if (projectiles[i] && enemies[j] && collision(projectiles[i], enemies[j])) {
        enemies[j].health -= projectiles[i].power;
        projectiles.splice(i, 1);
        i--;
      }
    }

    if (projectiles[i] && projectiles[i].x > canvas.width - cellSize) {
      projectiles.splice(i, 1);
      i--;
    }
  }
}

// Resources
const amounts = [20, 30, 40];
class Resource {
  constructor() {
    this.width = 30;
    this.height = 30;
    this.x = Math.floor(Math.random() * (canvas.width / cellSize)) * cellSize + cellSize / 2 - this.width / 2;
    this.y = Math.floor(Math.random() * (canvas.height / cellSize)) * cellSize + cellSize / 2 - this.height / 2 + cellSize;
    this.amount = amounts[Math.floor(Math.random() * amounts.length)];
  }
  draw() {
    ctx.fillStyle = orange;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = "black";
    ctx.font = "16px Teko";
    ctx.fillText(this.amount, this.x + 2, this.y + 14);
  }
}

function handleResources() {
  if (frame !== 0 && frame % 300 === 0 && score < winningScore) {
    resources.push(new Resource());
  }
  for (let i = 0; i < resources.length; i++) {
    resources[i].draw();
    if (resources[i] && mouse.x && mouse.y && collision(resources[i], mouse)) {
      numberOfResources += resources[i].amount;
      resources.splice(i, 1);
      i--;
    }
  }
}

// Utilities
function handleGameStatus() {
  ctx.fillStyle = lightGrey;
  ctx.font = "34px Teko";
  ctx.fillText("$" + numberOfResources, 20, 36);
  ctx.fillText("SCORE " + score, 750, 36);
  if (gameOver) {
    ctx.fillStyle = "black";
    ctx.font = "140px Teko";
    const text = "GAME OVER";
    ctx.fillText(text, canvas.width / 2 - ctx.measureText(text).width / 2, 340);
  }
  if (score >= winningScore && enemies.length === 0) {
    ctx.fillStyle = "black";
    ctx.font = "140px Teko";
    const text = "YOU WIN";
    ctx.fillText(text, canvas.width / 2 - ctx.measureText(text).width / 2, 340);
  }
}

// Main Game Loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = midGrey;
  ctx.fillRect(0, 0, controlsBar.width, controlsBar.height);
  handleGameGrid();
  handleDefenders();
  handleEnemies();
  handleProjectiles();
  handleResources();
  handleGameStatus();
  frame++;
  // Run loop again
  if (!gameOver || (score >= winningScore && enemies.length === 0)) requestAnimationFrame(gameLoop);
}
gameLoop();

function collision(first, second) {
  // Check if objects are not within each others bounds
  // Therefor no collision.
  if (first.x >= second.x + second.width) return false;
  if (first.x + first.width <= second.x) return false;
  if (first.y >= second.y + second.height) return false;
  if (first.y + first.height <= second.y) return false;
  return true;
}

window.addEventListener("resize", function () {
  canvasPosition = canvas.getBoundingClientRect();
});