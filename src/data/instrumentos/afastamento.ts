import type { Instrumento } from '../../types';
import { FONTE } from './fontes';

/** Exposição: instrumentos COMPLEMENTARES, que não constam na apostila da disciplina (os da apostila estão em apostila.ts). */
export const AFASTAMENTO: Instrumento[] = [
  { id:'senn', nome:'Afastador de Senn (Senn-Miller)', cat:'afastamento',
    uso:'Afastador manual de dupla extremidade: uma ponta em garras e a outra em lâmina, para planos superficiais.',
    dica:'Haste reta com garras em um lado e lâmina larga no outro.' },
  { id:'richardson', nome:'Afastador de Richardson (Richardson-Eastman)', cat:'afastamento',
    uso:'Afastador manual de lâmina larga e curta, para afastar a parede abdominal.',
    dica:'Lâmina larga e rasa, em ângulo reto com o cabo.' },
  { id:'armynavy', nome:'Afastador Army-Navy', cat:'afastamento',
    uso:'Afastador manual duplo, com duas lâminas pequenas de tamanhos diferentes, para planos superficiais.',
    dica:'Haste reta com lâmina dobrada em L em cada ponta, uma maior e outra menor.' },
  { id:'langenbeck', nome:'Afastador de Langenbeck', cat:'afastamento',
    uso:'Afastador manual de lâmina curta em L, para planos superficiais e incisões pequenas.',
    dica:'Cabo reto com a lâmina curta dobrada em ângulo reto na ponta.' },
  { id:'gelpi', nome:'Afastador de Gelpi', cat:'afastamento',
    uso:'Afastador autoestático pequeno de pontas agudas, que mantém abertas incisões em planos pequenos e profundos.',
    dica:'Duas hastes com pontas afiadas voltadas para dentro e uma cremalheira entre elas.', fontes:[FONTE.flashAux] },
  { id:'weitlaner', nome:'Afastador de Weitlaner', cat:'afastamento',
    uso:'Afastador autoestático pequeno, de garras, que mantém a ferida aberta em planos superficiais.',
    dica:'Cabo com argolas e cremalheira, como uma tesoura, e duas hastes terminadas em garras.',
    variacao:{ tambem:[], nota:'As fontes divergem quanto à indicação: uma lista o cita em neurocirurgia e cirurgia perineal; outra, em cirurgia plástica e ortopedia. A classificação (afastamento) não muda.' }, fontes:[FONTE.flashAux] },
  { id:'ganchoPele', nome:'Gancho de pele', cat:'afastamento',
    uso:'Gancho fino para afastar as bordas da pele em incisões pequenas e delicadas.',
    dica:'Haste fina com a ponta em gancho (um ou dois dentes).' },
];
