import * as THREE from 'three';
import { MAT, mesh, plate, bar, ring, box, type Pt } from './primitivas';
import { ringInstrument, hemostatJaw, scissorJaw, needleJaw, cheronJaw, type JawFn } from './construtores';

/* Famílias de modelos simples para os instrumentos do catálogo. Cada função devolve um Group com o eixo
   comprido em x, deitado no tampo da mesa (y = 0). Tudo é feito de formas básicas. */

type G = THREE.Group;
const M = (color: number, o: THREE.MeshStandardMaterialParameters = {}) => new THREE.MeshStandardMaterial({ roughness: 0.5, ...o, color });
const newG = () => new THREE.Group();
const cone = (r: number, h: number, mat: THREE.Material) => new THREE.Mesh(new THREE.ConeGeometry(r, h, 8), mat);

/* ---------- ajudantes de ponta (mordente) ---------- */
function angled(jaw: JawFn, ang: number): JawFn {
  return (g, px, ctx) => { const sub = newG(); sub.position.set(px, 0, 0); sub.rotation.y = ang; jaw(sub, 0, ctx); g.add(sub); };
}
function withTeeth(jaw: JawFn, jl: number, n = 2, spread = 0.012): JawFn {
  return (g, px, ctx) => {
    jaw(g, px, ctx);
    for (let i = 0; i < n; i++) { const t = cone(0.009, 0.04, ctx.dk); t.position.set(px + jl - 0.01, ctx.y + 0.04, (i - (n - 1) / 2) * spread * 2); t.castShadow = true; g.add(t); }
  };
}
function withHook(jaw: JawFn, jl: number): JawFn {
  return (g, px, ctx) => {
    jaw(g, px, ctx);
    const h = mesh(new THREE.TorusGeometry(0.03, 0.007, 6, 16, Math.PI), ctx.m); h.position.set(px + jl, ctx.y + 0.03, 0); g.add(h);
  };
}
function withBall(jaw: JawFn, jl: number, r = 0.03): JawFn {
  return (g, px, ctx) => { jaw(g, px, ctx); const b = mesh(new THREE.SphereGeometry(r, 12, 10), ctx.m); b.position.set(px + jl, ctx.y - 0.02, 0); g.add(b); };
}
function loopJaw(o: { jl: number; w: number; tri?: boolean; teeth?: boolean }): JawFn {
  return (g, px, { m, dk, y }) => {
    const { jl, w } = o;
    const pts: Pt[] = o.tri
      ? [[px, -0.03], [px + jl, -w / 2], [px + jl, w / 2], [px, 0.03]]
      : [[px, -0.03], [px + jl * 0.55, -w / 2], [px + jl, -w * 0.2], [px + jl, w * 0.2], [px + jl * 0.55, w / 2], [px, 0.03]];
    for (let i = 0; i < pts.length; i++) g.add(bar(pts[i], pts[(i + 1) % pts.length], 0.022, 0.03, m, y));
    if (o.teeth) for (const s of [-1, 1]) { const t = cone(0.01, 0.035, dk); t.position.set(px + jl, y + 0.03, s * w * 0.2); g.add(t); }
  };
}
function hookJaw(jl: number): JawFn {
  return (g, px, { m, dk, y }) => {
    for (const s of [-1, 1]) {
      g.add(bar([px, s * 0.02], [px + jl * 0.85, s * 0.07], 0.022, 0.03, m, y));
      g.add(bar([px + jl * 0.85, s * 0.07], [px + jl, s * 0.045], 0.02, 0.03, m, y));
      const t = cone(0.011, 0.07, dk); t.rotation.x = s > 0 ? -Math.PI / 2 : Math.PI / 2; t.position.set(px + jl, y, s * 0.02); g.add(t);
    }
  };
}
function weitlanerJaw(span: number): JawFn {
  return (g, px, { m, dk, y }) => {
    g.add(bar([px, -span], [px, span], 0.03, 0.04, m, y));
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) {
      const t = cone(0.014, 0.08, dk); t.rotation.x = Math.PI; t.position.set(px + 0.05 + k * 0.05, y - 0.02, s * span); g.add(t);
      g.add(bar([px, s * span], [px + 0.12, s * span], 0.03, 0.03, m, y));
    }
  };
}
function dilatorJaw(jl: number): JawFn {
  return (g, px, { m, y }) => {
    for (const s of [-1, 1]) { g.add(bar([px, s * 0.02], [px + jl, s * 0.13], 0.03, 0.04, m, y)); g.add(box(0.06, 0.04, 0.06, m, px + jl, y, s * 0.13)); }
  };
}
function foersterJaw(jl: number): JawFn {
  return (g, px, { m, y }) => {
    const tx = px + jl;
    g.add(bar([px, 0], [tx - 0.16, 0], 0.035, 0.03, m, y));
    const geo = new THREE.TorusGeometry(0.075, 0.016, 10, 32); geo.rotateX(Math.PI / 2);
    const o = mesh(geo, m); o.position.set(tx - 0.08, y, 0); g.add(o);
  };
}

/* ---------- pinças de mola (sem argolas) ---------- */
interface MolaOpts { L: number; s?: number; tip?: number; teeth?: 'nenhum' | 'dente' | 'fino' | 'grande'; serr?: 'transversal' | 'longitudinal' }
export function pincaMola(o: MolaOpts): G {
  const g = newG(), m = MAT.steel(), dk = MAT.dark();
  const { L } = o, s = o.s ?? 1, t = o.tip ?? 1;
  const pts: Pt[] = [[0, -0.042 * s], [L * 0.5, -0.05 * s], [L * 0.92, -0.02 * t], [L, -0.012 * t], [L, 0.012 * t], [L * 0.92, 0.02 * t], [L * 0.5, 0.05 * s], [0, 0.042 * s]];
  g.add(plate(pts, 0.018, m, 0.005));
  const top = newG(); top.position.set(0, 0.03, 0); top.rotation.z = 0.055; g.add(top);
  top.add(plate(pts, 0.018, m, 0));
  g.add(box(0.1, 0.05, 0.085 * s, m, 0.05, 0.03, 0));
  const n = o.serr === 'longitudinal' ? 5 : 8;
  for (let i = 0; i < n; i++) {
    if (o.serr === 'longitudinal') top.add(box(L * 0.3, 0.006, 0.006, dk, L * 0.78, 0.026, (i - 2) * 0.012 * t));
    else top.add(box(0.01, 0.008, 0.07 * s, dk, L * 0.38 + i * 0.035, 0.026, 0));
  }
  const nt = o.teeth === 'fino' ? 7 : o.teeth === 'grande' ? 3 : o.teeth === 'dente' ? 2 : 0;
  const rr = o.teeth === 'grande' ? 0.014 : 0.008;
  for (let i = 0; i < nt; i++) {
    const z = (i - (nt - 1) / 2) * (0.024 * t / Math.max(nt - 1, 1) * 2) * (nt === 2 ? 0.45 : 1);
    const c = cone(rr, rr * 5, dk); c.position.set(L - 0.01, 0.05, z); g.add(c);
  }
  return g;
}

/* ---------- argola: hemostáticas, tesouras, porta-agulhas, pinças de preensão ---------- */
const hem = (L: number, jl: number, w: number, curve: number, serr: 'full' | 'half', more: Partial<Parameters<typeof ringInstrument>[0]> = {}, jawWrap?: (j: JawFn) => JawFn) => {
  const j = hemostatJaw({ jl, w, curve, serr });
  return ringInstrument({ L, jawLen: jl, ratchet: true, ...more, jaw: jawWrap ? jawWrap(j) : j });
};
const tes = (L: number, jl: number, w: number, curve: number, more: Partial<Parameters<typeof ringInstrument>[0]> = {}, jawWrap?: (j: JawFn) => JawFn) => {
  const j = scissorJaw({ jl, w, curve });
  return ringInstrument({ L, jawLen: jl, ...more, jaw: jawWrap ? jawWrap(j) : j });
};

function bulldog(): G {
  const g = newG(), m = MAT.steel(), dk = MAT.dark();
  for (const s of [-1, 1]) {
    g.add(box(0.8, 0.04, 0.06, m, 0.4, 0.04, s * 0.04));
    g.add(box(0.5, 0.012, 0.05, dk, 0.6, 0.066, s * 0.04));
  }
  const geo = new THREE.TorusGeometry(0.09, 0.014, 8, 24, Math.PI * 1.25); geo.rotateX(Math.PI / 2);
  const sp = mesh(geo, m); sp.position.set(0.0, 0.04, 0); sp.rotation.y = Math.PI * 0.35; g.add(sp);
  return g;
}
function mathieu(): G {
  const g = newG(), m = MAT.steel(), dk = MAT.dark();
  const px = 1.1;
  for (const s of [-1, 1]) {
    g.add(bar([0, s * 0.11], [px, s * 0.012], 0.05, 0.034, m, 0.04));
    g.add(box(0.2, 0.03, 0.05, m, 0.1, 0.04, s * 0.13));
  }
  for (let k = 0; k < 3; k++) g.add(box(0.02, 0.03, 0.06, dk, 0.3 + k * 0.04, 0.04, 0.0));
  g.add(box(0.13, 0.06, 0.1, m, px, 0.04, 0));
  needleJaw(0.2, 0.085)(g, px, { m, dk, y: 0.04 });
  return g;
}

/* ---------- afastadores ---------- */
const pl = (pts: Pt[], mat = MAT.steel()) => { const g = newG(); g.add(plate(pts, 0.025, mat, 0.005)); return g; };
function deaver(): G {
  const g = pl([[0, -0.04], [1.0, -0.04], [1.5, -0.12], [2.0, 0.05], [2.1, 0.22], [1.9, 0.32], [1.4, 0.2], [1.0, 0.04], [0, 0.04]]);
  g.add(ring(-0.05, 0, 0.06, 0.015, MAT.steel(), 0.02)); return g;
}
const richardson = () => pl([[0, -0.04], [0.9, -0.04], [0.9, -0.36], [1.35, -0.36], [1.35, 0.36], [0.9, 0.36], [0.9, 0.04], [0, 0.04]]);
const armyNavy = () => pl([[0, -0.3], [0.18, -0.3], [0.18, -0.04], [1.24, -0.04], [1.24, -0.42], [1.42, -0.42], [1.42, 0.04], [0, 0.04]]);
const langenbeck = () => pl([[0, -0.04], [1.0, -0.04], [1.0, -0.4], [1.2, -0.4], [1.2, 0.04], [0, 0.04]]);
function senn(): G {
  const g = pl([[0, -0.04], [1.4, -0.04], [1.4, -0.3], [1.62, -0.3], [1.62, 0.04], [0, 0.04]]);
  const m = MAT.steel();
  for (let k = 0; k < 3; k++) g.add(bar([0.03 + k * 0.1, -0.02], [0.03 + k * 0.1, -0.3], 0.03, 0.03, m, 0.01));
  return g;
}
function volkmann(): G {
  const g = pl([[0, -0.035], [1.2, -0.035], [1.2, 0.035], [0, 0.035]]);
  const m = MAT.steel();
  for (let k = 0; k < 4; k++) {
    const x = 1.2 + k * 0.1 - 0.15;
    g.add(bar([x, -0.03], [x, -0.34], 0.03, 0.03, m, 0.01));
  }
  g.add(bar([1.05, -0.03], [1.35, -0.03], 0.04, 0.03, m, 0.01));
  return g;
}
function ganchoPele(): G {
  const g = newG(), m = MAT.steel();
  g.add(bar([0, 0], [1.05, 0], 0.035, 0.03, m, 0.02));
  const geo = new THREE.TorusGeometry(0.1, 0.014, 8, 20, Math.PI); geo.rotateX(Math.PI / 2);
  const h = mesh(geo, m); h.position.set(1.05, 0.02, -0.1); h.rotation.y = Math.PI / 2; g.add(h);
  return g;
}
function maleavel(): G {
  return pl([[0, -0.09], [0.8, -0.09], [1.6, -0.02], [2.4, -0.09], [2.4, 0.09], [1.6, 0.16], [0.8, 0.09], [0, 0.09]], M(0xc9ad7a, { metalness: 0.7, roughness: 0.4 }));
}
function gelpi(): G {
  const g = newG(), m = MAT.steel(), dk = MAT.dark();
  g.add(bar([0, -0.04], [1.15, -0.5], 0.045, 0.034, m, 0.04)); g.add(bar([0, 0.04], [1.15, 0.5], 0.045, 0.034, m, 0.04));
  g.add(box(0.1, 0.06, 0.12, m, 0, 0.04, 0));
  for (const s of [-1, 1]) { const t = cone(0.015, 0.09, dk); t.rotation.x = s > 0 ? Math.PI / 2 : -Math.PI / 2; t.position.set(1.15, 0.04, s * 0.45); g.add(t); }
  g.add(bar([0.6, -0.28], [0.6, 0.28], 0.04, 0.04, m, 0.08));
  for (let k = 0; k < 6; k++) g.add(box(0.012, 0.03, 0.05, dk, 0.6, 0.1, -0.2 + k * 0.08));
  return g;
}
function afastadorQuadro(opts: { z: number; bladeL: number; bladeW: number; central?: number; crank?: boolean }): G {
  const g = newG(), m = MAT.steel(), dk = MAT.dark();
  const { z, bladeL, bladeW } = opts;
  g.add(box(0.08, 0.05, z * 2 + 0.1, m, 0, 0.04, 0));
  for (let k = 0; k < 10; k++) g.add(box(0.1, 0.012, 0.02, dk, 0, 0.07, -z + 0.08 + k * ((z * 2 - 0.16) / 9)));
  for (const s of [-1, 1]) {
    g.add(plate([[0, s * z - bladeW / 2], [bladeL, s * z - bladeW * 0.6], [bladeL, s * z + bladeW * 0.6], [0, s * z + bladeW / 2]], 0.03, m, 0.01));
    g.add(box(0.12, 0.05, 0.08, m, 0.02, 0.04, s * z));
  }
  if (opts.central) g.add(plate([[0, -0.1], [opts.central, -0.13], [opts.central, 0.13], [0, 0.1]], 0.03, m, 0.01));
  if (opts.crank) {
    const c = mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.32, 12), dk); c.rotation.z = Math.PI / 2; c.position.set(-0.18, 0.07, 0); g.add(c);
    g.add(box(0.05, 0.05, 0.28, dk, -0.34, 0.07, 0));
  }
  return g;
}

/* ---------- agulhas, fios e sutura ---------- */
function agulhaSolo(tri: boolean): G {
  const g = newG(), m = MAT.steel(), r = 0.17;
  const geo = new THREE.TorusGeometry(r, 0.012, tri ? 3 : 10, 40, Math.PI * 0.75); geo.rotateX(Math.PI / 2);
  const n = mesh(geo, m); n.position.y = 0.02; g.add(n);
  const sw = mesh(new THREE.CylinderGeometry(0.018, 0.014, 0.07, 12), m); sw.rotation.x = Math.PI / 2; sw.position.set(r, 0.02, -0.035); g.add(sw);
  return g;
}
function agulhaReta(): G {
  const g = newG(), m = MAT.steel();
  const c = mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.9, 10), m); c.rotation.z = Math.PI / 2; c.position.set(0.45, 0.02, 0); g.add(c);
  const tip = cone(0.011, 0.14, m); tip.rotation.z = -Math.PI / 2; tip.position.set(0.97, 0.02, 0); g.add(tip);
  g.add(ring(-0.0, 0, 0.022, 0.006, m, 0.02));
  return g;
}
function fioPacote(cor: number, band: number, trancado: boolean, metal = false): G {
  const g = newG();
  g.add(box(0.9, 0.04, 0.6, M(0xf3f4f2, { roughness: 0.6 }), 0, 0.02, 0));
  g.add(box(0.9, 0.045, 0.14, M(band, { roughness: 0.5 }), 0, 0.022, -0.23));
  const mat = M(cor, metal ? { metalness: 0.9, roughness: 0.3 } : { roughness: 0.7 });
  for (let k = 0; k < 3; k++) {
    const geo = new THREE.TorusGeometry(0.17 - k * 0.012, trancado ? 0.014 : 0.009, 8, 40); geo.rotateX(Math.PI / 2);
    const t = mesh(geo, mat); t.position.set(0.05, 0.055 + k * 0.012, 0.06); g.add(t);
  }
  return g;
}
function grampeador(): G {
  const g = newG(), m = MAT.steel(), pl2 = M(0x3c8f86, { roughness: 0.5 });
  g.add(box(0.9, 0.12, 0.14, pl2, 0.45, 0.1, 0));
  const hd = box(0.5, 0.05, 0.1, pl2, 0.25, 0.04, 0); hd.rotation.z = 0.0; g.add(hd);
  const grip = box(0.12, 0.3, 0.12, pl2, 0.28, -0.0, 0); grip.rotation.z = 0.5; g.add(grip);
  g.add(box(0.22, 0.04, 0.09, m, 0.95, 0.06, 0));
  return g;
}

/* ---------- materiais de mesa e especiais ---------- */
function cubaRim(): G {
  const g = newG(), m = M(0xdfe4e8, { metalness: 0.75, roughness: 0.35 });
  const outer: THREE.Vector2[] = [], inner: THREE.Vector2[] = [];
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2, x = 0.95 * Math.cos(a), z = 0.4 * Math.sin(a) - 0.2 * Math.pow(Math.cos(a), 2) * 0.9;
    outer.push(new THREE.Vector2(x, z)); inner.push(new THREE.Vector2(x * 0.86, z * 0.78 + 0.012));
  }
  const sh = new THREE.Shape(outer); sh.holes.push(new THREE.Path(inner.slice().reverse()));
  const wall = new THREE.ExtrudeGeometry(sh, { depth: 0.22, bevelEnabled: false }); wall.rotateX(-Math.PI / 2);
  g.add(mesh(wall, m));
  const base = new THREE.ExtrudeGeometry(new THREE.Shape(outer), { depth: 0.03, bevelEnabled: false }); base.rotateX(-Math.PI / 2);
  g.add(mesh(base, m));
  return g;
}
function tigela(r: number, h: number, cor = 0xdfe4e8): G {
  const g = newG();
  const pts = [[0, 0], [r * 0.5, 0], [r * 0.82, h * 0.35], [r, h], [r * 0.96, h * 1.01], [r * 0.78, h * 0.4], [r * 0.45, h * 0.07], [0, h * 0.07]].map(([a, b]) => new THREE.Vector2(a, b));
  const geo = new THREE.LatheGeometry(pts, 40);
  g.add(mesh(geo, new THREE.MeshStandardMaterial({ color: cor, metalness: 0.75, roughness: 0.35, side: THREE.DoubleSide })));
  return g;
}
function pilha(w: number, d: number, n: number, cor: number, tag?: number): G {
  const g = newG(), m = M(cor, { roughness: 0.95 });
  for (let k = 0; k < n; k++) { const b = box(w, 0.045, d, m, 0, 0.0225 + k * 0.045, 0); b.rotation.y = (k - n / 2) * 0.04; g.add(b); }
  if (tag) g.add(box(w * 0.18, 0.012, d * 0.05, M(tag), w * 0.3, n * 0.045 + 0.006, d * 0.2));
  return g;
}
function seringa(): G {
  const g = newG(), m = MAT.steel();
  const cil = (r: number, len: number, mat: THREE.Material, x: number) => { const c = mesh(new THREE.CylinderGeometry(r, r, len, 16), mat); c.rotation.z = Math.PI / 2; c.position.set(x, 0.08, 0); return c; };
  g.add(cil(0.075, 0.85, new THREE.MeshStandardMaterial({ color: 0xcfe6ee, transparent: true, opacity: 0.6, roughness: 0.1 }), 0.5));
  g.add(cil(0.022, 0.55, M(0xf0f0f0), 0.0));
  g.add(cil(0.1, 0.03, M(0xf0f0f0), -0.28));
  g.add(box(0.03, 0.04, 0.3, M(0xf0f0f0), 0.93, 0.08, 0));
  g.add(cil(0.028, 0.1, M(0xe0e4e8), 1.0)); g.add(cil(0.009, 0.4, m, 1.25));
  return g;
}
function aspirador(): G {
  const g = newG(), m = M(0xdfe4e8, { metalness: 0.7, roughness: 0.35 });
  const curve = new THREE.CatmullRomCurve3([[0, 0.05, 0], [0.8, 0.05, 0], [1.2, 0.05, -0.05], [1.5, 0.05, -0.28]].map(([x, y, z]) => new THREE.Vector3(x, y, z)));
  g.add(mesh(new THREE.TubeGeometry(curve, 30, 0.04, 10, false), m));
  const b = mesh(new THREE.SphereGeometry(0.075, 14, 12), m); b.position.set(1.5, 0.05, -0.28); g.add(b);
  const c = mesh(new THREE.CylinderGeometry(0.075, 0.05, 0.22, 14), M(0x3c8f86)); c.rotation.z = Math.PI / 2; c.position.set(-0.05, 0.05, 0); g.add(c);
  return g;
}
function sondaCanelada(): G {
  const g = newG(), m = MAT.steel();
  g.add(box(1.4, 0.03, 0.05, m, 0.7, 0.03, 0));
  g.add(box(1.1, 0.012, 0.018, MAT.dark(), 0.85, 0.04, 0));
  g.add(box(0.26, 0.02, 0.12, m, 1.5, 0.03, 0));
  g.add(box(0.26, 0.012, 0.04, MAT.dark(), 1.5, 0.04, 0));
  const k = mesh(new THREE.SphereGeometry(0.04, 10, 8), m); k.position.set(-0.02, 0.03, 0); g.add(k);
  return g;
}
function sondaExploradora(): G {
  const g = newG(), m = MAT.steel();
  const c = mesh(new THREE.CylinderGeometry(0.013, 0.013, 1.5, 8), m); c.rotation.z = Math.PI / 2; c.position.set(0.75, 0.03, 0); g.add(c);
  for (const x of [0, 1.5]) { const b = mesh(new THREE.SphereGeometry(0.035, 10, 8), m); b.position.set(x, 0.03, 0); g.add(b); }
  return g;
}
function cureta(): G {
  const g = newG(), m = MAT.steel();
  const h = mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.9, 12), MAT.dark()); h.rotation.z = Math.PI / 2; h.position.set(0.45, 0.045, 0); g.add(h);
  g.add(bar([0.9, 0], [1.4, 0], 0.03, 0.025, m, 0.045));
  const geo = new THREE.TorusGeometry(0.07, 0.016, 8, 20); geo.rotateX(Math.PI / 2);
  const c = mesh(geo, m); c.position.set(1.47, 0.045, 0); c.scale.x = 1.3; g.add(c);
  return g;
}
function drenoPenrose(): G { const g = newG(); g.add(box(1.6, 0.03, 0.15, M(0xe3d3a8, { roughness: 0.6 }), 0.8, 0.015, 0)); g.add(box(1.6, 0.012, 0.03, M(0xc9b88a), 0.8, 0.034, 0)); return g; }
function drenoKehr(): G {
  const g = newG(), m = M(0xc9703d, { roughness: 0.45 });
  const t = mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.6, 12), m); t.rotation.x = Math.PI / 2; t.position.set(0, 0.045, 0); g.add(t);
  const s = mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.3, 12), m); s.rotation.z = Math.PI / 2; s.position.set(0.65, 0.045, 0); g.add(s);
  return g;
}
function canulaTraq(): G {
  const g = newG(), m = M(0xe9eef0, { roughness: 0.35 });
  g.add(box(0.12, 0.03, 0.5, m, 0, 0.02, 0));
  const curve = new THREE.CatmullRomCurve3([[0, 0.12, 0], [0.4, 0.12, -0.05], [0.65, 0.12, -0.2], [0.75, 0.12, -0.45]].map(([x, y, z]) => new THREE.Vector3(x, y, z)));
  g.add(mesh(new THREE.TubeGeometry(curve, 24, 0.055, 10, false), m));
  const conn = mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.18, 14), M(0x3c8f86)); conn.rotation.z = Math.PI / 2; conn.position.set(-0.1, 0.12, 0); g.add(conn);
  const cuff = mesh(new THREE.SphereGeometry(0.11, 14, 12), new THREE.MeshStandardMaterial({ color: 0x7fb7d9, transparent: true, opacity: 0.75, roughness: 0.3 }));
  cuff.scale.set(1.4, 1, 1); cuff.position.set(0.7, 0.12, -0.32); g.add(cuff);
  return g;
}
function campo(): G {
  const g = newG(), m = M(0x2e7466, { roughness: 0.95 });
  g.add(box(1.0, 0.12, 0.8, m, 0, 0.06, 0));
  for (let k = 0; k < 3; k++) g.add(box(1.0, 0.012, 0.012, M(0x245e52), 0, 0.126, -0.25 + k * 0.25));
  return g;
}


/* ---------- instrumentos da apostila (novos) ---------- */
function bisturiDescartavel(): G {
  const g = newG(), plastico = M(0x6fb4e0, { roughness: 0.5 }), dk = MAT.dark();
  g.add(plate([[0, -0.04], [1.05, -0.05], [1.12, -0.03], [1.12, 0.03], [1.05, 0.05], [0, 0.04]], 0.035, plastico, 0.005));
  for (let i = 0; i < 9; i++) g.add(box(0.01, 0.008, 0.07, M(0x4b92c2), 0.5 + i * 0.045, 0.043, 0));
  g.add(box(0.08, 0.012, 0.025, dk, 0.2, 0.043, 0));
  g.add(plate([[1.1, -0.03], [1.58, -0.034], [1.46, 0.02], [1.34, 0.06], [1.2, 0.065], [1.1, 0.04]], 0.007, MAT.blade(), 0.02));
  return g;
}
function bisturiEletrico(): G {
  const g = newG(), branco = M(0xf1f4f6, { roughness: 0.4 });
  const c = mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.2, 14), branco); c.rotation.z = Math.PI / 2; c.position.set(0.6, 0.05, 0); g.add(c);
  const ponta = mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.5, 8), MAT.steel()); ponta.rotation.z = Math.PI / 2; ponta.position.set(1.4, 0.05, 0); g.add(ponta);
  const cone1 = cone(0.05, 0.1, branco); cone1.rotation.z = -Math.PI / 2; cone1.position.set(1.22, 0.05, 0); g.add(cone1);
  for (const [x, cor] of [[0.78, 0xf2c94c], [0.62, 0x2f6fd0]] as [number, number][]) { const b = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 12), M(cor)); b.position.set(x, 0.1, 0); g.add(b); }
  const pts = [[0, 0.05, 0], [-0.2, 0.04, 0.18], [-0.5, 0.04, -0.15], [-0.8, 0.04, 0.22], [-1.2, 0.04, -0.1], [-1.5, 0.04, 0.12]].map(([x, y, z]) => new THREE.Vector3(x, y, z));
  g.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.02, 8, false), M(0x2f6fd0)));
  return g;
}
const harrington = () => pl([[0, -0.05], [1.2, -0.05], [1.45, -0.22], [1.8, -0.3], [2.05, -0.22], [2.1, -0.06], [2.0, 0.0], [2.1, 0.06], [2.05, 0.22], [1.8, 0.3], [1.45, 0.22], [1.2, 0.05], [0, 0.05]]);
function suprapubica(): G {
  const g = pl([[0, -0.04], [1.3, -0.04], [1.55, -0.2], [1.75, -0.45], [1.95, -0.42], [2.0, 0], [1.95, 0.42], [1.75, 0.45], [1.55, 0.2], [1.3, 0.04], [0, 0.04]]);
  g.add(ring(-0.06, 0, 0.07, 0.017, MAT.steel(), 0.02));
  g.add(bar([-0.0, -0.1], [-0.0, 0.1], 0.03, 0.03, MAT.steel(), 0.02));
  return g;
}
function especuloVaginal(): G {
  const g = newG(), m = MAT.steel(), dk = MAT.dark();
  for (const s of [-1, 1]) {
    g.add(bar([0.1, s * 0.05], [1.5, s * 0.42], 0.2, 0.03, m, 0.03));
    g.add(bar([-0.35, s * 0.1], [0.12, s * 0.05], 0.06, 0.03, m, 0.03));
  }
  g.add(box(0.15, 0.06, 0.2, m, 0.1, 0.04, 0));
  const parafuso = mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.45, 8), dk); parafuso.rotation.z = Math.PI / 2; parafuso.position.set(-0.35, 0.05, 0); g.add(parafuso);
  g.add(box(0.1, 0.02, 0.22, m, -0.62, 0.05, 0));
  return g;
}
function pean(): G {
  return ringInstrument({ L: 1.2, jawLen: 0.3, ratchet: true, ringR: 0.1, tube: 0.02, sep: 0.13, shankW: 0.034, jaw: loopJaw({ jl: 0.3, w: 0.1 }) });
}
function tentacanula(): G {
  const g = newG(), m = MAT.steel();
  const r = mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.5, 10), m); r.rotation.z = Math.PI / 2; r.position.set(0.75, 0.03, 0); g.add(r);
  g.add(plate([[1.5, -0.1], [1.62, -0.125], [1.74, -0.07], [1.76, -0.016], [1.62, -0.016], [1.62, 0.016], [1.76, 0.016], [1.74, 0.07], [1.62, 0.125], [1.5, 0.1]], 0.012, m, 0.02));
  return g;
}
function sacaFibroma(): G {
  const g = newG(), m = MAT.steel();
  const t = mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 12), MAT.dark()); t.rotation.x = Math.PI / 2; t.position.set(0, 0.04, 0); g.add(t);
  const r = mesh(new THREE.CylinderGeometry(0.014, 0.014, 1.5, 8), m); r.rotation.z = Math.PI / 2; r.position.set(0.75, 0.04, 0); g.add(r);
  const pts: THREE.Vector3[] = [];
  for (let k = 0; k <= 36; k++) { const a = (k / 36) * Math.PI * 6; pts.push(new THREE.Vector3(1.5 + k * 0.012, 0.09 + Math.sin(a) * 0.075, Math.cos(a) * 0.075)); }
  g.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, 0.014, 8, false), m));
  return g;
}
const faure = () => hem(1.9, 0.42, 0.065, 0.08, 'full', { shankW: 0.045 }, j => withTeeth(j, 0.42));
function histerolaboJaw(): JawFn {
  return (g, px, { m, y }) => {
    for (const s of [-1, 1]) {
      const geo = new THREE.TorusGeometry(0.2, 0.02, 8, 24, Math.PI * 1.55); geo.rotateX(Math.PI / 2);
      const a = mesh(geo, m); a.position.set(px + 0.24, y, s * 0.2); a.rotation.y = s > 0 ? Math.PI * 0.72 : -Math.PI * 0.72 + Math.PI; g.add(a);
    }
  };
}
function pincelAntissepsia(): G {
  const g = ringInstrument({ L: 2.0, jawLen: 0.7, ratchet: true, jaw: foersterJaw(0.7) });
  const gz = mesh(new THREE.SphereGeometry(0.17, 14, 10), M(0xf3f3ef, { roughness: 1 }));
  gz.scale.set(1.3, 0.8, 1.1); gz.position.set(2.0 - 0.1, 0.05, 0); g.add(gz);
  return g;
}
function forkJaw(jl: number): JawFn {
  return (g, px, { m, y }) => {
    for (const s of [-1, 1]) {
      g.add(bar([px, s * 0.012], [px + jl * 0.5, s * 0.07], 0.04, 0.03, m, y));
      for (let k = -1; k <= 1; k++) g.add(bar([px + jl * 0.5, s * 0.07 + k * 0.035], [px + jl, s * 0.07 + k * 0.035], 0.02, 0.03, m, y));
    }
  };
}
const pincaCirculante = () => ringInstrument({ L: 2.0, jawLen: 0.45, ringR: 0.1, sep: 0.12, shankW: 0.04, jaw: forkJaw(0.45) });
function manopla(): G {
  const g = newG(), m = M(0xe9eef0, { metalness: 0.4, roughness: 0.3 });
  const d = mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.05, 28), m); d.position.set(0, 0.025, 0); g.add(d);
  const c = mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.6, 16), m); c.rotation.z = Math.PI / 2 - 0.5; c.position.set(0.18, 0.2, 0); g.add(c);
  return g;
}
function caixaCirurgica(): G {
  const g = newG(), m = M(0xdfe4e8, { metalness: 0.75, roughness: 0.35 }), dk = MAT.dark();
  g.add(box(1.5, 0.3, 0.8, m, 0, 0.15, 0));
  g.add(box(1.54, 0.06, 0.84, m, 0, 0.33, 0));
  for (let i = 0; i < 7; i++) for (let j = 0; j < 4; j++) g.add(box(0.03, 0.01, 0.03, dk, -0.6 + i * 0.2, 0.366, -0.27 + j * 0.18));
  const alca = new THREE.TorusGeometry(0.14, 0.018, 8, 20, Math.PI); alca.rotateX(0);
  const a = mesh(alca, m); a.position.set(0, 0.36, 0); a.rotation.y = Math.PI / 2; g.add(a);
  return g;
}
function aspiradorCanulas(): G {
  const g = newG(), m = M(0xdfe4e8, { metalness: 0.7, roughness: 0.35 });
  const curve = new THREE.CatmullRomCurve3([[0.2, 0.05, 0], [0.7, 0.05, 0], [1.0, 0.05, -0.1], [1.3, 0.05, -0.32]].map(([x, y, z]) => new THREE.Vector3(x, y, z)));
  g.add(mesh(new THREE.TubeGeometry(curve, 24, 0.03, 10, false), m));
  const b = mesh(new THREE.SphereGeometry(0.055, 12, 10), m); b.position.set(1.3, 0.05, -0.32); g.add(b);
  const conn = mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.25, 14), MAT.dark()); conn.rotation.z = Math.PI / 2; conn.position.set(0.1, 0.05, 0); g.add(conn);
  const pts: THREE.Vector3[] = [];
  for (let k = 0; k <= 40; k++) { const a = (k / 40) * Math.PI * 4; pts.push(new THREE.Vector3(-0.5 + Math.cos(a) * 0.3 - k * 0.012, 0.04 + (k % 2) * 0.0, 0.5 + Math.sin(a) * 0.3)); }
  g.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 100, 0.025, 8, false), M(0xeceeea, { roughness: 0.4, transparent: true, opacity: 0.85 })));
  return g;
}

/* ---------- tabela de construtores ---------- */
export const EXTRAS: Record<string, () => G> = {
  // diérese
  bisturi3:        () => { const g = ringLikeScalpel(0.8); return g; },
  lamina11:        () => lamina([[0, -0.06], [0.85, -0.01], [0.85, 0.01], [0, 0.06]]),
  lamina15:        () => lamina([[0, -0.06], [0.45, -0.07], [0.7, -0.03], [0.76, 0.0], [0.7, 0.03], [0.45, 0.07], [0, 0.06]]),
  lamina22:        () => lamina([[0, -0.07], [0.5, -0.1], [0.9, -0.07], [1.0, 0.0], [0.9, 0.07], [0.5, 0.1], [0, 0.07]]),
  mayocurva:       () => tes(1.5, 0.52, 0.1, 0.1, { sep: 0.15 }),
  metzenbaumLonga: () => tes(2.2, 0.4, 0.062, 0.07, { ringR: 0.11, shankW: 0.036, sep: 0.14 }),
  iris:            () => tes(1.0, 0.26, 0.045, 0, { ringR: 0.09, tube: 0.018, sep: 0.12, shankW: 0.03 }),
  potts:           () => tes(1.5, 0.34, 0.05, 0, { ringR: 0.1, tube: 0.02, sep: 0.13, shankW: 0.034 }, j => angled(j, 0.95)),
  spencer:         () => tes(1.15, 0.22, 0.04, 0, { ringR: 0.095, tube: 0.02, sep: 0.12, shankW: 0.03 }),
  littauer:        () => tes(1.3, 0.26, 0.04, 0, { ringR: 0.1, tube: 0.02, sep: 0.12, shankW: 0.03 }, j => withHook(j, 0.26)),
  cooper:          () => tes(1.5, 0.45, 0.11, 0.13, { sep: 0.15 }),
  // preensão
  adson:           () => pincaMola({ L: 1.2, s: 0.8, tip: 0.9 }),
  adsonDente:      () => pincaMola({ L: 1.2, s: 0.8, tip: 0.9, teeth: 'dente' }),
  adsonBrown:      () => pincaMola({ L: 1.25, s: 0.85, tip: 1.6, teeth: 'fino' }),
  bonney:          () => pincaMola({ L: 1.6, s: 1.1, tip: 2.0, teeth: 'grande' }),
  debakey:         () => pincaMola({ L: 1.65, s: 1.0, tip: 1.7, serr: 'longitudinal' }),
  babcock:         () => ringInstrument({ L: 1.55, jawLen: 0.45, ratchet: true, shankW: 0.04, jaw: loopJaw({ jl: 0.45, w: 0.17 }) }),
  duval:           () => ringInstrument({ L: 1.65, jawLen: 0.56, ratchet: true, shankW: 0.04, jaw: loopJaw({ jl: 0.56, w: 0.24, tri: true }) }),
  collin:          () => ringInstrument({ L: 1.6, jawLen: 0.5, ratchet: true, shankW: 0.04, jaw: loopJaw({ jl: 0.5, w: 0.19, tri: true, teeth: true }) }),
  lahey:           () => ringInstrument({ L: 1.5, jawLen: 0.32, ratchet: true, jaw: withTeeth(hemostatJaw({ jl: 0.32, w: 0.07, curve: 0.02, serr: 'half' }), 0.32, 3, 0.016) }),
  pozzi:           () => ringInstrument({ L: 1.6, jawLen: 0.36, ratchet: true, shankW: 0.04, jaw: hookJaw(0.36) }),
  museux:          () => ringInstrument({ L: 1.65, jawLen: 0.34, ratchet: true, jaw: withTeeth(hemostatJaw({ jl: 0.34, w: 0.16, curve: 0, serr: 'full' }), 0.34, 4, 0.03) }),
  // hemostasia
  kellyReta:       () => hem(1.45, 0.4, 0.06, 0, 'half'),
  halstedReta:     () => hem(1.2, 0.3, 0.04, 0, 'full', { ringR: 0.1, tube: 0.02, sep: 0.13, shankW: 0.032 }),
  crile:           () => hem(1.35, 0.36, 0.06, 0.05, 'full'),
  spencerWells:    () => hem(1.55, 0.42, 0.065, 0.06, 'full'),
  rochester:       () => hem(1.8, 0.5, 0.08, 0.07, 'full', { ringR: 0.13, shankW: 0.05, sep: 0.17 }),
  rochesterOchsner:() => hem(1.8, 0.5, 0.08, 0.07, 'full', { ringR: 0.13, shankW: 0.05, sep: 0.17 }, j => withTeeth(j, 0.5)),
  kocher:          () => hem(1.6, 0.46, 0.075, 0, 'full', { shankW: 0.05 }, j => withTeeth(j, 0.46)),
  mixter:          () => hem(1.6, 0.3, 0.045, 0, 'full', { ringR: 0.11 }, j => angled(j, 1.5)),
  satinsky:        () => hem(1.9, 0.85, 0.07, 0.32, 'full', { shankW: 0.05 }),
  bulldog,
  debakeyClampe:   () => hem(1.9, 0.8, 0.07, 0, 'full', { shankW: 0.05 }),
  // afastamento
  gosset:          () => afastadorQuadro({ z: 0.75, bladeL: 0.9, bladeW: 0.3 }),
  balfour:         () => afastadorQuadro({ z: 0.8, bladeL: 1.0, bladeW: 0.3, central: 1.2 }),
  finochietto:     () => afastadorQuadro({ z: 0.65, bladeL: 0.5, bladeW: 0.42, crank: true }),
  volkmann, senn, deaver, richardson: richardson, armynavy: armyNavy, langenbeck, gelpi,
  weitlaner:       () => ringInstrument({ L: 1.3, jawLen: 0.1, ratchet: true, ringR: 0.1, tube: 0.02, sep: 0.13, jaw: weitlanerJaw(0.42) }),
  valvulaMaleavel: maleavel,
  ganchoPele,
  // síntese
  mathieu,
  derf:            () => ringInstrument({ L: 1.1, jawLen: 0.16, gold: true, ratchet: true, ringR: 0.09, tube: 0.02, sep: 0.12, shankW: 0.04, jaw: needleJaw(0.16, 0.06) }),
  agulhaCortante:  () => agulhaSolo(true),
  agulhaRedonda:   () => agulhaSolo(false),
  agulhaReta,
  grampeadorPele:  grampeador,
  fioSeda:         () => fioPacote(0x101010, 0x222222, true),
  fioAlgodao:      () => fioPacote(0xf0e8d0, 0xcfc7ae, true),
  fioCatgutSimples:() => fioPacote(0xd9b97a, 0xd9b97a, false),
  fioCatgutCromado:() => fioPacote(0x7a5230, 0x7a5230, false),
  fioNylon:        () => fioPacote(0x2a3a44, 0x2a3a44, false),
  fioPoliglactina: () => fioPacote(0x6a3fa8, 0x6a3fa8, true),
  fioPolipropileno:() => fioPacote(0x2b6fd0, 0x2b6fd0, false),
  fioPolidioxanona:() => fioPacote(0x8660c9, 0x8660c9, false),
  fioMonocryl:     () => fioPacote(0xe6e0f0, 0x7a58b8, false),
  fioAco:          () => fioPacote(0xb8bec6, 0x888f99, false, true),
  // apostila (novos)
  bisturiDescartavel, bisturiEletrico, harrington, suprapubica, especuloVaginal, pean, tentacanula, sacaFibroma, faure,
  histerolabo:     () => ringInstrument({ L: 1.8, jawLen: 0.45, ratchet: true, jaw: histerolaboJaw() }),
  pincelAntissepsia, pincaCirculante, manopla, caixaCirurgica,
  // especiais
  foerster:        () => ringInstrument({ L: 1.9, jawLen: 0.7, ratchet: true, jaw: foersterJaw(0.7) }),
  doyenIntestinal: () => hem(1.8, 0.95, 0.07, 0.04, 'full', { shankW: 0.05 }),
  cubaRim,
  cupula:          () => tigela(0.38, 0.26),
  bacia:           () => tigela(0.8, 0.36),
  gaze:            () => pilha(0.5, 0.5, 4, 0xf3f3ef),
  compressa:       () => pilha(0.95, 0.85, 4, 0xf0efe8, 0x3d6fd0),
  campo,
  seringa,
  aspirador: aspiradorCanulas,
  sondaCanelada,
  sondaExploradora,
  cureta,
  drenoPenrose,
  drenoKehr,
  canulaTraq,
  dilatadorTrousseau: () => ringInstrument({ L: 1.4, jawLen: 0.5, ringR: 0.1, sep: 0.14, jaw: dilatorJaw(0.5) }),
  lister:          () => tes(1.6, 0.5, 0.09, 0, { sep: 0.15 }, j => angled(withBall(j, 0.5), 0.45)),
};

/** Lâmina de bisturi solta (peça plana com furo de encaixe). */
function lamina(pts: Pt[]): G {
  const g = newG();
  g.add(plate(pts, 0.012, MAT.blade(), 0.004));
  g.add(box(0.08, 0.016, 0.03, MAT.dark(), 0.1, 0.013, 0));
  return g;
}
/** Cabo de bisturi nº 3: mais curto e estreito que o nº 4, sem lâmina. */
function ringLikeScalpel(_s: number): G {
  const g = newG(), m = MAT.steel(), dk = MAT.dark();
  g.add(plate([[0, -0.034], [0.75, -0.04], [0.82, -0.025], [0.95, -0.018], [0.95, 0.018], [0.82, 0.025], [0.75, 0.04], [0, 0.034]], 0.03, m, 0.005));
  for (let i = 0; i < 9; i++) g.add(box(0.01, 0.008, 0.06, dk, 0.15 + i * 0.045, 0.042, 0));
  g.add(plate([[0.88, -0.02], [1.32, -0.026], [1.24, 0.016], [1.14, 0.04], [1.0, 0.045], [0.9, 0.03]], 0.006, MAT.blade(), 0.02));
  return g;
}
