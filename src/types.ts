export type CatId = 'dierese' | 'preensao' | 'hemostasia' | 'afastamento' | 'sintese' | 'especiais';

export interface Categoria {
  nome: string;
  cor: string;
  desc: string;
}

export interface Instrumento {
  id: string;
  nome: string;
  cat: CatId;
  /** Para que serve. */
  uso: string;
  /** Como reconhecer. */
  dica: string;
}
