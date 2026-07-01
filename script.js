// ---------- boot sequence ----------
window.addEventListener('load', () => {
  const bar = document.getElementById('bar');
  setTimeout(()=>{ bar.style.width = '100%'; }, 300);
  setTimeout(()=>{
    document.getElementById('boot').classList.add('hide');
  }, 2600);
});

// ---------- typewriter ----------
const messages = [
  "System Notice: 检测到今天是你的专属版本更新日 v+1",
  "恭喜解锁新称号《又老了一岁的可爱宅男》",
  "祝你打游戏永远不卡顿，排位永远不掉分"
];
let mi = 0, ci = 0;
const tw = document.getElementById('typewriter');
function typeLoop(){
  const msg = messages[mi];
  if(ci <= msg.length){
    tw.textContent = msg.slice(0, ci);
    ci++;
    setTimeout(typeLoop, 65);
  } else {
    setTimeout(()=>{
      ci = 0; mi = (mi+1) % messages.length;
      typeLoop();
    }, 1600);
  }
}
setTimeout(typeLoop, 2800);

// ---------- secret messages on cake click ----------
const secrets = [
  "生日快乐！愿你 buff 常驻，debuff 全免。",
  "新的一岁，游戏连胜，工作不加班。",
  "愿你永远有理由熬夜——只不过是因为快乐，不是因为改需求。",
  "祝你被这个世界温柔以待，排位永远稳赢，大乱斗永远超神。"
];
const cake = document.getElementById('cake');
const secretMsg = document.getElementById('secret-msg');
let secretIndex = 0;
cake.addEventListener('click', (e)=>{
  secretMsg.textContent = secrets[secretIndex % secrets.length];
  secretIndex++;
  launchFireworks(e.clientX, e.clientY);
});

// ---------- buff button ----------
const buffs = [
  "🎯 「精准暴击」Buff：三角洲爆头率 +50%，一枪一个突突突",
  "🛌 「充能满格」Buff：睡眠质量拉满，通宵有理，早八不慌",
  "🎮 「连胜守护」Buff：排位连跪概率清零，本年只上分不掉分",
  "🪖 「千场老兵」Buff：三角洲撤离成功率 +100%，队友坑不倒你",
  "🍰 「好运加身」Buff：抽卡欧气+99，出货全靠手气",
  "💰 「隐藏富豪」Buff：想买的显卡/键盘/手办，钱包突然够用"
];
document.getElementById('buffBtn').addEventListener('click', ()=>{
  const pick = buffs[Math.floor(Math.random()*buffs.length)];
  const out = document.getElementById('buff-output');
  out.style.opacity = 0;
  setTimeout(()=>{
    out.textContent = pick;
    out.style.transition = 'opacity 0.4s';
    out.style.opacity = 1;
  }, 150);
});

// ---------- fireworks / confetti canvas ----------
const canvas = document.getElementById('fx-canvas');
const ctx = canvas.getContext('2d');
function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }
resize();
window.addEventListener('resize', resize);

const colors = ['#ff2ec4','#00fff2','#f9f871','#9d4edd','#ffffff'];
let particles = [];

function launchFireworks(x, y){
  x = x || innerWidth/2;
  y = y || innerHeight/2;
  for(let i=0;i<70;i++){
    const angle = Math.random()*Math.PI*2;
    const speed = 2 + Math.random()*6;
    particles.push({
      x, y,
      vx: Math.cos(angle)*speed,
      vy: Math.sin(angle)*speed,
      life: 60 + Math.random()*30,
      color: colors[Math.floor(Math.random()*colors.length)],
      size: 2 + Math.random()*3
    });
  }
}

function animate(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  particles.forEach(p=>{
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.05;
    p.life--;
    ctx.globalAlpha = Math.max(p.life/90, 0);
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
  particles = particles.filter(p=>p.life > 0);
  requestAnimationFrame(animate);
}
animate();

// auto fireworks once boot finishes, as a welcome burst
setTimeout(()=>{ launchFireworks(innerWidth/2, innerHeight*0.3); }, 3000);

// ---------- memory breach mini-game ----------
const memIcons = ['🪖','🔫','❄️','🛋️','⚡','🕹️'];
const memGrid = document.getElementById('memGrid');
const memMovesEl = document.getElementById('memMoves');
const memPairsEl = document.getElementById('memPairs');
const memResult = document.getElementById('mem-result');
const memRetryBtn = document.getElementById('memRetryBtn');

const jackpotText = "🎁 系统入侵成功！\n保险库解锁——隐藏款神秘礼物一份！\n7月11日现实到货，记得查收～";

let memDeck = [];
let memFlipped = [];
let memMatchedCount = 0;
let memMoves = 0;
let memLocked = false;

function shuffle(arr){
  for(let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildMemGame(){
  memDeck = shuffle([...memIcons, ...memIcons]);
  memFlipped = [];
  memMatchedCount = 0;
  memMoves = 0;
  memLocked = false;
  memResult.textContent = '';
  memResult.classList.remove('jackpot');
  memMovesEl.textContent = '0';
  memPairsEl.textContent = '0';

  memGrid.innerHTML = '';
  memDeck.forEach((icon, idx)=>{
    const card = document.createElement('div');
    card.className = 'mem-card';
    card.dataset.index = idx;
    card.dataset.icon = icon;
    card.innerHTML = `
      <div class="mem-card-inner">
        <div class="mem-face mem-face-front">🎴</div>
        <div class="mem-face mem-face-back">${icon}</div>
      </div>`;
    card.addEventListener('click', onMemCardClick);
    memGrid.appendChild(card);
  });
}

function onMemCardClick(e){
  const card = e.currentTarget;
  if(memLocked || card.classList.contains('flipped') || card.classList.contains('matched')) return;
  card.classList.add('flipped');
  memFlipped.push(card);

  if(memFlipped.length === 2){
    memLocked = true;
    memMoves++;
    memMovesEl.textContent = memMoves;
    const [a, b] = memFlipped;
    if(a.dataset.icon === b.dataset.icon){
      setTimeout(()=>{
        a.classList.add('matched');
        b.classList.add('matched');
        memMatchedCount++;
        memPairsEl.textContent = memMatchedCount;
        memFlipped = [];
        memLocked = false;
        if(memMatchedCount === memIcons.length){
          memResult.textContent = jackpotText + `\n（本次用了 ${memMoves} 步破译系统）`;
          memResult.classList.add('jackpot');
          launchFireworks(innerWidth/2, innerHeight/2);
        }
      }, 300);
    } else {
      a.classList.add('shake');
      b.classList.add('shake');
      setTimeout(()=>{
        a.classList.remove('flipped', 'shake');
        b.classList.remove('flipped', 'shake');
        memFlipped = [];
        memLocked = false;
      }, 700);
    }
  }
}

memRetryBtn.addEventListener('click', buildMemGame);
buildMemGame();
