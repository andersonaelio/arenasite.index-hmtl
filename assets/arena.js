/* Arena Prime · núcleo compartilhado (site + painel)
   Mapa: CONFIG · utilidades · banco (Supabase ou modo demonstração) · mídia do produto · carrinho · gaveta do pedido · cabeçalho */

/* ---------- CONFIG ---------- */
// Quando o banco for criado, preencher as duas linhas abaixo. Vazio = modo demonstração (dados no navegador).
const SUPABASE_URL = 'https://aqqmukbgnqxcfymaelus.supabase.co';
const SUPABASE_KEY = 'sb_publishable_PgQxIiD0ajBanMzgp7BL2g_x1L5P7H4';
const WHATSAPP = '5548999630724';
const LOJA = { nome: 'Arena Prime', endereco: 'R. Ver. Osvaldo Bittencourt, 637 · Carianos, Florianópolis/SC', horario: 'Terça a domingo · 14h às 22h', cnpj: '68.531.549/0001-46', instagram: 'arenaprimefloripa', myp: 'https://mypcards.com/ArenaPrimeFloripa' };
/* todas as cartas avulsas ficam na loja do MYP; o site mostra uma parte e manda pra lá */
const SETA_FORA = '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M8 7h9v9"/></svg>';
function mypFaixa(txt) { return `<div class="myp-strip"><p>${txt}</p><a class="btn btn-accent myp-btn" href="${LOJA.myp}" target="_blank" rel="noopener">Ver todas no MYP ${SETA_FORA}</a></div>`; }

/* ---------- utilidades ---------- */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (v) => (v == null || v === '' || isNaN(v)) ? 'Sob consulta' : Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const waLink = (msg) => 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(msg);
const DIAS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const DIAS_LONGO = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const CATEGORIAS_LACRADO = ['Booster box', 'Booster', 'Box', 'Double Pack', 'Deck pronto', 'Acessório', 'Jogo de tabuleiro', 'Pra jogar na loja', 'Colecionável'];
/* jogo que fica na loja pra jogar na mesa: não entra no pedido, vira conversa no WhatsApp */
const MESA = 'Pra jogar na loja';
const naMesa = (p) => p && p.categoria === MESA;
const msgMesa = (p) => 'Oi, Arena Prime! Quero jogar o ' + p.nome + ' aí na loja. Quando tem mesa livre?';
const msgInfo = (p) => 'Oi, Arena Prime! Queria saber mais sobre o ' + p.nome + ': como funciona pra jogar aí na loja?';
const CONDICOES = ['NM · Near Mint', 'SP · Slightly Played', 'MP · Moderately Played', 'HP · Heavily Played', 'D · Danificada'];
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
};
function toast(msg) {
  let t = $('#toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite'); document.body.appendChild(t); }
  t.textContent = msg; t.hidden = false;
  clearTimeout(toast._t); toast._t = setTimeout(() => { t.hidden = true; }, 2600);
}
function podeEnviar(chave, segundos = 60) {
  const t = store.get('arena_envio_' + chave, 0);
  if (Date.now() - t < segundos * 1000) return false;
  store.set('arena_envio_' + chave, Date.now()); return true;
}
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/* ---------- banco ---------- */
const DEMO = !SUPABASE_URL;
const DEMO_KEY = 'arena_demo_v1';
function seed() {
  const now = Date.now(), h = 3600e3;
  return {
    jogos: [
      { id: 'onepiece', nome: 'One Piece', visivel: true, ordem: 1 },
      { id: 'pokemon', nome: 'Pokémon', visivel: true, ordem: 2 },
      { id: 'magic', nome: 'Magic', visivel: true, ordem: 3 },
      { id: 'board', nome: 'Board Games', visivel: true, ordem: 4 },
      { id: 'riftbound', nome: 'Riftbound', visivel: false, ordem: 5 }
    ],
    produtos: [
      { id: 'p1', jogo: 'onepiece', tipo: 'lacrado', categoria: 'Booster box', nome: 'Booster box EB-05 Heroines Edition vol.2', colecao: 'EB-05', preco: null, estoque: 3, imagem: 'assets/img/eb05.webp', recorte: true, destaque: true, criado_em: now - 1 * h },
      { id: 'p2', jogo: 'onepiece', tipo: 'lacrado', categoria: 'Booster', nome: 'Booster [coleção]', colecao: '', preco: null, estoque: 3, imagem: '', destaque: false, criado_em: now - 2 * h },
      { id: 'p3', jogo: 'onepiece', tipo: 'lacrado', categoria: 'Double Pack', nome: 'Double Pack [coleção]', colecao: '', preco: null, estoque: 3, imagem: '', destaque: false, criado_em: now - 3 * h },
      { id: 'p4', jogo: 'pokemon', tipo: 'lacrado', categoria: 'Box', nome: 'Box [coleção]', colecao: '', preco: null, estoque: 3, imagem: '', destaque: true, criado_em: now - 4 * h },
      { id: 'p5', jogo: 'pokemon', tipo: 'lacrado', categoria: 'Booster', nome: 'Booster [coleção]', colecao: '', preco: null, estoque: 3, imagem: '', destaque: false, criado_em: now - 5 * h },
      { id: 'p6', jogo: 'magic', tipo: 'lacrado', categoria: 'Booster', nome: 'Booster [coleção]', colecao: '', preco: null, estoque: 3, imagem: '', destaque: false, criado_em: now - 6 * h },
      { id: 'p7', jogo: 'board', tipo: 'lacrado', categoria: 'Jogo de tabuleiro', nome: '[nome do jogo]', colecao: '', preco: null, estoque: 3, imagem: '', destaque: false, criado_em: now - 7 * h },
      { id: 'c1', jogo: 'pokemon', tipo: 'carta', categoria: 'Carta', nome: 'Abra', colecao: 'Base', numero: '43', raridade: 'Common', condicao: 'NM · Near Mint', idioma: 'EN', preco: 10, estoque: 5, imagem: 'assets/img/abra.webp', destaque: false, criado_em: now - 8 * h },
      { id: 'c2', jogo: 'onepiece', tipo: 'carta', categoria: 'Carta', nome: 'Alvida', colecao: 'Romance Dawn · OP01', numero: '', raridade: '', condicao: 'NM · Near Mint', idioma: 'EN', preco: null, estoque: 1, imagem: 'assets/img/alvida.webp', destaque: false, criado_em: now - 9 * h },
      { id: 'c3', jogo: 'pokemon', tipo: 'carta', categoria: 'Carta', nome: 'Alakazam', colecao: 'Base', numero: '1', raridade: 'Rare Holo', condicao: 'NM · Near Mint', idioma: 'EN', preco: null, estoque: 6, imagem: 'assets/img/alakazam.webp', destaque: false, criado_em: now - 10 * h },
      { id: 'c4', jogo: 'pokemon', tipo: 'carta', categoria: 'Carta', nome: 'Arcanine', colecao: 'Base', numero: '23', raridade: 'Uncommon', condicao: 'NM · Near Mint', idioma: 'EN', preco: null, estoque: 8, imagem: 'assets/img/arcanine.webp', destaque: false, criado_em: now - 11 * h }
    ],
    eventos: [
      { id: 'e1', dia: 6, titulo: 'Liga de One Piece', horario: 'a partir das 14h30', confirmado: true, ativo: true },
      { id: 'e2', dia: 0, titulo: 'Dia de troca', horario: 'horário a definir', confirmado: false, ativo: true },
      { id: 'e3', dia: 1, titulo: 'Game of Thrones ou RPG', horario: 'à noite', confirmado: false, ativo: true },
      { id: 'e4', dia: 2, titulo: 'Mesão de Magic', horario: 'à noite', confirmado: false, ativo: true }
    ],
    desejos: []
  };
}
const demoDb = () => { let d = store.get(DEMO_KEY, null); if (!d) { d = seed(); store.set(DEMO_KEY, d); } d.matriculas = d.matriculas || []; d.historico = d.historico || []; d.fornecedores = d.fornecedores || []; d.compras = d.compras || []; return d; };
const demoSave = (d) => store.set(DEMO_KEY, d);
const ROTULOS = { estoque: 'estoque', preco: 'preço', nome: 'nome', destaque: 'destaque', imagem: 'foto', colecao: 'coleção', condicao: 'condição', idioma: 'idioma', categoria: 'tipo', jogo: 'jogo', titulo: 'título', horario: 'horário', dia: 'dia', confirmado: 'confirmado', ativo: 'aparece no site', visivel: 'aparece no site', ordem: 'ordem', status: 'situação' };
function demoLog(db, acao, tabela, antes, depois) {
  const s = store.get('arena_demo_sessao', {}) || {}, email = s.email || 'demo';
  let det = '';
  if (acao === 'alterou') {
    det = Object.keys(depois).filter((k) => k !== 'id' && k !== 'criado_em' && JSON.stringify(depois[k]) !== JSON.stringify(antes[k]))
      .map((k) => (ROTULOS[k] || k) + ': ' + (k === 'imagem' ? 'trocada' : (antes[k] ?? 'vazio') + ' → ' + (depois[k] ?? 'vazio'))).join(' · ');
    if (!det) return;
  }
  const it = depois || antes;
  (db.historico = db.historico || []).unshift({ id: uid(), quando: Date.now(), email, nome: email.split('@')[0].replace(/^./, (c) => c.toUpperCase()), acao, tabela, registro: it.id, item: it.nome || it.titulo || it.carta || it.aluno || '', detalhes: det, antes: antes });
  db.historico = db.historico.slice(0, 300);
}

let _sb = null;
async function sb() {
  if (_sb) return _sb;
  if (!window.supabase) await new Promise((ok, fail) => { const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js'; s.onload = ok; s.onerror = () => fail(new Error('Não carregou o banco')); document.head.appendChild(s); });
  _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  return _sb;
}
const must = ({ data, error }) => { if (error) throw error; return data; };

const DB = {
  async jogos({ todos = false } = {}) {
    if (DEMO) return demoDb().jogos.filter((j) => todos || j.visivel).sort((a, b) => a.ordem - b.ordem);
    let q = (await sb()).from('jogos').select('*').order('ordem');
    if (!todos) q = q.eq('visivel', true);
    return must(await q);
  },
  async produtos({ jogo, tipo, busca, ordem = 'novos', comEstoque = true } = {}) {
    let list;
    if (DEMO) list = demoDb().produtos.slice();
    else {
      let q = (await sb()).from('produtos').select('*');
      if (jogo) q = q.eq('jogo', jogo);
      if (tipo) q = q.eq('tipo', tipo);
      list = must(await q);
    }
    if (jogo) list = list.filter((p) => p.jogo === jogo);
    if (tipo) list = list.filter((p) => p.tipo === tipo);
    if (comEstoque) list = list.filter((p) => (p.estoque ?? 0) > 0);
    if (busca) { const b = busca.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); list = list.filter((p) => (p.nome + ' ' + (p.colecao || '') + ' ' + (p.categoria || '')).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(b)); }
    const dt = (p) => new Date(p.criado_em).getTime();
    if (ordem === 'novos') list.sort((a, b) => (b.destaque - a.destaque) || ((b.imagem ? 1 : 0) - (a.imagem ? 1 : 0)) || (dt(b) - dt(a)));
    if (ordem === 'menor') list.sort((a, b) => (a.preco ?? 1e9) - (b.preco ?? 1e9));
    if (ordem === 'maior') list.sort((a, b) => (b.preco ?? -1) - (a.preco ?? -1));
    if (ordem === 'nome') list.sort((a, b) => a.nome.localeCompare(b.nome, 'pt'));
    return list;
  },
  async produto(id) {
    if (DEMO) return demoDb().produtos.find((p) => p.id === id) || null;
    return must(await (await sb()).from('produtos').select('*').eq('id', id).maybeSingle());
  },
  async eventos({ todos = false } = {}) {
    let list = DEMO ? demoDb().eventos.slice() : must(await (await sb()).from('eventos').select('*'));
    if (!todos) list = list.filter((e) => e.ativo);
    const hoje = new Date().getDay();
    return list.sort((a, b) => ((a.dia - hoje + 7) % 7) - ((b.dia - hoje + 7) % 7));
  },
  async novoDesejo(d) {
    const row = { carta: d.carta, versao: d.versao || '', nome: d.nome, contato: d.contato || '', status: 'novo' };
    if (DEMO) { const db = demoDb(); db.desejos.unshift({ id: uid(), criado_em: Date.now(), ...row }); demoSave(db); return; }
    must(await (await sb()).from('desejos').insert(row));
  },
  /* ---- painel ---- */
  async login(email, senha) {
    if (DEMO) { store.set('arena_demo_sessao', { email }); return { email }; }
    const r = await (await sb()).auth.signInWithPassword({ email, password: senha });
    if (r.error) throw r.error; return r.data.user;
  },
  async sessao() {
    if (DEMO) return store.get('arena_demo_sessao', null);
    const r = await (await sb()).auth.getSession(); return r.data.session ? r.data.session.user : null;
  },
  async sair() { if (DEMO) { localStorage.removeItem('arena_demo_sessao'); return; } await (await sb()).auth.signOut(); },
  async salvar(tabela, row) {
    if (DEMO) {
      const db = demoDb(), list = db[tabela];
      const i = row.id ? list.findIndex((x) => x.id === row.id) : -1, antes = i >= 0 ? { ...list[i] } : null;
      if (i >= 0) list[i] = { ...list[i], ...row };
      else { if (!row.id) row.id = uid(); if (tabela === 'produtos' && !row.criado_em) row.criado_em = Date.now(); list.unshift(row); }
      demoLog(db, antes ? 'alterou' : 'criou', tabela, antes, i >= 0 ? list[i] : row);
      if (!demoSave(db)) throw new Error('Sem espaço no navegador para salvar (foto muito grande?)');
      return row;
    }
    const c = await sb();
    if (tabela === 'jogos') return must(await c.from(tabela).upsert(row).select().single());
    if (row.id) {
      const upd = must(await c.from(tabela).update(row).eq('id', row.id).select());
      if (upd.length) return upd[0];
      return must(await c.from(tabela).insert(row).select().single());
    }
    const { id, ...novo } = row; return must(await c.from(tabela).insert(novo).select().single());
  },
  async apagar(tabela, id) {
    if (DEMO) { const db = demoDb(), antes = db[tabela].find((x) => x.id === id); db[tabela] = db[tabela].filter((x) => x.id !== id); if (antes) demoLog(db, 'apagou', tabela, antes, null); demoSave(db); return; }
    must(await (await sb()).from(tabela).delete().eq('id', id));
  },
  async lista(tabela, ordem) {
    if (DEMO) { const l = (demoDb()[tabela] || []).slice(); return ordem === 'nome' ? l.sort((a, b) => String(a.nome).localeCompare(b.nome)) : l.sort((a, b) => String(b[ordem] || '').localeCompare(String(a[ordem] || ''))); }
    return must(await (await sb()).from(tabela).select('*').order(ordem, { ascending: ordem === 'nome' }));
  },
  async desejos() {
    if (DEMO) return demoDb().desejos;
    return must(await (await sb()).from('desejos').select('*').order('criado_em', { ascending: false }));
  },
  async novaMatricula(m) {
    const row = { aluno: m.aluno, idade: m.idade || null, responsavel: m.responsavel, whatsapp: m.whatsapp, jogo: m.jogo || 'pokemon', obs: m.obs || '', status: 'pendente' };
    if (DEMO) { const db = demoDb(); db.matriculas.unshift({ id: uid(), criado_em: Date.now(), inicio: null, ...row }); demoSave(db); return; }
    must(await (await sb()).from('matriculas').insert(row));
  },
  async matriculas() {
    if (DEMO) return demoDb().matriculas;
    return must(await (await sb()).from('matriculas').select('*').order('criado_em', { ascending: false }));
  },
  async eu() {
    const u = await DB.sessao(); if (!u) return null;
    if (DEMO) return { email: u.email, nome: (u.email || '').split('@')[0].replace(/^./, (c) => c.toUpperCase()) };
    return must(await (await sb()).from('equipe').select('*').ilike('email', u.email).maybeSingle());
  },
  async equipe() {
    if (DEMO) { const h = demoDb().historico || []; const m = {}; h.forEach((x) => { m[x.email] = x.nome; }); return Object.keys(m).map((e) => ({ email: e, nome: m[e] })); }
    return must(await (await sb()).from('equipe').select('*').order('nome'));
  },
  async historico({ email, limite = 200 } = {}) {
    if (DEMO) { let h = (demoDb().historico || []).slice(); if (email) h = h.filter((x) => x.email === email); return h.slice(0, limite); }
    let q = (await sb()).from('historico').select('*').order('quando', { ascending: false }).limit(limite);
    if (email) q = q.eq('email', email);
    return must(await q);
  },
  async restaurar(h) {
    if (!h.antes) throw new Error('Esse registro não guardou cópia pra restaurar');
    return DB.salvar(h.tabela, { ...h.antes });
  },
  async enviarFoto(file, opcoes = {}) {
    const img = await shrinkImage(file, DEMO ? 700 : 1400, opcoes);
    const info = { recorte: img.transparente, fundoBranco: img.fundoBranco, fundoTirado: img.fundoTirado };
    if (DEMO) return { url: img.dataUrl, ...info };
    const c = await sb(), path = 'produtos/' + uid() + '.webp';
    must(await c.storage.from('fotos').upload(path, img.blob, { contentType: 'image/webp', upsert: false }));
    return { url: c.storage.from('fotos').getPublicUrl(path).data.publicUrl, ...info };
  }
};

// Imagem oficial em PNG sem fundo: os cantos são transparentes. Serve pra marcar "recortada" sozinho.
function cantosTransparentes(ctx, w, h) {
  try {
    const pts = [[1, 1], [w - 2, 1], [1, h - 2], [w - 2, h - 2]];
    return pts.filter(([x, y]) => ctx.getImageData(x, y, 1, 1).data[3] < 20).length >= 3;
  } catch (e) { return null; }
}

// Fundo branco liso (foto de distribuidora): se a borda inteira é quase branca, apaga o branco que
// encosta na borda (sem furar o branco de dentro do produto) e suaviza o contorno.
function bordaBranca(d, w, h) {
  let tot = 0, br = 0; const passo = Math.max(1, Math.floor((w + h) / 400));
  const ok = (i) => { const r = d[i], g = d[i + 1], b = d[i + 2]; return d[i + 3] > 200 && r > 232 && g > 232 && b > 232 && Math.max(r, g, b) - Math.min(r, g, b) < 18; };
  for (let x = 0; x < w; x += passo) { tot += 2; if (ok(x * 4)) br++; if (ok(((h - 1) * w + x) * 4)) br++; }
  for (let y = 0; y < h; y += passo) { tot += 2; if (ok(y * w * 4)) br++; if (ok((y * w + w - 1) * 4)) br++; }
  return br / tot >= 0.9;
}
function tirarFundoBranco(ctx, w, h) {
  const img = ctx.getImageData(0, 0, w, h), d = img.data, n = w * h;
  const claro = (p) => { const i = p * 4, r = d[i], g = d[i + 1], b = d[i + 2]; return r > 226 && g > 226 && b > 226 && Math.max(r, g, b) - Math.min(r, g, b) < 24; };
  const fora = new Uint8Array(n), pilha = new Int32Array(n); let top = 0;
  const pusha = (p) => { if (!fora[p] && claro(p)) { fora[p] = 1; pilha[top++] = p; } };
  for (let x = 0; x < w; x++) { pusha(x); pusha((h - 1) * w + x); }
  for (let y = 0; y < h; y++) { pusha(y * w); pusha(y * w + w - 1); }
  while (top) { const p = pilha[--top], x = p % w; if (x > 0) pusha(p - 1); if (x < w - 1) pusha(p + 1); if (p >= w) pusha(p - w); if (p < n - w) pusha(p + w); }
  for (let p = 0; p < n; p++) {
    if (fora[p]) { d[p * 4 + 3] = 0; continue; }
    const x = p % w; const viz = (x > 0 && fora[p - 1]) || (x < w - 1 && fora[p + 1]) || (p >= w && fora[p - w]) || (p < n - w && fora[p + w]);
    if (viz) { const i = p * 4, m = Math.min(d[i], d[i + 1], d[i + 2]); if (m > 190) d[i + 3] = Math.round(Math.min(1, (255 - m) / 65) * 255); }
  }
  // pedaços soltos e pequenos (selo, bandeirinha, marca d'água no canto) somem; o produto fica
  const grupo = new Int32Array(n).fill(-1), tam = []; let g = 0;
  for (let p0 = 0; p0 < n; p0++) {
    if (grupo[p0] !== -1 || d[p0 * 4 + 3] <= 12) continue;
    let t = 0; top = 0; pilha[top++] = p0; grupo[p0] = g;
    while (top) { const p = pilha[--top], x = p % w; t++;
      const viz4 = [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, p >= w ? p - w : -1, p < n - w ? p + w : -1];
      for (const q of viz4) if (q >= 0 && grupo[q] === -1 && d[q * 4 + 3] > 12) { grupo[q] = g; pilha[top++] = q; } }
    tam.push(t); g++;
  }
  if (tam.length > 1) { const maior = Math.max(...tam); for (let p = 0; p < n; p++) { const k = grupo[p]; if (k >= 0 && tam[k] < maior * 0.15) d[p * 4 + 3] = 0; } }
  ctx.putImageData(img, 0, 0);
}

// tirarFundo: 'auto' (só tira se a borda toda for branca), true (força) ou false (não mexe)
function shrinkImage(file, max, { tirarFundo = 'auto' } = {}) {
  return new Promise((ok, fail) => {
    const r = new FileReader();
    r.onerror = () => fail(new Error('Não consegui ler a foto'));
    r.onload = () => {
      const im = new Image();
      im.onerror = () => fail(new Error('Esse arquivo não parece ser uma foto'));
      im.onload = () => {
        // 1) lê a imagem inteira (até 2400px)
        const s0 = Math.min(1, 2400 / Math.max(im.width, im.height));
        const c0 = document.createElement('canvas'); c0.width = Math.round(im.width * s0); c0.height = Math.round(im.height * s0);
        const x0 = c0.getContext('2d', { willReadFrequently: true }); x0.drawImage(im, 0, 0, c0.width, c0.height);
        let transparente = cantosTransparentes(x0, c0.width, c0.height), fundoBranco = false, fundoTirado = false;
        // 2) fundo branco liso vira recorte
        if (!transparente && tirarFundo !== false) {
          try {
            fundoBranco = bordaBranca(x0.getImageData(0, 0, c0.width, c0.height).data, c0.width, c0.height);
            if (fundoBranco || tirarFundo === true) { tirarFundoBranco(x0, c0.width, c0.height); transparente = true; fundoTirado = true; }
          } catch (e) { /* sem permissão de ler os pixels: segue sem mexer */ }
        } else if (!transparente) {
          try { fundoBranco = bordaBranca(x0.getImageData(0, 0, c0.width, c0.height).data, c0.width, c0.height); } catch (e) {}
        }
        let sx = 0, sy = 0, sw = c0.width, sh = c0.height;
        if (transparente) {
          // 3) corta a margem vazia pra o produto ocupar a placa inteira
          try {
            const d = x0.getImageData(0, 0, c0.width, c0.height).data; let x1 = c0.width, y1 = c0.height, x2 = -1, y2 = -1;
            for (let y = 0; y < c0.height; y++) for (let x = 0; x < c0.width; x++) if (d[(y * c0.width + x) * 4 + 3] > 12) { if (x < x1) x1 = x; if (x > x2) x2 = x; if (y < y1) y1 = y; if (y > y2) y2 = y; }
            if (x2 > x1 && y2 > y1) { const pad = Math.round(Math.max(x2 - x1, y2 - y1) * 0.03); sx = Math.max(0, x1 - pad); sy = Math.max(0, y1 - pad); sw = Math.min(c0.width, x2 + pad + 1) - sx; sh = Math.min(c0.height, y2 + pad + 1) - sy; }
          } catch (e) { /* segue sem cortar */ }
        }
        // 4) reduz pro tamanho final
        const s = Math.min(1, max / Math.max(sw, sh));
        const cv = document.createElement('canvas'); cv.width = Math.round(sw * s); cv.height = Math.round(sh * s);
        const ctx = cv.getContext('2d'); ctx.drawImage(c0, sx, sy, sw, sh, 0, 0, cv.width, cv.height);
        const dataUrl = cv.toDataURL('image/webp', 0.85);
        cv.toBlob((blob) => ok({ dataUrl, blob, transparente, fundoBranco, fundoTirado }), 'image/webp', 0.85);
      };
      im.src = r.result;
    };
    r.readAsDataURL(file);
  });
}

/* ---------- mídia do produto ---------- */
const SHAPE = { 'Booster box': 'box', 'Booster': 'pack', 'Box': 'etb', 'Double Pack': 'etb', 'Deck pronto': 'etb', 'Acessório': 'etb', 'Jogo de tabuleiro': 'etb', 'Pra jogar na loja': 'etb', 'Colecionável': 'etb', 'Carta': 'card' };
function media(p, { alt = true } = {}) {
  if (p.imagem) return `<img class="${p.recorte ? 'cut' : 'photo'}" src="${esc(p.imagem)}" alt="${alt ? esc(p.nome + (p.colecao ? ', ' + p.colecao : '')) : ''}" loading="lazy" decoding="async">`;
  const s = SHAPE[p.categoria] || (p.tipo === 'carta' ? 'card' : 'etb');
  return `<span class="ph ph-${s}" role="img" aria-label="Foto pendente: ${esc(p.nome)}"><b>${esc((p.categoria || '').toUpperCase())}</b><i>Foto em breve</i></span>`;
}
let _jogosNome = {};
async function nomesJogos() { if (!Object.keys(_jogosNome).length) (await DB.jogos({ todos: true })).forEach((j) => { _jogosNome[j.id] = j.nome; }); return _jogosNome; }
function tagLine(p) {
  const jogo = (_jogosNome[p.jogo] || '').toUpperCase();
  if (p.tipo === 'carta') return [jogo, p.colecao, (p.condicao || '').split(' ·')[0]].filter(Boolean).join(' · ');
  return [jogo, (p.categoria || '').toUpperCase()].filter(Boolean).join(' · ');
}
function itemHTML(p, li) {
  const url = 'produto.html?id=' + encodeURIComponent(p.id);
  const mesa = naMesa(p);
  const sem = !mesa && (p.estoque ?? 0) <= 0;
  return `<article class="item${p.tipo === 'carta' ? ' is-card' : ''}"${li ? ' role="listitem"' : ''}>
    <a class="stage" href="${url}" tabindex="-1" aria-hidden="true">${media(p, { alt: false })}${sem || mesa ? '' : `<span class="qty-badge">${p.estoque} unid.</span>`}</a>
    <p class="tag">${esc(tagLine(p))}</p>
    <h4><a href="${url}">${esc(p.nome)}</a></h4>
    ${p.estoque === 1 && !mesa ? '<p class="stock-low">Última unidade</p>' : ''}
    <div class="item-foot"><span class="price">${mesa ? 'Na mesa da loja' : p.preco == null ? 'Sob consulta' : money(p.preco)}</span>
      ${mesa ? `<a class="add" href="${waLink(msgMesa(p))}" target="_blank" rel="noopener" aria-label="Quero jogar ${esc(p.nome)} na loja">Quero jogar</a>` : `<button type="button" class="add" data-add="${esc(p.id)}" ${sem ? 'disabled' : ''} aria-label="Colocar ${esc(p.nome)} no pedido">${sem ? 'Esgotado' : '+ Pedido'}</button>`}</div>
  </article>`;
}

/* ---------- carrinho ---------- */
const CART_KEY = 'arena_pedido_v1';
const Cart = {
  get() { return store.get(CART_KEY, []); },
  set(c) { store.set(CART_KEY, c); Cart.render(); },
  add(p, qtd = 1) {
    const c = Cart.get(), it = c.find((x) => x.id === p.id), max = p.estoque ?? 99;
    if (it) it.qtd = Math.min(max, it.qtd + qtd);
    else c.push({ id: p.id, nome: p.nome, preco: p.preco, imagem: p.imagem || '', categoria: p.categoria, tipo: p.tipo, info: tagLine(p), qtd: Math.min(max, qtd), max });
    Cart.set(c); toast(p.nome + ' foi pro pedido');
  },
  count() { return Cart.get().reduce((s, x) => s + x.qtd, 0); },
  render() { $$('[data-cart-count]').forEach((el) => { el.textContent = Cart.count(); }); if ($('#drawer') && !$('#drawer').hidden) drawBody(); }
};
document.addEventListener('click', async (e) => {
  const b = e.target.closest('[data-add]');
  if (!b) return;
  const p = await DB.produto(b.dataset.add);
  if (p) Cart.add(p);
});

/* ---------- gaveta do pedido ---------- */
let _lastFocus = null;
function openDrawer() {
  if (!$('#drawer')) {
    document.body.insertAdjacentHTML('beforeend', `
      <div class="drawer-bg" id="drawer-bg" hidden></div>
      <aside class="drawer light" id="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-t" hidden>
        <header><h2 id="drawer-t">Seu pedido</h2><button type="button" class="icon-btn" style="background:rgba(20,15,31,.08);color:inherit" id="drawer-x" aria-label="Fechar pedido"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button></header>
        <div class="body" id="drawer-body"></div>
        <footer id="drawer-foot"></footer>
      </aside>`);
    $('#drawer-x').onclick = closeDrawer; $('#drawer-bg').onclick = closeDrawer;
    $('#drawer').addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDrawer();
      if (e.key === 'Tab') { const f = $$('button,a,input', $('#drawer')).filter((x) => !x.disabled); if (!f.length) return; const a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
    });
    $('#drawer').addEventListener('click', (e) => {
      const b = e.target.closest('[data-q]'); if (!b) return;
      const c = Cart.get(), it = c.find((x) => x.id === b.dataset.id); if (!it) return;
      it.qtd += Number(b.dataset.q); if (it.qtd > it.max) it.qtd = it.max;
      Cart.set(it.qtd <= 0 ? c.filter((x) => x !== it) : c);
    });
  }
  _lastFocus = document.activeElement;
  $('#drawer').hidden = false; $('#drawer-bg').hidden = false; document.body.style.overflow = 'hidden';
  _avisos = []; refreshDrawer(); $('#drawer-x').focus();
}
function closeDrawer() { $('#drawer').hidden = true; $('#drawer-bg').hidden = true; document.body.style.overflow = ''; if (_lastFocus) _lastFocus.focus(); }
/* confere o pedido com o banco: preço, nome, foto e estoque do momento */
async function syncCart() {
  const c = Cart.get(), avisos = [], novo = [];
  for (const x of c) {
    let p = null; try { p = await DB.produto(x.id); } catch (e) { novo.push(x); continue; }
    if (!p) { avisos.push(x.nome + ' saiu da loja e foi tirado do pedido.'); continue; }
    const est = p.estoque ?? 0;
    if (est <= 0) { avisos.push(p.nome + ' esgotou e foi tirado do pedido.'); continue; }
    const it = { ...x, nome: p.nome, preco: p.preco, imagem: p.imagem || '', categoria: p.categoria, tipo: p.tipo, info: tagLine(p), max: est };
    if ((x.preco ?? null) !== (p.preco ?? null)) avisos.push(p.nome + ': o preço mudou de ' + money(x.preco) + ' pra ' + money(p.preco) + '.');
    if (it.qtd > est) { avisos.push(p.nome + ': só tem ' + est + (est === 1 ? ' unidade' : ' unidades') + ', a quantidade foi ajustada.'); it.qtd = est; }
    novo.push(it);
  }
  store.set(CART_KEY, novo); $$('[data-cart-count]').forEach((el) => { el.textContent = Cart.count(); });
  return avisos;
}
let _avisos = [];
async function refreshDrawer() {
  $('#drawer-body').innerHTML = '<p class="empty">Conferindo preços e estoque…</p>'; $('#drawer-foot').innerHTML = '';
  await nomesJogos();
  _avisos = await syncCart();
  drawBody();
}
function drawBody() {
  const c = Cart.get(), body = $('#drawer-body'), foot = $('#drawer-foot');
  const av = _avisos.length ? `<div class="avisos" role="alert"><b>Seu pedido foi atualizado</b><ul>${_avisos.map((a) => `<li>${esc(a)}</li>`).join('')}</ul></div>` : '';
  if (!c.length) { body.innerHTML = av + '<p class="empty">Seu pedido está vazio. Escolhe uma carta ou um produto na loja.</p>'; foot.innerHTML = '<a class="btn btn-dark" href="loja.html">Ir pra loja</a>'; return; }
  body.innerHTML = av + c.map((x) => `<div class="line"><div class="thumb">${media(x, { alt: false })}</div>
    <div class="nm"><p><b>${esc(x.nome)}</b></p><p class="s">${esc(x.info)} · ${money(x.preco)}</p></div>
    <div class="mini-qty"><button type="button" data-q="-1" data-id="${esc(x.id)}" aria-label="Tirar um ${esc(x.nome)}">−</button><span aria-label="Quantidade">${x.qtd}</span><button type="button" data-q="1" data-id="${esc(x.id)}" aria-label="Mais um ${esc(x.nome)}" ${x.qtd >= x.max ? 'disabled' : ''}>+</button></div></div>`).join('');
  const semPreco = c.some((x) => x.preco == null), algumPreco = c.some((x) => x.preco != null);
  const total = c.reduce((s, x) => s + (x.preco || 0) * x.qtd, 0);
  foot.innerHTML = `${algumPreco ? `<div class="total"><span>${semPreco ? 'Total dos itens com preço' : 'Total'}</span><span>${money(total)}</span></div>` : ''}
    ${semPreco ? `<p class="note">${algumPreco ? 'Alguns itens' : 'Os itens'} estão com preço sob consulta. A loja confirma o valor no WhatsApp.</p>` : ''}
    <a class="btn btn-accent" id="send-order" href="${waLink(pedidoMsg(c))}" target="_blank" rel="noopener">Fechar pedido no WhatsApp</a>
    <p class="note">O pagamento e a retirada são combinados direto com a loja.</p>`;
  $('#send-order').addEventListener('click', async (e) => {
    if (e.currentTarget.dataset.ok) return;
    e.preventDefault();
    const win = window.open('', '_blank');
    const antes = JSON.stringify(Cart.get());
    _avisos = await syncCart();
    if (_avisos.length || JSON.stringify(Cart.get()) !== antes) { if (win) win.close(); drawBody(); $('#drawer-body').scrollTop = 0; return; }
    const url = waLink(pedidoMsg(Cart.get()));
    if (win) win.location = url; else location.href = url;
  });
}
function pedidoMsg(c) {
  const linhas = c.map((x) => `• ${x.qtd}x ${x.nome} (${x.info}) · ${money(x.preco)}`);
  const comPreco = c.filter((x) => x.preco != null), semPreco = c.length - comPreco.length;
  const total = comPreco.reduce((s, x) => s + x.preco * x.qtd, 0);
  let fim = '';
  if (!semPreco) fim = `Total: ${money(total)}`;
  else if (comPreco.length) fim = `Total dos itens com preço: ${money(total)}\nOs outros itens estão com preço sob consulta.`;
  else fim = 'Pode me passar o valor?';
  return `Oi, Arena Prime! Quero fazer esse pedido pelo site:\n\n${linhas.join('\n')}\n\n${fim}`;
}

/* ---------- cabeçalho e rodapé ---------- */
function header(atual) {
  const ic = (d) => `<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  return `<a class="skip" href="#conteudo">Pular para o conteúdo</a>
  <header class="top"><div class="wrap">
    <a class="logo" href="index.html"><img src="assets/logo-wordmark.svg" alt="Arena Prime, página inicial" width="160" height="40"></a>
    <nav class="nav" aria-label="Principal">
      <span class="nav-links">
        <a href="loja.html" ${atual === 'loja' ? 'aria-current="page"' : ''}>Loja</a>
        <a href="index.html#agenda">Agenda</a>
        <a href="index.html#escolinha">Escolinha</a>
        <a href="index.html#lista">Lista de desejos</a>
      </span>
      <a class="icon-btn" href="loja.html#busca" aria-label="Buscar carta ou produto">${ic('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>')}</a>
      <button type="button" class="btn btn-accent" id="open-cart">${ic('<path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2"/><circle cx="10" cy="20.5" r="1"/><circle cx="17" cy="20.5" r="1"/>')}Pedido <span class="cart-count" data-cart-count>0</span></button>
    </nav>
  </div></header>`;
}
function footer() {
  return `<footer class="foot"><div class="wrap">
    <img class="foot-logo" src="assets/logo-slogan.svg" alt="Arena Prime. Seu jogo em outro nível." width="200" height="187" loading="lazy">
    <span>${esc(LOJA.endereco)}</span><span>${esc(LOJA.horario)}</span>
    <a href="https://instagram.com/${LOJA.instagram}" target="_blank" rel="noopener">@${LOJA.instagram}</a>
    <a href="${LOJA.myp}" target="_blank" rel="noopener">Cartas avulsas no MYP</a>
    <span class="foot-cnpj">CNPJ ${esc(LOJA.cnpj)}</span>
  </div></footer>
  <a class="wa-float" href="${waLink('Oi, Arena Prime! Vim pelo site.')}" target="_blank" rel="noopener" aria-label="Falar com a loja no WhatsApp"><svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.1.7a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z"/></svg></a>`;
}
function mountChrome(atual) {
  $('#hdr').outerHTML = header(atual);
  $('#ftr').outerHTML = footer();
  $('#open-cart').addEventListener('click', openDrawer);
  Cart.render();
}
window.addEventListener('storage', (e) => { if (e.key === CART_KEY) Cart.render(); });
