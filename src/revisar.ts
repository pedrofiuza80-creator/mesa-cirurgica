import { CATS, ZONE_ORDER } from './data/categorias';
import { INSTR } from './data/instrumentos';
import { CIRURGIAS } from './data/cirurgias';
import { validarDados } from './data/validar';
import type { CatId, Status } from './types';

const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
const nomeDe = (id: string) => INSTR.find(i => i.id === id)?.nome ?? `⚠ ${id}`;
const chip = (c: CatId) => `<span class="chip" style="background:${CATS[c].cor}">${CATS[c].nome}</span>`;
const sel = (s?: Status) => s === 'conferido'
  ? '<span class="st ok">✓ Conferido</span>' : '<span class="st todo">A conferir</span>';

/** Página "Revisar conteúdo": lista tudo o que está nos arquivos de dados, para conferência. */
export function renderRevisar(root: HTMLElement) {
  const erros = validarDados();
  let filtro: CatId | '' = '';
  let busca = '';

  const draw = () => {
    const q = busca.trim().toLowerCase();
    const lista = INSTR.filter(d => (!filtro || d.cat === filtro) &&
      (!q || (d.nome + ' ' + d.uso + ' ' + d.dica).toLowerCase().includes(q)));
    const nConf = INSTR.filter(d => d.status === 'conferido').length;
    const nVar = INSTR.filter(d => d.variacao).length;
    root.innerHTML = `<div class="rev">
      <h2>Revisar conteúdo</h2>
      <p>Aqui está tudo o que o jogo ensina. Confira cada ficha com o material da disciplina e anote o que estiver errado ou diferente na sua faculdade.</p>
      ${erros.length ? `<div class="card err"><b>Problemas nos arquivos de dados (${erros.length})</b><ul class="miss">${erros.map(e => `<li>${esc(e)}</li>`).join('')}</ul></div>` : ''}
      <div class="stats" style="max-width:520px">
        <div class="stat"><b>${INSTR.length}</b><span>Instrumentos</span></div>
        <div class="stat"><b>${nConf}/${INSTR.length}</b><span>Conferidos</span></div>
        <div class="stat"><b>${nVar}</b><span>Classif. varia</span></div></div>

      <h3>Cirurgias (${CIRURGIAS.length})</h3>
      ${CIRURGIAS.map(c => `<div class="card"><div class="rtop"><h2 style="margin:0">${esc(c.nome)}</h2>${sel(c.status)}</div>
        <p>${esc(c.descricao)}</p>
        <p><b>Tempos:</b></p><ol class="miss">${c.tempos.map(t => `<li><b>${esc(t.nome)}</b>: ${esc(t.descricao)} <span class="muted">Pedidos: ${t.pedidos.map(p => esc(nomeDe(p))).join(', ')}</span></li>`).join('')}</ol>
        <p style="margin-top:10px"><b>Essenciais:</b></p><ul class="miss">${c.essenciais.map(i => `<li>${i.qtd}× ${esc(nomeDe(i.id))}${i.obs ? ` <span class="muted">— ${esc(i.obs)}</span>` : ''}</li>`).join('')}</ul>
        <p style="margin-top:10px"><b>Opcionais:</b></p><ul class="miss">${c.opcionais.length ? c.opcionais.map(i => `<li>${i.qtd}× ${esc(nomeDe(i.id))}${i.obs ? ` <span class="muted">— ${esc(i.obs)}</span>` : ''}</li>`).join('') : '<li class="muted">nenhum</li>'}</ul>
        ${c.notas ? `<p class="muted" style="margin-top:10px">Obs.: ${esc(c.notas)}</p>` : ''}
        ${c.fontes?.length ? `<p class="muted">Fontes: ${c.fontes.map(esc).join('; ')}</p>` : ''}</div>`).join('')}

      <h3>Instrumentos (${lista.length} de ${INSTR.length})</h3>
      <div class="filtros">
        <input id="rv-q" type="search" placeholder="Buscar por nome, uso…" value="${esc(busca)}">
        <select id="rv-c"><option value="">Todos os tempos</option>${ZONE_ORDER.map(c => `<option value="${c}" ${filtro === c ? 'selected' : ''}>${CATS[c].nome}</option>`).join('')}</select>
        <button class="btn" id="rv-p">Imprimir</button>
      </div>
      <div class="tabela">${lista.map(d => `<div class="card"><div class="rtop">${chip(d.cat)}<h2 style="margin:0">${esc(d.nome)}</h2>${sel(d.status)}</div>
        <p style="margin-top:8px"><b>Uso:</b> ${esc(d.uso)}</p>
        <p><b>Como reconhecer:</b> ${esc(d.dica)}</p>
        ${d.variacao ? `<p class="aviso">⚠ A classificação varia entre fontes. Também aceito em: ${d.variacao.tambem.map(chip).join(' ')}<br>${esc(d.variacao.nota)}</p>` : ''}
        ${d.fontes?.length ? `<p class="muted" style="margin:0">Fontes: ${d.fontes.map(esc).join('; ')}</p>` : ''}
        <p class="muted" style="margin:6px 0 0;font-size:12px">id: ${esc(d.id)}</p></div>`).join('') || '<p class="muted">Nada encontrado.</p>'}</div>
      <div class="foot">Para corrigir: edite <code>src/data/instrumentos.ts</code> ou os arquivos em <code>src/data/cirurgias/</code>. Material de estudo: a classificação varia entre faculdades.</div>
    </div>`;
    const q2 = root.querySelector<HTMLInputElement>('#rv-q')!;
    q2.oninput = () => { busca = q2.value; const p = q2.selectionStart; draw(); const n = root.querySelector<HTMLInputElement>('#rv-q')!; n.focus(); n.setSelectionRange(p, p); };
    root.querySelector<HTMLSelectElement>('#rv-c')!.onchange = e => { filtro = (e.target as HTMLSelectElement).value as CatId | ''; draw(); };
    root.querySelector<HTMLButtonElement>('#rv-p')!.onclick = () => window.print();
  };
  draw();
}
