import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as clonarComEsqueleto } from 'three/addons/utils/SkeletonUtils.js';

/** Dados de origem de um modelo 3D. Preencher sempre: a página "Revisar conteúdo" mostra os créditos. */
export interface Origem { arquivo: string; autor?: string; licenca?: string; fonte?: string }
export interface PessoaCfg extends Origem {
  /** posição no chão da sala (x, z); a mesa fica em 0,0 e o fundo da sala em z = -18 */
  x: number; z: number;
  /** giro em radianos (0 = de frente para o jogador) */
  giro?: number;
  /** multiplica o tamanho automático (altura de ~1,75 m) */
  escala?: number;
  /** nome da animação a tocar (se omitido, toca a primeira, se houver) */
  animacao?: string;
  nome?: string;
}
export interface Catalogo { instrumentos?: Record<string, Origem>; pessoas?: PessoaCfg[] }

let catalogoAtual: Catalogo = {};
export const catalogo = () => catalogoAtual;

const loader = new GLTFLoader();
const base = import.meta.env.BASE_URL;

/** Lê public/models/catalogo.json. Se não existir ou estiver quebrado, devolve vazio (o jogo usa os modelos simples). */
export async function lerCatalogo(): Promise<Catalogo> {
  try {
    const r = await fetch(`${base}models/catalogo.json`, { cache: 'no-cache' });
    if (!r.ok || !(r.headers.get('content-type') ?? '').includes('json')) return {};
    catalogoAtual = (await r.json()) as Catalogo;
  } catch (e) {
    console.warn('[modelos] catalogo.json ilegível; usando modelos simples.', e);
    catalogoAtual = {};
  }
  return catalogoAtual;
}

/** Baixa um .glb; devolve null se falhar ou demorar demais (nunca lança erro). */
export function carregarGlb(url: string, limiteMs = 20000): Promise<{ cena: THREE.Group; animacoes: THREE.AnimationClip[] } | null> {
  return new Promise(resolve => {
    const t = window.setTimeout(() => { console.warn('[modelos] tempo esgotado:', url); resolve(null); }, limiteMs);
    loader.load(url,
      g => { clearTimeout(t); resolve({ cena: g.scene, animacoes: g.animations }); },
      undefined,
      e => { clearTimeout(t); console.warn('[modelos] falhou ao carregar', url, e); resolve(null); });
  });
}

function sombras(o: THREE.Object3D) {
  o.traverse(c => { if (c instanceof THREE.Mesh) { c.castShadow = true; c.receiveShadow = true; } });
}

/**
 * Ajusta um modelo de instrumento ao mesmo padrão dos modelos simples:
 * eixo mais comprido na horizontal (x), mesmo comprimento do modelo simples, apoiado no tampo da mesa.
 */
export function ajustarInstrumento(modelo: THREE.Object3D, comprimentoAlvo: number): THREE.Group {
  const m = modelo.clone(true);
  const caixa = new THREE.Box3().setFromObject(m);
  const t = caixa.getSize(new THREE.Vector3());
  const envoltorio = new THREE.Group(); envoltorio.add(m);
  // se o comprimento maior estiver em z, gira 90°; se estiver em y (instrumento "em pé"), deita
  if (t.y > t.x && t.y > t.z) m.rotation.z = Math.PI / 2;
  else if (t.z > t.x) m.rotation.y = Math.PI / 2;
  envoltorio.updateMatrixWorld(true);
  const c2 = new THREE.Box3().setFromObject(envoltorio);
  const s = comprimentoAlvo / Math.max(c2.max.x - c2.min.x, 1e-6);
  envoltorio.scale.setScalar(s);
  envoltorio.updateMatrixWorld(true);
  const c3 = new THREE.Box3().setFromObject(envoltorio), centro = c3.getCenter(new THREE.Vector3());
  m.position.set(-centro.x / s, -c3.min.y / s, -centro.z / s);
  // cria o grupo final já com a escala aplicada, para o resto do jogo tratar como os modelos simples
  const saida = new THREE.Group(); saida.add(envoltorio);
  sombras(saida);
  return saida;
}

/** Prepara uma pessoa (clone próprio, altura ~13 unidades = 1,75 m) e devolve o misturador de animação, se houver. */
export function criarPessoa(cena: THREE.Group, animacoes: THREE.AnimationClip[], cfg: PessoaCfg, pisoY: number) {
  const p = clonarComEsqueleto(cena) as THREE.Group;
  const caixa = new THREE.Box3().setFromObject(p);
  const h = Math.max(caixa.max.y - caixa.min.y, 1e-6);
  const s = (13 / h) * (cfg.escala ?? 1);
  const g = new THREE.Group(); g.add(p);
  p.scale.setScalar(s);
  p.position.y = -caixa.min.y * s;
  g.position.set(cfg.x, pisoY, cfg.z); g.rotation.y = cfg.giro ?? 0;
  sombras(g);
  let mixer: THREE.AnimationMixer | null = null;
  if (animacoes.length) {
    mixer = new THREE.AnimationMixer(p);
    const clip = (cfg.animacao && animacoes.find(a => a.name === cfg.animacao)) || animacoes[0];
    mixer.clipAction(clip).play();
  }
  return { grupo: g, mixer };
}
