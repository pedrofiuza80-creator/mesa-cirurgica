import type { Cirurgia } from '../../types';
import { it, preparo, preparoOpcional, reparo } from './comum';

// Conteúdo escrito a partir de conhecimento geral; precisa ser conferido com o material da disciplina.
export const suturaDeFerida: Cirurgia = {
  id: 'sutura-de-ferida',
  nome: 'Sutura de ferida',
  descricao: 'Fechamento primário de uma ferida limpa de pele e subcutâneo, após antissepsia, campos e anestesia local.',
  tempos: [
    { nome: 'Antissepsia e campos', descricao: 'Limpar a pele e delimitar o campo operatório.', pedidos: ['foerster', 'cupula', 'gaze', 'campo', 'backhaus'] },
    { nome: 'Anestesia local', descricao: 'Infiltrar anestésico nas bordas da ferida.', pedidos: ['seringa'] },
    { nome: 'Preparo da ferida', descricao: 'Avivar as bordas, se necessário.', pedidos: ['bisturi3', 'lamina15', 'denterato'] },
    { nome: 'Síntese', descricao: 'Aproximar as bordas com pontos e cortar o fio.', pedidos: ['denterato', 'portaagulha', 'agulhaCortante', 'fioNylon', 'mayo'] },
  ],
  essenciais: [
    ...preparo(10),
    it('seringa', 1, 'Anestesia local.'),
    it('denterato', 1, 'Segura a pele durante a sutura.'),
    it('portaagulha', 1, 'Segura a agulha.'),
    it('agulhaCortante', 1, 'Agulha cortante, própria para pele.'),
    it('fioNylon', 1, 'Fio inabsorvível monofilamentar, comum na pele.'),
    it('mayo', 1, 'Mayo reta: corta o fio.'),
  ],
  opcionais: [
    ...preparoOpcional,
    it('adson', 1, 'Pode substituir a dente de rato em pele fina.'),
    it('adsonDente', 1, 'Pode substituir a dente de rato.'),
    it('bisturi3', 1, 'Só se for preciso avivar as bordas.'),
    it('lamina15', 1, 'Lâmina para o cabo nº 3, se for avivar as bordas.'),
    it('halsted', 1, 'Para pinçar um pequeno vaso que sangre.'),
    it('spencer', 1, 'Tesoura de fios (não consta na apostila); pode substituir a Mayo para cortar o fio.'),
    reparo,
    it('agulha', 1, 'Alternativa: agulha já montada com o fio (nesse caso o fio e a agulha avulsos não são necessários).'),
  ],
  status: 'a_conferir',
  notas: 'A escolha da tesoura (Spencer ou Mayo), a quantidade de pinças de campo e o tipo de fio variam entre serviços.',
};
