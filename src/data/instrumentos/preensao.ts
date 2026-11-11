import type { Instrumento } from '../../types';
import { FONTE } from './fontes';

/** Preensão: instrumentos COMPLEMENTARES, que não constam na apostila da disciplina (os da apostila estão em apostila.ts). */
export const PREENSAO: Instrumento[] = [
  { id:'adsonDente', nome:'Pinça de Adson com dente', cat:'preensao',
    uso:'Versão da Adson com dentes finos (1×2), que seguram melhor a pele e tecidos mais firmes com pouco trauma.',
    dica:'Igual à Adson, mas com dentes finos na ponta, que se encaixam.', fontes:[FONTE.grasping] },
  { id:'adsonBrown', nome:'Pinça de Adson-Brown', cat:'preensao',
    uso:'Pinça fina com várias fileiras de pequenos dentes, que segura a pele e a fáscia fina sem escorregar; muito usada em sutura de pele e cirurgia plástica.',
    dica:'Ponta mais larga que a Adson, com duas fileiras de dentes finos que se encaixam.', fontes:[FONTE.grasping] },
  { id:'bonney', nome:'Pinça de Bonney', cat:'preensao',
    uso:'Pinça de dissecção robusta, de dentes grandes, para tecidos firmes como aponeurose e músculo.',
    dica:'Maior e mais forte que a dente de rato, com dentes bem evidentes na ponta larga.' },
  { id:'debakey', nome:'Pinça de DeBakey', cat:'preensao',
    uso:'Pinça de dissecção atraumática, usada em cirurgia vascular e abdominal para segurar vasos e vísceras sem lesá-los.',
    dica:'Comprida, com a ponta cheia de sulcos finos no sentido do comprimento e sem dentes.' },
  { id:'lahey', nome:'Pinça de Lahey', cat:'preensao',
    uso:'Pinça de preensão com pequenos dentes na ponta, usada para tracionar tecidos firmes, como a glândula tireoide.',
    dica:'Ponta curta com dentes agudos que se cruzam, e cremalheira.' },
];
