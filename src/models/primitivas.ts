import * as THREE from 'three';

/* Utilitários de geometria: peças básicas com que os instrumentos são montados. */
export type Pt = [number, number];
type Mat = THREE.Material;
export const MAT = {
  steel: () => new THREE.MeshStandardMaterial({ color:0xe2e6eb, metalness:0.72, roughness:0.3 }),
  dark:  () => new THREE.MeshStandardMaterial({ color:0x6d747e, metalness:0.6, roughness:0.5 }),
  gold:  () => new THREE.MeshStandardMaterial({ color:0xd9ab4e, metalness:1, roughness:0.25 }),
  blade: () => new THREE.MeshStandardMaterial({ color:0xf0f3f6, metalness:0.85, roughness:0.12 }),
  suture:() => new THREE.MeshStandardMaterial({ color:0x2b4fd0, roughness:0.55 }),
};
export function mesh(geo: THREE.BufferGeometry, mat: Mat): THREE.Mesh { const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; return m; }
// Placa plana desenhada vista de cima: pontos [x, z]
export function plate(pts: Pt[], thick: number, mat: Mat, y = 0): THREE.Mesh {
  const shape = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thick, bevelEnabled: true, bevelThickness: thick * 0.3,
    bevelSize: Math.min(thick * 0.3, 0.008), bevelSegments: 2, curveSegments: 16 });
  geo.rotateX(-Math.PI / 2);
  const m = mesh(geo, mat); m.position.y = y; return m;
}
export function bar(a: Pt, b: Pt, w: number, h: number, mat: Mat, y = 0): THREE.Mesh {
  const dx = b[0] - a[0], dz = b[1] - a[1], len = Math.hypot(dx, dz);
  const m = mesh(new THREE.BoxGeometry(len, h, w), mat);
  m.position.set((a[0] + b[0]) / 2, y, (a[1] + b[1]) / 2);
  m.rotation.y = Math.atan2(-dz, dx);
  return m;
}
export function ring(x: number, z: number, r: number, tube: number, mat: Mat, y = 0): THREE.Mesh {
  const g = new THREE.TorusGeometry(r, tube, 12, 40); g.rotateX(Math.PI / 2);
  const m = mesh(g, mat); m.position.set(x, y, z); return m;
}
export function box(w: number, h: number, d: number, mat: Mat, x: number, y: number, z: number): THREE.Mesh { const m = mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); return m; }
