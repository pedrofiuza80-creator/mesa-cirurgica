import type { ItemCirurgia } from '../../types';

/** Atalho para escrever um item: it('kelly', 4, 'Pinçam os vasos.') */
export const it = (id: string, qtd = 1, obs?: string): ItemCirurgia => (obs ? { id, qtd, obs } : { id, qtd });

/** Antissepsia e colocação dos campos: igual na maioria das cirurgias. */
export const preparo = (gazes = 10): ItemCirurgia[] => [
  it('cheron', 1, 'Segura a gaze com antisséptico na antissepsia.'),
  it('cupula', 1, 'Guarda o antisséptico.'),
  it('gaze', gazes, 'Limpar e secar o campo, antissepsia.'),
  it('campo', 4, 'Isolam a área operatória.'),
  it('backhaus', 4, 'Fixam os campos à pele.'),
];
export const preparoOpcional: ItemCirurgia[] = [
  it('foerster', 1, 'Pode substituir a Cheron na antissepsia.'),
];
