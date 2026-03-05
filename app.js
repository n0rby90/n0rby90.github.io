const CONFIG = {
  imagePath: "photo.jpg", 
  revealText: "Ai reușit să refaci puzzle-ul, dar adevărul e că tu ai fost piesa care mi-a completat viața. Cu tine, totul pare mai simplu, mai frumos și mai real. Te iubesc enorm și sunt recunoscător că te am în viața mea. Ești cea mai prețioasă comoară a mea, iar fiecare zi alături de tine e un dar neprețuit. Mulțumesc că ești tu și că mă iubești așa cum sunt. Te iubesc din tot sufletul meu!",
  boardPx: 420,          
  shuffleSwaps: 300      
};


const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const sizeSelect = document.getElementById("size");
const diffLabel = document.getElementById("diffLabel");
const movesEl = document.getElementById("moves");
const timeEl = document.getElementById("time");
const msgEl = document.getElementById("msg");

const reveal = document.getElementById("reveal");
const revealText = document.getElementById("revealText");

const btnShuffle = document.getElementById("btnShuffle");
const btnReset = document.getElementById("btnReset");
const btnAgain = document.getElementById("btnAgain");

canvas.width = CONFIG.boardPx;
canvas.height = CONFIG.boardPx;

let N = Number(sizeSelect.value);
let tile = CONFIG.boardPx / N;

let img = new Image();
img.src = CONFIG.imagePath;

let order = [];       
let selected = null; 
let moves = 0;

let startedAt = null;
let timerId = null;

function setMsg(type, text){
  msgEl.className = "msg " + (type || "");
  msgEl.textContent = text || "";
}

function startTimer(){
  if (timerId) clearInterval(timerId);
  startedAt = Date.now();
  timerId = setInterval(() => {
    const ms = Date.now() - startedAt;
    const totalSec = Math.floor(ms / 1000);
    const mm = String(Math.floor(totalSec / 60)).padStart(2, "0");
    const ss = String(totalSec % 60).padStart(2, "0");
    timeEl.textContent = `${mm}:${ss}`;
  }, 250);
}

function stopTimer(){
  if (timerId) clearInterval(timerId);
  timerId = null;
}

function initOrder(){
  order = Array.from({length: N*N}, (_, i) => i);
}

function shuffle(){
  for (let k = 0; k < CONFIG.shuffleSwaps; k++){
    const a = Math.floor(Math.random() * order.length);
    const b = Math.floor(Math.random() * order.length);
    [order[a], order[b]] = [order[b], order[a]];
  }
  selected = null;
  moves = 0;
  movesEl.textContent = String(moves);
  timeEl.textContent = "00:00";
  setMsg("", "");
  reveal.classList.add("hidden");
  draw();
}

function isSolved(){
  for (let i = 0; i < order.length; i++){
    if (order[i] !== i) return false;
  }
  return true;
}

function cropToSquareDraw(){
  const s = Math.min(img.width, img.height);
  const sx = Math.floor((img.width - s) / 2);
  const sy = Math.floor((img.height - s) / 2);
  return { s, sx, sy };
}

function draw(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const { s, sx, sy } = cropToSquareDraw();
  for (let pos = 0; pos < order.length; pos++){
    const tileIndex = order[pos];

    const dx = (pos % N) * tile;
    const dy = Math.floor(pos / N) * tile;

    const tx = (tileIndex % N);
    const ty = Math.floor(tileIndex / N);

    const sw = s / N;
    const sh = s / N;

    const srcX = sx + tx * sw;
    const srcY = sy + ty * sh;

    ctx.drawImage(img, srcX, srcY, sw, sh, dx, dy, tile, tile);

    ctx.strokeStyle = "rgba(255,255,255,0.10)";
    ctx.lineWidth = 1;
    ctx.strokeRect(dx + 0.5, dy + 0.5, tile - 1, tile - 1);

    if (selected === pos){
      ctx.strokeStyle = "rgba(139,92,246,0.95)";
      ctx.lineWidth = 4;
      ctx.strokeRect(dx + 2, dy + 2, tile - 4, tile - 4);
    }
  }
}

function posFromEvent(ev){
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const x = (ev.clientX - rect.left) * scaleX;
  const y = (ev.clientY - rect.top) * scaleY;

  const cx = Math.min(canvas.width - 1, Math.max(0, x));
  const cy = Math.min(canvas.height - 1, Math.max(0, y));

  const col = Math.floor(cx / tile);
  const row = Math.floor(cy / tile);
  return row * N + col;
}

function handleClick(ev){
  if (!startedAt) startTimer();
  if (!img.complete) return;

  const pos = posFromEvent(ev);

  if (selected === null){
    selected = pos;
    draw();
    return;
  }

  if (selected === pos){
    selected = null;
    draw();
    return;
  }
  
  [order[selected], order[pos]] = [order[pos], order[selected]];
  selected = null;

  moves += 1;
  movesEl.textContent = String(moves);

  draw();

  if (isSolved()){
    stopTimer();
    setMsg("ok", "Perfect. Ai refăcut poza.");
    revealText.textContent = CONFIG.revealText;
    reveal.classList.remove("hidden");
  }
}

function applySize(newN){
  N = newN;
  tile = CONFIG.boardPx / N;
  diffLabel.textContent = `${N}x${N}`;
  initOrder();
  shuffle();
}

btnShuffle.addEventListener("click", () => shuffle());
btnReset.addEventListener("click", () => {
  stopTimer();
  startedAt = null;
  initOrder();
  shuffle();
});

btnAgain.addEventListener("click", () => {
  stopTimer();
  startedAt = null;
  initOrder();
  shuffle();
});

sizeSelect.addEventListener("change", () => {
  stopTimer();
  startedAt = null;
  applySize(Number(sizeSelect.value));
});

canvas.addEventListener("click", handleClick);

img.onload = () => {
  applySize(N);
};

img.onerror = () => {
  setMsg("bad", "Nu găsesc photo.jpg. Pune poza în folder și numește-o exact photo.jpg.");
};
