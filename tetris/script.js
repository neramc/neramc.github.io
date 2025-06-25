document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('game-grid');
  const scoreDisplay = document.getElementById('score');
  const statusDisplay = document.getElementById('status');
  const startBtn = document.getElementById('start-button');
  const miniGrid = document.querySelector('.mini-grid');
  const width = 10;
  let score = 0;
  let timerId = null;
  let interval = 1000;
  let currentPosition = 4;
  let currentRotation = 0;
  let nextRandom = 0;
  let random = 0;
  let isGameOver = false;

  const cells = Array.from({ length: 210 }, () => {
    const cell = document.createElement('div');
    grid.appendChild(cell);
    return cell;
  });

  const miniCells = Array.from({ length: 16 }, () => {
    const cell = document.createElement('div');
    miniGrid.appendChild(cell);
    return cell;
  });

  const lTetromino = [
    [1, width+1, width*2+1, 2],
    [width, width+1, width+2, width*2+2],
    [1, width+1, width*2+1, width*2],
    [width, width*2, width*2+1, width*2+2]
  ];
  const zTetromino = [
    [0, width, width+1, width*2+1],
    [width+1, width+2, width*2, width*2+1],
    [0, width, width+1, width*2+1],
    [width+1, width+2, width*2, width*2+1]
  ];
  const tTetromino = [
    [1, width, width+1, width+2],
    [1, width+1, width*2+1, width+1],
    [width, width+1, width+2, width*2+1],
    [1, width+1, width*2+1, width+1]
  ];
  const oTetromino = [
    [0, 1, width, width+1],
    [0, 1, width, width+1],
    [0, 1, width, width+1],
    [0, 1, width, width+1]
  ];
  const iTetromino = [
    [1, width+1, width*2+1, width*3+1],
    [width, width+1, width+2, width+3],
    [1, width+1, width*2+1, width*3+1],
    [width, width+1, width+2, width+3]
  ];
  const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino];

  function randomTetromino() {
    random = nextRandom;
    nextRandom = Math.floor(Math.random() * theTetrominoes.length);
    current = theTetrominoes[random][currentRotation];
    currentPosition = 4;
  }

  let current = [];
  randomTetromino();

  function draw() {
    current.forEach(index => {
      cells[currentPosition + index].classList.add('tetromino');
    });
  }

  function undraw() {
    current.forEach(index => {
      cells[currentPosition + index].classList.remove('tetromino');
    });
  }

  function moveDown() {
    if (!timerId) return;
    undraw();
    currentPosition += width;
    draw();
    freeze();
  }

  function moveLeft() {
    undraw();
    if (!current.some(index => (currentPosition + index) % width === 0)) currentPosition--;
    draw();
  }

  function moveRight() {
    undraw();
    if (!current.some(index => (currentPosition + index) % width === width - 1)) currentPosition++;
    draw();
  }

  function rotateTetromino() {
    undraw();
    currentRotation = (currentRotation + 1) % 4;
    current = theTetrominoes[random][currentRotation];
    draw();
  }

  function freeze() {
    if (current.some(index => cells[currentPosition + index + width].classList.contains('taken'))) {
      current.forEach(index => cells[currentPosition + index].classList.add('taken'));
      addScore();
      if (!isGameOver) {
        randomTetromino();
        draw();
        displayNext();
      }
    }
  }

  function displayNext() {
    miniCells.forEach(cell => cell.className = '');
    theTetrominoes[nextRandom][0].forEach(index => {
      miniCells[index].classList.add('tetromino');
    });
  }

  function addScore() {
    for (let row = 0; row < 20; row++) {
      const rowStart = row * width;
      const rowCells = Array.from({ length: width }, (_, i) => cells[rowStart + i]);
      if (rowCells.every(cell => cell.classList.contains('taken'))) {
        score += 10;
        interval = Math.max(100, interval - 50);
        scoreDisplay.textContent = score;
        clearInterval(timerId);
        timerId = setInterval(moveDown, interval);
        rowCells.forEach(cell => cell.classList.remove('taken', 'tetromino'));
        const removed = cells.splice(rowStart, width);
        cells.unshift(...removed);
        grid.innerHTML = '';
        cells.forEach(cell => grid.appendChild(cell));
      }
    }
  }

  function gameOver() {
    if (current.some(index => cells[currentPosition + index].classList.contains('taken'))) {
      clearInterval(timerId);
      timerId = null;
      isGameOver = true;
      statusDisplay.textContent = 'Game Over';
      alert('Game Over!');
    }
  }

  startBtn.addEventListener('click', () => {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
      statusDisplay.textContent = 'Paused';
    } else {
      if (isGameOver) location.reload();
      draw();
      timerId = setInterval(moveDown, interval);
      displayNext();
      statusDisplay.textContent = 'Playing';
    }
  });

  document.getElementById('left').addEventListener('click', moveLeft);
  document.getElementById('right').addEventListener('click', moveRight);
  document.getElementById('rotate').addEventListener('click', rotateTetromino);
  document.getElementById('down').addEventListener('click', moveDown);

  document.addEventListener('keyup', e => {
    if (!timerId) return;
    switch (e.keyCode) {
      case 37: moveLeft(); break;
      case 38: rotateTetromino(); break;
      case 39: moveRight(); break;
      case 40: moveDown(); break;
    }
  });

  // 터치 슬라이드
  let touchStartX = 0;
  let touchStartY = 0;

  grid.addEventListener('touchstart', e => {
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  });

  grid.addEventListener('touchend', e => {
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 30) moveRight();
      else if (dx < -30) moveLeft();
    } else {
      if (dy > 30) moveDown();
      else if (dy < -30) rotateTetromino();
    }
  });
});
