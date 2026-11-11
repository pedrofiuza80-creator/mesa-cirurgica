import { CATS } from './categorias';
import { INSTR } from './instrumentos';
import { CIRURGIAS } from './cirurgias';
import { BUILD_ALL } from '../models/todos';

/** Procura erros nos arquivos de dados (ids repetidos, tempos inválidos, instrumento inexistente...). */
export function validarDados(): string[] {
  const erros: string[] = [];
  const ids = new Set<string>();
  for (const d of INSTR) {
    if (ids.has(d.id)) erros.push(`Instrumento com id repetido: ${d.id}`);
    ids.add(d.id);
    if (!BUILD_ALL[d.id]) erros.push(`${d.nome}: sem modelo 3D (id "${d.id}")`);
    if (!CATS[d.cat]) erros.push(`${d.nome}: categoria inválida "${d.cat}"`);
    for (const c of d.variacao?.tambem ?? []) {
      if (!CATS[c]) erros.push(`${d.nome}: categoria inválida em variacao "${c}"`);
      if (c === d.cat) erros.push(`${d.nome}: variacao repete a categoria principal`);
    }
  }
  const cids = new Set<string>();
  for (const c of CIRURGIAS) {
    if (cids.has(c.id)) erros.push(`Cirurgia com id repetido: ${c.id}`);
    cids.add(c.id);
    const usados = [...c.essenciais, ...c.opcionais].map(i => i.id);
    for (const t of c.tempos) usados.push(...t.pedidos);
    for (const id of usados) if (!ids.has(id)) erros.push(`${c.nome}: instrumento inexistente "${id}"`);
    for (const i of c.essenciais) if (c.opcionais.some(o => o.id === i.id)) erros.push(`${c.nome}: "${i.id}" está em essenciais e em opcionais`);
    for (const i of [...c.essenciais, ...c.opcionais]) if (!(i.qtd >= 1)) erros.push(`${c.nome}: quantidade inválida para "${i.id}"`);
  }
  return erros;
}
