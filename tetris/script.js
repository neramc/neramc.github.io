const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const nextCanvas = document.getElementById('next');
const nextContext = nextCanvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverScreen = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const restartButton = document.getElementById('restart');

context.scale(30, 30); // 메인 캔버스: 각 블록 30x30px
nextContext.scale(30, 30); // 미리보기 캔버스: 각 블록 30x30px

// 테트리스 보드
const board = Array.from({ length: 20 }, () => Array(10).fill(0));

// 테트리미노 정의
const tetrominoes = [
    [[1, 1, 1, 1]], // I
    [[1, 1], [1, 1]], // O
    [[0, 1, 0], [1, 1, 1]], // T
    [[1, 1, 0], [0, 1, 1]], // S
    [[0, 1, 1], [1, 1, 0]], // Z
    [[1, 0, 0], [1, 1, 1]], // J
    [[0, 0, 1], [1, 1, 1]] // L
];

// 색상 정의
const colors = [
    null,
    'cyan',
    'yellow',
    'purple',
    'green',
    'red',
    'blue',
    'orange'
];

let currentPiece = null;
let nextPiece = null;
let score = 0;
let dropCounter = 0;
let dropInterval = 1000; // 1초마다 떨어짐
let lastTime = 0;
let gameOver = false;

// 새로운 테트리미노 생성
function createPiece() {
    const typeId = Math.floor(Math.random() * tetrominoes.length) + 1;
    return {
        matrix: tetrominoes[typeId - 1],
        x: Math.floor((10 - tetrominoes[typeId - 1][0].length) / 2),
        y: 0,
        typeId
    };
}

// 충돌 감지
function collide(board, piece) {
    for (let y = 0; y < piece.matrix.length; y++) {
        for (let x = 0; x < piece.matrix[y].length; x++) {
            if (piece.matrix[y][x] &&
                (board[piece.y + y] && board[piece.y + y][piece.x + x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

// 보드에 테트리미노 병합
function merge(board, piece) {
    for (let y = 0; y < piece.matrix.length; y++) {
        for (let x = 0; x < piece.matrix[y].length; x++) {
            if (piece.matrix[y][x]) {
                board[piece.y + y][piece.x + x] = piece.typeId;
            }
        }
    }
}

// 줄 지우기
function clearLines() {
    let linesCleared = 0;
    outer: for (let y = board.length - 1; y >= 0; y--) {
        for (let x = 0; x < board[y].length; x++) {
            if (!board[y][x]) {
                continue outer;
            }
        }
        board.splice(y, 1);
        board.unshift(Array(10).fill(0));
        linesCleared++;
    }
    score += linesCleared * 100;
    scoreElement.textContent = score;
}

// 메인 보드 그리기
function drawBoard() {
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width / 30, canvas.height / 30);

    for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 10; x++) {
            if (board[y][x]) {
                context.fillStyle = colors[board[y][x]];
                context.fillRect(x, y, 1, 1);
            }
        }
    }

    if (currentPiece && !gameOver) {
        context.fillStyle = colors[currentPiece.typeId];
        for (let y = 0; y < currentPiece.matrix.length; y++) {
            for (let x = 0; x < currentPiece.matrix[y].length; x++) {
                if (currentPiece.matrix[y][x]) {
                    context.fillRect(currentPiece.x + x, currentPiece.y + y, 1, 1);
                }
            }
        }
    }
}

// 다음 블록 그리기
function drawNextPiece() {
    nextContext.fillStyle = '#fff';
    nextContext.fillRect(0, 0, nextCanvas.width / 30, nextCanvas.height / 30);

    if (nextPiece && !gameOver) {
        nextContext.fillStyle = colors[nextPiece.typeId];
        const offsetX = (4 - nextPiece.matrix[0].length) / 2; // 중앙 정렬
        const offsetY = (4 - nextPiece.matrix.length) / 2;
        for (let y = 0; y < nextPiece.matrix.length; y++) {
            for (let x = 0; x < nextPiece.matrix[y].length; x++) {
                if (nextPiece.matrix[y][x]) {
                    nextContext.fillRect(x + offsetX, y + offsetY, 1, 1);
                }
            }
        }
    }
}

// 전체 그리기
function draw() {
    drawBoard();
    drawNextPiece();
}

// 테트리미노 회전
function rotate(piece) {
    const matrix = piece.matrix;
    const n = matrix.length;
    const result = Array.from({ length: n }, () => Array(n).fill(0));
    for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
            result[x][n - 1 - y] = matrix[y][x];
        }
    }
    return result;
}

// 게임 오버 처리
function showGameOver() {
    gameOver = true;
    finalScoreElement.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

// 게임 재시작
function restartGame() {
    board.forEach(row => row.fill(0));
    score = 0;
    scoreElement.textContent = score;
    currentPiece = createPiece();
    nextPiece = createPiece();
    gameOver = false;
    gameOverScreen.classList.add('hidden');
    dropCounter = 0;
    lastTime = 0;
    update();
}

// 게임 업데이트
function update(time = 0) {
    if (gameOver) return;

    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;

    if (dropCounter > dropInterval) {
        currentPiece.y++;
        if (collide(board, currentPiece)) {
            currentPiece.y--;
            merge(board, currentPiece);
            clearLines();
            currentPiece = nextPiece;
            nextPiece = createPiece();
            if (collide(board, currentPiece)) {
                showGameOver();
                return;
            }
        }
        dropCounter = 0;
    }

    draw();
    requestAnimationFrame(update);
}

// 키보드 입력 처리
document.addEventListener('keydown', event => {
    if (gameOver || !currentPiece) return;

    if (event.key === 'ArrowLeft') {
        currentPiece.x--;
        if (collide(board, currentPiece)) {
            currentPiece.x++;
        }
    } else if (event.key === 'ArrowRight') {
        currentPiece.x++;
        if (collide(board, currentPiece)) {
            currentPiece.x--;
        }
    } else if (event.key === 'ArrowDown') {
        currentPiece.y++;
        if (collide(board, currentPiece)) {
            currentPiece.y--;
            merge(board, currentPiece);
            clearLines();
            currentPiece = nextPiece;
            nextPiece = createPiece();
            if (collide(board, currentPiece)) {
                showGameOver();
                return;
            }
        }
        dropCounter = 0;
    } else if (event.key === 'ArrowUp') {
        const originalMatrix = currentPiece.matrix;
        currentPiece.matrix = rotate(currentPiece);
        if (collide(board, currentPiece)) {
            currentPiece.matrix = originalMatrix;
        }
    } else if (event.key === ' ') {
        while (!collide(board, currentPiece)) {
            currentPiece.y++;
        }
        currentPiece.y--;
        merge(board, currentPiece);
        clearLines();
        currentPiece = nextPiece;
        nextPiece = createPiece();
        if (collide(board, currentPiece)) {
            showGameOver();
            return;
        }
        dropCounter = 0;
    }
    draw();
});

// 재시작 버튼 이벤트
restartButton.addEventListener('click', restartGame);

// 게임 시작
currentPiece = createPiece();
nextPiece = createPiece();
update();
