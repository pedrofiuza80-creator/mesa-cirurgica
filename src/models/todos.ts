import type * as THREE from 'three';
import { BUILD } from './construtores';
import { EXTRAS } from './extras';

/** Todos os modelos simples (formas básicas): os 14 originais + as famílias novas. */
export const BUILD_ALL: Record<string, () => THREE.Group> = { ...BUILD, ...EXTRAS };
