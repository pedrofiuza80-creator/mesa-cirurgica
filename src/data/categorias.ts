import type { CatId, Categoria } from '../types';

/**
 * Os seis tempos cirúrgicos, com os nomes e a ordem da apostila da disciplina (CINST):
 * 1º Diérese, 2º Preensão, 3º Hemostasia, 4º Exposição, 5º Especial, 6º Síntese.
 * (O id interno "afastamento" é o 4º tempo, Exposição; o id não aparece para o usuário.)
 */
export const CATS: Record<CatId, Categoria> = {
  dierese:     { nome:'Diérese',     cor:'#e86a6a', desc:'Cortar e separar tecidos.' },
  preensao:    { nome:'Preensão',    cor:'#e6a64e', desc:'Segurar e manipular tecidos.' },
  hemostasia:  { nome:'Hemostasia',  cor:'#5a9ae8', desc:'Controlar o sangramento: pinçar vasos e enxugar o campo (pinças hemostáticas, gaze e compressa).' },
  afastamento: { nome:'Exposição',   cor:'#a27ae0', desc:'Afastar bordas e estruturas para expor o campo operatório (afastadores dinâmicos e auto-estáticos).' },
  especiais:   { nome:'Especial',    cor:'#94a0b4', desc:'Uso específico: fixar campos, tração e preensão especiais, ginecológicos e instrumentos anexos.' },
  sintese:     { nome:'Síntese',     cor:'#45c294', desc:'Aproximar e fechar tecidos (sutura).' },
};
export const ZONE_ORDER: CatId[] = ['dierese','preensao','hemostasia','afastamento','especiais','sintese'];
