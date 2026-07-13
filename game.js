const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d', { alpha: false });
const scoreEl = document.getElementById('score');
const coinsEl = document.getElementById('coins');
const blessingEl = document.getElementById('blessing');
const healthEl = document.getElementById('health');
const overlay = document.getElementById('overlay');
const eduCard = document.getElementById('eduCard');
const startBtn = document.getElementById('startBtn');
const easyBtn = document.getElementById('easyBtn');
const continueBtn = document.getElementById('continueBtn');
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const pauseBtn = document.getElementById('pauseBtn');

const W = canvas.width;
const H = canvas.height;
const lanes = [-250, 0, 250];
const chapters = [
  { name: 'Village Road', target: 1200, speed: 9, fact: 'Rath Yatra means “chariot journey”. It celebrates Lord Jagannath, Balabhadra, and Subhadra travelling in grand wooden chariots.' },
  { name: 'Town Celebration', target: 1700, speed: 10.4, fact: 'In Puri, Odisha, many devotees pull the chariots together. The act represents service, unity, and shared devotion.' },
  { name: 'Temple Surroundings', target: 2200, speed: 11.7, fact: 'Lord Jagannath is lovingly associated with the Jagannath Temple of Puri, one of India’s most revered pilgrimage places.' },
  { name: 'Grand Puri Procession', target: 2750, speed: 13.2, fact: 'The chariots are decorated with bright cloth, flowers, flags, wheels, and traditional motifs made by skilled artisans.' },
  { name: 'Festival Finale', target: 3400, speed: 15, fact: 'Rath Yatra welcomes people from many backgrounds and highlights joy, community, humility, and cultural heritage.' },
];
const collectibleTypes = [
  { type: 'flower', value: 25, coin: 1, color: '#ff4f9a', label: '✿' },
  { type: 'mahaprasad', value: 60, coin: 2, color: '#f5a623', label: '●' },
  { type: 'bell', value: 40, coin: 1, color: '#ffd54a', label: '🔔' },
  { type: 'lamp', value: 50, coin: 1, color: '#ff7a1a', label: '✦' },
  { type: 'flag', value: 35, coin: 1, color: '#2f9b64', label: '⚑' },
  { type: 'blessing', value: 90, coin: 3, color: '#7a5cff', label: 'ॐ' },
];
const obstacleTypes = ['barrier', 'puddle', 'cart', 'rope', 'animal', 'block'];
const powerUps = ['Divine Blessing', '2X Score', 'Temple Bell Slow Motion', 'Mahaprasad Health', 'Golden Rope'];

const state = {
  running: false, paused: false, mode: 'story', easy: false, muted: false, time: 0, shake: 0,
  chapter: 0, levelScore: 0, score: 0, coins: 0, blessing: 0, health: 100, happiness: 100,
  speed: 9, spawnTimer: 35, devoteeTimer: 50, collectibleTimer: 65, powerTimer: 900,
  obstacles: [], devotees: [], collectibles: [], particles: [], power: null, powerLeft: 0, combo: 1,
};
const rath = { lane: 1, x: lanes[1] };
const save = JSON.parse(localStorage.getItem('rath-yatra-save') || '{"coins":0,"best":0,"tokens":0}');

function persist() { save.coins = Math.max(save.coins || 0, state.coins); save.best = Math.max(save.best || 0, Math.floor(state.score)); localStorage.setItem('rath-yatra-save', JSON.stringify(save)); }
function resetGame() {
  Object.assign(state, { running: true, paused: false, time: 0, shake: 0, chapter: 0, levelScore: 0, score: 0, coins: save.coins || 0, blessing: 0, health: 100, happiness: 100, speed: chapters[0].speed, spawnTimer: 35, devoteeTimer: 40, collectibleTimer: 60, powerTimer: 500, obstacles: [], devotees: [], collectibles: [], particles: [], power: null, powerLeft: 0, combo: 1 });
  Object.assign(rath, { lane: 1, x: lanes[1] });
  overlay.classList.add('hidden'); eduCard.classList.add('hidden'); updateHud();
}
function endGame(title = 'Procession Complete') {
  state.running = false; persist(); overlay.classList.remove('hidden');
  overlay.querySelector('.eyebrow').textContent = `Best ${save.best.toLocaleString()} • Coins ${save.coins.toLocaleString()}`;
  overlay.querySelector('h2').textContent = title;
  overlay.querySelector('p').textContent = `Score ${Math.floor(state.score).toLocaleString()} • Blessing ${Math.floor(state.blessing)}% • Crowd happiness ${Math.floor(state.happiness)}%.`;
  startBtn.textContent = 'Restart Journey';
}
function updateHud() { scoreEl.textContent = Math.floor(state.score).toLocaleString(); coinsEl.textContent = state.coins.toLocaleString(); blessingEl.textContent = `${Math.floor(state.blessing)}%`; healthEl.textContent = `${Math.max(0, Math.floor(state.health))}%`; }
function move(dir) { if (state.running && !state.paused) rath.lane = Math.max(0, Math.min(2, rath.lane + dir)); }
function addParticles(x, y, color, count = 9) { if (matchMedia('(prefers-reduced-motion: reduce)').matches) return; for (let i = 0; i < count; i++) state.particles.push({ x, y, vx: (Math.random() - .5) * 8, vy: -Math.random() * 8 - 2, life: 35, color }); }
function project(x, z, lift = 0) { const scale = 760 / (z + 760); return { x: W / 2 + x * scale, y: H - 145 - z * .55 * scale - lift * scale, scale }; }
function spawnObstacle() { const lane = Math.floor(Math.random() * 3); state.obstacles.push({ lane, z: 1500, type: obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)], hit: false }); }
function spawnDevotee() { const side = Math.random() < .5 ? -1 : 1; const lane = side < 0 ? 0 : 2; state.devotees.push({ lane, side, z: 1450, board: false, wave: Math.random() * 6.28 }); }
function spawnCollectibles() { const lane = Math.floor(Math.random() * 3); const item = collectibleTypes[Math.floor(Math.random() * collectibleTypes.length)]; for (let i = 0; i < 4; i++) state.collectibles.push({ ...item, lane, z: 1150 + i * 115, bob: Math.random() * 6.28 }); }
function spawnPower() { const lane = Math.floor(Math.random() * 3); state.collectibles.push({ type: 'power', value: 150, coin: 5, color: '#fff176', label: '✺', lane, z: 1300, bob: 0, power: powerUps[Math.floor(Math.random() * powerUps.length)] }); }

function drawBackground() {
  const chapter = chapters[state.chapter] || chapters.at(-1);
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, state.chapter >= 3 ? '#ffbd6b' : '#78d8ff'); g.addColorStop(.55, '#fff0b2'); g.addColorStop(1, '#d98b55'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(117,57,23,.16)'; for (let i = 0; i < 7; i++) { const x = (i * 180 - state.time * .35) % (W + 220) - 80; ctx.beginPath(); ctx.ellipse(x, 110 + i % 3 * 42, 88, 26, 0, 0, 7); ctx.fill(); }
  for (let side of [-1, 1]) for (let i = 0; i < 12; i++) { const z = (i * 220 - (state.time * state.speed * 2) % 220) + 90; const p = project(side * 470, z); ctx.save(); ctx.translate(p.x, p.y); ctx.scale(p.scale, p.scale); ctx.fillStyle = '#b93220'; ctx.fillRect(-16, -140, 32, 140); ctx.fillStyle = i % 2 ? '#ffd54a' : '#2f9b64'; ctx.beginPath(); ctx.moveTo(0, -140); ctx.lineTo(side * 86, -112); ctx.lineTo(0, -88); ctx.fill(); ctx.restore(); }
  ctx.fillStyle = '#7f2a1d'; ctx.font = '900 34px system-ui'; ctx.fillText(chapter.name, 28, H - 28);
}
function drawRoad() { ctx.beginPath(); ctx.moveTo(W/2-105, 320); ctx.lineTo(W/2+105, 320); ctx.lineTo(W-54,H); ctx.lineTo(54,H); ctx.closePath(); ctx.fillStyle = '#c56d39'; ctx.fill(); ctx.strokeStyle = 'rgba(255,248,226,.7)'; ctx.lineWidth = 6; for (const lx of [-128,128]) { ctx.beginPath(); ctx.moveTo(W/2+lx*.35,330); ctx.lineTo(W/2+lx*2.9,H); ctx.stroke(); } }
function drawRath() { rath.x += (lanes[rath.lane] - rath.x) * .2; const p = project(rath.x, 0); ctx.save(); ctx.translate(p.x + (Math.random()-.5)*state.shake, p.y); ctx.scale(1.05,1.05); ctx.fillStyle='rgba(54,24,9,.25)'; ctx.beginPath(); ctx.ellipse(0,76,118,24,0,0,7); ctx.fill(); ctx.fillStyle='#8f1d1d'; ctx.fillRect(-92,-110,184,150); ctx.fillStyle='#ffd54a'; ctx.fillRect(-74,-88,148,20); ctx.fillStyle='#ff8a1f'; ctx.beginPath(); ctx.moveTo(-118,-108); ctx.lineTo(0,-238); ctx.lineTo(118,-108); ctx.fill(); ctx.fillStyle='#fff7df'; ctx.beginPath(); ctx.arc(0,-52,26,0,7); ctx.fill(); ctx.fillStyle='#2f9b64'; ctx.fillRect(-8,-286,16,58); ctx.fillStyle='#d9417e'; ctx.beginPath(); ctx.moveTo(0,-286); ctx.lineTo(68,-264); ctx.lineTo(0,-238); ctx.fill(); ctx.strokeStyle='#4b190c'; ctx.lineWidth=12; [-62,62].forEach(x=>{ctx.beginPath(); ctx.arc(x,54,34,0,7); ctx.stroke();}); if (state.powerLeft>0) { ctx.strokeStyle='rgba(255,255,160,.85)'; ctx.lineWidth=8; ctx.beginPath(); ctx.arc(0,-58,145,0,7); ctx.stroke(); } ctx.restore(); }
function drawObstacle(o) { const p=project(lanes[o.lane],o.z); ctx.save(); ctx.translate(p.x,p.y); ctx.scale(p.scale,p.scale); ctx.fillStyle='#6b3b25'; if(o.type==='puddle'){ctx.fillStyle='#4aa3df';ctx.beginPath();ctx.ellipse(0,20,80,28,0,0,7);ctx.fill();} else if(o.type==='animal'){ctx.fillStyle='#8a623d';ctx.beginPath();ctx.ellipse(0,-18,58,34,0,0,7);ctx.fill();ctx.fillRect(34,-40,32,24);} else {ctx.fillRect(-70,-36,140,58);ctx.fillStyle=o.type==='rope'?'#d3a15b':'#ffd54a';ctx.fillRect(-80,-52,160,18);} ctx.restore(); }
function drawCollectible(c) { const p=project(lanes[c.lane],c.z,80+Math.sin(state.time*.12+c.bob)*18); ctx.save(); ctx.translate(p.x,p.y); ctx.scale(p.scale,p.scale); ctx.fillStyle=c.color; ctx.beginPath(); ctx.arc(0,0,34,0,7); ctx.fill(); ctx.fillStyle='#5c150e'; ctx.font='900 30px system-ui'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(c.label,0,1); ctx.restore(); }
function drawDevotee(d) { const p=project(lanes[d.lane]+d.side*170,d.z); ctx.save(); ctx.translate(p.x,p.y); ctx.scale(p.scale,p.scale); ctx.fillStyle=d.side<0?'#2f9b64':'#d9417e'; ctx.fillRect(-18,-54,36,58); ctx.fillStyle='#8b4b2b'; ctx.beginPath(); ctx.arc(0,-76,20,0,7); ctx.fill(); ctx.strokeStyle='#ffd54a'; ctx.lineWidth=7; ctx.beginPath(); ctx.moveTo(0,-42); ctx.lineTo(d.side*(34+Math.sin(state.time*.2+d.wave)*12),-74); ctx.stroke(); ctx.restore(); }
function drawParticles(){ state.particles.forEach(p=>{ctx.globalAlpha=Math.max(0,p.life/35);ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,7,7);p.x+=p.vx;p.y+=p.vy;p.vy+=.35;p.life--;});ctx.globalAlpha=1;state.particles=state.particles.filter(p=>p.life>0); }

function levelComplete() { state.running = false; const ch = chapters[state.chapter]; document.getElementById('eduChapter').textContent = `Chapter ${state.chapter + 1} Complete`; document.getElementById('eduTitle').textContent = ch.name; document.getElementById('eduText').textContent = ch.fact; eduCard.classList.remove('hidden'); persist(); }
function activatePower(c) { state.power = c.power; state.powerLeft = 420; if (c.power.includes('Health')) state.health = Math.min(100, state.health + 25); if (c.power.includes('2X')) state.combo = 2; if (c.power.includes('Slow')) state.speed *= .78; }
function update() {
  if (!state.running || state.paused) return; state.time++; state.shake=Math.max(0,state.shake-1); state.powerLeft=Math.max(0,state.powerLeft-1); if(!state.powerLeft){state.combo=1;state.power=null;}
  const chapter = chapters[state.chapter] || chapters.at(-1); state.speed += state.easy ? .0015 : .0035; state.score += state.speed*.12*state.combo; state.levelScore += state.speed*.12;
  if(--state.spawnTimer<=0){spawnObstacle();state.spawnTimer=Math.max(state.easy?58:40, 95-state.speed*3);}
  if(--state.devoteeTimer<=0){spawnDevotee();state.devoteeTimer=Math.max(36,88-state.speed*2);}
  if(--state.collectibleTimer<=0){spawnCollectibles();state.collectibleTimer=105;}
  if(--state.powerTimer<=0){spawnPower();state.powerTimer=760;}
  for (const list of [state.obstacles,state.devotees,state.collectibles]) for (const item of list) item.z -= state.power?.includes('Slow') ? state.speed*.72 : state.speed;
  state.obstacles.forEach(o=>{ if(!o.hit && o.z<65 && o.z>-45 && o.lane===rath.lane && !state.power?.includes('Divine')){ o.hit=true; state.health-=state.easy?10:18; state.shake=16; navigator.vibrate?.(35); addParticles(W/2,H-200,'#6b3b25',18); }});
  state.devotees.forEach(d=>{ if(!d.board && d.z<80 && d.z>-40 && d.lane===rath.lane){ d.board=true; state.score+=120*state.combo; state.blessing=Math.min(100,state.blessing+4); state.happiness=Math.min(100,state.happiness+2); addParticles(project(lanes[d.lane],0).x,H-230,'#ffd54a',14); } else if(!d.board && d.z<-60){ d.board=true; state.score=Math.max(0,state.score-45); state.happiness-=state.easy?2:5; }});
  state.collectibles = state.collectibles.filter(c=>{ const hit=c.z<70&&c.z>-55&&c.lane===rath.lane; if(hit){state.score+=c.value*state.combo;state.coins+=c.coin;state.blessing=Math.min(100,state.blessing+(c.type==='blessing'?5:1)); if(c.type==='power')activatePower(c); addParticles(project(lanes[c.lane],0).x,H-260,c.color,12);} return !hit && c.z>-100; });
  state.obstacles=state.obstacles.filter(o=>o.z>-120); state.devotees=state.devotees.filter(d=>d.z>-130);
  if(state.health<=0 || state.happiness<=0) endGame('Procession Paused');
  if(state.mode==='story' && state.levelScore>=chapter.target) levelComplete(); updateHud();
}
function render(){ drawBackground(); drawRoad(); [...state.devotees].sort((a,b)=>b.z-a.z).forEach(drawDevotee); [...state.collectibles].sort((a,b)=>b.z-a.z).forEach(drawCollectible); [...state.obstacles].sort((a,b)=>b.z-a.z).forEach(drawObstacle); drawRath(); drawParticles(); if(state.paused){ctx.fillStyle='rgba(38,20,11,.45)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff7df';ctx.font='900 80px system-ui';ctx.textAlign='center';ctx.fillText('Paused',W/2,H/2);} requestAnimationFrame(loop); }
function loop(){ update(); render(); }

startBtn.addEventListener('click', resetGame); continueBtn.addEventListener('click',()=>{ state.chapter++; if(state.chapter>=chapters.length) return endGame('Festival Finale Complete'); state.levelScore=0; state.speed=chapters[state.chapter].speed; state.running=true; eduCard.classList.add('hidden'); });
easyBtn.addEventListener('click',()=>{state.easy=!state.easy; easyBtn.textContent=`Easy Mode: ${state.easy?'On':'Off'}`;});
document.querySelectorAll('.mode').forEach(btn=>btn.addEventListener('click',()=>{document.querySelector('.mode.active').classList.remove('active');btn.classList.add('active');state.mode=btn.dataset.mode;}));
leftBtn.addEventListener('click',()=>move(-1)); rightBtn.addEventListener('click',()=>move(1)); pauseBtn.addEventListener('click',()=>{state.paused=!state.paused;});
window.addEventListener('keydown',e=>{ if(['ArrowLeft','ArrowRight',' ','p','P','h','H','m','M'].includes(e.key)) e.preventDefault(); if(e.key==='ArrowLeft')move(-1); if(e.key==='ArrowRight')move(1); if(e.key===' ')resetGame(); if(e.key.toLowerCase()==='p')state.paused=!state.paused; if(e.key.toLowerCase()==='h')document.body.classList.toggle('high-contrast'); if(e.key.toLowerCase()==='m')state.muted=!state.muted; });
let touchStart=null; canvas.addEventListener('pointerdown',e=>touchStart={x:e.clientX,y:e.clientY}); canvas.addEventListener('pointerup',e=>{ if(!touchStart)return; const dx=e.clientX-touchStart.x; if(Math.abs(dx)>24)move(dx>0?1:-1); touchStart=null; });
if ('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js').catch(()=>{});
render(); updateHud();
