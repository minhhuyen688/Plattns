const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let player, obstacle, gravity, score, gameRunning = false;
let bgMusic = document.getElementById("bg-music");

function init() {
  player = {
    x: 50,
    y: 300,
    width: 30,
    height: 30,
    color: "pink",
    velocityY: 0,
    jumpForce: 12,
    grounded: false
  };

  obstacle = {
    x: canvas.width,
    y: canvas.height - 60,
    width: 30,
    height: 30,
    color: "red",
    speed: 4
  };

  gravity = 0.8;
  score = 0;
  document.getElementById("score-value").textContent = score;
}

document.addEventListener("keydown", function (e) {
  if (e.code === "Space" && player.grounded && gameRunning) {
    player.velocityY = -player.jumpForce;
    player.grounded = false;
  }
});

function startGame() {
  document.getElementById("menu").style.display = "none";
  document.getElementById("game-over").style.display = "none";
  canvas.style.display = "block";
  document.getElementById("score").style.display = "block";
  bgMusic.play();

  init();
  gameRunning = true;
  update();
}

function restartGame() {
  startGame();
}

function update() {
  if (!gameRunning) return;

  player.velocityY += gravity;
  player.y += player.velocityY;

  if (player.y + player.height >= canvas.height - 30) {
    player.y = canvas.height - 30 - player.height;
    player.velocityY = 0;
    player.grounded = true;
  }

  // Di chuyển obstacle
  obstacle.x -= obstacle.speed;
  if (obstacle.x + obstacle.width < 0) {
    obstacle.x = canvas.width + Math.random() * 200;
    score++;
    document.getElementById("score-value").textContent = score;
  }

  // Kiểm tra va chạm
  if (
    player.x < obstacle.x + obstacle.width &&
    player.x + player.width > obstacle.x &&
    player.y < obstacle.y + obstacle.height &&
    player.y + player.height > obstacle.y
  ) {
    gameOver();
    return;
  }

  draw();
  requestAnimationFrame(update);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Vẽ nền đất
  ctx.fillStyle = "#3B7A57";
  ctx.fillRect(0, canvas.height - 30, canvas.width, 30);

  // Vẽ nhân vật
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Vẽ chướng ngại vật hình tam giác
  ctx.fillStyle = obstacle.color;
  ctx.beginPath();
  ctx.moveTo(obstacle.x, obstacle.y + obstacle.height);
  ctx.lineTo(obstacle.x + obstacle.width / 2, obstacle.y);
  ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
  ctx.closePath();
  ctx.fill();
}

function gameOver() {
  gameRunning = false;
  bgMusic.pause();
  document.getElementById("final-score").textContent = score;
  document.getElementById("game-over").style.display = "block";
  canvas.style.display = "none";
  document.getElementById("score").style.display = "none";
}
