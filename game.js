const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const coinsEl = document.getElementById('coins');
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('startBtn');

const W = canvas.width;
const H = canvas.height;
const lanes = [-185, 0, 185];
const state = {
  running: false,
  over: false,
  time: 0,
  speed: 12,
  score: 0,
  coins: 0,
  spawnTimer: 0,
  charmTimer: 0,
  obstacles: [],
  charms: [],
  particles: [],
  keys: new Set(),
};

const player = {
  lane: 1,
  x: lanes[1],
  y: 0,
  vy: 0,
  sliding: 0,
  invincible: 0,
};

function resetGame() {
  Object.assign(state, { running: true, over: false, time: 0, speed: 12, score: 0, coins: 0, spawnTimer: 18, charmTimer: 45, obstacles: [], charms: [], particles: [] });
  Object.assign(player, { lane: 1, x: lanes[1], y: 0, vy: 0, sliding: 0, invincible: 45 });
  overlay.classList.add('hidden');
  updateHud();
}

function endGame() {
  state.running = false;
  state.over = true;
  overlay.classList.remove('hidden');
  overlay.querySelector('h2').textContent = 'Run Complete!';
  overlay.querySelector('p').textContent = `Score ${Math.floor(state.score)} • ${state.coins} moon charms. Press Space to sprint again.`;
  startBtn.textContent = 'Restart Run';
}

function updateHud() {
  scoreEl.textContent = Math.floor(state.score).toLocaleString();
  coinsEl.textContent = state.coins.toLocaleString();
}

function laneMove(dir) {
  if (!state.running) return;
  player.lane = Math.max(0, Math.min(2, player.lane + dir));
}
function jump() {
  if (!state.running) return;
  if (player.y === 0) player.vy = 22;
}
function slide() {
  if (!state.running) return;
  player.sliding = 34;
}

function spawnObstacle() {
  const lane = Math.floor(Math.random() * 3);
  const roll = Math.random();
  state.obstacles.push({ lane, z: 1060, type: roll < .45 ? 'gate' : roll < .75 ? 'lantern' : 'spirit', wobble: Math.random() * 9 });
}
function spawnCharmLine() {
  const lane = Math.floor(Math.random() * 3);
  for (let i = 0; i < 5; i++) state.charms.push({ lane, z: 920 + i * 96, bob: Math.random() * 6.28 });
}

function project(x, z, lift = 0) {
  const scale = 580 / (z + 580);
  return { x: W / 2 + x * scale, y: H - 80 - z * .34 * scale - lift * scale, scale };
}

function drawBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#160b31'); g.addColorStop(.52, '#271046'); g.addColorStop(1, '#070711');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalAlpha = .9;
  for (let i = 0; i < 80; i++) {
    const x = (i * 131 + state.time * (i % 5 + 1) * .12) % W;
    const y = (i * 67) % 300;
    ctx.fillStyle = i % 3 ? '#ffd7fb' : '#75e7ff';
    ctx.fillRect(x, y, 2, 2);
  }
  ctx.restore();

  for (let side of [-1, 1]) {
    for (let i = 0; i < 12; i++) {
      const z = (i * 150 - (state.time * state.speed * 2) % 150) + 100;
      const p = project(side * 380, z);
      ctx.fillStyle = 'rgba(255,70,178,.55)';
      ctx.fillRect(p.x - 8 * p.scale, p.y - 120 * p.scale, 16 * p.scale, 120 * p.scale);
      ctx.beginPath(); ctx.arc(p.x, p.y - 136 * p.scale, 24 * p.scale, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,225,100,.78)'; ctx.fill();
    }
  }
}

function drawRoad() {
  ctx.beginPath(); ctx.moveTo(W / 2 - 80, 245); ctx.lineTo(W / 2 + 80, 245); ctx.lineTo(W - 70, H); ctx.lineTo(70, H); ctx.closePath();
  ctx.fillStyle = '#171330'; ctx.fill();
  for (const laneX of [-92, 92]) {
    ctx.strokeStyle = 'rgba(103,232,255,.45)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(W / 2 + laneX * .22, 250); ctx.lineTo(W / 2 + laneX * 2.6, H); ctx.stroke();
  }
  for (let i = 0; i < 22; i++) {
    const z = (i * 76 - (state.time * state.speed * 4) % 76) + 40;
    const a = project(-305, z), b = project(305, z);
    ctx.strokeStyle = 'rgba(255,255,255,.09)'; ctx.lineWidth = Math.max(1, a.scale * 3);
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  }
}

function drawAnimeRunner() {
  const targetX = lanes[player.lane];
  player.x += (targetX - player.x) * .22;
  const p = project(player.x, 0, player.y);
  const s = 1.25;
  const bob = Math.sin(state.time * .38) * (player.y ? 2 : 8);
  ctx.save(); ctx.translate(p.x, p.y + bob); ctx.scale(s, s);
  if (player.invincible % 8 > 4) ctx.globalAlpha = .5;
  ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(0, 50, 36, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#21152e'; ctx.lineWidth = 8; ctx.lineCap = 'round';
  const run = Math.sin(state.time * .55);
  ctx.beginPath(); ctx.moveTo(-10, 28); ctx.lineTo(-22 + run * 10, 64); ctx.moveTo(12, 28); ctx.lineTo(25 - run * 10, 64); ctx.stroke();
  ctx.fillStyle = '#ff5fc8'; ctx.beginPath(); ctx.ellipse(0, 0, player.sliding ? 26 : 22, player.sliding ? 18 : 34, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#ffe76c'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-20, -2); ctx.lineTo(-42, 17 + run * 8); ctx.moveTo(20, -2); ctx.lineTo(42, 13 - run * 8); ctx.stroke();
  ctx.fillStyle = '#ffd3bd'; ctx.beginPath(); ctx.arc(0, -48, 23, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#22152f'; ctx.beginPath(); ctx.arc(-10, -58, 24, .2, Math.PI * 1.45); ctx.arc(12, -60, 22, Math.PI * 1.55, Math.PI * .85, true); ctx.fill();
  ctx.fillStyle = '#64f0ff'; ctx.beginPath(); ctx.arc(-8, -48, 4, 0, Math.PI * 2); ctx.arc(10, -48, 4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawObstacle(o) {
  const p = project(lanes[o.lane], o.z);
  ctx.save(); ctx.translate(p.x, p.y); ctx.scale(p.scale, p.scale);
  if (o.type === 'gate') {
    ctx.fillStyle = '#e9248c'; ctx.fillRect(-58, -118, 22, 118); ctx.fillRect(36, -118, 22, 118); ctx.fillRect(-72, -126, 144, 22);
    ctx.fillStyle = '#ffe66e'; ctx.fillRect(-38, -96, 76, 12);
  } else if (o.type === 'lantern') {
    ctx.strokeStyle = '#67e8ff'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(-70, -92); ctx.lineTo(70, -92); ctx.stroke();
    ctx.fillStyle = '#ffdd76'; ctx.beginPath(); ctx.ellipse(0, -64, 36, 28, 0, 0, Math.PI * 2); ctx.fill();
  } else {
    ctx.fillStyle = '#9b5cff'; ctx.beginPath(); ctx.ellipse(0, -46 + Math.sin(state.time * .2 + o.wobble) * 8, 46, 54, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(-14, -58, 7, 0, 7); ctx.arc(14, -58, 7, 0, 7); ctx.fill();
  }
  ctx.restore();
}

function drawCharm(c) {
  const p = project(lanes[c.lane], c.z, 40 + Math.sin(state.time * .12 + c.bob) * 18);
  ctx.save(); ctx.translate(p.x, p.y); ctx.scale(p.scale, p.scale); ctx.rotate(state.time * .08);
  ctx.fillStyle = '#ffe66e'; ctx.beginPath(); ctx.moveTo(0, -26); ctx.lineTo(8, -7); ctx.lineTo(28, -5); ctx.lineTo(12, 8); ctx.lineTo(17, 28); ctx.lineTo(0, 16); ctx.lineTo(-17, 28); ctx.lineTo(-12, 8); ctx.lineTo(-28, -5); ctx.lineTo(-8, -7); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function update() {
  if (!state.running) return;
  state.time++; state.speed += .004; state.score += state.speed * .08;
  player.y = Math.max(0, player.y + player.vy); player.vy -= player.y ? 1.35 : 0; if (player.y === 0) player.vy = 0;
  player.sliding = Math.max(0, player.sliding - 1); player.invincible = Math.max(0, player.invincible - 1);
  if (--state.spawnTimer <= 0) { spawnObstacle(); state.spawnTimer = Math.max(34, 82 - state.speed * 2.2); }
  if (--state.charmTimer <= 0) { spawnCharmLine(); state.charmTimer = 120; }
  for (const list of [state.obstacles, state.charms]) for (const item of list) item.z -= state.speed;
  state.obstacles = state.obstacles.filter(o => o.z > -90);
  state.charms = state.charms.filter(c => c.z > -90);
  for (const o of state.obstacles) {
    if (o.z < 70 && o.z > -35 && o.lane === player.lane && !player.invincible) {
      const safe = (o.type === 'gate' && player.y > 78) || (o.type === 'lantern' && player.sliding > 0);
      if (!safe) endGame();
    }
  }
  state.charms = state.charms.filter(c => {
    const hit = c.z < 55 && c.z > -45 && c.lane === player.lane && player.y < 130;
    if (hit) { state.coins++; state.score += 50; }
    return !hit;
  });
  updateHud();
}

function render() {
  drawBackground(); drawRoad();
  [...state.charms].sort((a,b)=>b.z-a.z).forEach(drawCharm);
  [...state.obstacles].sort((a,b)=>b.z-a.z).forEach(drawObstacle);
  drawAnimeRunner();
  requestAnimationFrame(loop);
}
function loop() { update(); render(); }

window.addEventListener('keydown', e => {
  if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key)) e.preventDefault();
  if (e.key === 'ArrowLeft') laneMove(-1);
  if (e.key === 'ArrowRight') laneMove(1);
  if (e.key === 'ArrowUp') jump();
  if (e.key === 'ArrowDown') slide();
  if (e.key === ' ') resetGame();
});
let touchStart = null;
canvas.addEventListener('pointerdown', e => touchStart = { x: e.clientX, y: e.clientY });
canvas.addEventListener('pointerup', e => {
  if (!touchStart) return;
  const dx = e.clientX - touchStart.x, dy = e.clientY - touchStart.y;
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 25) laneMove(dx > 0 ? 1 : -1);
  else if (dy < -20) jump(); else if (dy > 20) slide(); else jump();
});
startBtn.addEventListener('click', resetGame);
render();
