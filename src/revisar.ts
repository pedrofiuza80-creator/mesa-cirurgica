import { CATS, ZONE_ORDER } from './data/categorias';
import { INSTR } from './data/instrumentos';
import { CIRURGIAS } from './data/cirurgias';
import { validarDados } from './data/validar';
import type { CatId, Status } from './types';
import { catalogo } from './models/carregador';

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
  let origem: '' | 'apostila' | 'complementar' = '';

  const draw = () => {
    const q = busca.trim().toLowerCase();
    const lista = INSTR.filter(d => (!filtro || d.cat === filtro) && (!origem || (origem === 'apostila') === (d.apostila !== undefined)) &&
      (!q || (d.nome + ' ' + d.uso + ' ' + d.dica).toLowerCase().includes(q)));
    const nApostila = INSTR.filter(d => d.apostila !== undefined).length;
    const nVar = INSTR.filter(d => d.variacao).length;
    root.innerHTML = `<div class="rev">
      <h2>Revisar conteúdo</h2>
      <p>Aqui está tudo o que o jogo ensina. Confira cada ficha com o material da disciplina e anote o que estiver errado ou diferente na sua faculdade.</p>
      <p class="muted"><b>Instrumentos com o selo "Apostila p. N"</b> têm texto e tempo cirúrgico tirados da apostila da disciplina (CINST), na página indicada. Os <b>"fora da apostila"</b> são complementares (fios, agulhas, outros afastadores e pinças): foram escritos a partir de conhecimento geral e de poucas fontes de internet, sem revisão por professor, e estão marcados "a conferir". Onde há divergência entre fontes, a ficha mostra um aviso amarelo.</p>
      ${erros.length ? `<div class="card err"><b>Problemas nos arquivos de dados (${erros.length})</b><ul class="miss">${erros.map(e => `<li>${esc(e)}</li>`).join('')}</ul></div>` : ''}
      <div class="stats" style="max-width:520px">
        <div class="stat"><b>${INSTR.length}</b><span>Instrumentos</span></div>
        <div class="stat"><b>${nApostila}</b><span>Na apostila</span></div>
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
        <select id="rv-o"><option value="">Todas as origens</option><option value="apostila" ${origem === 'apostila' ? 'selected' : ''}>Só da apostila</option><option value="complementar" ${origem === 'complementar' ? 'selected' : ''}>Fora da apostila</option></select>
        <select id="rv-c"><option value="">Todos os tempos</option>${ZONE_ORDER.map(c => `<option value="${c}" ${filtro === c ? 'selected' : ''}>${CATS[c].nome}</option>`).join('')}</select>
        <button class="btn" id="rv-p">Imprimir</button>
      </div>
      <div class="tabela">${lista.map(d => `<div class="card"><div class="rtop">${chip(d.cat)}<h2 style="margin:0">${esc(d.nome)}</h2>${d.grupo ? `<span class="st">${d.grupo === 'anexo' ? 'Anexo' : 'Ginecológico'}</span>` : ''}${d.apostila !== undefined ? `<span class="st ok">Apostila p. ${d.apostila}</span>` : '<span class="st">Fora da apostila</span>'}${sel(d.status)}</div>
        <p style="margin-top:8px"><b>Uso:</b> ${esc(d.uso)}</p>
        <p><b>Como reconhecer:</b> ${esc(d.dica)}</p>
        ${d.variacao ? `<p class="aviso">⚠ As fontes divergem.${d.variacao.tambem.length ? ` Também aceito em: ${d.variacao.tambem.map(chip).join(' ')}` : ''}<br>${esc(d.variacao.nota)}</p>` : ''}
        ${d.fontes?.length ? `<p class="muted" style="margin:0">Fontes: ${d.fontes.map(esc).join('; ')}</p>` : ''}
        <p class="muted" style="margin:6px 0 0;font-size:12px">id: ${esc(d.id)}</p></div>`).join('') || '<p class="muted">Nada encontrado.</p>'}</div>
      ${creditos()}
      <div class="foot">Para corrigir: edite <code>src/data/instrumentos.ts</code> ou os arquivos em <code>src/data/cirurgias/</code>. Material de estudo: a classificação varia entre faculdades.</div>
    </div>`;
    const q2 = root.querySelector<HTMLInputElement>('#rv-q')!;
    q2.oninput = () => { busca = q2.value; const p = q2.selectionStart; draw(); const n = root.querySelector<HTMLInputElement>('#rv-q')!; n.focus(); n.setSelectionRange(p, p); };
    root.querySelector<HTMLSelectElement>('#rv-o')!.onchange = e => { origem = (e.target as HTMLSelectElement).value as typeof origem; draw(); };
    root.querySelector<HTMLSelectElement>('#rv-c')!.onchange = e => { filtro = (e.target as HTMLSelectElement).value as CatId | ''; draw(); };
    root.querySelector<HTMLButtonElement>('#rv-p')!.onclick = () => window.print();
  };
  draw();
}

/** Seção de créditos dos modelos 3D externos (.glb); avisa quando falta autor ou licença. */
function creditos(): string {
  const c = catalogo();
  const itens = [
    ...Object.entries(c.instrumentos ?? {}).map(([id, o]) => ({ nome: nomeDe(id), o })),
    ...(c.pessoas ?? []).map(p => ({ nome: p.nome ?? p.arquivo, o: p })),
  ];
  if (!itens.length) return `<h3>Modelos 3D</h3><p class="muted">Nenhum modelo externo em uso: todos os instrumentos usam os modelos simples.</p>`;
  return `<h3>Modelos 3D e créditos (${itens.length})</h3><ul class="miss">${itens.map(({ nome, o }) => {
    const falta = !o.autor || !o.licenca;
    return `<li>${esc(nome)} — ${esc(o.arquivo)} · ${o.autor ? esc(o.autor) : '<b>autor?</b>'} · ${o.licenca ? esc(o.licenca) : '<b>licença?</b>'}${o.fonte ? ` · <span class="muted">${esc(o.fonte)}</span>` : ''}${falta ? ' <span class="st todo">falta informação</span>' : ''}</li>`;
  }).join('')}</ul>`;
}
