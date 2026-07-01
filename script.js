function safeRun(fn){
  try { fn(); } catch(err) { console.error('模块出错，已跳过：', err); }
}

// ---------- boot sequence ----------
safeRun(() => {
  const bar = document.getElementById('bar');
  const boot = document.getElementById('boot');
  if(!bar || !boot) return;
  setTimeout(()=>{ bar.style.width = '100%'; }, 300);
  setTimeout(()=>{ boot.classList.add('hide'); }, 2600);
});

// ---------- typewriter ----------
safeRun(() => {
  const messages = [
    "System Notice: 检测到今天是你的专属版本更新日 v+1",
    "恭喜解锁新称号《又老了一岁的可爱宅男》",
    "祝你打游戏永远不卡顿，排位永远不掉分"
  ];
  const tw = document.getElementById('typewriter');
  if(!tw) return;
  let mi = 0, ci = 0;
  function typeLoop(){
    const msg = messages[mi];
    if(ci <= msg.length){
      tw.textContent = msg.slice(0, ci);
      ci++;
      setTimeout(typeLoop, 65);
    } else {
      setTimeout(()=>{ ci = 0; mi = (mi+1) % messages.length; typeLoop(); }, 1600);
    }
  }
  setTimeout(typeLoop, 2800);
});

// ---------- fireworks / confetti canvas ----------
let fxCtx = null, fxCanvas = null;
const fxColors = ['#ff2ec4','#00fff2','#f9f871','#9d4edd','#ffffff'];
let particles = [];

function launchFireworks(x, y){
  if(!fxCtx) return;
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
      color: fxColors[Math.floor(Math.random()*fxColors.length)],
      size: 2 + Math.random()*3
    });
  }
}
function animateFx(){
  if(!fxCtx) return;
  fxCtx.clearRect(0,0,fxCanvas.width,fxCanvas.height);
  particles.forEach(p=>{
    p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life--;
    fxCtx.globalAlpha = Math.max(p.life/90, 0);
    fxCtx.fillStyle = p.color;
    fxCtx.shadowColor = p.color;
    fxCtx.shadowBlur = 8;
    fxCtx.beginPath();
    fxCtx.arc(p.x, p.y, p.size, 0, Math.PI*2);
    fxCtx.fill();
  });
  fxCtx.globalAlpha = 1;
  particles = particles.filter(p=>p.life > 0);
  requestAnimationFrame(animateFx);
}
safeRun(() => {
  fxCanvas = document.getElementById('fx-canvas');
  if(!fxCanvas) return;
  fxCtx = fxCanvas.getContext('2d');
  function resize(){ fxCanvas.width = innerWidth; fxCanvas.height = innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  animateFx();
});
safeRun(() => { setTimeout(()=>{ launchFireworks(innerWidth/2, innerHeight*0.3); }, 3000); });

// ---------- secret messages on cake click ----------
safeRun(() => {
  const secrets = [
    "生日快乐！愿你 buff 常驻，debuff 全免。",
    "新的一岁，游戏连胜，工作不加班。",
    "愿你永远有理由熬夜——只不过是因为快乐，不是因为改需求。",
    "祝你被这个世界温柔以待，排位永远稳赢，大乱斗永远超神。"
  ];
  const cake = document.getElementById('cake');
  const secretMsg = document.getElementById('secret-msg');
  if(!cake || !secretMsg) return;
  let secretIndex = 0;
  cake.addEventListener('click', (e)=>{
    secretMsg.textContent = secrets[secretIndex % secrets.length];
    secretIndex++;
    launchFireworks(e.clientX, e.clientY);
  });
});

// ---------- buff button ----------
safeRun(() => {
  const buffs = [
    "精准暴击 Buff：三角洲爆头率 +50%，一枪一个突突突",
    "充能满格 Buff：睡眠质量拉满，通宵有理，早八不慌",
    "连胜守护 Buff：排位连跪概率清零，本年只上分不掉分",
    "千场老兵 Buff：三角洲撤离成功率 +100%，队友坑不倒你",
    "好运加身 Buff：抽卡欧气+99，出货全靠手气",
    "隐藏富豪 Buff：想买的显卡/键盘/手办，钱包突然够用"
  ];
  const btn = document.getElementById('buffBtn');
  const out = document.getElementById('buff-output');
  if(!btn || !out) return;
  btn.addEventListener('click', ()=>{
    const pick = buffs[Math.floor(Math.random()*buffs.length)];
    out.style.opacity = 0;
    setTimeout(()=>{
      out.textContent = pick;
      out.style.transition = 'opacity 0.4s';
      out.style.opacity = 1;
    }, 150);
  });
});

// ---------- target raid shooting mini-game ----------
safeRun(() => {
  const targetIcons = ['👾','💀','🛰️','🤖'];
  const decoyIcons = ['💣','☠️'];
  const shootArena = document.getElementById('shootArena');
  const shootScoreEl = document.getElementById('shootScore');
  const shootTimeEl = document.getElementById('shootTime');
  const shootStartBtn = document.getElementById('shootStartBtn');
  const shootResetBtn = document.getElementById('shootResetBtn');
  const shootResult = document.getElementById('shoot-result');
  if(!shootArena || !shootScoreEl || !shootTimeEl || !shootStartBtn || !shootResetBtn || !shootResult) return;

  const jackpotText = "突袭成功！防线已突破，隐藏款神秘礼物一份！\n7月11日现实到货，记得查收～";
  const GAME_TIME = 20;
  const WIN_SCORE = 18;
  const DECOY_CHANCE = 0.3;

  var shootScore = 0;
  var shootTimeLeft = GAME_TIME;
  var shootRunning = false;
  var spawnTimerId = null;
  var countdownTimerId = null;

  function spawnTarget(){
    if(!shootRunning) return;
    var isDecoy = Math.random() < DECOY_CHANCE;
    var pool = isDecoy ? decoyIcons : targetIcons;
    var target = document.createElement('div');
    target.className = 'shoot-target' + (isDecoy ? ' decoy' : '');
    target.textContent = pool[Math.floor(Math.random()*pool.length)];
    var arenaW = shootArena.clientWidth;
    var arenaH = shootArena.clientHeight;
    var size = 28;
    var maxX = Math.max(arenaW - size, 10);
    var maxY = Math.max(arenaH - size, 10);
    target.style.left = Math.floor(Math.random()*maxX) + 'px';
    target.style.top = Math.floor(Math.random()*maxY) + 'px';
    shootArena.appendChild(target);
    var lifetime = 750 + Math.random()*300;
    var missTimer = setTimeout(function(){ if(target.parentNode) target.remove(); }, lifetime);
    target.addEventListener('click', function(e){
      e.stopPropagation();
      if(!shootRunning || target.classList.contains('hit')) return;
      clearTimeout(missTimer);
      target.classList.add('hit');
      if(isDecoy){ shootScore = Math.max(0, shootScore - 2); } else { shootScore++; }
      shootScoreEl.textContent = shootScore;
      setTimeout(function(){ if(target.parentNode) target.remove(); }, 200);
    });
  }

  function startShootGame(){
    shootScore = 0;
    shootTimeLeft = GAME_TIME;
    shootScoreEl.textContent = '0';
    shootTimeEl.textContent = GAME_TIME;
    shootResult.textContent = '';
    shootResult.classList.remove('jackpot', 'fail');
    shootArena.innerHTML = '';
    shootRunning = true;
    shootStartBtn.disabled = true;
    shootStartBtn.textContent = '突袭中...';
    shootResetBtn.style.display = 'inline-block';
    spawnTimerId = setInterval(spawnTarget, 380);
    countdownTimerId = setInterval(function(){
      shootTimeLeft--;
      shootTimeEl.textContent = shootTimeLeft;
      if(shootTimeLeft <= 0) endShootGame();
    }, 1000);
  }

  function endShootGame(){
    shootRunning = false;
    clearInterval(spawnTimerId);
    clearInterval(countdownTimerId);
    shootArena.innerHTML = '';
    shootStartBtn.disabled = false;
    shootStartBtn.textContent = '再次突袭 ▸';
    if(shootScore >= WIN_SCORE){
      shootResult.textContent = jackpotText + '\n（本次命中 ' + shootScore + ' 个目标）';
      shootResult.classList.add('jackpot');
      launchFireworks(innerWidth/2, innerHeight/2);
    } else {
      shootResult.textContent = '本次命中 ' + shootScore + ' 个目标，还差 ' + (WIN_SCORE - shootScore) + ' 个才能突破防线，再试一次！';
      shootResult.classList.add('fail');
    }
  }

  function resetShootGame(){
    shootRunning = false;
    clearInterval(spawnTimerId);
    clearInterval(countdownTimerId);
    shootArena.innerHTML = '';
    shootScore = 0;
    shootTimeLeft = GAME_TIME;
    shootScoreEl.textContent = '0';
    shootTimeEl.textContent = GAME_TIME;
    shootResult.textContent = '';
    shootResult.classList.remove('jackpot', 'fail');
    shootStartBtn.disabled = false;
    shootStartBtn.textContent = '开始突袭 ▸';
    shootResetBtn.style.display = 'none';
  }

  shootStartBtn.addEventListener('click', startShootGame);
  shootResetBtn.addEventListener('click', resetShootGame);
});
