// Pong Game Implementation

// Canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 16;
const PLAYER_MARGIN = 20;
const AI_MARGIN = 20;
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

// Game state
let playerPaddle = {
  x: PLAYER_MARGIN,
  y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT
};

let aiPaddle = {
  x: CANVAS_WIDTH - AI_MARGIN - PADDLE_WIDTH,
  y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
  width: PADDLE_WIDTH,
  height: PADDLE_HEIGHT,
  speed: 4
};

let ball = {
  x: CANVAS_WIDTH / 2 - BALL_SIZE / 2,
  y: CANVAS_HEIGHT / 2 - BALL_SIZE / 2,
  size: BALL_SIZE,
  speedX: 5 * (Math.random() > 0.5 ? 1 : -1),
  speedY: 3 * (Math.random() > 0.5 ? 1 : -1)
};

let playerScore = 0;
let aiScore = 0;

// Mouse movement controls left paddle
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseY = e.clientY - rect.top;
  playerPaddle.y = mouseY - playerPaddle.height / 2;
  // Clamp within bounds
  playerPaddle.y = Math.max(0, Math.min(CANVAS_HEIGHT - playerPaddle.height, playerPaddle.y));
});

// Draw functions
function drawRect(x, y, w, h, color = "#fff") {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function drawBall(x, y, size, color = "#fff") {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();
}

function drawNet() {
  ctx.strokeStyle = "#555";
  ctx.lineWidth = 4;
  for (let y = 0; y < CANVAS_HEIGHT; y += 30) {
    ctx.beginPath();
    ctx.moveTo(CANVAS_WIDTH / 2, y);
    ctx.lineTo(CANVAS_WIDTH / 2, y + 15);
    ctx.stroke();
  }
}

function drawScore() {
  ctx.font = "32px Arial";
  ctx.fillStyle = "#fff";
  ctx.fillText(playerScore, CANVAS_WIDTH / 4, 40);
  ctx.fillText(aiScore, CANVAS_WIDTH * 3 / 4, 40);
}

function resetBall() {
  ball.x = CANVAS_WIDTH / 2 - BALL_SIZE / 2;
  ball.y = CANVAS_HEIGHT / 2 - BALL_SIZE / 2;
  ball.speedX = 5 * (Math.random() > 0.5 ? 1 : -1);
  ball.speedY = 3 * (Math.random() > 0.5 ? 1 : -1);
}

// Collision detection
function checkCollision(paddle, ball) {
  return (
    ball.x < paddle.x + paddle.width &&
    ball.x + ball.size > paddle.x &&
    ball.y < paddle.y + paddle.height &&
    ball.y + ball.size > paddle.y
  );
}

// AI paddle movement
function moveAIPaddle() {
  const paddleCenter = aiPaddle.y + aiPaddle.height / 2;
  const ballCenter = ball.y + ball.size / 2;
  if (ballCenter < paddleCenter - 10) {
    aiPaddle.y -= aiPaddle.speed;
  } else if (ballCenter > paddleCenter + 10) {
    aiPaddle.y += aiPaddle.speed;
  }
  // Clamp within bounds
  aiPaddle.y = Math.max(0, Math.min(CANVAS_HEIGHT - aiPaddle.height, aiPaddle.y));
}

// Update game state
function update() {
  // Move ball
  ball.x += ball.speedX;
  ball.y += ball.speedY;

  // Top and bottom wall collision
  if (ball.y <= 0 || ball.y + ball.size >= CANVAS_HEIGHT) {
    ball.speedY *= -1;
  }

  // Player paddle collision
  if (checkCollision(playerPaddle, ball)) {
    ball.x = playerPaddle.x + playerPaddle.width; // Prevent sticking
    ball.speedX *= -1;
    // Add a little "spin"
    let collidePoint = (ball.y + ball.size / 2) - (playerPaddle.y + playerPaddle.height / 2);
    collidePoint = collidePoint / (playerPaddle.height / 2);
    ball.speedY = 4 * collidePoint;
  }

  // AI paddle collision
  if (checkCollision(aiPaddle, ball)) {
    ball.x = aiPaddle.x - ball.size; // Prevent sticking
    ball.speedX *= -1;
    // Add a little "spin"
    let collidePoint = (ball.y + ball.size / 2) - (aiPaddle.y + aiPaddle.height / 2);
    collidePoint = collidePoint / (aiPaddle.height / 2);
    ball.speedY = 4 * collidePoint;
  }

  // Score for AI
  if (ball.x <= 0) {
    aiScore++;
    resetBall();
  }

  // Score for player
  if (ball.x + ball.size >= CANVAS_WIDTH) {
    playerScore++;
    resetBall();
  }

  moveAIPaddle();
}

// Game loop
function gameLoop() {
  // Update state
  update();

  // Draw everything
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawNet();
  drawScore();
  drawRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height);
  drawRect(aiPaddle.x, aiPaddle.y, aiPaddle.width, aiPaddle.height);
  drawBall(ball.x, ball.y, ball.size);

  requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
