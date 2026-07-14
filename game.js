const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const coinsEl = document.getElementById('coins');
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('startBtn');

const W = canvas.width;
const H = canvas.height;
const laneXs = [-122, 0, 122];
const raths = [
  { name: 'Balabhadra', lane: 0, canopy: '#0a8f66', trim: '#f4d35e', face: '#fff1bf' },
  { name: 'Jagannath', lane: 1, canopy: '#d9241f', trim: '#ffb32c', face: '#20100a' },
  { name: 'Subhadra', lane: 2, canopy: '#f08a1d', trim: '#d9241f', face: '#f2b13d' },
];
const state = {
  running: false,
  over: false,
  time: 0,
  speed: 8.5,
  score: 0,
  flowers: 0,
  obstacleTimer: 35,
  flowerTimer: 42,
  obstacles: [],
  flowersOnRoad: [],
  petals: [],
};
const player = { lane: 1, x: 0, y: 0, vy: 0, duck: 0, blessing: 45 };

function resetGame() {
  Object.assign(state, {
    running: true, over: false, time: 0, speed: 8.5, score: 0, flowers: 0,
    obstacleTimer: 32, flowerTimer: 40, obstacles: [], flowersOnRoad: [], petals: [],
  });
  Object.assign(player, { lane: 1, x: 0, y: 0, vy: 0, duck: 0, blessing: 50 });
  overlay.classList.add('hidden');
  startBtn.textContent = 'Restart Yatra';
  updateHud();
}

function finishRun() {
  state.running = false;
  state.over = true;
  overlay.classList.remove('hidden');
  overlay.querySelector('h2').textContent = 'Yatra Paused';
  overlay.querySelector('p').textContent = `Distance ${Math.floor(state.score)}m • ${state.flowers} flowers offered. Press Space to guide the ropes again.`;
}

function updateHud() {
  scoreEl.textContent = `${Math.floor(state.score).toLocaleString()}m`;
  coinsEl.textContent = state.flowers.toLocaleString();
}

function moveLane(dir) {
  if (!state.running) return;
  player.lane = Math.max(0, Math.min(2, player.lane + dir));
}
function jump() {
  if (state.running && player.y === 0) player.vy = 19;
}
function duck() {
  if (state.running) player.duck = 34;
}

function spawnObstacle() {
  const lane = Math.floor(Math.random() * 3);
  const types = ['basket', 'banner', 'crowd-gap'];
  const type = types[Math.floor(Math.random() * types.length)];
  state.obstacles.push({ lane, type, z: 980, wobble: Math.random() * Math.PI * 2 });
}

function spawnFlowers() {
  const lane = Math.floor(Math.random() * 3);
  for (let i = 0; i < 6; i++) {
    state.flowersOnRoad.push({ lane, z: 850 + i * 76, spin: Math.random() * 6.28 });
  }
}

function project(x, z, lift = 0) {
  const scale = 530 / (z + 530);
  return { x: W / 2 + x * scale, y: H - 78 - z * .42 * scale - lift * scale, scale };
}

function roundedRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

function drawSkyAndTemple() {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#7ab5e9'); sky.addColorStop(.32, '#f2c78b'); sky.addColorStop(.66, '#8f3d18'); sky.addColorStop(1, '#361409');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = 'rgba(255,245,210,.55)';
  for (let i = 0; i < 9; i++) {
    ctx.beginPath();
    ctx.ellipse(40 + i * 55 + Math.sin(state.time * .01 + i) * 18, 58 + (i % 3) * 18, 45, 14, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawTempleTower(W / 2 + 124, 192, .76);
  drawTempleTower(W / 2 - 168, 228, .58);

  ctx.fillStyle = 'rgba(81,38,18,.7)';
  ctx.fillRect(0, 210, W, 64);
  for (let x = 10; x < W; x += 44) {
    ctx.fillStyle = '#693519'; ctx.fillRect(x, 180 + (x % 3) * 6, 28, 94);
    ctx.fillStyle = '#d89439'; ctx.fillRect(x - 5, 174 + (x % 3) * 6, 38, 10);
  }
}

function drawTempleTower(x, baseY, s) {
  ctx.save(); ctx.translate(x, baseY); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(85,45,24,.78)';
  for (let i = 0; i < 8; i++) {
    const w = 88 - i * 7;
    ctx.fillRect(-w / 2, -i * 22, w, 18);
  }
  ctx.fillStyle = '#b9752c'; ctx.beginPath(); ctx.moveTo(-18, -184); ctx.lineTo(0, -224); ctx.lineTo(18, -184); ctx.fill();
  ctx.fillStyle = '#d6231f'; ctx.fillRect(0, -222, 34, 12);
  ctx.restore();
}

function drawRoad() {
  ctx.beginPath(); ctx.moveTo(W / 2 - 88, 250); ctx.lineTo(W / 2 + 88, 250); ctx.lineTo(W + 80, H); ctx.lineTo(-80, H); ctx.closePath();
  ctx.fillStyle = '#8a431c'; ctx.fill();
  ctx.fillStyle = 'rgba(255,209,108,.18)';
  for (let i = 0; i < 42; i++) {
    const z = (i * 48 - (state.time * state.speed * 3.2) % 48) + 35;
    const a = project(-210, z), b = project(210, z);
    ctx.beginPath(); ctx.ellipse(a.x + (b.x - a.x) * ((i * 37) % 100 / 100), a.y, 3 * a.scale, 2 * a.scale, 0, 0, 7); ctx.fill();
  }
  for (const lx of [-61, 61]) {
    ctx.strokeStyle = 'rgba(255,231,168,.34)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W / 2 + lx * .26, 260); ctx.lineTo(W / 2 + lx * 3.2, H); ctx.stroke();
  }
  for (const laneX of laneXs) drawRope(laneX);
}

function drawRope(laneX) {
  const end = project(laneX, 0, player.y > 0 ? 22 : 0);
  const start = project(laneX * .9, 720, -40);
  ctx.strokeStyle = '#d2a66a'; ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  for (let i = 1; i <= 16; i++) {
    const t = i / 16;
    const x = start.x + (end.x - start.x) * t + Math.sin(t * 12 + state.time * .16) * 3;
    const y = start.y + (end.y - start.y) * t;
    ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.strokeStyle = 'rgba(88,45,19,.55)'; ctx.lineWidth = 2;
  ctx.setLineDash([8, 7]); ctx.stroke(); ctx.setLineDash([]);
}

function drawRaths() {
  raths.forEach((rath, i) => drawRath(rath, laneXs[i], 710 + Math.sin(state.time * .025 + i) * 18));
}

function drawRath(rath, laneX, z) {
  const p = project(laneX, z, -8);
  ctx.save(); ctx.translate(p.x, p.y); ctx.scale(p.scale, p.scale);
  const sway = Math.sin(state.time * .055 + rath.lane) * 4;
  ctx.translate(0, sway);

  ctx.fillStyle = 'rgba(55,20,8,.35)'; ctx.beginPath(); ctx.ellipse(0, 70, 92, 20, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#6e3518'; roundedRect(-74, -8, 148, 78, 10); ctx.fill();
  ctx.fillStyle = '#bd812d'; ctx.fillRect(-82, -22, 164, 18);
  for (let x of [-52, 52]) drawWheel(x, 70, 26);

  ctx.fillStyle = rath.canopy;
  ctx.beginPath(); ctx.moveTo(-66, -16); ctx.bezierCurveTo(-50, -118, 50, -118, 66, -16); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = rath.trim; ctx.lineWidth = 8;
  for (let x of [-42, 0, 42]) { ctx.beginPath(); ctx.moveTo(x, -16); ctx.quadraticCurveTo(x * .5, -100, 0, -112); ctx.stroke(); }
  ctx.fillStyle = rath.trim; ctx.beginPath(); ctx.arc(0, -124, 15, 0, 7); ctx.fill(); ctx.fillRect(-5, -160, 10, 40);

  ctx.fillStyle = rath.face; ctx.beginPath(); ctx.arc(0, 2, 34, 0, 7); ctx.fill();
  ctx.fillStyle = rath.name === 'Jagannath' ? '#fff' : '#2a1107';
  ctx.beginPath(); ctx.arc(-13, -4, 9, 0, 7); ctx.arc(13, -4, 9, 0, 7); ctx.fill();
  ctx.fillStyle = rath.name === 'Jagannath' ? '#121212' : '#fff';
  ctx.beginPath(); ctx.arc(-13, -4, 4, 0, 7); ctx.arc(13, -4, 4, 0, 7); ctx.fill();
  ctx.strokeStyle = '#f2d076'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 10, 20, .15, Math.PI - .15); ctx.stroke();

  ctx.fillStyle = '#f5c13a';
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(-48 + i * 24, 34 + Math.sin(state.time * .09 + i) * 3, 8, 0, 7); ctx.fill(); }
  ctx.restore();
}

function drawWheel(x, y, r) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(state.time * .11);
  ctx.fillStyle = '#42200e'; ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill();
  ctx.strokeStyle = '#f0b34d'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, r - 5, 0, 7); ctx.stroke();
  for (let i = 0; i < 8; i++) { ctx.rotate(Math.PI / 4); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r - 8, 0); ctx.stroke(); }
  ctx.restore();
}

function drawSevakRunner() {
  player.x += (laneXs[player.lane] - player.x) * .22;
  const p = project(player.x, 0, player.y);
  const run = Math.sin(state.time * .6);
  ctx.save(); ctx.translate(p.x, p.y); ctx.scale(1.05, 1.05);
  if (player.blessing % 8 > 4) ctx.globalAlpha = .62;
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(0, 52, 34, 9, 0, 0, 7); ctx.fill();
  ctx.strokeStyle = '#5b2a12'; ctx.lineWidth = 8; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-8, 20); ctx.lineTo(-20 + run * 9, 58); ctx.moveTo(10, 20); ctx.lineTo(22 - run * 9, 58); ctx.stroke();
  ctx.fillStyle = '#f7c38b'; ctx.beginPath(); ctx.ellipse(0, -4, player.duck ? 25 : 20, player.duck ? 16 : 30, 0, 0, 7); ctx.fill();
  ctx.fillStyle = '#f7941e'; ctx.fillRect(-22, 12, 44, 20);
  ctx.strokeStyle = '#f7c38b'; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(-18, -6); ctx.lineTo(-44, 10 + run * 8); ctx.moveTo(18, -6); ctx.lineTo(44, 10 - run * 8); ctx.stroke();
  ctx.fillStyle = '#f7c38b'; ctx.beginPath(); ctx.arc(0, -44, 19, 0, 7); ctx.fill();
  ctx.fillStyle = '#2c160d'; ctx.fillRect(-18, -62, 36, 10);
  ctx.fillStyle = '#ffd45d'; ctx.fillRect(-22, -58, 44, 8);
  ctx.restore();
}

function drawObstacle(o) {
  const p = project(laneXs[o.lane], o.z);
  ctx.save(); ctx.translate(p.x, p.y); ctx.scale(p.scale, p.scale);
  if (o.type === 'basket') {
    ctx.fillStyle = '#8a4c20'; roundedRect(-34, -22, 68, 42, 8); ctx.fill();
    ctx.fillStyle = '#ffcf4d'; for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.arc(-24 + i * 8, -22 + Math.sin(i) * 5, 8, 0, 7); ctx.fill(); }
  } else if (o.type === 'banner') {
    ctx.strokeStyle = '#5a2710'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(-66, -96); ctx.lineTo(66, -96); ctx.stroke();
    ctx.fillStyle = '#d6231f'; roundedRect(-56, -92, 112, 35, 7); ctx.fill();
    ctx.fillStyle = '#ffe07a'; ctx.font = '700 18px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('जय', 0, -68);
  } else {
    ctx.fillStyle = '#45200e'; roundedRect(-48, -78, 96, 88, 13); ctx.fill();
    ctx.fillStyle = '#ffd45d'; ctx.fillRect(-40, -70, 80, 13);
    ctx.fillStyle = '#f7c38b'; for (let x of [-26, 0, 26]) { ctx.beginPath(); ctx.arc(x, -28 + Math.sin(state.time * .08 + x) * 4, 15, 0, 7); ctx.fill(); }
  }
  ctx.restore();
}

function drawFlower(f) {
  const p = project(laneXs[f.lane], f.z, 32 + Math.sin(state.time * .12 + f.spin) * 9);
  ctx.save(); ctx.translate(p.x, p.y); ctx.scale(p.scale, p.scale); ctx.rotate(f.spin + state.time * .08);
  for (let i = 0; i < 6; i++) { ctx.rotate(Math.PI / 3); ctx.fillStyle = i % 2 ? '#ff7a22' : '#ffd44e'; ctx.beginPath(); ctx.ellipse(0, -13, 8, 16, 0, 0, 7); ctx.fill(); }
  ctx.fillStyle = '#d6231f'; ctx.beginPath(); ctx.arc(0, 0, 7, 0, 7); ctx.fill();
  ctx.restore();
}

function update() {
  if (!state.running) return;
  state.time++;
  state.speed += .0035;
  state.score += state.speed * .055;
  player.y = Math.max(0, player.y + player.vy);
  if (player.y > 0) player.vy -= 1.18;
  if (player.y === 0) player.vy = 0;
  player.duck = Math.max(0, player.duck - 1);
  player.blessing = Math.max(0, player.blessing - 1);

  if (--state.obstacleTimer <= 0) { spawnObstacle(); state.obstacleTimer = Math.max(35, 86 - state.speed * 3.2); }
  if (--state.flowerTimer <= 0) { spawnFlowers(); state.flowerTimer = 118; }
  for (const item of [...state.obstacles, ...state.flowersOnRoad]) item.z -= state.speed;
  state.obstacles = state.obstacles.filter(o => o.z > -70);
  state.flowersOnRoad = state.flowersOnRoad.filter(f => f.z > -70);

  for (const o of state.obstacles) {
    if (o.z < 62 && o.z > -36 && o.lane === player.lane && !player.blessing) {
      const cleared = (o.type === 'basket' && player.y > 70) || (o.type === 'banner' && player.duck > 0);
      if (!cleared) finishRun();
    }
  }
  state.flowersOnRoad = state.flowersOnRoad.filter(f => {
    const collected = f.z < 58 && f.z > -42 && f.lane === player.lane && player.y < 130;
    if (collected) { state.flowers++; state.score += 18; }
    return !collected;
  });
  updateHud();
}

function render() {
  drawSkyAndTemple();
  drawRoad();
  drawRaths();
  [...state.flowersOnRoad].sort((a,b) => b.z - a.z).forEach(drawFlower);
  [...state.obstacles].sort((a,b) => b.z - a.z).forEach(drawObstacle);
  drawSevakRunner();
  requestAnimationFrame(loop);
}
function loop() { update(); render(); }

window.addEventListener('keydown', (event) => {
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(event.key)) event.preventDefault();
  if (event.key === 'ArrowLeft') moveLane(-1);
  if (event.key === 'ArrowRight') moveLane(1);
  if (event.key === 'ArrowUp') jump();
  if (event.key === 'ArrowDown') duck();
  if (event.key === ' ') resetGame();
});

let touchStart = null;
canvas.addEventListener('pointerdown', (event) => { touchStart = { x: event.clientX, y: event.clientY }; });
canvas.addEventListener('pointerup', (event) => {
  if (!touchStart) return;
  const dx = event.clientX - touchStart.x;
  const dy = event.clientY - touchStart.y;
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 24) moveLane(dx > 0 ? 1 : -1);
  else if (dy < -22) jump();
  else if (dy > 22) duck();
  else jump();
  touchStart = null;
});
startBtn.addEventListener('click', resetGame);
render();
