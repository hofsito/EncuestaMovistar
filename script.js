
if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}
window.addEventListener("load", () => {
  window.scrollTo(0, 0);
});


function lockScroll() {
  document.body.classList.add("locked");
}
function unlockScroll() {
  document.body.classList.remove("locked");
}
lockScroll();


function preventScroll(e) {
  e.preventDefault();
}
function preventKeys(e) {
  const keys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " ", "Spacebar"];
  if (keys.includes(e.key)) e.preventDefault();
}

window.addEventListener("wheel", preventScroll, { passive: false });
window.addEventListener("touchmove", preventScroll, { passive: false });
window.addEventListener("keydown", preventKeys, { passive: false });


const openBtn = document.getElementById("openBtn");
const letterSection = document.getElementById("letterSection");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const msg = document.getElementById("msg");
const noPortal = document.getElementById("noPortal");


let open = 0;
let opening = false;

function setOpen(v) {
  open = Math.max(0, Math.min(1, v));
  document.documentElement.style.setProperty("--open", open.toFixed(4));
}
setOpen(0);


function smoothScrollTo(targetY, duration = 900) {
  return new Promise((resolve) => {
    const startY = window.scrollY;
    const delta = targetY - startY;
    const start = performance.now();

    const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      window.scrollTo(0, startY + delta * easeInOut(t));
      if (t < 1) requestAnimationFrame(step);
      else resolve();
    }
    requestAnimationFrame(step);
  });
}

function getScrollTopForElementCenter(el) {
  const rect = el.getBoundingClientRect();
  const elTop = window.scrollY + rect.top;
  const target = elTop - window.innerHeight / 2 + rect.height / 2;
  return Math.max(0, target);
}

openBtn.addEventListener("click", async () => {

  unlockScroll();


  const targetY = getScrollTopForElementCenter(letterSection);
  await smoothScrollTo(targetY, 900);

 
  lockScroll();

 
  if (opening) return;
  opening = true;

  const duration = 2800; // lento
  const start = performance.now();
  const from = open;
  const to = 1;
  const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  function step(now) {
    const t = Math.min(1, (now - start) / duration);
    setOpen(from + (to - from) * easeInOut(t));
    if (t < 1) requestAnimationFrame(step);
    else opening = false;
  }
  requestAnimationFrame(step);
});

const bg = document.getElementById("bg");
const bctx = bg.getContext("2d");
let dpr = window.devicePixelRatio || 1;
let bw = 0,
  bh = 0;
let hearts = [];

function resizeBG() {
  dpr = window.devicePixelRatio || 1;
  bw = bg.width = Math.floor(window.innerWidth * dpr);
  bh = bg.height = Math.floor(window.innerHeight * dpr);
  bg.style.width = "100%";
  bg.style.height = "100%";

  const count = Math.floor((window.innerWidth * window.innerHeight) / 9500);
  hearts = Array.from({ length: count }, () => ({
    x: Math.random() * bw,
    y: Math.random() * bh,
    s: (Math.random() * 0.9 + 0.4) * dpr,
    vy: (Math.random() * 0.55 + 0.25) * dpr,
    vx: (Math.random() * 0.4 - 0.2) * dpr,
    a: Math.random() * 0.35 + 0.15,
    wob: Math.random() * 6.28,
    rot: Math.random() * 6.28,
  }));
}

function drawHeart(ctx, x, y, size, rot) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(size, size);
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.bezierCurveTo(-10, -2, -12, -12, 0, -8);
  ctx.bezierCurveTo(12, -12, 10, -2, 0, 6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

let last = 0;
function loopBG(ts) {
  const dt = Math.min(0.05, (ts - last) / 1000);
  last = ts;

  bctx.clearRect(0, 0, bw, bh);

  const cx = bw * (0.35 + open * 0.35);
  const cy = bh * 0.22;
  const r = (560 + open * 240) * dpr;

  const grad = bctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  grad.addColorStop(0, `rgba(255,255,255,${0.16 + open * 0.12})`);
  grad.addColorStop(0.55, `rgba(255,255,255,${0.06 + open * 0.06})`);
  grad.addColorStop(1, "rgba(255,255,255,0)");
  bctx.fillStyle = grad;
  bctx.fillRect(0, 0, bw, bh);

  for (const p of hearts) {
    p.wob += dt * (1.1 + open * 1.4);
    p.rot += dt * (0.32 + open * 0.6);

    const speed = 0.85 + open * 1.15;
    p.y -= p.vy * speed * (60 * dt);
    p.x += (p.vx + Math.sin(p.wob) * 0.18 * dpr) * speed * (60 * dt);

    if (p.y < -140 * dpr) {
      p.y = bh + 40 * dpr;
      p.x = Math.random() * bw;
    }

    bctx.globalAlpha = p.a;
    bctx.fillStyle = "rgba(255,255,255,0.95)";
    drawHeart(bctx, p.x, p.y, p.s, p.rot);
  }
  bctx.globalAlpha = 1;

  requestAnimationFrame(loopBG);
}

window.addEventListener("resize", resizeBG);
resizeBG();
requestAnimationFrame(loopBG);

const conf = document.getElementById("confetti");
const cctx = conf.getContext("2d");
let cw = 0,
  ch = 0;
let confetti = [];
let confettiOn = false;

function resizeConfetti() {
  cw = conf.width = Math.floor(window.innerWidth * dpr);
  ch = conf.height = Math.floor(window.innerHeight * dpr);
  conf.style.width = "100%";
  conf.style.height = "100%";
}
window.addEventListener("resize", resizeConfetti);
resizeConfetti();

function spawnConfetti() {
  confetti = [];
  const n = 280;
  for (let i = 0; i < n; i++) {
    confetti.push({
      x: Math.random() * cw,
      y: -Math.random() * ch,
      w: (Math.random() * 9 + 5) * dpr,
      h: (Math.random() * 12 + 6) * dpr,
      vx: (Math.random() * 2 - 1) * dpr,
      vy: (Math.random() * 4 + 3) * dpr,
      r: Math.random() * Math.PI,
      vr: Math.random() * 0.18 - 0.09,
      hue: Math.floor(Math.random() * 360),
      life: Math.random() * 220 + 160,
    });
  }
}

function drawConfetti() {
  if (!confettiOn) return;
  cctx.clearRect(0, 0, cw, ch);

  for (const p of confetti) {
    p.x += p.vx;
    p.y += p.vy;
    p.r += p.vr;
    p.life -= 1;

    cctx.save();
    cctx.translate(p.x, p.y);
    cctx.rotate(p.r);
    cctx.fillStyle = `hsl(${p.hue}, 90%, 60%)`;
    cctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    cctx.restore();
  }

  confetti = confetti.filter((p) => p.life > 0 && p.y < ch + 60 * dpr);
  if (confetti.length) requestAnimationFrame(drawConfetti);
  else {
    confettiOn = false;
    conf.style.opacity = 0;
  }
}

let noCount = 0;
const noLines = [
  "¿Segura?",
  "¿Segurísima?",
  "¿100% segura?",
  "Piensa bien…",
  "Negado",
  "Ese botón es de decoración",
  "Me parece que querías decir que sí",
  "Esa opción está en mantenimiento",
  "Error 404: No encontrado",
  "JAJA no te deja",
  "Uy se movió",
  "Casi… pero no",
  "Intenta otra vez",
  "Eso fue un no muy tímido",
  "Te estás haciendo la difícil",
  "Dale otra vez",
  "No funciona hoy",
  "Muy lenta",
  "No te creo",
  "Sigue intentando",
  "Más rápido",
  "Más lento",
  "Otra vez",
  "Casi lo logras (mentira)",
  "Ok… inténtalo si quieres",
  "No hay escape",
  "El destino dice que no",
  "Plot twist: es sí",
  "Ups… se fue",
  "Se resbaló",
  "Esquive perfecto",
  "Cuidado, se teletransporta",
  "Eso estuvo cerca",
  "Uy, por allá",
  "Por acá no fue",
  "Sigue, sigue",
  "Nope",
  "Hoy no se puede",
  "Reintentar",
  "No disponible",
  "Denegado",
  "Acceso restringido",
];

function rand(a, b) {
  return a + Math.random() * (b - a);
}

function moveNoButton() {
  if (noBtn.disabled) return;

  noCount++;
  msg.textContent = noLines[noCount % noLines.length];


  if (noBtn.parentElement !== noPortal) {
    noPortal.appendChild(noBtn);
    noBtn.classList.add("floating");
  }

  const rect = noBtn.getBoundingClientRect();
  const pad = 14;

  const maxX = Math.max(pad, window.innerWidth - rect.width - pad);
  const maxY = Math.max(pad, window.innerHeight - rect.height - pad);

  const x = rand(pad, maxX);
  const y = rand(pad, maxY);

  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;

  const rot = rand(-10, 10);
  noBtn.style.transform = `rotate(${rot}deg)`;

  noBtn.animate(
    [
      { transform: `rotate(${rot}deg) scale(1)` },
      { transform: `rotate(${rot}deg) scale(1.08)` },
      { transform: `rotate(${rot}deg) scale(1)` },
    ],
    { duration: 140, iterations: 1 }
  );
}

noBtn.addEventListener("mouseenter", moveNoButton);
noBtn.addEventListener("click", moveNoButton);
noBtn.addEventListener(
  "touchstart",
  (e) => {
    e.preventDefault();
    moveNoButton();
  },
  { passive: false }
);


yesBtn.addEventListener("click", () => {
  msg.textContent = "Sabía que sí";

  yesBtn.disabled = true;
  noBtn.disabled = true;

  spawnConfetti();
  confettiOn = true;
  conf.style.opacity = 1;
  drawConfetti();

  setTimeout(() => {
    msg.textContent = "Feliz dia princesa, te adoro mucho ❤️";
  }, 2400);
});