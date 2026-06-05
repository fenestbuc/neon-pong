const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 80;
const BALL_RADIUS = 8;
const PADDLE_SPEED = 400;
const BALL_SPEED = 300;
const WIN_SCORE = 10;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set actual canvas size
function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio, 2);
  canvas.width = CANVAS_WIDTH * dpr;
  canvas.height = CANVAS_HEIGHT * dpr;
  canvas.style.width = CANVAS_WIDTH + 'px';
  canvas.style.height = CANVAS_HEIGHT + 'px';
  ctx.scale(dpr, dpr);
}
resizeCanvas();

// Game state
let state = 'MENU';
let playerScore = 0;
let aiScore = 0;
let countdown = 0;
let countdownTimer = null;

// Entities
const player = { x: 20, y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2, width: PADDLE_WIDTH, height: PADDLE_HEIGHT };
const ai = { x: CANVAS_WIDTH - 20 - PADDLE_WIDTH, y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2, width: PADDLE_WIDTH, height: PADDLE_HEIGHT };
const ball = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, vx: 0, vy: 0, radius: BALL_RADIUS };

// Input
let mouseY = null;
let touchY = null;
const keys = new Set();

document.addEventListener('keydown', e => {
  keys.add(e.key);
  if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
    if (state === 'PLAYING') setState('PAUSED');
    else if (state === 'PAUSED') setState('PLAYING');
  }
});
document.addEventListener('keyup', e => keys.delete(e.key));
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  mouseY = e.clientY - rect.top;
});
canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  touchY = e.touches[0].clientY - rect.top;
}, { passive: false });

// Serve ball
function serveBall(towardPlayer = true) {
  ball.x = CANVAS_WIDTH / 2;
  ball.y = CANVAS_HEIGHT / 2;
  const angle = (Math.random() * Math.PI / 2) - Math.PI / 4;
  ball.vx = BALL_SPEED * Math.cos(angle) * (towardPlayer ? -1 : 1);
  ball.vy = BALL_SPEED * Math.sin(angle);
}

// Update paddle position
function updatePaddle(paddle, targetY, dt) {
  const center = paddle.y + paddle.height / 2;
  const diff = targetY - center;
  const move = Math.sign(diff) * Math.min(Math.abs(diff), PADDLE_SPEED * dt);
  paddle.y += move;
  paddle.y = Math.max(0, Math.min(CANVAS_HEIGHT - paddle.height, paddle.y));
}

// AI difficulty
let difficulty = 'medium';
function getAiTarget() {
  if (difficulty === 'easy') {
    if (Math.random() < 0.3) return ai.y + ai.height / 2;
    return ball.y;
  }
  if (difficulty === 'medium') {
    if (Math.random() < 0.15) return ball.y + 40;
    return ball.y;
  }
  return ball.y;
}

// Game loop
let lastTime = 0;
function gameLoop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;

  if (state === 'PLAYING') {
    update(dt);
  }
  render();
  requestAnimationFrame(gameLoop);
}

function update(dt) {
  // Move ball
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  // Wall bounces
  if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= CANVAS_HEIGHT) {
    ball.vy = -ball.vy;
    ball.y = Math.max(ball.radius, Math.min(CANVAS_HEIGHT - ball.radius, ball.y));
  }

  // Paddle collisions
  if (ball.vx < 0 && ball.x - ball.radius <= player.x + player.width &&
      ball.y >= player.y && ball.y <= player.y + player.height &&
      ball.x > player.x) {
    ball.vx = -ball.vx * 1.05;
    const offset = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
    ball.vy += offset * 100;
  }

  if (ball.vx > 0 && ball.x + ball.radius >= ai.x &&
      ball.y >= ai.y && ball.y <= ai.y + ai.height &&
      ball.x < ai.x + ai.width) {
    ball.vx = -ball.vx * 1.05;
    const offset = (ball.y - (ai.y + ai.height / 2)) / (ai.height / 2);
    ball.vy += offset * 100;
  }

  // Scoring
  if (ball.x < 0) {
    aiScore++;
    checkWin();
    serveBall(true);
  }
  if (ball.x > CANVAS_WIDTH) {
    playerScore++;
    checkWin();
    serveBall(false);
  }

  // Player input
  let targetY = player.y + player.height / 2;
  if (keys.has('w') || keys.has('ArrowUp')) targetY -= 100;
  if (keys.has('s') || keys.has('ArrowDown')) targetY += 100;
  if (mouseY !== null) targetY = mouseY;
  if (touchY !== null) targetY = touchY;
  updatePaddle(player, targetY, dt);

  // AI
  const aiTarget = getAiTarget();
  const aiSpeed = difficulty === 'easy' ? 200 : difficulty === 'hard' ? 500 : 350;
  const aiCenter = ai.y + ai.height / 2;
  const aiDiff = aiTarget - aiCenter;
  const aiMove = Math.sign(aiDiff) * Math.min(Math.abs(aiDiff), aiSpeed * dt);
  ai.y += aiMove;
  ai.y = Math.max(0, Math.min(CANVAS_HEIGHT - ai.height, ai.y));
}

function checkWin() {
  if (playerScore >= WIN_SCORE || aiScore >= WIN_SCORE) {
    state = 'GAME_OVER';
    showScreen('game-over');
    document.getElementById('result-text').textContent = playerScore >= WIN_SCORE ? 'YOU WIN!' : 'GAME OVER';
    document.getElementById('final-score').textContent = `${playerScore} — ${aiScore}`;
  }
}

// Rendering
function render() {
  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Center line
  ctx.strokeStyle = '#1a1a2e';
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH / 2, 0);
  ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT);
  ctx.stroke();
  ctx.setLineDash([]);

  // Paddles
  ctx.shadowBlur = 15;
  ctx.shadowColor = '#00ffff';
  ctx.fillStyle = '#00ffff';
  ctx.fillRect(player.x, player.y, player.width, player.height);

  ctx.shadowColor = '#ff00ff';
  ctx.fillStyle = '#ff00ff';
  ctx.fillRect(ai.x, ai.y, ai.width, ai.height);

  // Ball
  ctx.shadowColor = '#ff00ff';
  ctx.fillStyle = '#ff00ff';
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 0;

  // Score
  ctx.fillStyle = '#ffffff';
  ctx.font = '48px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(playerScore, CANVAS_WIDTH / 4, 60);
  ctx.fillText(aiScore, CANVAS_WIDTH * 3 / 4, 60);

  // Countdown
  if (state === 'COUNTDOWN' && countdown > 0) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '120px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(countdown, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
  }
}

// UI Management
function setState(newState) {
  state = newState;
 
  if (newState === 'MENU') {
    showScreen('title-screen');
    playerScore = 0;
    aiScore = 0;
  } else if (newState === 'COUNTDOWN') {
    hideAllScreens();
    countdown = 3;
    const interval = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(interval);
        setState('PLAYING');
        serveBall(Math.random() < 0.5);
      }
    }, 1000);
  } else if (newState === 'PLAYING') {
    hideAllScreens();
  } else if (newState === 'PAUSED') {
    showScreen('pause-menu');
  } else if (newState === 'GAME_OVER') {
    showScreen('game-over');
  }
}

function showScreen(id) {
  hideAllScreens();
  document.getElementById(id).classList.add('active');
}

function hideAllScreens() {
  document.querySelectorAll('.overlay').forEach(el => el.classList.remove('active'));
}

// Button handlers
document.getElementById('btn-start').addEventListener('click', () => {
  difficulty = document.getElementById('difficulty-select')?.value || 'medium';
  setState('COUNTDOWN');
});

document.getElementById('btn-resume').addEventListener('click', () => setState('PLAYING'));
document.getElementById('btn-quit').addEventListener('click', () => setState('MENU'));
document.getElementById('btn-play-again').addEventListener('click', () => {
  playerScore = 0;
  aiScore = 0;
  setState('COUNTDOWN');
});
document.getElementById('btn-menu').addEventListener('click', () => setState('MENU'));
document.getElementById('btn-leaderboard').addEventListener('click', () => showScreen('leaderboard'));
document.getElementById('btn-leaderboard-back').addEventListener('click', () => setState('MENU'));
document.getElementById('btn-settings').addEventListener('click', () => showScreen('settings'));
document.getElementById('btn-settings-back').addEventListener('click', () => setState('MENU'));
document.getElementById('btn-settings-save').addEventListener('click', () => {
  const name = document.getElementById('player-name').value;
  if (name) localStorage.setItem('player_name', name);
  setState('MENU');
});

// Load saved name
const savedName = localStorage.getItem('player_name');
if (savedName) document.getElementById('player-name').value = savedName;

// Start loop
requestAnimationFrame(gameLoop);
