import * as THREE from 'three';

/**
 * Sala cirúrgica ao redor da mesa. Escala: 1 unidade ≈ 13 cm.
 * A mesa de instrumentação fica com o tampo em y = 0; o piso, em PISO_Y.
 */
export const PISO_Y = -7;
const TETO_Y = 17;
const X = 26, Z_FUNDO = -18, Z_FRENTE = 26;

const M = (c: number, o: THREE.MeshStandardMaterialParameters = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.6, ...o });

function box(w: number, h: number, d: number, mat: THREE.Material, x: number, y: number, z: number, cast = false) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; return m;
}
function cyl(rt: number, rb: number, h: number, mat: THREE.Material, x: number, y: number, z: number, seg = 24) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  m.position.set(x, y, z); m.receiveShadow = true; return m;
}

/** Azulejo branco-esverdeado com rejunte. */
function texAzulejo(tamanho: number, repeticoesX: number, repeticoesY: number) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 512;
  const x = cv.getContext('2d')!;
  x.fillStyle = '#b4c2c0'; x.fillRect(0, 0, 512, 512);
  const n = 4, t = 512 / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const v = 226 + Math.floor(Math.random() * 10);
    x.fillStyle = `rgb(${v - 8},${v + 2},${v})`;
    x.fillRect(i * t + 3, j * t + 3, t - 6, t - 6);
    const g = x.createLinearGradient(i * t, j * t, i * t + t, j * t + t);
    g.addColorStop(0, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(0,0,0,.06)');
    x.fillStyle = g; x.fillRect(i * t + 3, j * t + 3, t - 6, t - 6);
  }
  const tx = new THREE.CanvasTexture(cv);
  tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(repeticoesX / n, repeticoesY / n);
  tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8;
  void tamanho; return tx;
}
function texPiso() {
  const cv = document.createElement('canvas'); cv.width = cv.height = 512;
  const x = cv.getContext('2d')!;
  x.fillStyle = '#7d9490'; x.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 5000; i++) {
    const v = 110 + Math.random() * 60;
    x.fillStyle = `rgba(${v},${v + 20},${v + 14},.35)`;
    x.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
  }
  x.strokeStyle = 'rgba(40,60,56,.5)'; x.lineWidth = 3;
  x.strokeRect(0, 0, 512, 512);
  const tx = new THREE.CanvasTexture(cv);
  tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(10, 8);
  tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8; return tx;
}
function texMonitor() {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 320;
  const x = cv.getContext('2d')!;
  x.fillStyle = '#04100d'; x.fillRect(0, 0, 512, 320);
  const trilha = (y: number, cor: string, f: (i: number) => number) => {
    x.strokeStyle = cor; x.lineWidth = 3; x.beginPath();
    for (let i = 0; i < 420; i++) { const yy = y + f(i); i ? x.lineTo(20 + i, yy) : x.moveTo(20, yy); }
    x.stroke();
  };
  trilha(70, '#3dff8a', i => { const p = i % 70; return p === 30 ? -34 : p === 31 ? 30 : p === 32 ? -8 : p > 40 && p < 50 ? -6 : 0; });
  trilha(150, '#ffd84a', i => Math.sin(i / 9) * 14);
  trilha(225, '#4ac8ff', i => (Math.sin(i / 14) > 0 ? -14 : 8));
  x.font = '700 44px sans-serif';
  x.fillStyle = '#3dff8a'; x.fillText('72', 440, 80);
  x.fillStyle = '#4ac8ff'; x.fillText('98', 440, 245);
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; return tx;
}

/** Monta a sala (paredes, piso, teto, lâmpada cirúrgica, equipamentos e paciente coberto). */
export function criarSala(): { grupo: THREE.Group; lampada: THREE.Vector3 } {
  const g = new THREE.Group();
  const largura = X * 2, prof = Z_FRENTE - Z_FUNDO, alt = TETO_Y - PISO_Y;
  const cz = (Z_FUNDO + Z_FRENTE) / 2, cy = (TETO_Y + PISO_Y) / 2;

  // piso
  const piso = new THREE.Mesh(new THREE.PlaneGeometry(largura, prof), new THREE.MeshStandardMaterial({ map: texPiso(), roughness: 0.4, metalness: 0.05, envMapIntensity: 0.35 }));
  piso.rotation.x = -Math.PI / 2; piso.position.set(0, PISO_Y, cz); piso.receiveShadow = true; g.add(piso);

  // paredes (azulejo), voltadas para dentro
  const parede = (w: number, x: number, z: number, ry: number) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, alt),
      new THREE.MeshStandardMaterial({ map: texAzulejo(1, w / 2.3, alt / 2.3), roughness: 0.5, metalness: 0, envMapIntensity: 0.4 }));
    m.position.set(x, cy, z); m.rotation.y = ry; m.receiveShadow = true; g.add(m);
  };
  parede(largura, 0, Z_FUNDO, 0);
  parede(largura, 0, Z_FRENTE, Math.PI);
  parede(prof, -X, cz, Math.PI / 2);
  parede(prof, X, cz, -Math.PI / 2);
  // faixa colorida e rodapé
  const faixa = M(0x2e7466, { roughness: 0.4 });
  g.add(box(largura, 0.9, 0.2, faixa, 0, PISO_Y + 9, Z_FUNDO + 0.1));
  g.add(box(0.2, 0.9, prof, faixa, -X + 0.1, PISO_Y + 9, cz));
  g.add(box(0.2, 0.9, prof, faixa, X - 0.1, PISO_Y + 9, cz));
  g.add(box(largura, 0.8, 0.2, M(0x56706c), 0, PISO_Y + 0.4, Z_FUNDO + 0.1));

  // teto com painéis de luz
  const teto = new THREE.Mesh(new THREE.PlaneGeometry(largura, prof), M(0xe8eeee, { roughness: 0.9 }));
  teto.rotation.x = Math.PI / 2; teto.position.set(0, TETO_Y, cz); g.add(teto);
  const luz = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xf4fbff, emissiveIntensity: 2.2 });
  for (const x of [-14, 0, 14]) for (const z of [-10, 6]) g.add(box(9, 0.3, 3.4, luz, x, TETO_Y - 0.15, z));

  // porta de vai-e-vem na parede lateral esquerda
  const aco = M(0xcfd6db, { metalness: 0.6, roughness: 0.35 });
  const vidro = M(0x6fa0a8, { transparent: true, opacity: 0.45, roughness: 0.1, metalness: 0.2 });
  g.add(box(0.5, 17, 11, aco, -X + 0.25, PISO_Y + 8.5, -4));
  for (const dz of [-2.7, 2.7]) {
    g.add(box(0.3, 15.5, 4.8, M(0xb9c4c6, { roughness: 0.4 }), -X + 0.6, PISO_Y + 8, -4 + dz));
    g.add(box(0.2, 5.5, 2.6, vidro, -X + 0.78, PISO_Y + 10, -4 + dz));
  }

  // janela de observação (parede do fundo, à direita)
  g.add(box(10.4, 6.4, 0.5, aco, 14, PISO_Y + 11, Z_FUNDO + 0.25));
  g.add(box(9.6, 5.6, 0.3, M(0x1a2c33, { roughness: 0.05, metalness: 0.4 }), 14, PISO_Y + 11, Z_FUNDO + 0.5));

  // relógio de parede
  const rel = cyl(1.6, 1.6, 0.3, M(0xf4f4f0), -12, PISO_Y + 14, Z_FUNDO + 0.3, 40); rel.rotation.x = Math.PI / 2; g.add(rel);
  const ponteiro = (c: number, l: number, a: number) => { const p = box(0.12, l, 0.08, M(0x111111), -12 + Math.sin(a) * l / 2, PISO_Y + 14 + Math.cos(a) * l / 2, Z_FUNDO + 0.5); p.rotation.z = -a; return p; };
  g.add(ponteiro(0, 1.0, 2.1), ponteiro(0, 1.3, 0.4));

  // armário com portas de vidro (fundo, à esquerda)
  g.add(box(10, 9, 2.6, M(0xe9eeee, { roughness: 0.4 }), 4, PISO_Y + 4.5, Z_FUNDO + 1.5));
  g.add(box(4.6, 7.6, 0.15, vidro, 1.6, PISO_Y + 4.6, Z_FUNDO + 2.85));
  g.add(box(4.6, 7.6, 0.15, vidro, 6.4, PISO_Y + 4.6, Z_FUNDO + 2.85));

  // lâmpada cirúrgica de teto
  const lampadaPos = new THREE.Vector3(0, 10, -1);
  const poste = cyl(0.25, 0.25, TETO_Y - lampadaPos.y - 1.2, aco, lampadaPos.x, (TETO_Y + lampadaPos.y + 1.2) / 2, lampadaPos.z); g.add(poste);
  g.add(cyl(0.9, 0.9, 0.5, aco, 0, TETO_Y - 0.25, lampadaPos.z));
  const cab = new THREE.Group(); cab.position.copy(lampadaPos);
  const casca = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 3.0, 0.9, 48), M(0xe4e9ec, { metalness: 0.4, roughness: 0.3 }));
  cab.add(casca);
  const lamp = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfff8ec, emissiveIntensity: 3 });
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2, r = i < 6 ? 1.0 : 1.9;
    const l = cyl(0.42, 0.42, 0.1, lamp, Math.cos(a) * r, -0.5, Math.sin(a) * r, 20); cab.add(l);
  }
  cab.add(cyl(0.55, 0.55, 0.12, lamp, 0, -0.5, 0, 20));
  g.add(cab);

  // carrinho de anestesia + monitor (canto esquerdo do fundo)
  const cx = -16, cz2 = -13;
  g.add(box(5, 7, 4, M(0xdfe5e8, { roughness: 0.4 }), cx, PISO_Y + 3.5, cz2));
  g.add(box(5.1, 0.3, 4.1, M(0x4a5a60), cx, PISO_Y + 7.15, cz2));
  g.add(box(5, 0.3, 0.1, M(0x2e7466), cx, PISO_Y + 5.5, cz2 + 2.05));
  for (const dx of [-2, 2]) for (const dz of [-1.6, 1.6]) g.add(cyl(0.3, 0.3, 0.4, M(0x111111), cx + dx, PISO_Y + 0.2, cz2 + dz, 12));
  g.add(cyl(0.15, 0.15, 2.4, aco, cx, PISO_Y + 8.4, cz2 - 0.5));
  const tela = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.25), new THREE.MeshBasicMaterial({ map: texMonitor() }));
  tela.position.set(cx, PISO_Y + 9.9, cz2 - 0.1 + 0.2); tela.rotation.y = 0.35; g.add(tela);
  const moldura = box(3.9, 2.55, 0.25, M(0x1c2226), cx, PISO_Y + 9.9, cz2 - 0.1); moldura.rotation.y = 0.35; g.add(moldura);

  // suporte de soro
  const sx = 9, sz = -10;
  g.add(cyl(1.1, 1.3, 0.25, aco, sx, PISO_Y + 0.15, sz, 24));
  g.add(cyl(0.1, 0.1, 15, aco, sx, PISO_Y + 7.6, sz, 12));
  g.add(box(2.6, 0.12, 0.12, aco, sx, PISO_Y + 15, sz));
  const bolsa = M(0xcfe6ee, { transparent: true, opacity: 0.6, roughness: 0.2 });
  for (const dx of [-1, 1]) g.add(box(0.9, 1.7, 0.4, bolsa, sx + dx, PISO_Y + 13.9, sz));

  // mesa cirúrgica com o paciente coberto por campo
  const px = 0, pz = -15.5, topoY = PISO_Y + 6.8;
  const campo = M(0x2e7466, { roughness: 0.95 });
  g.add(cyl(0.9, 1.4, topoY - PISO_Y - 0.6, aco, px, PISO_Y + (topoY - PISO_Y - 0.6) / 2, pz));
  g.add(box(5, 0.3, 4, M(0x4a5a60), px, PISO_Y + 0.15, pz));
  g.add(box(15, 0.6, 4.2, M(0x2b3438), px, topoY - 0.3, pz));
  const corpo = new THREE.Mesh(new THREE.CapsuleGeometry(1.35, 8.2, 8, 20), campo);
  corpo.rotation.z = Math.PI / 2; corpo.scale.set(1, 1, 0.8); corpo.position.set(px + 0.3, topoY + 1.35, pz); g.add(corpo);
  const cabeca = new THREE.Mesh(new THREE.SphereGeometry(0.95, 24, 18), M(0x4f9fc0, { roughness: 0.8 }));
  cabeca.position.set(px - 6.3, topoY + 1.0, pz); g.add(cabeca);
  const cobertor = new THREE.Mesh(new THREE.BoxGeometry(14, 0.25, 4.6), campo);
  cobertor.position.set(px, topoY + 0.12, pz); g.add(cobertor);

  return { grupo: g, lampada: lampadaPos };
}

/** Sala simplificada, só para gerar os reflexos no metal (luzes do teto e paredes). */
export function criarCenaDeReflexos(): THREE.Scene {
  const s = new THREE.Scene();
  const basico = (v: number, tint = [1, 1, 1]) => new THREE.MeshBasicMaterial({ color: new THREE.Color(tint[0] * v, tint[1] * v, tint[2] * v), side: THREE.BackSide });
  const sala = new THREE.Mesh(new THREE.BoxGeometry(X * 2, TETO_Y - PISO_Y, Z_FRENTE - Z_FUNDO),
    [basico(0.3, [0.9, 1, 1]), basico(0.3, [0.9, 1, 1]), basico(0.35), basico(0.12, [0.7, 0.9, 0.85]), basico(0.3, [0.9, 1, 1]), basico(0.3, [0.9, 1, 1])]);
  sala.position.set(0, (TETO_Y + PISO_Y) / 2, (Z_FUNDO + Z_FRENTE) / 2); s.add(sala);
  const painel = new THREE.MeshBasicMaterial({ color: new THREE.Color(9, 9, 9.3) });
  for (const x of [-14, 0, 14]) for (const z of [-10, 6]) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(9, 3.4), painel);
    p.rotation.x = Math.PI / 2; p.position.set(x, TETO_Y - 0.4, z); s.add(p);
  }
  return s;
}
