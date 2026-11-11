import type { Cirurgia } from '../../types';

// EXEMPLO inicial: ainda precisa ser conferido com o material da disciplina.
export const suturaDeFerida: Cirurgia = {
  id: 'sutura-de-ferida',
  nome: 'Sutura de ferida',
  descricao: 'Fechamento primário de uma ferida limpa de pele e subcutâneo, após antissepsia e colocação dos campos.',
  tempos: [
    { nome: 'Antissepsia e campos', descricao: 'Limpar a pele e delimitar o campo operatório.', pedidos: ['cheron', 'backhaus'] },
    { nome: 'Preparo da ferida', descricao: 'Avivar as bordas, se necessário.', pedidos: ['bisturi', 'denterato'] },
    { nome: 'Síntese', descricao: 'Aproximar as bordas com pontos e cortar o fio.', pedidos: ['denterato', 'portaagulha', 'agulha', 'mayo'] },
  ],
  essenciais: [
    { id: 'cheron', qtd: 1, obs: 'Segura a gaze com antisséptico.' },
    { id: 'backhaus', qtd: 4, obs: 'Fixa os campos à pele.' },
    { id: 'denterato', qtd: 1, obs: 'Segura a pele durante a sutura.' },
    { id: 'portaagulha', qtd: 1 },
    { id: 'agulha', qtd: 1, obs: 'Agulha já montada com o fio.' },
  ],
  opcionais: [
    { id: 'bisturi', qtd: 1, obs: 'Só se for preciso avivar as bordas.' },
    { id: 'mayo', qtd: 1, obs: 'Corte do fio; na prática costuma haver tesoura de fios (a incluir no catálogo).' },
  ],
  status: 'a_conferir',
  notas: 'Quantidade de pinças de campo e escolha da tesoura variam entre serviços.',
};
