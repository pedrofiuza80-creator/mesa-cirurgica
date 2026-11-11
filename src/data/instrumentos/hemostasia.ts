import type { Instrumento } from '../../types';
import { FONTE } from './fontes';


/** Hemostasia: instrumentos COMPLEMENTARES, que não constam na apostila da disciplina (os da apostila estão em apostila.ts). */
export const HEMOSTASIA: Instrumento[] = [
  { id:'spencerWells', nome:'Pinça de Spencer-Wells', cat:'hemostasia',
    uso:'Pinça hemostática de tamanho médio a grande, muito usada para pinçar vasos e pedículos.',
    dica:'Curva, com ranhuras em toda a ponta; parecida com a Crile e com a Kelly.',
    variacao:{ tambem:[], nota:'Kelly, Crile e Spencer-Wells são muito parecidas, e alguns serviços usam os nomes como sinônimos. Confira com seu material.' } },
  { id:'rochesterOchsner', nome:'Pinça de Rochester-Ochsner', cat:'hemostasia',
    uso:'Pinça hemostática grande com dentes na ponta, que impedem o pedículo de escorregar.',
    dica:'Igual à Rochester-Pean, mas com dente 1×2 na ponta.',
    variacao:{ tambem:[], nota:'Kocher, Ochsner e Rochester-Ochsner têm nomes e desenhos muito próximos; alguns serviços tratam como a mesma pinça.' } },
  { id:'satinsky', nome:'Clampe de Satinsky', cat:'hemostasia',
    uso:'Clampe vascular curvo que oclui parcialmente um vaso grande (como a aorta), mantendo o fluxo no restante.',
    dica:'Mordente longo e bem curvo, em forma de concha, com cremalheira.' },
  { id:'bulldog', nome:'Clampe bulldog', cat:'hemostasia',
    uso:'Pequeno clampe vascular de mola, atraumático, para fechar temporariamente vasos de pequeno calibre.',
    dica:'Sem argolas; pequeno, com mola na base e mordentes que fecham sozinhos.' },
  { id:'debakeyClampe', nome:'Clampe vascular de DeBakey', cat:'hemostasia',
    uso:'Clampe atraumático para ocluir vasos temporariamente em cirurgia vascular.',
    dica:'Longo, com argolas e cremalheira; mordentes retos com sulcos finos, sem dentes.' },
];
