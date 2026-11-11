import type { CatId, Categoria } from '../types';

export const CATS: Record<CatId, Categoria> = {
  dierese:     { nome:'Diérese',        cor:'#e86a6a', desc:'Cortar e separar tecidos.' },
  preensao:    { nome:'Preensão',       cor:'#e6a64e', desc:'Segurar e manipular tecidos.' },
  hemostasia:  { nome:'Hemostasia',     cor:'#5a9ae8', desc:'Pinçar vasos e controlar o sangramento.' },
  afastamento: { nome:'Afastamento',    cor:'#a27ae0', desc:'Afastar bordas e estruturas para expor o campo operatório.' },
  sintese:     { nome:'Síntese',        cor:'#45c294', desc:'Aproximar e fechar tecidos (sutura).' },
  especiais:   { nome:'Especiais',      cor:'#94a0b4', desc:'Uso específico, como fixar campos ou fazer a antissepsia.' },
};
export const ZONE_ORDER: CatId[] = ['dierese','preensao','hemostasia','afastamento','sintese','especiais'];
