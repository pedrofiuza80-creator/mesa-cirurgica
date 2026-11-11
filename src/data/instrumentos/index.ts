import type { Instrumento } from '../../types';
import { DA_APOSTILA } from './apostila';
import { DIERESE } from './dierese';
import { PREENSAO } from './preensao';
import { HEMOSTASIA } from './hemostasia';
import { AFASTAMENTO } from './afastamento';
import { SINTESE } from './sintese';
import { ESPECIAIS } from './especiais';

/**
 * Todos os instrumentos.
 *  - `apostila.ts`: os que constam na apostila da disciplina (texto e tempo seguem a apostila).
 *  - demais arquivos: instrumentos COMPLEMENTARES, que não constam na apostila (fios, agulhas, outros afastadores etc.).
 */
export const INSTR: Instrumento[] = [...DA_APOSTILA, ...DIERESE, ...PREENSAO, ...HEMOSTASIA, ...AFASTAMENTO, ...SINTESE, ...ESPECIAIS];
