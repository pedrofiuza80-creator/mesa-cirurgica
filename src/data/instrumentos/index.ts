import type { Instrumento } from '../../types';
import { DIERESE } from './dierese';
import { PREENSAO } from './preensao';
import { HEMOSTASIA } from './hemostasia';
import { AFASTAMENTO } from './afastamento';
import { SINTESE } from './sintese';
import { ESPECIAIS } from './especiais';

/** Todos os instrumentos. Para corrigir uma ficha, edite o arquivo do tempo cirúrgico correspondente. */
export const INSTR: Instrumento[] = [...DIERESE, ...PREENSAO, ...HEMOSTASIA, ...AFASTAMENTO, ...SINTESE, ...ESPECIAIS];
