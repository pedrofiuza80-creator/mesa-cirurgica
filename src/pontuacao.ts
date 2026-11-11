import type { CatId, Cirurgia, ItemCirurgia } from './types';
import { INSTR } from './data/instrumentos';

/** Um instrumento que a pessoa colocou na mesa: qual, em que área e quantas unidades. */
export interface Colocado { id: string; zone: CatId; qtd: number }

export interface Avaliacao {
  nota: number;
  estrelas: 1 | 2 | 3;
  /** parte dos instrumentos colocados que a cirurgia usa (essenciais ou opcionais): 1 = nenhum desnecessário */
  precisao: number;
  /** pontos de cada parte (soma = nota) e o máximo possível */
  partes: { essenciais: number; posicao: number; quantidade: number; desnecessarios: number };
  essenciaisTotal: number;
  essenciaisCertos: ItemCirurgia[];
  faltaram: ItemCirurgia[];
  opcionaisUsados: ItemCirurgia[];
  desnecessarios: { id: string; motivo: string }[];
  posicaoTotal: number;
  posicaoCertos: number;
  foraDoLugar: { id: string; escolhida: CatId; certas: CatId[] }[];
  quantidadeErrada: { id: string; pediu: number; colocou: number }[];
}

export const MAX = { essenciais: 50, posicao: 30, quantidade: 10, desnecessarios: 10 } as const;

const porId = new Map(INSTR.map(d => [d.id, d]));
/** Áreas aceitas como corretas para um instrumento (a principal e as que variam entre fontes). */
export function zonasCertas(id: string): CatId[] {
  const d = porId.get(id);
  return d ? [d.cat, ...(d.variacao?.tambem ?? [])] : [];
}

/**
 * Pontuação (0 a 100):
 *  - 50 pts: instrumentos essenciais presentes;
 *  - 30 pts: instrumentos (essenciais e opcionais) na área certa;
 *  - 10 pts: quantidade certa dos essenciais colocados;
 *  - 10 pts: sem instrumentos desnecessários (perde 3 por item).
 * Os três primeiros valem na proporção da "precisão": quanto dos instrumentos colocados a cirurgia realmente usa.
 * Sem isso, jogar o arsenal inteiro na mesa renderia quase a nota máxima.
 */
export function avaliarMesa(c: Cirurgia, colocados: Colocado[]): Avaliacao {
  const mapa = new Map(colocados.map(x => [x.id, x]));
  const essIds = new Set(c.essenciais.map(i => i.id)), opcIds = new Set(c.opcionais.map(i => i.id));

  const essenciaisCertos = c.essenciais.filter(i => mapa.has(i.id));
  const faltaram = c.essenciais.filter(i => !mapa.has(i.id));
  const opcionaisUsados = c.opcionais.filter(i => mapa.has(i.id));
  const desnecessarios = colocados.filter(x => !essIds.has(x.id) && !opcIds.has(x.id)).map(x => {
    const d = porId.get(x.id);
    const motivo = c.naoUsar?.[x.id] ?? (d ? `Não costuma ser usado nesta cirurgia. Para que serve: ${d.uso}` : 'Não é usado nesta cirurgia.');
    return { id: x.id, motivo };
  });

  const relevantes = colocados.filter(x => essIds.has(x.id) || opcIds.has(x.id));
  const foraDoLugar = relevantes.filter(x => !zonasCertas(x.id).includes(x.zone)).map(x => ({ id: x.id, escolhida: x.zone, certas: zonasCertas(x.id) }));
  const posicaoCertos = relevantes.length - foraDoLugar.length;

  const quantidadeErrada = essenciaisCertos.filter(i => mapa.get(i.id)!.qtd !== i.qtd).map(i => ({ id: i.id, pediu: i.qtd, colocou: mapa.get(i.id)!.qtd }));
  const qtdCertas = essenciaisCertos.length - quantidadeErrada.length;

  const precisao = colocados.length ? relevantes.length / colocados.length : 0;
  const partes = {
    essenciais: (c.essenciais.length ? MAX.essenciais * essenciaisCertos.length / c.essenciais.length : 0) * precisao,
    posicao: (relevantes.length ? MAX.posicao * posicaoCertos / relevantes.length : 0) * precisao,
    quantidade: (essenciaisCertos.length ? MAX.quantidade * qtdCertas / essenciaisCertos.length : 0) * precisao,
    desnecessarios: colocados.length ? Math.max(0, MAX.desnecessarios - 3 * desnecessarios.length) : 0,
  };
  const nota = Math.round(partes.essenciais + partes.posicao + partes.quantidade + partes.desnecessarios);
  return {
    nota, estrelas: nota >= 90 ? 3 : nota >= 70 ? 2 : 1, precisao, partes,
    essenciaisTotal: c.essenciais.length, essenciaisCertos, faltaram, opcionaisUsados, desnecessarios,
    posicaoTotal: relevantes.length, posicaoCertos, foraDoLugar, quantidadeErrada,
  };
}
