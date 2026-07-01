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
