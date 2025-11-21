const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-canvas');
const nextCtx = nextCanvas.getContext('2d');

const ROWS = 20;
const COLS = 10;
let BLOCK_SIZE = 30;

// 화면 크기에 따라 블록 크기 조정
function updateBlockSize() {
    if (window.innerWidth <= 480) {
        BLOCK_SIZE = 20;
        canvas.width = 200;
        canvas.height = 400;
    } else if (window.innerWidth <= 768) {
        BLOCK_SIZE = 25;
        canvas.width = 250;
        canvas.height = 500;
    } else {
        BLOCK_SIZE = 30;
        canvas.width = 300;
        canvas.height = 600;
    }
}

const COLORS = {
    I: '#00f0f0',
    O: '#f0f000',
    T: '#a000f0',
    S: '#00f000',
    Z: '#f00000',
    J: '#0000f0',
    L: '#f0a000'
};

const SHAPES = {
    I: [[1, 1, 1, 1]],
    O: [[1, 1], [1, 1]],
    T: [[0, 1, 0], [1, 1, 1]],
    S: [[0, 1, 1], [1, 1, 0]],
    Z: [[1, 1, 0], [0, 1, 1]],
    J: [[1, 0, 0], [1, 1, 1]],
    L: [[0, 0, 1], [1, 1, 1]]
};

let board = [];
let currentPiece = null;
let nextPiece = null;
let score = 0;
let level = 1;
let lines = 0;
let gameRunning = false;
let gamePaused = false;
let dropInterval;
let dropSpeed = 1000;

function initBoard() {
    board = Array(ROWS).fill().map(() => Array(COLS).fill(0));
}

function drawBlock(ctx, x, y, color, blockSize = BLOCK_SIZE) {
    ctx.fillStyle = color;
    ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(x * blockSize + 2, y * blockSize + 2, blockSize - 4, blockSize / 3);
}

function drawBoard() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            if (board[y][x]) {
                drawBlock(ctx, x, y, board[y][x]);
            }
        }
    }
}

function createPiece() {
    const types = Object.keys(SHAPES);
    const type = types[Math.floor(Math.random() * types.length)];
    return {
        type: type,
        shape: SHAPES[type],
        color: COLORS[type],
        x: Math.floor(COLS / 2) - Math.floor(SHAPES[type][0].length / 2),
        y: 0
    };
}

function drawPiece(piece, offsetX = 0, offsetY = 0) {
    piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                drawBlock(ctx, piece.x + x + offsetX, piece.y + y + offsetY, piece.color);
            }
        });
    });
}

function drawNextPiece() {
    nextCtx.fillStyle = '#000';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    
    if (nextPiece) {
        const blockSize = 25;
        const offsetX = (nextCanvas.width - nextPiece.shape[0].length * blockSize) / 2;
        const offsetY = (nextCanvas.height - nextPiece.shape.length * blockSize) / 2;
        
        nextPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    nextCtx.fillStyle = nextPiece.color;
                    nextCtx.fillRect(offsetX + x * blockSize, offsetY + y * blockSize, blockSize, blockSize);
                    nextCtx.strokeStyle = '#000';
                    nextCtx.lineWidth = 2;
                    nextCtx.strokeRect(offsetX + x * blockSize, offsetY + y * blockSize, blockSize, blockSize);
                }
            });
        });
    }
}

function collision(piece, offsetX = 0, offsetY = 0) {
    return piece.shape.some((row, y) => {
        return row.some((value, x) => {
            if (value) {
                const newX = piece.x + x + offsetX;
                const newY = piece.y + y + offsetY;
                return (
                    newX < 0 ||
                    newX >= COLS ||
                    newY >= ROWS ||
                    (newY >= 0 && board[newY][newX])
                );
            }
            return false;
        });
    });
}

function mergePiece() {
    currentPiece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value) {
                if (currentPiece.y + y >= 0) {
                    board[currentPiece.y + y][currentPiece.x + x] = currentPiece.color;
                }
            }
        });
    });
}

function clearLines() {
    let linesCleared = 0;
    
    for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            board.splice(y, 1);
            board.unshift(Array(COLS).fill(0));
            linesCleared++;
            y++;
        }
    }
    
    if (linesCleared > 0) {
        lines += linesCleared;
        score += [0, 40, 100, 300, 1200][linesCleared] * level;
        level = Math.floor(lines / 10) + 1;
        dropSpeed = Math.max(100, 1000 - (level - 1) * 100);
        updateDisplay();
        
        // 속도 변경 시 interval 재설정
        if (gameRunning && !gamePaused) {
            clearInterval(dropInterval);
            dropInterval = setInterval(gameLoop, dropSpeed);
        }
    }
}

function rotate() {
    const rotated = currentPiece.shape[0].map((_, i) =>
        currentPiece.shape.map(row => row[i]).reverse()
    );
    
    const previousShape = currentPiece.shape;
    currentPiece.shape = rotated;
    
    if (collision(currentPiece)) {
        currentPiece.shape = previousShape;
    }
}

function moveDown() {
    if (!collision(currentPiece, 0, 1)) {
        currentPiece.y++;
    } else {
        mergePiece();
        clearLines();
        currentPiece = nextPiece;
        nextPiece = createPiece();
        drawNextPiece();
        
        if (collision(currentPiece)) {
            gameOver();
        }
    }
}

function moveLeft() {
    if (!collision(currentPiece, -1, 0)) {
        currentPiece.x--;
    }
}

function moveRight() {
    if (!collision(currentPiece, 1, 0)) {
        currentPiece.x++;
    }
}

function hardDrop() {
    while (!collision(currentPiece, 0, 1)) {
        currentPiece.y++;
        score += 2;
    }
    updateDisplay();
    moveDown();
}

function updateDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('lines').textContent = lines;
}

function gameLoop() {
    if (!gameRunning || gamePaused) return;
    
    moveDown();
    drawBoard();
    drawPiece(currentPiece);
}

function startGame() {
    if (gameRunning && !gamePaused) return;
    
    if (!gameRunning) {
        initBoard();
        score = 0;
        level = 1;
        lines = 0;
        dropSpeed = 1000;
        currentPiece = createPiece();
        nextPiece = createPiece();
        updateDisplay();
        drawNextPiece();
        document.getElementById('game-over').classList.add('hidden');
    }
    
    gameRunning = true;
    gamePaused = false;
    
    clearInterval(dropInterval);
    dropInterval = setInterval(gameLoop, dropSpeed);
    
    document.getElementById('start-btn').textContent = 'PAUSE';
}

function pauseGame() {
    if (!gameRunning) return;
    
    gamePaused = !gamePaused;
    
    if (gamePaused) {
        clearInterval(dropInterval);
        document.getElementById('start-btn').textContent = 'RESUME';
    } else {
        dropInterval = setInterval(gameLoop, dropSpeed);
        document.getElementById('start-btn').textContent = 'PAUSE';
    }
}

function gameOver() {
    gameRunning = false;
    gamePaused = false;
    clearInterval(dropInterval);
    document.getElementById('game-over').classList.remove('hidden');
    document.getElementById('start-btn').textContent = 'START';
}

// 키보드 컨트롤
document.addEventListener('keydown', (e) => {
    if (!gameRunning || gamePaused) return;
    
    switch(e.key) {
        case 'ArrowLeft':
            moveLeft();
            break;
        case 'ArrowRight':
            moveRight();
            break;
        case 'ArrowDown':
            moveDown();
            score += 1;
            updateDisplay();
            break;
        case 'ArrowUp':
            rotate();
            break;
        case ' ':
            e.preventDefault();
            hardDrop();
            break;
    }
    
    drawBoard();
    drawPiece(currentPiece);
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'p' || e.key === 'P') {
        pauseGame();
    }
});

// 터치 컨트롤
document.getElementById('left-btn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameRunning && !gamePaused) {
        moveLeft();
        drawBoard();
        drawPiece(currentPiece);
    }
});

document.getElementById('right-btn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameRunning && !gamePaused) {
        moveRight();
        drawBoard();
        drawPiece(currentPiece);
    }
});

document.getElementById('down-btn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameRunning && !gamePaused) {
        moveDown();
        score += 1;
        updateDisplay();
        drawBoard();
        drawPiece(currentPiece);
    }
});

document.getElementById('rotate-btn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameRunning && !gamePaused) {
        rotate();
        drawBoard();
        drawPiece(currentPiece);
    }
});

document.getElementById('drop-btn').addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameRunning && !gamePaused) {
        hardDrop();
        drawBoard();
        drawPiece(currentPiece);
    }
});

// 마우스 클릭도 지원
document.getElementById('left-btn').addEventListener('click', (e) => {
    if (gameRunning && !gamePaused) {
        moveLeft();
        drawBoard();
        drawPiece(currentPiece);
    }
});

document.getElementById('right-btn').addEventListener('click', (e) => {
    if (gameRunning && !gamePaused) {
        moveRight();
        drawBoard();
        drawPiece(currentPiece);
    }
});

document.getElementById('down-btn').addEventListener('click', (e) => {
    if (gameRunning && !gamePaused) {
        moveDown();
        score += 1;
        updateDisplay();
        drawBoard();
        drawPiece(currentPiece);
    }
});

document.getElementById('rotate-btn').addEventListener('click', (e) => {
    if (gameRunning && !gamePaused) {
        rotate();
        drawBoard();
        drawPiece(currentPiece);
    }
});

document.getElementById('drop-btn').addEventListener('click', (e) => {
    if (gameRunning && !gamePaused) {
        hardDrop();
        drawBoard();
        drawPiece(currentPiece);
    }
});

document.getElementById('start-btn').addEventListener('click', () => {
    if (!gameRunning) {
        startGame();
    } else {
        pauseGame();
    }
});

// 화면 크기 변경 시 대응
window.addEventListener('resize', () => {
    updateBlockSize();
    drawBoard();
    if (currentPiece) {
        drawPiece(currentPiece);
    }
});

// 초기화
updateBlockSize();
initBoard();
drawBoard();
drawNextPiece();
