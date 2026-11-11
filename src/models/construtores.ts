import * as THREE from 'three';
import { MAT, mesh, plate, bar, ring, box, type Pt } from './primitivas';

type Mat = THREE.Material;
type JawCtx = { m: Mat; dk: Mat; y: number };
/** Desenha a ponta (mordente/lâmina) de um instrumento de argola a partir da articulação em x = px. */
export type JawFn = (g: THREE.Group, px: number, ctx: JawCtx) => void;
export interface RingOpts {
  L: number; jawLen: number; jaw: JawFn;
  ringR?: number; tube?: number; sep?: number; shankW?: number;
  gold?: boolean; ratchet?: boolean;
}

/* Instrumentos de argola (tesouras, pinças hemostáticas, porta-agulha...) */
export function ringInstrument(o: RingOpts): THREE.Group {
  const g = new THREE.Group();
  const m = MAT.steel(), rm = o.gold ? MAT.gold() : m, dk = MAT.dark();
  const L = o.L, jawLen = o.jawLen, rr = o.ringR ?? 0.12, tube = o.tube ?? 0.024, sep = o.sep ?? 0.16, y = 0.04;
  const px = L - jawLen;
  for (const s of [-1, 1]){
    const cx = rr + tube, cz = s * sep;
    g.add(ring(cx, cz, rr, tube, rm, y));
    const a: Pt = [cx + rr * 0.85, cz - s * rr * 0.45];
    const b: Pt = [px - 0.02, s * 0.012];
    g.add(bar(a, b, o.shankW ?? 0.045, 0.034, m, y));
    if (o.ratchet){
      const x0 = a[0] + 0.07;
      const zAt = a[1] + (x0 - a[0]) / (b[0] - a[0]) * (b[1] - a[1]);
      for (let k = 0; k < 3; k++) g.add(box(0.022, 0.03, 0.05, dk, x0 + k * 0.035, y, zAt - s * 0.035));
    }
  }
  g.add(box(0.13, 0.06, 0.1, m, px, y, 0));
  const screw = mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.07, 16), dk);
  screw.position.set(px, y + 0.005, 0); g.add(screw);
  o.jaw(g, px, { m, dk, y });
  return g;
}
export function hemostatJaw({ jl, w, curve = 0, serr = 'full' }: { jl: number; w: number; curve?: number; serr?: 'full' | 'half' }): JawFn {
  return (g, px, { m, dk, y }) => {
    const c = curve;
    g.add(plate([[px,-w/2],[px+jl*0.5,-w*0.42+c*0.3],[px+jl*0.92,-w*0.28+c*0.85],[px+jl,c],
                 [px+jl*0.92,w*0.28+c*0.85],[px+jl*0.5,w*0.42+c*0.3],[px,w/2]], 0.03, m, y - 0.015));
    const t0 = serr === 'half' ? 0.5 : 0.12, n = serr === 'half' ? 6 : 10;
    for (let i = 0; i < n; i++){
      const t = t0 + (0.9 - t0) * i / (n - 1);
      const zc = t < 0.5 ? c * t * 0.6 : c * (0.3 + (t - 0.5) * 1.1);
      g.add(box(0.008, 0.006, w * (0.85 - 0.45 * t), dk, px + t * jl, y + 0.024, zc));
    }
  };
}
export function scissorJaw({ jl, w, curve = 0 }: { jl: number; w: number; curve?: number }): JawFn {
  return (g, px, { dk, y }) => {
    const c = curve;
    g.add(plate([[px,-w/2],[px+jl*0.6,-w*0.38+c*0.4],[px+jl*0.93,-w*0.2+c*0.9],[px+jl,c],
                 [px+jl*0.93,w*0.2+c*0.9],[px+jl*0.6,w*0.38+c*0.4],[px,w/2]], 0.028, MAT.blade(), y - 0.014));
    const seg: Pt[] = [[px,0],[px+jl*0.6,c*0.4],[px+jl*0.95,c*0.92]];
    for (let i = 0; i < seg.length - 1; i++) g.add(bar(seg[i], seg[i+1], 0.006, 0.004, dk, y + 0.024));
  };
}
export function needleJaw(jl: number, w: number): JawFn {
  return (g, px, { m, dk, y }) => {
    g.add(plate([[px,-w/2],[px+jl*0.85,-w*0.45],[px+jl,-w*0.25],[px+jl,w*0.25],[px+jl*0.85,w*0.45],[px,w/2]], 0.034, m, y - 0.017));
    g.add(box(jl * 0.7, 0.006, w * 0.6, dk, px + jl * 0.55, y + 0.028, 0));
  };
}
export function allisJaw(jl: number): JawFn {
  return (g, px, { m, dk, y }) => {
    const tx = px + jl;
    g.add(bar([px,-0.02],[tx-0.03,-0.012], 0.022, 0.022, m, y));
    g.add(bar([px, 0.02],[tx-0.03, 0.012], 0.022, 0.022, m, y));
    g.add(box(0.035, 0.03, 0.11, m, tx - 0.015, y, 0));
    for (let i = 0; i < 5; i++) g.add(box(0.014, 0.02, 0.012, dk, tx + 0.006, y, -0.044 + i * 0.022));
  };
}
export function backhausJaw(): JawFn {
  return (g, px, { m, y }) => {
    const r = 0.14, cx = px + r;
    for (const s of [1, -1]){
      const geo = new THREE.TorusGeometry(r, 0.018, 10, 32, Math.PI - 0.12); geo.rotateX(Math.PI / 2);
      const a = mesh(geo, m); a.position.set(cx, y, 0); a.rotation.y = Math.PI; a.scale.z = s; g.add(a);
    }
  };
}
export function cheronJaw(jl: number): JawFn {
  return (g, px, { m, y }) => {
    const tx = px + jl;
    g.add(bar([px,0],[tx-0.2,0], 0.035, 0.03, m, y));
    const geo = new THREE.TorusGeometry(0.07, 0.016, 10, 32); geo.rotateX(Math.PI / 2);
    const o = mesh(geo, m); o.position.set(tx - 0.11, y, 0); o.scale.x = 1.6; g.add(o);
  };
}
export function forceps({ L, teeth }: { L: number; teeth: boolean }): THREE.Group {
  const g = new THREE.Group(), m = MAT.steel(), dk = MAT.dark();
  const pts: Pt[] = [[0,-0.042],[L*0.5,-0.05],[L*0.92,-0.02],[L,-0.012],[L,0.012],[L*0.92,0.02],[L*0.5,0.05],[0,0.042]];
  g.add(plate(pts, 0.018, m, 0.005));
  const top = new THREE.Group(); top.position.set(0, 0.03, 0); top.rotation.z = 0.055; g.add(top);
  top.add(plate(pts, 0.018, m, 0));
  g.add(box(0.1, 0.05, 0.085, m, 0.05, 0.03, 0));
  for (let i = 0; i < 9; i++) top.add(box(0.01, 0.008, 0.075, dk, L * 0.38 + i * 0.035, 0.026, 0));
  if (teeth){
    for (const z of [-0.009, 0.009]){
      const t = mesh(new THREE.ConeGeometry(0.009, 0.045, 8), dk); t.position.set(L - 0.01, 0.045, z); g.add(t);
    }
    const t2 = mesh(new THREE.ConeGeometry(0.01, 0.045, 8), dk); t2.rotation.x = Math.PI; t2.position.set(L - 0.01, -0.012, 0); top.add(t2);
  } else {
    for (let i = 0; i < 6; i++) top.add(box(0.006, 0.006, 0.022, dk, L - 0.02 - i * 0.018, 0.026, 0));
  }
  return g;
}
function scalpel(){
  const g = new THREE.Group(), m = MAT.steel(), dk = MAT.dark();
  g.add(plate([[0,-0.05],[0.9,-0.056],[1.0,-0.034],[1.16,-0.024],[1.16,0.024],[1.0,0.034],[0.9,0.056],[0,0.05]], 0.035, m, 0.005));
  for (let i = 0; i < 12; i++) g.add(box(0.012, 0.008, 0.085, dk, 0.2 + i * 0.045, 0.047, 0));
  g.add(plate([[1.1,-0.034],[1.64,-0.038],[1.52,0.025],[1.4,0.062],[1.24,0.07],[1.12,0.05]], 0.007, MAT.blade(), 0.02));
  return g;
}
function farabeuf(){
  const g = new THREE.Group();
  g.add(plate([[-0.14,-0.30],[-0.14,0.055],[1.44,0.055],[1.44,-0.40],[1.26,-0.40],[1.26,-0.055],[0.04,-0.055],[0.04,-0.30]], 0.025, MAT.steel(), 0.005));
  return g;
}
function doyen(){
  const g = new THREE.Group(), m = MAT.steel();
  g.add(plate([[0,-0.045],[1.05,-0.045],[1.05,-0.28],[1.5,-0.30],[1.58,-0.2],[1.58,0.2],[1.5,0.30],[1.05,0.28],[1.05,0.045],[0,0.045]], 0.025, m, 0.005));
  const grip = mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.55, 20), MAT.dark());
  grip.rotation.z = Math.PI / 2; grip.position.set(0.32, 0.06, 0); g.add(grip);
  return g;
}
function needle(){
  const g = new THREE.Group(), m = MAT.steel();
  const r = 0.17;
  const geo = new THREE.TorusGeometry(r, 0.012, 8, 40, Math.PI * 0.75); geo.rotateX(Math.PI / 2);
  const n = mesh(geo, m); n.position.y = 0.02; g.add(n);
  const sw = mesh(new THREE.CylinderGeometry(0.017, 0.014, 0.06, 12), m);
  sw.rotation.x = Math.PI / 2; sw.position.set(r, 0.02, -0.03); g.add(sw);
  const pts = [[r,-0.06],[r+0.05,-0.3],[r-0.15,-0.55],[r+0.25,-0.78],[r+0.6,-0.7],[r+0.9,-0.45],[r+1.15,-0.6]]
    .map(([x, z]) => new THREE.Vector3(x, 0.02, z));
  g.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 140, 0.011, 8, false), MAT.suture()));
  return g;
}

/** Um construtor por instrumento (a chave é o id do instrumento nos dados). */
export const BUILD: Record<string, () => THREE.Group> = {
  bisturi:    () => scalpel(),
  mayo:       () => ringInstrument({ L:1.5, jawLen:0.52, sep:0.15, jaw:scissorJaw({ jl:0.52, w:0.1 }) }),
  metzenbaum: () => ringInstrument({ L:1.75, jawLen:0.34, sep:0.14, ringR:0.11, shankW:0.036, jaw:scissorJaw({ jl:0.34, w:0.062, curve:0.06 }) }),
  anatomica:  () => forceps({ L:1.4, teeth:false }),
  denterato:  () => forceps({ L:1.4, teeth:true }),
  allis:      () => ringInstrument({ L:1.55, jawLen:0.6, ratchet:true, shankW:0.04, jaw:allisJaw(0.6) }),
  kelly:      () => ringInstrument({ L:1.45, jawLen:0.4, ratchet:true, jaw:hemostatJaw({ jl:0.4, w:0.06, curve:0.05, serr:'half' }) }),
  halsted:    () => ringInstrument({ L:1.2, jawLen:0.3, ringR:0.1, tube:0.02, sep:0.13, shankW:0.032, ratchet:true, jaw:hemostatJaw({ jl:0.3, w:0.04, curve:0.04, serr:'full' }) }),
  farabeuf:   () => farabeuf(),
  doyen:      () => doyen(),
  portaagulha:() => ringInstrument({ L:1.5, jawLen:0.2, gold:true, ratchet:true, shankW:0.05, jaw:needleJaw(0.2, 0.085) }),
  agulha:     () => needle(),
  backhaus:   () => ringInstrument({ L:1.1, jawLen:0.28, ringR:0.1, tube:0.02, sep:0.13, ratchet:true, jaw:backhausJaw() }),
  cheron:     () => ringInstrument({ L:2.2, jawLen:0.95, ratchet:true, jaw:cheronJaw(0.95) }),
};
