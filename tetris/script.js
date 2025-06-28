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
  score: 0
};

let dropCounter = 0;
const defaultDropInterval = 1000;
let dropInterval = defaultDropInterval;
let lastTime = 0;
let paused = false;

// 매트릭스, 블록 생성 등 기존 함수들...
function createMatrix(w, h) {
  const m = [];
  while (h--) m.push(new Array(w).fill(0));
  return m;
}
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
function collide(arena, player) {
  const [m, o] = [player.matrix, player.pos];
  for (let y=0; y<m.length; ++y) {
    for (let x=0; x<m[y].length; ++x) {
      if (m[y][x] !== 0 &&
         (arena[y+o.y] && arena[y+o.y][x+o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}
function merge(arena, player) {
  player.matrix.forEach((row,y) =>
    row.forEach((val,x) => {
      if (val !== 0) arena[y+player.pos.y][x+player.pos.x] = val;
    })
  );
}
function drawMatrix(matrix, offset) {
  matrix.forEach((row,y) =>
    row.forEach((val,x) => {
      if (val !== 0) {
        context.fillStyle = colors[val];
        context.fillRect(x+offset.x, y+offset.y, 1, 1);
      }
    })
  );
}
function draw() {
  context.fillStyle = '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);

  drawMatrix(arena, { x:0, y:0 });
  drawMatrix(player.matrix, player.pos);

  if (paused) {
    context.fillStyle = 'rgba(0,0,0,0.7)';
    context.fillRect(0, canvas.height/40*8, canvas.width/20*4, canvas.height/20*4);
    context.fillStyle = '#7ec850';
    context.font = '1px Courier New';
    context.fillText('PAUSED', 4, 12);
  }
}
function arenaSweep() {
  outer: for (let y=arena.length-1; y>=0; --y) {
    for (let x=0; x<arena[y].length; ++x) {
      if (arena[y][x] === 0) continue outer;
    }
    const row = arena.splice(y,1)[0].fill(0);
    arena.unshift(row);
    ++y;
    player.score += 10;
    updateScore();
  }
}
function rotate(matrix, dir) {
  for (let y=0; y<matrix.length; ++y)
    for (let x=0; x<y; ++x)
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
  if (dir > 0) matrix.forEach(row => row.reverse());
  else matrix.reverse();
}

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
    offset = -(offset + (offset>0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}
function playerReset() {
  const pieces = 'TJLOSZI';
  player.matrix = createPiece(pieces[Math.floor(Math.random()*pieces.length)]);
  player.pos.y = 0;
  player.pos.x = Math.floor(arenaWidth/2) - Math.floor(player.matrix[0].length/2);
  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
    player.score = 0;
    updateScore();
  }
}
function updateScore() {
  document.getElementById('score').innerText = `Score: ${player.score}`;
}

function update(time = 0) {
  const delta = time - lastTime;
  lastTime = time;
  if (!paused) {
    dropCounter += delta;
    if (dropCounter > dropInterval) {
      playerDrop();
    }
  }
  draw();
  requestAnimationFrame(update);
}

// 키보드 이벤트
document.addEventListener('keydown', e => {
  switch (e.key) {
    case 'ArrowLeft':  playerMove(-1); break;
    case 'ArrowRight': playerMove(1);  break;
    case 'ArrowDown':  playerDrop();   break;
    case 'q':          playerRotate(-1); break;
    case 'w':          playerRotate(1);  break;
    case 'p': // 'p'로 일시정지 토글
      paused = !paused;
      break;
  }
});

// 터치·버튼 이벤트 바인딩
const btn = id => document.getElementById(id);
btn('left').addEventListener( 'touchstart', ()=>playerMove(-1) );
btn('right').addEventListener('touchstart', ()=>playerMove(1) );
btn('down').addEventListener( 'touchstart', ()=>playerDrop() );
btn('rotate').addEventListener('touchstart', ()=>playerRotate(1) );

// 빠른낙하: touchstart 시 dropInterval 줄이고, touchend 시 복원
btn('fastdrop').addEventListener('touchstart', ()=>{ dropInterval = 50; });
btn('fastdrop').addEventListener( 'touchend', ()=>{ dropInterval = defaultDropInterval; });

// 일시정지 버튼
btn('pause').addEventListener('touchstart', ()=>{ paused = !paused; });

// 초기화 및 시작
playerReset();
updateScore();
update();
