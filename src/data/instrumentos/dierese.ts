import type { Instrumento } from '../../types';
import { FONTE } from './fontes';

/** Diérese: instrumentos COMPLEMENTARES, que não constam na apostila da disciplina (os da apostila estão em apostila.ts). */
export const DIERESE: Instrumento[] = [
  { id:'lamina11', nome:'Lâmina de bisturi nº 11', cat:'dierese',
    uso:'Lâmina pontiaguda, em triângulo alongado, para incisões pequenas e precisas (por exemplo, drenagem de abscesso e punções). Encaixa no cabo nº 3.',
    dica:'Ponta afilada em triângulo, quase sem "barriga" de corte.' },
  { id:'lamina15', nome:'Lâmina de bisturi nº 15', cat:'dierese',
    uso:'Lâmina pequena de corte curvo, a mais comum para incisões de pele em procedimentos pequenos. Encaixa no cabo nº 3.',
    dica:'Pequena, com a borda de corte arredondada ("barriga" curta).' },
  { id:'lamina22', nome:'Lâmina de bisturi nº 22', cat:'dierese',
    uso:'Lâmina grande, de corte amplo e curvo, para incisões longas e planos mais profundos. Encaixa no cabo nº 4.',
    dica:'A maior das lâminas aqui; barriga larga e bem arredondada.' },
  { id:'metzenbaumLonga', nome:'Tesoura de Metzenbaum longa', cat:'dierese',
    uso:'Versão de cabo mais longo da Metzenbaum, para dissecar tecidos delicados em cavidades profundas (abdome, tórax, pelve).',
    dica:'Mesmo desenho delicado da Metzenbaum, porém bem mais comprida.' },
  { id:'potts', nome:'Tesoura de Potts-Smith', cat:'dierese',
    uso:'Tesoura de lâminas anguladas usada em cirurgia vascular para abrir (arteriotomia) vasos no sentido do comprimento.',
    dica:'As lâminas formam um ângulo com o cabo; delicada e pontuda.' },
  { id:'spencer', nome:'Tesoura de fios (Spencer)', cat:'dierese',
    uso:'Tesoura pequena para cortar fios de sutura e retirar pontos da pele.',
    dica:'Pequena, de lâminas curtas e finas e ponta aguda; as de retirar pontos podem ter a ponta de uma lâmina em gancho.',
    variacao:{ tambem:['sintese'], nota:'Cortar o fio faz parte da síntese; alguns materiais colocam as tesouras de fio em Síntese e outros em Diérese, junto das demais tesouras. Confira o critério da sua disciplina.' } },
  { id:'littauer', nome:'Tesoura de Littauer', cat:'dierese',
    uso:'Tesoura para retirar pontos: a ponta em gancho de uma lâmina passa sob o fio, que é então cortado.',
    dica:'Pequena e reta, com um pequeno gancho na ponta de uma das lâminas.',
    variacao:{ tambem:['sintese'], nota:'Mesma divergência das demais tesouras de fio: Diérese ou Síntese conforme a fonte.' } },
  { id:'cooper', nome:'Tesoura de Cooper', cat:'dierese',
    uso:'Tesoura curva e forte, de pontas rombas, para cortar tecidos resistentes; em alguns serviços também corta fios e curativos.',
    dica:'Robusta, com lâminas curvas na face plana e pontas rombas.' },
];
