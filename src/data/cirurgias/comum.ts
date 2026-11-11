import type { ItemCirurgia } from '../../types';

/** Atalho para escrever um item: it('kelly', 4, 'Pinçam os vasos.') */
export const it = (id: string, qtd = 1, obs?: string): ItemCirurgia => (obs ? { id, qtd, obs } : { id, qtd });

/** Antissepsia e colocação dos campos: igual na maioria das cirurgias. */
export const preparo = (gazes = 10, foersters = 1): ItemCirurgia[] => [
  it('foerster', foersters, foersters > 1
    ? 'Uma para o pincel de antissepsia (Foerster reta) e as demais para tracionar o fundo da vesícula.'
    : 'Pincel de antissepsia: a Foerster reta segura a gaze com antisséptico.'),
  it('cupula', 1, 'Guarda o antisséptico.'),
  it('gaze', gazes, 'Limpar e secar o campo, antissepsia.'),
  it('campo', 4, 'Isolam a área operatória.'),
  it('backhaus', 4, 'Fixam os campos à pele.'),
];
export const preparoOpcional: ItemCirurgia[] = [
  it('pean', 1, 'Pinça de Pean: antissepsia e curativos em cirurgias de caixa pequena.'),
  it('cheron', 1, 'Não consta na apostila; mesmo uso da Foerster na antissepsia.'),
];

/** O Reparo (Halstead reta) monta e desmonta a lâmina do bisturi de cabo frio. */
export const reparo = it('halstedReta', 1, 'Reparo: monta e desmonta a lâmina do bisturi.');
