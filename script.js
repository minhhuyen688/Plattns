const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Nhân vật
let player = {
  x: 50,
  y: 300,
  width: 30,
  height: 30,
  color: "pink",
  velocityY: 0,
  jumpForce: 12,
  grounded: false
};

// Chướng ngại vật
let obstacle = {
  x: 400,
  y: 340,
  width: 30,
  height: 30,
  color: "red"
};

let gravity = 0.8;

// Phím điều khiển
document.addEventListener("keydown", function (e) {
  if (e.code === "Space" && player.grounded) {
    player.velocityY = -player.jumpForce;
    player.grounded = false;
  }
});

function update() {
  // Trọng lực
  player.velocityY += gravity;
  player.y += player.velocityY;

  // Va chạm đất
  if (player.y + player.height >= canvas.height - 30) {
    player.y = canvas.height - 30 - player.height;
    player.velocityY = 0;
    player.grounded = true;
  }

  // Kiểm tra va chạm với chướng ngại vật
  if (
    player.x < obstacle.x + obstacle.width &&
    player.x + player.width > obstacle.x &&
    player.y < obstacle.y + obstacle.height &&
    player.y + player.height > obstacle.y
  ) {
    alert("💥 Game Over! Làm lại nhé!");
    document.location.reload();
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

  // Vẽ chướng ngại vật
  ctx.fillStyle = obstacle.color;
  ctx.beginPath();
  ctx.moveTo(obstacle.x, obstacle.y + obstacle.height);
  ctx.lineTo(obstacle.x + obstacle.width / 2, obstacle.y);
  ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
  ctx.closePath();
  ctx.fill();
}

update();
