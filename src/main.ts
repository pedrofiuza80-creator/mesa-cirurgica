import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import './style.css';

import type { CatId, Instrumento } from './types';
import { CATS, ZONE_ORDER } from './data/categorias';
import { INSTR } from './data/instrumentos';
import { mesh, box } from './models/primitivas';
import { BUILD } from './models/construtores';
import { renderRevisar } from './revisar';
import { validarDados } from './data/validar';

declare global { interface Window { __mesaOk?: boolean } }

/** Um instrumento na cena: dados + objeto 3D + alvos de animação. */
interface Obj {
  d: Instrumento; g: THREE.Group; mats: THREE.MeshStandardMaterial[]; len: number;
  /** posição, rotação e escala de destino (a animação persegue esses valores) */
  tp: THREE.Vector3; tr: number; ts: number; lift: number; glow: number; placed: boolean;
}
const el = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;


/* ---------------- Cena ---------------- */
const canvas = el<HTMLCanvasElement>('c');
const stage = el('stage');
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x141b26);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(40, 1, 0.05, 100);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI * 0.47;
controls.minDistance = 1.2;
controls.maxDistance = 24;

scene.add(new THREE.HemisphereLight(0xffffff, 0x2a3546, 0.55));
const sun = new THREE.DirectionalLight(0xffffff, 1.7);
sun.position.set(3, 11, 6);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left:-11, right:11, top:11, bottom:-11, near:1, far:40 });
sun.shadow.bias = -0.0004;
scene.add(sun);

function onResize(){
  const w = stage.clientWidth, h = stage.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
}
new ResizeObserver(onResize).observe(stage);


/* ---------------- Mesa, zonas, bandeja, pedestal ---------------- */
const ZW = 2.6, ZD = 2.0;
function zoneCenter(i: number){ const col = i % 3, row = Math.floor(i / 3); return new THREE.Vector3((col - 1) * 2.8, 0, row === 0 ? -1.1 : 1.1); }

const mesa = new THREE.Group(); scene.add(mesa);
mesa.add(box(9.0, 0.2, 5.0, new THREE.MeshStandardMaterial({ color:0xb7bec7, metalness:0.7, roughness:0.45 }), 0, -0.1, 0));
const drape = mesh(new THREE.PlaneGeometry(8.8, 4.8), new THREE.MeshStandardMaterial({ color:0x2e7466, roughness:0.95 }));
drape.rotation.x = -Math.PI / 2; drape.position.y = 0.002; drape.castShadow = false; mesa.add(drape);

const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ color:0x19202b, roughness:1 }));
floor.rotation.x = -Math.PI / 2; floor.position.y = -1.2; floor.receiveShadow = true; scene.add(floor);

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
function zoneTexture(cat: CatId, i: number){
  const W = 1040, H = 800, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const x = cv.getContext('2d')!, col = CATS[cat].cor;
  x.fillStyle = 'rgba(255,255,255,0.06)'; roundRect(x, 8, 8, W - 16, H - 16, 40); x.fill();
  x.setLineDash([30, 18]); x.lineWidth = 8; x.strokeStyle = col; roundRect(x, 8, 8, W - 16, H - 16, 40); x.stroke(); x.setLineDash([]);
  const label = `${i + 1}. ${CATS[cat].nome}`;
  x.font = '700 58px Inter, system-ui, sans-serif';
  const tw = x.measureText(label).width;
  x.fillStyle = col; roundRect(x, 34, 30, tw + 64, 90, 45); x.fill();
  x.fillStyle = '#0d1219'; x.fillText(label, 66, 96);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
const zones = {} as Record<CatId, { mesh: THREE.Mesh; flash: THREE.Mesh<THREE.BufferGeometry, THREE.MeshBasicMaterial>; f: number }>;
ZONE_ORDER.forEach((cat, i) => {
  const c = zoneCenter(i);
  const geo = new THREE.PlaneGeometry(ZW, ZD); geo.rotateX(-Math.PI / 2);
  const z = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map:zoneTexture(cat, i), transparent:true, roughness:1 }));
  z.position.set(c.x, 0.005, c.z); z.receiveShadow = true; z.userData.zone = cat;
  const flash = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color:0xffffff, transparent:true, opacity:0, depthWrite:false }));
  flash.position.set(c.x, 0.008, c.z);
  mesa.add(z); mesa.add(flash);
  zones[cat] = { mesh:z, flash, f:0 };
});

const TRAY_Z = 5.3;
const tray = new THREE.Group(); scene.add(tray);
{
  const tm = new THREE.MeshStandardMaterial({ color:0xc9d0d8, metalness:0.85, roughness:0.3 });
  tray.add(box(9.0, 0.12, 4.6, tm, 0, -0.06, TRAY_Z));
  tray.add(box(9.0, 0.16, 0.1, tm, 0, 0.02, TRAY_Z - 2.3));
  tray.add(box(9.0, 0.16, 0.1, tm, 0, 0.02, TRAY_Z + 2.3));
  tray.add(box(0.1, 0.16, 4.6, tm, -4.5, 0.02, TRAY_Z));
  tray.add(box(0.1, 0.16, 4.6, tm, 4.5, 0.02, TRAY_Z));
}
const traySlots: THREE.Vector3[] = [];
for (let r = 0; r < 5; r++) for (let c = 0; c < 3; c++) traySlots.push(new THREE.Vector3((c - 1) * 2.9, 0, TRAY_Z + (r - 2) * 0.84));

const pedestal = new THREE.Group(); scene.add(pedestal);
{
  const p = mesh(new THREE.CylinderGeometry(1.7, 1.85, 0.3, 64), new THREE.MeshStandardMaterial({ color:0x2a3546, metalness:0.3, roughness:0.6 }));
  p.position.y = 0.15; pedestal.add(p);
  const top = mesh(new THREE.CylinderGeometry(1.62, 1.62, 0.02, 64), new THREE.MeshStandardMaterial({ color:0x2e7466, roughness:0.95 }));
  top.position.y = 0.31; pedestal.add(top);
}
const PED_Y = 0.32;

/* ---------------- Objetos dos instrumentos ---------------- */
const objs: Obj[] = INSTR.map(d => {
  const inner = BUILD[d.id]();
  const bb = new THREE.Box3().setFromObject(inner);
  const c = bb.getCenter(new THREE.Vector3());
  inner.position.set(-c.x, -bb.min.y, -c.z);
  const g = new THREE.Group(); g.add(inner); scene.add(g);
  const mats = new Set<THREE.MeshStandardMaterial>(); g.traverse(o => { if (o instanceof THREE.Mesh) mats.add(o.material); });
  const sz = bb.getSize(new THREE.Vector3());
  const hit = new THREE.Mesh(new THREE.BoxGeometry(sz.x + 0.08, 0.14, Math.max(sz.z, 0.12) + 0.08),
    new THREE.MeshBasicMaterial({ colorWrite:false, depthWrite:false }));
  hit.position.y = 0.07; g.add(hit);
  const o: Obj = { d, g, mats:[...mats], len: bb.max.x - bb.min.x, tp:new THREE.Vector3(), tr:0, ts:1, lift:0, glow:-1, placed:false };
  g.userData.obj = o;
  return o;
});
const byCat = {} as Record<CatId, Obj[]>; ZONE_ORDER.forEach(c => byCat[c] = objs.filter(o => o.d.cat === c));
function zoneSlot(cat: CatId, k: number){
  const n = byCat[cat].length, c = zoneCenter(ZONE_ORDER.indexOf(cat));
  return new THREE.Vector3(c.x, 0, c.z + 0.15 + (k - (n - 1) / 2) * 0.58);
}

/* ---------------- Câmera animada ---------------- */
let fly: { pos: THREE.Vector3; target: THREE.Vector3 } | null = null;
function flyTo(pos: THREE.Vector3, target: THREE.Vector3){ fly = { pos:pos.clone(), target:target.clone() }; }
controls.addEventListener('start', () => { fly = null; });

/* ---------------- UI helpers ---------------- */
const panel = el('panel');
const hintEl = el('hint');
const tipEl = el('tip');
const toastEl = el('toast');
let toastTimer: number | undefined;
function toast(msg: string, kind = ''){
  toastEl.textContent = msg; toastEl.className = 'show ' + kind;
  clearTimeout(toastTimer); toastTimer = window.setTimeout(() => toastEl.className = kind, 2200);
}
const chip = (cat: CatId) => `<span class="chip" style="background:${CATS[cat].cor}">${CATS[cat].nome}</span>`;
const shuffle = <T,>(a: T[]): T[] => { a = a.slice(); for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const legendHTML = () => `<div class="legend">${ZONE_ORDER.map((c, i) =>
  `<div><span class="dot" style="background:${CATS[c].cor}"></span><span><b>${i + 1}. ${CATS[c].nome}</b>: ${CATS[c].desc}</span></div>`).join('')}</div>`;
const FOOT = `<div class="foot">Protótipo para estudo. Os modelos 3D são simplificados e a disposição da mesa varia entre faculdades e serviços, então confirme com o material da disciplina de Técnica Operatória.</div>`;
function infoCard(d: Instrumento){
  return `<div class="card">${chip(d.cat)}<h2 style="margin-top:10px">${d.nome}</h2>
    <p><b>Uso:</b> ${d.uso}</p><p style="margin:0"><b>Como reconhecer:</b> ${d.dica}</p>
    ${d.variacao ? `<p class="aviso" style="margin:10px 0 0">⚠ A classificação varia entre fontes. ${d.variacao.nota}</p>` : ''}</div>`;
}
const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/* ---------------- Modos ---------------- */
type Mode = 'explorar' | 'quiz' | 'montar' | 'revisar';
let mode: Mode | null = null, selected: Obj | null = null, hovered: Obj | null = null;

const navButtons = document.querySelectorAll<HTMLButtonElement>('nav button');
function normalizeRot(){
  for (const o of objs){ const r = ((o.g.rotation.y % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI); o.g.rotation.y = r > Math.PI ? r - 2 * Math.PI : r; o.tr = 0; }
}
function layoutMesa(){
  for (const cat of ZONE_ORDER) byCat[cat].forEach((o, k) => { o.tp.copy(zoneSlot(cat, k)); o.tr = 0; o.ts = 1; o.lift = 0; o.g.visible = true; });
}

function setMode(m: Mode){
  mode = m; selected = null; hovered = null; tipEl.style.display = 'none';
  navButtons.forEach(b => b.classList.toggle('active', b.dataset.mode === m));
  normalizeRot();
  document.querySelector('main')!.style.display = m === 'revisar' ? 'none' : '';
  el('revisar').classList.toggle('on', m === 'revisar');
  mesa.visible = m !== 'quiz'; tray.visible = m === 'montar'; pedestal.visible = m === 'quiz';
  clearInterval(montar.timer);
  if (m === 'explorar') startExplore();
  if (m === 'quiz') startQuiz();
  if (m === 'montar') startMontar();
  if (m === 'revisar') renderRevisar(el('revisar'));
}
navButtons.forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode as Mode)));

/* --- Explorar --- */
function startExplore(){
  layoutMesa();
  flyTo(new THREE.Vector3(0, 7.2, 6.6), new THREE.Vector3(0, 0, 0.1));
  hintEl.textContent = 'Arraste para girar · role para dar zoom · clique em um instrumento';
  renderExplore();
}
function renderExplore(){
  panel.innerHTML = `<h2>Explorar a mesa</h2>
    <p>Esta é a mesa organizada pelos tempos cirúrgicos. Clique em qualquer instrumento para ver o nome, para que serve e como reconhecer.</p>
    ${selected ? infoCard(selected.d) + `<div class="row"><button class="btn" id="back">Ver a mesa inteira</button></div>` : ''}
    <h3>Tempos cirúrgicos</h3>${legendHTML()}${FOOT}`;
  const back = document.getElementById('back');
  if (back) back.onclick = () => { selected = null; flyTo(new THREE.Vector3(0, 7.2, 6.6), new THREE.Vector3(0, 0, 0.1)); renderExplore(); };
}
function clickExplore(o: Obj | null){
  if (!o) return;
  selected = o;
  const p = o.g.position.clone();
  flyTo(p.clone().add(new THREE.Vector3(0.3, 1.9, 1.9)), p);
  renderExplore();
}

/* --- Quiz --- */
const quiz = { q: [] as { o: Obj; type: 'nome' | 'tempo' }[], i:0, score:0, answered:false, missed: [] as Instrumento[], cur: null as Obj | null };
function getBest(){ try { return Number(localStorage.getItem('mesa3d_best')) || 0; } catch { return 0; } }
function setBest(v: number){ try { localStorage.setItem('mesa3d_best', String(v)); } catch {} }
function startQuiz(){
  quiz.q = shuffle(objs).slice(0, 10).map(o => ({ o, type: Math.random() < 0.7 ? 'nome' as const : 'tempo' as const }));
  quiz.i = 0; quiz.score = 0; quiz.missed = [];
  flyTo(new THREE.Vector3(0, 2.7, 3.7), new THREE.Vector3(0, 0.45, 0));
  hintEl.textContent = 'Arraste para girar o instrumento · role para aproximar';
  showQuestion();
}
function showQuestion(){
  const item = quiz.q[quiz.i]; quiz.answered = false; quiz.cur = item.o;
  for (const o of objs){ o.g.visible = o === item.o; o.lift = 0; }
  const o = item.o;
  o.tp.set(0, PED_Y, 0); o.ts = Math.min(1.9, 2.5 / o.len);
  o.g.position.set(0, PED_Y + 1.2, 0); o.g.scale.setScalar(o.ts * 0.6); o.g.rotation.y = 0; o.tr = 0;
  let opts: { v: string; t: string }[];
  if (item.type === 'nome'){
    const same = shuffle(byCat[o.d.cat].filter(x => x !== o)).slice(0, 2);
    const rest = shuffle(objs.filter(x => x !== o && !same.includes(x))).slice(0, 3 - same.length);
    opts = shuffle([o, ...same, ...rest]).map(x => ({ v:x.d.id, t:x.d.nome }));
  } else {
    const others = shuffle(ZONE_ORDER.filter(c => c !== o.d.cat && !o.d.variacao?.tambem.includes(c))).slice(0, 3);
    opts = shuffle([o.d.cat, ...others]).map(c => ({ v:c, t:CATS[c].nome }));
  }
  const correct = item.type === 'nome' ? o.d.id : o.d.cat;
  const pct = (quiz.i / quiz.q.length) * 100;
  panel.innerHTML = `<h2>Quiz</h2>
    <p class="muted">Pergunta ${quiz.i + 1} de ${quiz.q.length} · Acertos: ${quiz.score}</p>
    <div class="bar"><i style="width:${pct}%"></i></div>
    <div class="card"><b>${item.type === 'nome' ? 'Qual é este instrumento?' : 'A que tempo cirúrgico pertence este instrumento?'}</b>
    <div class="opts">${opts.map(op => `<button class="btn opt" data-v="${op.v}">${op.t}</button>`).join('')}</div></div>
    <div id="fb"></div>${FOOT}`;
  const optBtns = panel.querySelectorAll<HTMLButtonElement>('.opt');
  optBtns.forEach(b => b.onclick = () => {
    if (quiz.answered) return; quiz.answered = true;
    const ok = b.dataset.v === correct;
    if (ok) quiz.score++; else quiz.missed.push(o.d);
    optBtns.forEach(x => { x.disabled = true; if (x.dataset.v === correct) x.classList.add('right'); });
    if (!ok) b.classList.add('wrong');
    toast(ok ? 'Acertou!' : 'Não foi dessa vez', ok ? 'ok' : 'bad');
    const last = quiz.i === quiz.q.length - 1;
    el('fb').innerHTML = infoCard(o.d) +
      `<div class="row"><button class="btn primary" id="next">${last ? 'Ver resultado' : 'Próxima'}</button></div>`;
    el('next').onclick = () => { if (last) finishQuiz(); else { quiz.i++; showQuestion(); } };
  });
}
function finishQuiz(){
  const best = Math.max(getBest(), quiz.score); setBest(best);
  const n = quiz.q.length;
  const stars = quiz.score >= 9 ? '★★★' : quiz.score >= 6 ? '★★☆' : '★☆☆';
  panel.innerHTML = `<h2>Resultado do quiz</h2>
    <div class="card" style="text-align:center"><div class="stars">${stars}</div>
    <h2 style="margin-top:6px">${quiz.score} de ${n}</h2><p class="muted" style="margin:0">Melhor resultado: ${best} de ${n}</p></div>
    ${quiz.missed.length ? `<h3>Para revisar</h3><ul class="miss">${quiz.missed.map(d => `<li>${d.nome} <span class="muted">(${CATS[d.cat].nome})</span></li>`).join('')}</ul>` : '<p style="margin-top:14px">Gabaritou! 🎉</p>'}
    <div class="row"><button class="btn primary" id="again">Jogar de novo</button><button class="btn" id="toExp">Explorar a mesa</button></div>${FOOT}`;
  el('again').onclick = () => startQuiz();
  el('toExp').onclick = () => setMode('explorar');
}

/* --- Montar a mesa --- */
const montar = { errors:0, start:0, done:false, count: {} as Record<CatId, number>, timer: undefined as number | undefined, names:true, missed: new Set<Instrumento>(), finalSecs: undefined as number | undefined };
function startMontar(){
  montar.errors = 0; montar.done = false; montar.missed = new Set(); montar.finalSecs = undefined;
  ZONE_ORDER.forEach(c => montar.count[c] = 0);
  const slots = shuffle(traySlots);
  objs.forEach((o, i) => {
    o.placed = false; o.g.visible = true; o.lift = 0; o.ts = 1;
    o.tp.copy(slots[i]).add(new THREE.Vector3((Math.random() - 0.5) * 0.4, 0, (Math.random() - 0.5) * 0.12));
    o.tr = (Math.random() - 0.5) * 0.35 + (Math.random() < 0.5 ? Math.PI : 0);
  });
  montar.start = performance.now();
  flyTo(new THREE.Vector3(0, 14.5, 12.2), new THREE.Vector3(0, 0, 3.1));
  hintEl.textContent = 'Clique em um instrumento da bandeja e depois na área correta da mesa';
  renderMontar();
  clearInterval(montar.timer);
  montar.timer = window.setInterval(() => { const t = document.getElementById('timer'); if (t && !montar.done) t.textContent = fmtTime((performance.now() - montar.start) / 1000); }, 500);
}
function placedTotal(){ return objs.filter(o => o.placed).length; }
function renderMontar(){
  const n = placedTotal(), total = objs.length;
  if (montar.done){
    const secs = (performance.now() - montar.start) / 1000;
    const stars = montar.errors === 0 ? '★★★' : montar.errors <= 3 ? '★★☆' : '★☆☆';
    panel.innerHTML = `<h2>Mesa montada!</h2>
      <div class="card" style="text-align:center"><div class="stars">${stars}</div>
      <p style="margin:8px 0 0">Tempo: <b>${fmtTime(montar.finalSecs ?? secs)}</b> · Erros: <b>${montar.errors}</b></p></div>
      ${montar.missed.size ? `<h3>Instrumentos em que você errou</h3><ul class="miss">${[...montar.missed].map(d => `<li>${d.nome} → <b>${CATS[d.cat].nome}</b></li>`).join('')}</ul>` : ''}
      <div class="row"><button class="btn primary" id="again">Montar de novo</button><button class="btn" id="toQuiz">Fazer o quiz</button></div>${FOOT}`;
    el('again').onclick = () => startMontar();
    el('toQuiz').onclick = () => setMode('quiz');
    return;
  }
  panel.innerHTML = `<h2>Montar a mesa</h2>
    <p>Os instrumentos estão bagunçados na bandeja. Clique em um deles e depois na área da mesa onde ele deve ficar.</p>
    <div class="stats"><div class="stat"><b>${n}/${total}</b><span>Na mesa</span></div>
      <div class="stat"><b id="timer">${fmtTime((performance.now() - montar.start) / 1000)}</b><span>Tempo</span></div>
      <div class="stat"><b>${montar.errors}</b><span>Erros</span></div></div>
    <div class="bar"><i style="width:${(n / total) * 100}%"></i></div>
    ${selected ? `<div class="card"><span class="muted">Selecionado:</span><h2 style="margin:4px 0 0">${montar.names ? selected.d.nome : 'Instrumento misterioso'}</h2></div>` : `<div class="card muted">Nenhum instrumento selecionado.</div>`}
    <label class="check"><input type="checkbox" id="names" ${montar.names ? 'checked' : ''}> Mostrar o nome do instrumento (desligue para o modo desafio)</label>
    <div class="row"><button class="btn" id="reshuffle">Recomeçar</button></div>
    <h3>Áreas da mesa</h3>${legendHTML()}${FOOT}`;
  el<HTMLInputElement>('names').onchange = e => { montar.names = (e.target as HTMLInputElement).checked; renderMontar(); };
  el('reshuffle').onclick = () => { selected = null; startMontar(); };
}
function clickMontar(o: Obj | null, zoneCat: CatId | null | undefined){
  if (montar.done) return;
  if (o && !o.placed){
    if (selected) selected.lift = 0;
    selected = (selected === o) ? null : o;
    if (selected) selected.lift = 0.35;
    renderMontar(); return;
  }
  if (o && o.placed) zoneCat = o.d.cat;
  if (!zoneCat) return;
  if (!selected){ toast('Primeiro escolha um instrumento na bandeja'); return; }
  const s = selected;
  if (s.d.cat === zoneCat || s.d.variacao?.tambem.includes(zoneCat)){
    s.placed = true; s.lift = 0; s.tr = 0;
    s.tp.copy(zoneSlot(zoneCat, montar.count[zoneCat]++));
    zones[zoneCat].flash.material.color.set(0x3fd08a); zones[zoneCat].f = 0.55;
    toast(`✓ ${montar.names ? s.d.nome : 'Correto'} → ${CATS[zoneCat].nome}`, 'ok');
    selected = null;
    if (placedTotal() === objs.length){ montar.done = true; montar.finalSecs = (performance.now() - montar.start) / 1000; clearInterval(montar.timer); }
  } else {
    montar.errors++; montar.missed.add(s.d);
    zones[zoneCat].flash.material.color.set(0xef5b5b); zones[zoneCat].f = 0.55;
    toast(`✗ Esse instrumento não é de ${CATS[zoneCat].nome}`, 'bad');
  }
  renderMontar();
}

/* ---------------- Interação ---------------- */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function hits(ev: PointerEvent, targets: THREE.Object3D[]){
  const r = canvas.getBoundingClientRect();
  ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  return ray.intersectObjects(targets, true);
}
function objFrom(h: THREE.Intersection): Obj | null { let o: THREE.Object3D | null = h.object; while (o && !o.userData.obj) o = o.parent; return o ? o.userData.obj as Obj : null; }
function pickables(): THREE.Object3D[] { return objs.filter(o => o.g.visible).map(o => o.g); }

let down: { x: number; y: number } | null = null;
canvas.addEventListener('pointerdown', e => { down = { x:e.clientX, y:e.clientY }; });
canvas.addEventListener('pointerup', e => {
  if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) { down = null; return; }
  down = null;
  if (mode === 'quiz') return;
  const targets = pickables();
  if (mode === 'montar') targets.push(...ZONE_ORDER.map(c => zones[c].mesh));
  const h = hits(e, targets)[0];
  if (!h){ if (mode === 'montar') clickMontar(null, null); return; }
  const o = objFrom(h), zoneCat = h.object.userData.zone as CatId | undefined;
  if (mode === 'explorar') clickExplore(o);
  else if (mode === 'montar') clickMontar(o, zoneCat);
});
canvas.addEventListener('pointermove', e => {
  if (mode === 'quiz' || e.buttons) { hovered = null; tipEl.style.display = 'none'; return; }
  const h = hits(e, pickables())[0];
  hovered = h ? objFrom(h) : null;
  canvas.style.cursor = hovered ? 'pointer' : 'grab';
  const showName = hovered && (mode === 'explorar' || (mode === 'montar' && montar.names));
  if (showName){
    const r = stage.getBoundingClientRect();
    tipEl.textContent = hovered!.d.nome; tipEl.style.display = 'block';
    tipEl.style.left = (e.clientX - r.left) + 'px'; tipEl.style.top = (e.clientY - r.top) + 'px';
  } else tipEl.style.display = 'none';
});
canvas.addEventListener('pointerleave', () => { hovered = null; tipEl.style.display = 'none'; });

/* ---------------- Loop ---------------- */
const clock = new THREE.Clock();
const GLOW = [0x000000, 0x1d3550, 0x1c6656];
function tick(){
  const dt = Math.min(clock.getDelta(), 0.05);
  const k = 1 - Math.exp(-dt * 9);
  if (mode === 'quiz' && quiz.cur) quiz.cur.tr += dt * 0.5;
  for (const o of objs){
    const t = o.tp.clone(); t.y += o.lift + (o.lift ? Math.sin(performance.now() / 300) * 0.03 : 0);
    o.g.position.lerp(t, k);
    o.g.rotation.y += (o.tr - o.g.rotation.y) * k;
    o.g.scale.setScalar(o.g.scale.x + (o.ts - o.g.scale.x) * k);
    const gl = o === selected ? 2 : o === hovered ? 1 : 0;
    if (gl !== o.glow){ o.glow = gl; for (const m of o.mats){ m.emissive.setHex(GLOW[gl]); } }
  }
  for (const c of ZONE_ORDER){ const z = zones[c]; if (z.f > 0){ z.f = Math.max(0, z.f - dt * 0.9); } z.flash.material.opacity = z.f * 0.6; }
  if (fly){
    camera.position.lerp(fly.pos, 1 - Math.exp(-dt * 4));
    controls.target.lerp(fly.target, 1 - Math.exp(-dt * 4));
    if (camera.position.distanceTo(fly.pos) < 0.01) fly = null;
  }
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

camera.position.set(0, 9, 9); controls.target.set(0, 0, 0);
onResize();
for (const e of validarDados()) console.error('[dados]', e);
setMode('explorar');
tick();
window.__mesaOk = true;
el('loading').remove();
