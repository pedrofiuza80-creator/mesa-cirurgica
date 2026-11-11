import * as THREE from 'three';

/** Equipe cirúrgica estilizada, montada só com formas simples (altura ≈ 13 unidades = 1,75 m). */
export interface MedicoOpts {
  /** cor da roupa cirúrgica (pijama cirúrgico) */
  roupa: number;
  /** cor do gorro */
  gorro: number;
  pele: number;
  /** avental estéril por cima da roupa (cirurgião e instrumentador) */
  avental?: boolean;
  /** braços dobrados com as mãos enluvadas à frente do peito */
  maosAoAlto?: boolean;
  /** mais largo (1 = padrão) */
  porte?: number;
}

const mat = (c: number, r = 0.7, m = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });

function parte<T extends THREE.BufferGeometry>(geo: T, m: THREE.Material, x = 0, y = 0, z = 0) {
  const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; return o;
}
/** Cápsula de a até b (pontos no espaço), para braços e pernas. */
function osso(a: THREE.Vector3, b: THREE.Vector3, r: number, m: THREE.Material) {
  const d = new THREE.Vector3().subVectors(b, a), len = d.length();
  const o = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(len - 2 * r, 0.01), 6, 14), m);
  o.position.copy(a).addScaledVector(d, 0.5);
  o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  o.castShadow = true; o.receiveShadow = true; return o;
}

/** Devolve o grupo e uma função de animação leve (respiração e leve movimento de cabeça). */
export function criarMedico(o: MedicoOpts): { grupo: THREE.Group; animar: (t: number) => void } {
  const g = new THREE.Group();
  const w = o.porte ?? 1;
  const roupa = mat(o.roupa, 0.85), gorro = mat(o.gorro, 0.85), pele = mat(o.pele, 0.6);
  const avental = mat(0x3c8f86, 0.9), luva = mat(0xf1ece4, 0.45), branco = mat(0xf2f5f6, 0.7), mascara = mat(0xa9d6e6, 0.9);
  const sapato = mat(0xf4f4f4, 0.5);

  // pernas e calçados
  for (const s of [-1, 1]) {
    g.add(osso(new THREE.Vector3(s * 0.85 * w, 6.4, 0), new THREE.Vector3(s * 0.85 * w, 0.8, 0), 0.82 * w, roupa));
    const pe = parte(new THREE.BoxGeometry(1.2 * w, 0.7, 2.2), sapato, s * 0.85 * w, 0.35, 0.45); g.add(pe);
  }
  // tronco (pivô para a respiração)
  const tronco = new THREE.Group(); tronco.position.set(0, 6.4, 0); g.add(tronco);
  const corpo = parte(new THREE.CapsuleGeometry(1.95 * w, 2.6, 8, 20), o.avental ? avental : roupa, 0, 2.5, 0);
  corpo.scale.set(1, 1, 0.62); tronco.add(corpo);
  if (o.avental) {
    const faixa = parte(new THREE.BoxGeometry(3.7 * w, 0.18, 1.5), mat(0x2d7870, 0.9), 0, 2.2, 0); tronco.add(faixa);
  }
  // pescoço e cabeça
  const cabecaG = new THREE.Group(); cabecaG.position.set(0, 5.9, 0.1); tronco.add(cabecaG);
  cabecaG.add(parte(new THREE.CylinderGeometry(0.5, 0.55, 0.7, 14), pele, 0, -0.55, 0));
  cabecaG.add(parte(new THREE.SphereGeometry(1.15, 28, 20), pele, 0, 0.4, 0));
  // gorro (calota que cobre a parte de cima e a nuca)
  const calota = parte(new THREE.SphereGeometry(1.24, 28, 16, 0, Math.PI * 2, 0, Math.PI * 0.58), gorro, 0, 0.42, -0.05);
  calota.rotation.x = -0.18; cabecaG.add(calota);
  // máscara cobrindo nariz e boca
  const msk = parte(new THREE.SphereGeometry(1.2, 24, 16, Math.PI * 0.18, Math.PI * 0.64, Math.PI * 0.46, Math.PI * 0.36), mascara, 0, 0.35, 0.02);
  msk.rotation.y = Math.PI / 2 * 0 + Math.PI * 0.5 - Math.PI * 0.5; cabecaG.add(msk);
  // olhos e óculos de proteção
  for (const s of [-1, 1]) {
    cabecaG.add(parte(new THREE.SphereGeometry(0.14, 10, 8), mat(0x1c1a18, 0.3), s * 0.42, 0.62, 1.07));
  }
  const oculos = parte(new THREE.BoxGeometry(1.9, 0.5, 0.12), new THREE.MeshStandardMaterial({ color: 0xcfe8f0, transparent: true, opacity: 0.35, roughness: 0.1 }), 0, 0.62, 1.15);
  cabecaG.add(oculos);

  // braços: ombro → cotovelo → mão
  const bracos: THREE.Object3D[] = [];
  for (const s of [-1, 1]) {
    const ombro = new THREE.Vector3(s * 2.15 * w, 4.6, 0);
    const cotovelo = o.maosAoAlto ? new THREE.Vector3(s * 2.55 * w, 2.7, 0.9) : new THREE.Vector3(s * 2.55 * w, 2.3, 0.4);
    const mao = o.maosAoAlto ? new THREE.Vector3(s * 1.15 * w, 3.9, 2.4) : new THREE.Vector3(s * 2.7 * w, 0.2, 0.9);
    const mangaMat = o.avental ? avental : roupa;
    const braco = new THREE.Group();
    braco.add(osso(ombro, cotovelo, 0.62 * w, mangaMat));
    braco.add(osso(cotovelo, mao.clone().lerp(cotovelo, 0.18), 0.55 * w, o.avental ? mat(0x3c8f86, 0.9) : roupa));
    braco.add(parte(new THREE.SphereGeometry(0.4, 14, 12), luva, mao.x, mao.y, mao.z));
    tronco.add(braco); bracos.push(braco);
  }
  tronco.position.y = 6.4; // (pernas já em y=0)

  const fase = Math.random() * 6;
  const animar = (t: number) => {
    const r = Math.sin(t * 1.6 + fase);
    tronco.scale.y = 1 + r * 0.008; tronco.position.y = 6.4 + r * 0.04;
    cabecaG.rotation.y = Math.sin(t * 0.5 + fase) * 0.18;
    cabecaG.rotation.x = Math.sin(t * 0.37 + fase) * 0.04;
    if (o.maosAoAlto) bracos.forEach((b, i) => { b.rotation.x = Math.sin(t * 0.9 + fase + i) * 0.015; });
  };
  void branco;
  return { grupo: g, animar };
}
