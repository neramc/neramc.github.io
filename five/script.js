const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const SIZE = 19;
const CELL = canvas.width / SIZE;

let board, currentPlayer, winner, moveHistory;

// 난이도 관리
let aiDifficulty = "auto";
let aiDepthLevel = 2;

function initGame() {
  board = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  currentPlayer = 1; // 흑 시작
  winner = null;
  moveHistory = [];
  drawBoard();
  document.getElementById("status").innerText = "난이도: " + aiDifficulty.toUpperCase();
}

function resetGame() {
  initGame();
}

function setDifficulty(level) {
  aiDifficulty = level;
  if (level === "easy") aiDepthLevel = 2;
  else if (level === "normal") aiDepthLevel = 3;
  else if (level === "hard") aiDepthLevel = 4;
  document.getElementById("status").innerText = "난이도: " + level.toUpperCase();
  resetGame();
}

// 바둑판 그리기
function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#333";
  for (let i = 0; i < SIZE; i++) {
    ctx.beginPath();
    ctx.moveTo(CELL/2, CELL/2 + i * CELL);
    ctx.lineTo(canvas.width - CELL/2, CELL/2 + i * CELL);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(CELL/2 + i * CELL, CELL/2);
    ctx.lineTo(CELL/2 + i * CELL, canvas.height - CELL/2);
    ctx.stroke();
  }
  for (let i=0;i<SIZE;i++){
    for (let j=0;j<SIZE;j++){
      if (board[i][j] !== 0) drawStone(i,j,board[i][j]);
    }
  }
}

function drawStone(i, j, player) {
  ctx.beginPath();
  ctx.arc(CELL/2 + j*CELL, CELL/2 + i*CELL, CELL/2 - 2, 0, Math.PI*2);
  ctx.fillStyle = player === 1 ? "black" : "white";
  ctx.fill();
  ctx.strokeStyle = "#000";
  ctx.stroke();
}

// 착수
function place(i,j) {
  if (winner || board[i][j] !== 0) return;
  board[i][j] = currentPlayer;
  moveHistory.push({i, j, player: currentPlayer});
  drawBoard();
  if (checkWin(i,j,currentPlayer)) {
    winner = currentPlayer;
    document.getElementById("status").innerText = (winner===1?"흑":"백")+" 승리!";
    return;
  }
  currentPlayer = 3 - currentPlayer;
  if (currentPlayer === 2) {
    setTimeout(aiMove, 200);
  }
}

// Undo (한 턴 되돌리기)
function undoMove() {
  if (moveHistory.length < 2 || winner) return;
  const lastAI = moveHistory.pop(); // AI 수 제거
  board[lastAI.i][lastAI.j] = 0;
  const lastHuman = moveHistory.pop(); // Human 수 제거
  board[lastHuman.i][lastHuman.j] = 0;
  currentPlayer = 1; // 다시 흑 차례
  winner = null;
  drawBoard();
  document.getElementById("status").innerText = "되돌리기 완료! 난이도: " + aiDifficulty.toUpperCase();
}

// 승리 판정
function checkWin(i,j,player) {
  const dirs = [[1,0],[0,1],[1,1],[1,-1]];
  for (const [dx,dy] of dirs) {
    let count = 1;
    let x=i+dx,y=j+dy;
    while (x>=0&&y>=0&&x<SIZE&&y<SIZE&&board[x][y]===player) {count++; x+=dx; y+=dy;}
    x=i-dx; y=j-dy;
    while (x>=0&&y>=0&&x<SIZE&&y<SIZE&&board[x][y]===player) {count++; x-=dx; y-=dy;}
    if (count>=5) return true;
  }
  return false;
}

// 평가 함수
function evaluateBoard(player) {
  let score = 0;
  const opponent = player === 1 ? 2 : 1;
  for (let i=0;i<SIZE;i++){
    for (let j=0;j<SIZE;j++){
      if (board[i][j] === player) score += getShapeScore(i,j,player);
      else if (board[i][j] === opponent) score -= getShapeScore(i,j,opponent);
    }
  }
  return score;
}

function getShapeScore(i,j,player) {
  const dirs = [[1,0],[0,1],[1,1],[1,-1]];
  let total = 0;
  for (const [dx,dy] of dirs) {
    let count = 1;
    let openEnds = 0;

    let x=i+dx, y=j+dy;
    while (x>=0&&y>=0&&x<SIZE&&y<SIZE&&board[x][y]===player) {count++; x+=dx; y+=dy;}
    if (x>=0&&y>=0&&x<SIZE&&y<SIZE&&board[x][y]===0) openEnds++;

    x=i-dx; y=j-dy;
    while (x>=0&&y>=0&&x<SIZE&&y<SIZE&&board[x][y]===player) {count++; x-=dx; y-=dy;}
    if (x>=0&&y>=0&&x<SIZE&&y<SIZE&&board[x][y]===0) openEnds++;

    if (count>=5) total += 100000;
    else if (count===4 && openEnds===2) total += 10000;
    else if (count===4 && openEnds===1) total += 5000;
    else if (count===3 && openEnds===2) total += 1000;
    else if (count===3 && openEnds===1) total += 300;
    else if (count===2 && openEnds===2) total += 100;
    else if (count===2 && openEnds===1) total += 30;
  }
  return total;
}

// MiniMax + Alpha-Beta
function minimax(depth, alpha, beta, maximizingPlayer) {
  if (depth === 0 || winner) return evaluateBoard(2);
  const moves = generateMoves();
  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const m of moves) {
      board[m.i][m.j] = 2;
      const eval = minimax(depth-1, alpha, beta, false);
      board[m.i][m.j] = 0;
      maxEval = Math.max(maxEval, eval);
      alpha = Math.max(alpha, eval);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const m of moves) {
      board[m.i][m.j] = 1;
      const eval = minimax(depth-1, alpha, beta, true);
      board[m.i][m.j] = 0;
      minEval = Math.min(minEval, eval);
      beta = Math.min(beta, eval);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

// 후보 수 생성
function generateMoves() {
  let moves = [];
  for (let i=0;i<SIZE;i++){
    for (let j=0;j<SIZE;j++){
      if (board[i][j] !== 0) continue;
      let near = false;
      for (let dx=-1;dx<=1;dx++){
        for (let dy=-1;dy<=1;dy++){
          if (i+dx<0||j+dy<0||i+dx>=SIZE||j+dy>=SIZE) continue;
          if (board[i+dx][j+dy]!==0) near = true;
        }
      }
      if (near) moves.push({i,j});
    }
  }
  return moves;
}

// AI 착수
function aiMove() {
  if (winner) return;

  let depth = aiDepthLevel;
  if (aiDifficulty === "auto") {
    let stoneCount = 0;
    for (let i=0;i<SIZE;i++){
      for (let j=0;j<SIZE;j++){
        if (board[i][j]!==0) stoneCount++;
      }
    }
    if (stoneCount < 20) depth = 2;
    else if (stoneCount < 50) depth = 3;
    else depth = 4;
  }

  let bestScore = -Infinity;
  let bestMove = null;
  const moves = generateMoves();
  for (const m of moves) {
    board[m.i][m.j] = 2;
    let score = minimax(depth, -Infinity, Infinity, false);
    board[m.i][m.j] = 0;
    if (score > bestScore) {
      bestScore = score;
      bestMove = m;
    }
  }
  if (bestMove) place(bestMove.i, bestMove.j);
}

// 사용자 클릭 이벤트
canvas.addEventListener("click", e => {
  if (winner || currentPlayer!==1) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const i = Math.floor(y/CELL);
  const j = Math.floor(x/CELL);
  place(i,j);
});

// 초기 실행
initGame();
