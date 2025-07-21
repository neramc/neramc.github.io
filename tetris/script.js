const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 20;

context.scale(BLOCK_SIZE, BLOCK_SIZE);

let score = 0;
let grid = createGrid();
let activePiece = createPiece();

const COLORS = [
    null, '#e74c3c', '#8e44ad', '#3498db', '#e67e22', '#2ecc71', '#f1c40f', '#1abc9c'
];

function createGrid() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function createPiece() {
    const type = 'IOTJLSZ'[Math.floor(Math.random() * 7)];
    let matrix;
    if (type === 'I') matrix = [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]];
    else if (type === 'O') matrix = [[2, 2], [2, 2]];
    else if (type === 'T') matrix = [[0, 3, 0], [3, 3, 3], [0, 0, 0]];
    else if (type === 'J') matrix = [[0, 4, 0], [0, 4, 0], [4, 4, 0]];
    else if (type === 'L') matrix = [[0, 5, 0], [0, 5, 0], [0, 5, 5]];
    else if (type === 'S') matrix = [[0, 6, 6], [6, 6, 0], [0, 0, 0]];
    else if (type === 'Z') matrix = [[7, 7, 0], [0, 7, 7], [0, 0, 0]];
    
    return { x: Math.floor(COLS / 2) - 1, y: 0, matrix: matrix };
}

function isValidMove(matrix, offsetX, offsetY) {
    for (let y = 0; y < matrix.length; y++) {
        for (let x = 0; x < matrix[y].length; x++) {
            if (matrix[y][x] !== 0) {
                let newX = offsetX + x;
                let newY = offsetY + y;
                if (newX < 0 || newX >= COLS || newY >= ROWS || (grid[newY] && grid[newY][newX] !== 0)) {
                    return false;
                }
            }
        }
    }
    return true;
}

function merge(piece) {
    piece.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                grid[piece.y + y][piece.x + x] = value;
            }
        });
    });
}

function rotate(piece) {
    const matrix = piece.matrix;
    const N = matrix.length;
    const result = matrix.map((_, i) => matrix.map(col => col[i]));
    result.forEach(row => row.reverse());
    if (isValidMove(result, piece.x, piece.y)) {
        piece.matrix = result;
    }
}

function clearLines() {
    let linesCleared = 0;
    outer: for (let y = ROWS - 1; y >= 0; y--) {
        for (let x = 0; x < COLS; x++) {
            if (grid[y][x] === 0) {
                continue outer;
            }
        }
        const row = grid.splice(y, 1)[0].fill(0);
        grid.unshift(row);
        y++;
        linesCleared++;
    }
    score += linesCleared * 100 * linesCleared; // 보너스 점수
    scoreElement.innerText = score;
}

function pieceDrop() {
    activePiece.y++;
    if (!isValidMove(activePiece.matrix, activePiece.x, activePiece.y)) {
        activePiece.y--;
        merge(activePiece);
        clearLines();
        activePiece = createPiece();
        if (!isValidMove(activePiece.matrix, activePiece.x, activePiece.y)) {
            alert('Game Over! Score: ' + score);
            grid = createGrid();
            score = 0;
        }
    }
    dropCounter = 0;
}

function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(grid, { x: 0, y: 0 });
    drawMatrix(activePiece.matrix, { x: activePiece.x, y: activePiece.y });
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = COLORS[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        pieceDrop();
    }
    draw();
    requestAnimationFrame(update);
}

// Controls
function move(dir) {
    if (isValidMove(activePiece.matrix, activePiece.x + dir, activePiece.y)) {
        activePiece.x += dir;
    }
}

document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') move(-1);
    else if (e.key === 'ArrowRight') move(1);
    else if (e.key === 'ArrowDown') pieceDrop();
    else if (e.key === 'ArrowUp') rotate(activePiece);
});

document.getElementById('left').addEventListener('touchstart', (e) => { e.preventDefault(); move(-1); });
document.getElementById('right').addEventListener('touchstart', (e) => { e.preventDefault(); move(1); });
document.getElementById('down').addEventListener('touchstart', (e) => { e.preventDefault(); pieceDrop(); });
document.getElementById('rotate').addEventListener('touchstart', (e) => { e.preventDefault(); rotate(activePiece); });

update();
