;(() => {
  const SIZE = 19;
  const PADDING_RATIO = 0.06;
  const LINE_WIDTH = 1.2;
  const STAR_RADIUS_RATIO = 0.012;
  const STONE_RADIUS_RATIO = 0.018;
  const HOVER_ALPHA = 0.35;

  let board = Array.from({length: SIZE}, () => Array(SIZE).fill(0));
  let moves = [];
  let current = 1;
  let winner = 0;
  let aiEnabled = false;

  let canvas, ctx;
  let W=0, H=0, pad=0, gap=0;
  let hover = { i:-1, j:-1, visible:false };

  const $ = sel => document.querySelector(sel);
  const turnStoneEl = $('#turnStone');
  const turnTextEl  = $('#turnText');
  const moveCountEl = $('#moveCount');
  const resultTextEl = $('#resultText');
  const toggleAIBtn = $('#toggleAIBtn');

  function resize() {
    canvas.width = canvas.clientWidth * devicePixelRatio;
    canvas.height = canvas.clientHeight * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

    W = canvas.clientWidth;
    H = canvas.clientHeight;
    const minSide = Math.min(W, H);
    pad = Math.max(12, Math.floor(minSide * PADDING_RATIO));
    gap = (minSide - pad*2) / (SIZE-1);

    drawAll();
  }

  function clear() {
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--board-bg').trim();
    ctx.fillRect(0,0,canvas.clientWidth, canvas.clientHeight);
  }

  function drawGrid(){
    ctx.save();
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--line').trim();
    ctx.lineWidth = LINE_WIDTH;
    for(let i=0;i<SIZE;i++){
      const x = pad + i*gap;
      const y = pad + i*gap;
      ctx.beginPath(); ctx.moveTo(x, pad); ctx.lineTo(x, pad + gap*(SIZE-1)); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(pad, y); ctx.lineTo(pad + gap*(SIZE-1), y); ctx.stroke();
    }
    ctx.strokeRect(pad, pad, gap*(SIZE-1), gap*(SIZE-1));
    const starsIdx = [3,9,15];
    const r = Math.max(2, Math.floor(gap * STAR_RADIUS_RATIO * 100) / 100 * 6);
    ctx.fillStyle = 'rgba(0,0,0,.65)';
    for(const i of starsIdx){
      for(const j of starsIdx){
        const {x,y} = ij2xy(i,j);
        ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawStone(i,j,player, emphasize=false){
    const {x,y} = ij2xy(i,j);
    const r = gap*0.43;
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2);
    ctx.shadowColor = 'rgba(0,0,0,.25)';
    ctx.shadowBlur = 6; ctx.shadowOffsetY = 2;
    ctx.fillStyle = ctx.createRadialGradient(x-r*0.35, y-r*0.35, r*0.1, x, y, r);
    if(player===1){
      ctx.fillStyle.addColorStop(0, '#555');
      ctx.fillStyle.addColorStop(0.7, '#0c0c0c');
      ctx.fillStyle.addColorStop(1, '#000');
    }else{
      ctx.fillStyle.addColorStop(0, '#fff');
      ctx.fillStyle.addColorStop(0.7, '#e5e5e5');
      ctx.fillStyle.addColorStop(1, '#d6d6d6');
    }
    ctx.fill();
    if(emphasize){
      ctx.lineWidth = 2;
      ctx.strokeStyle = player===1 ? 'rgba(255,255,255,.85)' : 'rgba(0,0,0,.55)';
      ctx.beginPath(); ctx.arc(x,y,r*0.55,0,Math.PI*2); ctx.stroke();
    }
    ctx.restore();
  }

  function drawHover(){
    if(!hover.visible || winner) return;
    const {i,j} = hover;
    if(i<0 || j<0 || board[i][j]!==0) return;
    const {x,y} = ij2xy(i,j);
    const r = gap*0.42;
    ctx.save();
    ctx.globalAlpha = HOVER_ALPHA;
    ctx.fillStyle = current===1 ? '#000' : '#fff';
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }

  function drawAll(){
    clear();
    drawGrid();
    for(let i=0;i<SIZE;i++){
      for(let j=0;j<SIZE;j++){
        const p = board[i][j];
        if(p!==0) drawStone(i,j,p);
      }
    }
    const last = moves[moves.length-1];
    if(last) drawStone(last.x, last.y, last.player, true);
    drawHover();
    if(winner){
      const last = moves[moves.length-1];
      if(last){
        const info = checkWin(last.x,last.y,last.player);
        if(info.win) drawWinLine(info.line);
      }
    }
  }

  function ij2xy(i,j){ return { x: pad + i*gap, y: pad + j*gap }; }
  function xy2ij(x,y){
    const i = Math.round((x - pad) / gap);
    const j = Math.round((y - pad) / gap);
    if(i<0 || i>=SIZE || j<0 || j>=SIZE) return {i:-1, j:-1};
    const {x:ix, y:iy} = ij2xy(i,j);
    const dist = Math.hypot(ix - x, iy - y);
    const threshold = gap * 0.45;
    if(dist <= threshold) return {i,j};
    return {i:-1, j:-1};
  }

  function place(i,j){
    if(winner) return;
    if(i<0 || j<0 || i>=SIZE || j>=SIZE) return;
    if(board[i][j]!==0) return;

    board[i][j] = current;
    moves.push({x:i, y:j, player:current});
    moveCountEl.textContent = String(moves.length);

    const winInfo = checkWin(i,j,current);
    if(winInfo.win){
      winner = current;
      updateStatus(true);
    }else{
      current = 3 - current;
      updateStatus(false);
      if(aiEnabled && current===2 && !winner){
        setTimeout(aiMove, 400); // 약간의 딜레이로 두는 느낌
      }
    }
    drawAll();
  }

  function checkWin(i,j,player){
    const dirs = [[1,0],[0,1],[1,1],[1,-1]];
    for(const [dx,dy] of dirs){
      const c1 = countDir(i,j, dx,dy, player);
      const c2 = countDir(i,j,-dx,-dy, player) - 1;
      const total = c1 + c2;
      if(total >= 5){
        return { win:true, line:{sx:i,sy:j,ex:i,ey:j} };
      }
    }
    return { win:false };
  }

  function countDir(i,j,dx,dy,player){
    let cnt = 0, x=i, y=j;
    while(x>=0 && x<SIZE && y>=0 && y<SIZE && board[x][y]===player){
      cnt++; x+=dx; y+=dy;
    }
    return cnt;
  }

  function drawWinLine(line){
    // 간단히 마지막 수 중심으로 하이라이트
    const {sx,sy} = line;
    const a = ij2xy(sx,sy);
    ctx.save();
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(10,124,255,.9)';
    ctx.beginPath(); ctx.arc(a.x,a.y,gap*0.7,0,Math.PI*2); ctx.stroke();
    ctx.restore();
  }

  function updateStatus(isWin=false){
    if(isWin){
      const who = winner===1 ? '흑' : '백';
      resultTextEl.innerHTML = `<span class="winner">🎉 ${who} 승!</span> (총 수: ${moves.length})`;
      turnTextEl.textContent = `${who} 승`;
    }else{
      turnStoneEl.className = 'stone-ind ' + (current===1 ? 'stone-black' : 'stone-white');
      turnTextEl.textContent = current===1 ? '흑 차례' : '백 차례';
      resultTextEl.textContent = '';
    }
  }

  function undo(){
    if(!moves.length || winner) return;
    const last = moves.pop();
    board[last.x][last.y] = 0;
    current = last.player;
    moveCountEl.textContent = String(moves.length);
    winner = 0;
    updateStatus(false);
    drawAll();
  }

  function reset(){
    board = Array.from({length: SIZE}, () => Array(SIZE).fill(0));
    moves = [];
    current = 1;
    winner = 0;
    hover.visible = false;
    moveCountEl.textContent = '0';
    updateStatus(false);
    drawAll();
  }

  // ===== AI 로직 (심플 버전: 중앙 가까운 곳 선호) =====
  function aiMove(){
    if(winner) return;
    let emptyCells = [];
    for(let i=0;i<SIZE;i++){
      for(let j=0;j<SIZE;j++){
        if(board[i][j]===0) emptyCells.push({i,j});
      }
    }
    if(!emptyCells.length) return;
    // 중앙 가까운 점 찾기
    const center = SIZE/2;
    emptyCells.sort((a,b)=> {
      const da = Math.hypot(a.i-center,a.j-center);
      const db = Math.hypot(b.i-center,b.j-center);
      return da-db;
    });
    const choice = emptyCells[Math.floor(Math.random()*Math.min(4, emptyCells.length))];
    place(choice.i, choice.j);
  }

  // ===== 이벤트 =====
  function getEventXY(ev){
    const rect = canvas.getBoundingClientRect();
    const x = (ev.touches ? ev.touches[0].clientX : ev.clientX) - rect.left;
    const y = (ev.touches ? ev.touches[0].clientY : ev.clientY) - rect.top;
    return {x,y};
  }
  function onPointerMove(ev){
    const {x,y} = getEventXY(ev);
    const {i,j} = xy2ij(x,y);
    hover.i = i; hover.j = j; hover.visible = true;
    drawAll();
  }
  function onPointerLeave(){ hover.visible = false; drawAll(); }
  function onPointerDown(ev){
    if(winner) return;
    if(aiEnabled && current===2) return; // AI 차례면 무시
    const {x,y} = getEventXY(ev);
    const {i,j} = xy2ij(x,y);
    if(i!==-1 && j!==-1) place(i,j);
  }

  function init(){
    canvas = document.getElementById('board');
    ctx = canvas.getContext('2d');
    window.addEventListener('resize', resize, {passive:true});
    resize();
    canvas.addEventListener('mousemove', onPointerMove);
    canvas.addEventListener('mouseleave', onPointerLeave);
    canvas.addEventListener('mousedown', onPointerDown);
    canvas.addEventListener('touchstart', (e)=>{ onPointerDown(e); }, {passive:true});
    canvas.addEventListener('touchmove', (e)=>{ onPointerMove(e); }, {passive:true});
    canvas.addEventListener('touchend', onPointerLeave, {passive:true});
    document.getElementById('undoBtn').addEventListener('click', undo);
    document.getElementById('resetBtn').addEventListener('click', reset);
    toggleAIBtn.addEventListener('click', ()=>{
      aiEnabled = !aiEnabled;
      toggleAIBtn.textContent = aiEnabled ? "🤖 AI: ON" : "🤖 AI: OFF";
      reset();
    });
    updateStatus(false);
    drawAll();
  }

  window.addEventListener('DOMContentLoaded', init);
})();
