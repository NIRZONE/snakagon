const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const box = 20; // size of one block
let direction = 'RIGHT';
let running = false;
let paused = false;
let snake = [];
let food = {};
let score = 0;
const scoreDisplay = document.getElementById('score');
const restartBtn = document.getElementById('restartBtn');
let gameInterval = null;
let speed = 30; // ms per move

let lastTouchX = null, lastTouchY = null;

function initGame() {
    snake = [{x: 8, y: 10}, {x: 7, y: 10}];
    direction = 'RIGHT';
    running = true;
    paused = false;
    score = 0;
    placeFood();
    scoreDisplay.textContent = "Score: 0";
    restartBtn.style.display = 'none';
    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, speed);
    draw(); // Draw initial state
}

function placeFood() {
    while (true) {
        food = {
            x: Math.floor(Math.random() * (canvas.width / box)),
            y: Math.floor(Math.random() * (canvas.height / box))
        };
        if (!snake.some(seg => seg.x === food.x && seg.y === food.y)) break;
    }
}

function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * box, y * box, box - 2, box - 2);
}

function drawPaused() {
    ctx.font = "40px Arial";
    ctx.fillStyle = "#fff";
    ctx.globalAlpha = 0.7;
    ctx.fillRect(0, canvas.height / 2 - 40, canvas.width, 60);
    ctx.globalAlpha = 1.0;
    ctx.fillStyle = "#222";
    ctx.fillText("Paused", canvas.width / 2 - 65, canvas.height / 2);
}

function draw() {
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawBlock(food.x, food.y, '#ff5252');
    snake.forEach((seg, i) => {
        drawBlock(seg.x, seg.y, i === 0 ? '#aaffaa' : '#68ef68');
    });
    if (paused) {
        drawPaused();
    }
}

function gameLoop() {
    if (!running) return;
    if (paused) {
        draw(); // Show paused overlay
        return;
    }
    let head = {...snake[0]};
    if (direction === 'LEFT') head.x--;
    else if (direction === 'RIGHT') head.x++;
    else if (direction === 'UP') head.y--;
    else if (direction === 'DOWN') head.y++;
    if (
        head.x < 0 || head.x >= canvas.width / box ||
        head.y < 0 || head.y >= canvas.height / box ||
        snake.some(seg => seg.x === head.x && seg.y === head.y)
    ) {
        running = false;
        scoreDisplay.textContent = `Game Over! Final Score: ${score}`;
        restartBtn.style.display = 'block';
        clearInterval(gameInterval);
        return;
    }
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        score += 1;
        scoreDisplay.textContent = `Score: ${score}`;
        placeFood();
    } else {
        snake.pop();
    }
    draw();
}

// Keyboard controls
window.addEventListener('keydown', function(e) {
    if (!running) return;
    // Prevent scrolling with arrow keys
    if (["ArrowLeft", "ArrowUp", "ArrowRight", "ArrowDown"].includes(e.key)) e.preventDefault();
    if ((e.key === 'ArrowLeft' || e.key === 'a') && direction !== 'RIGHT') direction = 'LEFT';
    else if ((e.key === 'ArrowUp' || e.key === 'w') && direction !== 'DOWN') direction = 'UP';
    else if ((e.key === 'ArrowRight' || e.key === 'd') && direction !== 'LEFT') direction = 'RIGHT';
    else if ((e.key === 'ArrowDown' || e.key === 's') && direction !== 'UP') direction = 'DOWN';
    else if (e.code === 'Space') {
        paused = !paused;
        draw(); // Show/hide pause overlay immediately
    }
});

// Touch controls for mobile
canvas.addEventListener('touchstart', function(e) {
    if (!running) return;
    const touch = e.touches[0];
    lastTouchX = touch.clientX;
    lastTouchY = touch.clientY;
}, false);

canvas.addEventListener('touchmove', function(e) {
    if (!running || lastTouchX === null || lastTouchY === null) return;
    const touch = e.touches[0];
    const dx = touch.clientX - lastTouchX;
    const dy = touch.clientY - lastTouchY;
    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0 && direction !== 'LEFT') direction = 'RIGHT';
        else if (dx < 0 && direction !== 'RIGHT') direction = 'LEFT';
    } else {
        if (dy > 0 && direction !== 'UP') direction = 'DOWN';
        else if (dy < 0 && direction !== 'DOWN') direction = 'UP';
    }
    lastTouchX = null;
    lastTouchY = null;
}, false);

restartBtn.addEventListener('click', initGame);

window.onload = initGame;
