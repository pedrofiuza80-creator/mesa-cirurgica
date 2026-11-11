export type CatId = 'dierese' | 'preensao' | 'hemostasia' | 'afastamento' | 'sintese' | 'especiais';

export interface Categoria {
  nome: string;
  cor: string;
  desc: string;
}

/** Situação da conferência do conteúdo de uma ficha. */
export type Status = 'a_conferir' | 'conferido';

export interface Instrumento {
  id: string;
  nome: string;
  cat: CatId;
  /** Para que serve. */
  uso: string;
  /** Como reconhecer. */
  dica: string;
  /**
   * Preencher quando fontes diferentes classificam o instrumento em tempos diferentes.
   * `tambem` = outros tempos que também são aceitos como resposta certa no jogo;
   * `nota` = explicação mostrada na ficha e na página de revisão.
   */
  variacao?: { tambem: CatId[]; nota: string };
  /** Se omitido, vale 'a_conferir'. */
  status?: Status;
  /** Livros ou materiais usados para conferir (texto livre). */
  fontes?: string[];
}

/** Um instrumento (ou material) pedido por uma cirurgia. */
export interface ItemCirurgia {
  /** id do instrumento em src/data/instrumentos.ts */
  id: string;
  qtd: number;
  /** Por que ele é necessário (ou aceitável) nesta cirurgia. */
  obs?: string;
}

export interface TempoCirurgico {
  nome: string;
  descricao: string;
  /** Instrumentos que o "cirurgião" pede neste tempo (usado na fase 2 do modo Simular cirurgia). */
  pedidos: string[];
}

export interface Cirurgia {
  id: string;
  nome: string;
  descricao: string;
  tempos: TempoCirurgico[];
  essenciais: ItemCirurgia[];
  opcionais: ItemCirurgia[];
  status?: Status;
  fontes?: string[];
  /** Observações para quem revisa (diferenças entre serviços, dúvidas). */
  notas?: string;
}
