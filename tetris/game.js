const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(20, 20);

const arenaWidth = 12;
const arenaHeight = 20;
const arena = createMatrix(arenaWidth, arenaHeight);

const colors = [
  null,
  '#FF0D72', '#0DC2FF', '#0DFF72',
  '#F538FF', '#FF8E0D', '#FFE138', '#3877FF',
];

const player = {
  pos: { x: 0, y: 0 },
  matrix: null,
  score: 0,
};

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let paused = false;

// 매트릭스 생성
function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

// 블록 모양 생성
function createPiece(type) {
  switch (type) {
    case 'T': return [[0,0,0],[1,1,1],[0,1,0]];
    case 'O': return [[7,7],[7,7]];
    case 'L': return [[0,5,0],[0,5,0],[0,5,5]];
    case 'J': return [[0,6,0],[0,6,0],[6,6,0]];
    case 'I': return [[0,2,0,0],[0,2,0,0],[0,2,0,0],[0,2,0,0]];
    case 'S': return [[0,3,3],[3,3,0],[0,0,0]];
    case 'Z': return [[4,4,0],[0,4,4],[0,0,0]];
  }
}

// 충돌 검사
function collide(arena, player) {
  const [m, o] = [player.matrix, player.pos];
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 &&
          (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

// 합치기
function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = val;
      }
    });
  });
}

// 그리기
function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((val, x) => {
      if (val !== 0) {
        context.fillStyle = colors[val];
        context.fillRect(x + offset.x, y + offset.y, 1, 1);
        context.strokeStyle = '#000';
        context.strokeRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function draw() {
  context.fillStyle = '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawMatrix(arena, { x: 0, y: 0 });
  drawMatrix(player.matrix, player.pos);
  if (paused) {
    context.fillStyle = 'rgba(0,0,0,0.7)';
    context.fillRect(2, 8, 8, 4);
    context.fillStyle = '#7ec850';
    context.font = '1px Courier New';
    context.fillText('PAUSED', 4, 10);
  }
}

// 줄 삭제 (즉시)
function arenaSweep() {
  outer: for (let y = arena.length - 1; y >= 0; --y) {
    for (let x = 0; x < arena[y].length; ++x) {
      if (arena[y][x] === 0) continue outer;
    }
    const row = arena.splice(y, 1)[0].fill(0);
    arena.unshift(row);
    player.score += 10;
    updateScore();
  }
}

// 회전
function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; ++y)
    for (let x = 0; x < y; ++x)
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
  if (dir > 0) matrix.forEach(row => row.reverse());
  else matrix.reverse();
}

// 플레이어 동작
function playerDrop() {
  if (paused) return;
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
  }
  dropCounter = 0;
}
function playerMove(dir) {
  if (paused) return;
  player.pos.x += dir;
  if (collide(arena, player)) player.pos.x -= dir;
}
function playerRotate(dir) {
  if (paused) return;
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, dir);
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

// 리셋
function playerReset() {
  const pieces = 'TJLOSZI';
  player.matrix = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
  player.pos.y = 0;
  player.pos.x = Math.floor(arenaWidth / 2) - Math.floor(player.matrix[0].length / 2);
  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
    player.score = 0;
    updateScore();
  }
}

// 점수 업데이트
function updateScore() {
  document.getElementById('score').innerText = `Score: ${player.score}`;
}

// 메인 루프
let lastTimeStamp = 0;
function update(time = 0) {
  const delta = time - lastTimeStamp;
  lastTimeStamp = time;
  dropCounter += delta;
  if (dropCounter > dropInterval) playerDrop();
  draw();
  requestAnimationFrame(update);
}

// 이벤트 바인딩
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') playerMove(-1);
  if (e.key === 'ArrowRight') playerMove(1);
  if (e.key === 'ArrowDown') playerDrop();
  if (e.key === 'q') playerRotate(-1);
  if (e.key === 'w') playerRotate(1);
  if (e.key === 'p') paused = !paused;
});
const btn = id => document.getElementById(id);
btn('left').addEventListener('touchstart',  () => playerMove(-1));
btn('right').addEventListener('touchstart', () => playerMove(1));
btn('down').addEventListener('touchstart',   () => playerDrop());
btn('rotate').addEventListener('touchstart', () => playerRotate(1));
btn('rotate-left').addEventListener('touchstart', () => playerRotate(-1));
btn('fastdrop').addEventListener('touchstart', () => { dropInterval = 50; });
btn('fastdrop').addEventListener('touchend',   () => { dropInterval = 1000; });
btn('pause').addEventListener('touchstart',    () => { paused = !paused; });

document.getElementById('menu-button').addEventListener('click', () => {
  document.getElementById('menu-overlay').classList.toggle('hidden');
});

// 초기화 및 시작
playerReset();
updateScore();
update();
