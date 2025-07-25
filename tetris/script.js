const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const nextCanvas = document.getElementById('nextCanvas');
const nextCtx = nextCanvas.getContext('2d');

const COLS = 10, ROWS = 20, BLOCK_SIZE = 24;
canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;

const colors = [
  null,
  '#0ff', '#00f', '#ffa500', '#ff0', '#0f0', '#f0f', '#f00'
];

const SHAPES = [
  [],
  [[[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],[[0,0,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0]]],
  [[[2,0,0],[2,2,2],[0,0,0]],[[0,2,2],[0,2,0],[0,2,0]],[[0,0,0],[2,2,2],[0,0,2]],[[0,2,0],[0,2,0],[2,2,0]]],
  [[[0,0,3],[3,3,3],[0,0,0]],[[0,3,0],[0,3,0],[0,3,3]],[[0,0,0],[3,3,3],[3,0,0]],[[3,3,0],[0,3,0],[0,3,0]]],
  [[[4,4],[4,4]]],
  [[[0,5,5],[5,5,0],[0,0,0]],[[0,5,0],[0,5,5],[0,0,5]]],
  [[[0,6,0],[6,6,6],[0,0,0]],[[0,6,0],[0,6,6],[0,6,0]],[[0,0,0],[6,6,6],[0,6,0]],[[0,6,0],[6,6,0],[0,6,0]]],
  [[[7,7,0],[0,7,7],[0,0,0]],[[0,0,7],[0,7,7],[0,7,0]]]
];

class Piece {
  constructor(type) {
    this.type = type;
    this.shapes = SHAPES[type];
    this.rotation = 0;
    this.shape = this.shapes[this.rotation];
    this.x = Math.floor((COLS - this.shape[0].length) / 2);
    this.y = 0;
  }
  rotate() {
    const nextRot = (this.rotation + 1) % this.shapes.length;
    const nextShape = this.shapes[nextRot];
    if (!collide(arena, nextShape, this.x, this.y)) {
      this.rotation = nextRot;
      this.shape = nextShape;
    }
  }
}

function createMatrix(w, h) {
  const matrix = [];
  while (h--) matrix.push(new Array(w).fill(0));
  return matrix;
}

function collide(arena, shape, x, y) {
  for (let row = 0; row < shape.length; row++) {
    for (let col = 0; col < shape[row].length; col++) {
      if (shape[row][col] &&
          (arena[row + y] && arena[row + y][col + x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function merge(arena, piece) {
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) arena[y + piece.y][x + piece.x] = value;
    });
  });
}

function sweep() {
  let rowCount = 1;
  let scored = false;

  outer: for (let y = ROWS - 1; y >= 0; --y) {
    for (let x = 0; x < COLS; ++x) {
      if (arena[y][x] === 0) continue outer;
    }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    ++y;
    score += rowCount * 10;
    rowCount *= 2;
    scored = true;
  }

  if (scored) {
    levelUpFlag = true; // 점수 획득 시 레벨 상승 플래그 설정
  }
}

function drawMatrix(ctx, matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        ctx.fillStyle = colors[value];
        ctx.fillRect(
          (x + offset.x) * BLOCK_SIZE,
          (y + offset.y) * BLOCK_SIZE,
          BLOCK_SIZE - 1,
          BLOCK_SIZE - 1
        );
      }
    });
  });
}

function draw() {
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawMatrix(ctx, arena, {x:0, y:0});
  drawMatrix(ctx, player.shape, {x:player.x, y:player.y});
}

function drawNext() {
  nextCtx.fillStyle = '#111';
  nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
  const size = player.next.shape.length;
  const offset = {
    x: Math.floor((4 - size) / 2),
    y: Math.floor((4 - size) / 2)
  };
  drawMatrix(nextCtx, player.next.shape, offset);
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let arena = createMatrix(COLS, ROWS);

const player = {
  pos: {x:0, y:0},
  piece: null,
  next: null,
  get shape() { return this.piece.shape },
  get x()     { return this.piece.x },
  get y()     { return this.piece.y }
};

let score = 0;
let level = 1;
let levelUpFlag = false;

function updateScore() {
  document.getElementById('score').innerText = score;
  document.getElementById('level').innerText = level;
}

function playerDrop() {
  player.piece.y++;
  if (collide(arena, player.shape, player.piece.x, player.piece.y)) {
    player.piece.y--;
    merge(arena, player.piece);
    sweep();
    spawnPiece();
    updateScore();
  }
  dropCounter = 0;
}

function spawnPiece() {
  if (!player.next) {
    player.next = new Piece(randInt(1, SHAPES.length - 1));
  }
  player.piece = player.next;
  player.piece.x = Math.floor((COLS - player.shape[0].length) / 2);
  player.piece.y = 0;
  player.next = new Piece(randInt(1, SHAPES.length - 1));

  if (levelUpFlag) {
    level++;
    levelUpFlag = false;
  }

  if (collide(arena, player.shape, player.piece.x, player.piece.y)) {
    arena.forEach(row => row.fill(0));
    score = 0;
    level = 1;
    levelUpFlag = false;
  }

  drawNext();
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function update(time = 0) {
  const delta = time - lastTime;
  lastTime = time;
  dropCounter += delta;
  if (dropCounter > dropInterval) {
    playerDrop();
  }
  draw();
  requestAnimationFrame(update);
}

document.addEventListener('keydown', event => {
  switch (event.key) {
    case 'ArrowLeft':
      player.piece.x--;
      if (collide(arena, player.shape, player.piece.x, player.piece.y)) player.piece.x++;
      break;
    case 'ArrowRight':
      player.piece.x++;
      if (collide(arena, player.shape, player.piece.x, player.piece.y)) player.piece.x--;
      break;
    case 'ArrowDown':
      playerDrop();
      break;
    case 'ArrowUp':
      player.piece.rotate();
      break;
    case ' ':
      while (!collide(arena, player.shape, player.piece.x, player.piece.y + 1)) {
        player.piece.y++;
      }
      playerDrop();
      break;
  }
});

// ✅ 모바일 버튼 → 키보드 이벤트 트리거
document.querySelectorAll('.mobile-controls button').forEach(button => {
  button.addEventListener('touchstart', e => {
    e.preventDefault();
    const key = button.dataset.key;
    const event = new KeyboardEvent('keydown', { key });
    document.dispatchEvent(event);
  });
});

spawnPiece();
update();
