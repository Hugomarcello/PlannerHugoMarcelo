/* =====================================================================
   Planner Hugo Marcelo · app.js  —  O COMPORTAMENTO de todo o sistema
   ---------------------------------------------------------------------
   Se o HTML é o esqueleto e o CSS é a roupa, este arquivo é o cérebro.
   Ele monta a sidebar, liga o tema, salva seus dados e cuida do backup.
   Escrito UMA vez aqui = funciona em TODAS as páginas. Esse é o pulo
   do gato da arquitetura que você escolheu.
   ===================================================================== */


/* =====================================================================
   1. O MAPA DO MENU
   ---------------------------------------------------------------------
   Toda a sidebar nasce DESTA lista. Quer adicionar uma página nova?
   Adicione uma linha aqui e ela aparece no menu de todas as páginas.
   Esse é o conceito DRY na prática: um lugar só pra mudar.

   Campos de cada item:
     id    -> nome curto único (precisa bater com o data-page do <body>)
     nome  -> o texto que aparece no menu
     icone -> classe do Font Awesome
     arquivo -> para qual .html o link aponta
   ===================================================================== */

const MENU = [
  {
    grupo: "Produtividade",
    itens: [
      { id: "index",        nome: "Visão Geral",       icone: "fa-gauge-high",     arquivo: "index.html" },
      { id: "objetivos",    nome: "Objetivos",         icone: "fa-bullseye",       arquivo: "objetivos.html" },
      { id: "tarefas",      nome: "Tarefas",           icone: "fa-list-check",     arquivo: "tarefas.html" },
      { id: "compromissos", nome: "Compromissos",      icone: "fa-calendar-check", arquivo: "compromissos.html" },
      { id: "anotacoes",    nome: "Anotações",         icone: "fa-pen-clip",       arquivo: "anotacoes.html" },
      { id: "planejadores", nome: "Planejadores",      icone: "fa-calendar-day",   arquivo: "planejadores.html" },
      { id: "habitos",      nome: "Rotinas e Hábitos", icone: "fa-rotate",         arquivo: "habitos.html" },
    ],
  },
  {
    grupo: "Áreas da Vida",
    itens: [
      { id: "autocuidado", nome: "Autocuidado",   icone: "fa-hand-holding-heart", arquivo: "autocuidado.html" },
      { id: "saude",       nome: "Saúde",         icone: "fa-heart-pulse",        arquivo: "saude.html" },
      { id: "estudos",     nome: "Estudos",       icone: "fa-book-open",          arquivo: "estudos.html" },
      { id: "garagem",     nome: "Moto/Garagem",  icone: "fa-motorcycle",         arquivo: "garagem.html" },
      { id: "casa",        nome: "Casa",          icone: "fa-house",              arquivo: "casa.html" },
      { id: "hobbies",     nome: "Hobbies e Lazer", icone: "fa-gamepad",          arquivo: "hobbies.html" },
      { id: "financeiro",  nome: "Financeiro",    icone: "fa-wallet",             arquivo: "financeiro.html" },
    ],
  },
  {
    grupo: "Área Profissional",
    itens: [
      { id: "pro",        nome: "Visão Geral Pro",   icone: "fa-briefcase",     arquivo: "pro.html" },
      { id: "alunos",     nome: "Central de Alunos", icone: "fa-children",      arquivo: "alunos.html" },
      { id: "turmas",     nome: "Aulas/Turmas",      icone: "fa-futbol",        arquivo: "turmas.html" },
      { id: "marketing",  nome: "Divulgação/Mkt",    icone: "fa-bullhorn",      arquivo: "marketing.html" },
      { id: "recreacoes", nome: "Recreações",        icone: "fa-flag",          arquivo: "recreacoes.html" },
      { id: "vendas",     nome: "Vendas OLX",        icone: "fa-tag",           arquivo: "vendas.html" },
      { id: "afiliados",  nome: "Mercado Afiliados", icone: "fa-share-nodes",   arquivo: "afiliados.html" },
    ],
  },
];

/* Atalhos que aparecem no rodapé de toda página */
const ATALHOS = [
  { nome: "Tarefas de Hoje",  icone: "fa-list-check",     arquivo: "tarefas.html" },
  { nome: "Compromissos",     icone: "fa-calendar-check", arquivo: "compromissos.html" },
  { nome: "Planejadores",     icone: "fa-calendar-day",   arquivo: "planejadores.html" },
  { nome: "Hábitos",          icone: "fa-rotate",         arquivo: "habitos.html" },
  { nome: "Anotações",        icone: "fa-pen-clip",       arquivo: "anotacoes.html" },
];


/* =====================================================================
   2. STORE  —  o "cofre" de dados (localStorage com nomes organizados)
   ---------------------------------------------------------------------
   localStorage guarda texto no navegador. Aqui criamos atalhos seguros
   pra ler e gravar, sempre com o prefixo "planner_" pra não bagunçar.
       Store.salvar("tarefas", [...])   // grava
       Store.ler("tarefas", [])         // lê (ou devolve o padrão)
   ===================================================================== */

const Store = {
  prefixo: "planner_",

  salvar(chave, valor) {
    localStorage.setItem(this.prefixo + chave, JSON.stringify(valor));
  },

  ler(chave, padrao = null) {
    const bruto = localStorage.getItem(this.prefixo + chave);
    if (bruto === null) return padrao;
    try { return JSON.parse(bruto); }
    catch { return padrao; }
  },

  apagar(chave) {
    localStorage.removeItem(this.prefixo + chave);
  },

  /* Quanto espaço o Planner está ocupando (aproximação em bytes).
     Útil pra avisar antes de estourar o limite de ~5MB do navegador. */
  usoEmBytes() {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const chave = localStorage.key(i);
      if (chave && chave.startsWith(this.prefixo)) {
        const valor = localStorage.getItem(chave) || "";
        total += valor.length + chave.length;
      }
    }
    return total;
  },
};


/* =====================================================================
   2.5 NOTAS  —  a camada de dados das Anotações (compartilhada!)
   ---------------------------------------------------------------------
   Aqui mora a "integração semipronta" que combinamos. Qualquer página
   do Planner pode jogar uma anotação na MESMA gaveta (planner_anotacoes)
   que a página Anotações lê. Um lugar só pra guardar nota = nada de
   informação repetida ou esquecida em bloquinhos soltos.

   Como usar isto em OUTRA página, no futuro (1 linha basta):

       Notas.criar({ titulo: "Trocar óleo", conteudo: "10W40", origem: "garagem" });

   A nota nasce já na página Anotações, com data, categoria e tudo.
   ===================================================================== */

const Notas = {
  CHAVE: "anotacoes",

  /* Categorias de fábrica. A "cor" é um NOME do nosso leque pastel
     (definido no CSS da página Anotações), não um código hexadecimal. */
  tagsPadrao: [
    { id: "t_geral",    nome: "Ideias",   cor: "verde"   },
    { id: "t_pessoal",  nome: "Pessoal",  cor: "azul"    },
    { id: "t_trabalho", nome: "Trabalho", cor: "laranja" },
    { id: "t_estudos",  nome: "Estudos",  cor: "roxo"    },
  ],

  /* Lê o banco inteiro e GARANTE um formato válido (à prova de bagunça). */
  lerTudo() {
    const bd = Store.ler(this.CHAVE, null);
    if (!bd || typeof bd !== "object") {
      return { notas: [], tags: this.tagsPadrao.map((t) => ({ ...t })) };
    }
    if (!Array.isArray(bd.notas)) bd.notas = [];
    if (!Array.isArray(bd.tags) || bd.tags.length === 0) {
      bd.tags = this.tagsPadrao.map((t) => ({ ...t }));
    }
    return bd;
  },

  gravarTudo(bd) {
    Store.salvar(this.CHAVE, bd);
  },

  /* O molde de uma nota nova — um lugar só define os campos padrão. */
  novaNota(extra = {}) {
    return Object.assign(
      {
        id: "nt_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        titulo: "",
        conteudo: "",
        tipo: "texto",   // "texto" ou "checklist"
        itens: [],        // [{ txt, feito }] — usado quando tipo === "checklist"
        tagId: null,
        cor: "padrao",   // cor de fundo pastel (padrao = sem cor)
        imagens: [],      // anexos leves (imagens em base64)
        data: Date.now(),
        arquivada: false,
        fixada: false,
        origem: "anotacoes", // de qual página a nota veio
      },
      extra
    );
  },

  /* Cria uma anotação rápida a partir de QUALQUER página. */
  criar({ titulo = "", conteudo = "", tagId = null, origem = "outras" } = {}) {
    const bd = this.lerTudo();
    const tagValida = bd.tags.some((t) => t.id === tagId) ? tagId : bd.tags[0].id;
    const nova = this.novaNota({
      titulo: String(titulo).trim(),
      conteudo: String(conteudo).trim(),
      tagId: tagValida,
      origem,
    });
    bd.notas.unshift(nova);
    this.gravarTudo(bd);
    return nova.id;
  },
};


/* =====================================================================
   3. TEMA  —  alternar claro/escuro e lembrar a escolha
   ===================================================================== */

const Tema = {
  aplicar(modo) {
    document.documentElement.setAttribute("data-theme", modo);
    Store.salvar("tema", modo);
    // Troca o ícone do botão (lua no escuro, sol no claro)
    const icone = document.querySelector("#btn-tema i");
    if (icone) icone.className = modo === "dark" ? "fa-solid fa-moon" : "fa-solid fa-sun";
  },

  alternar() {
    const atual = document.documentElement.getAttribute("data-theme");
    this.aplicar(atual === "dark" ? "light" : "dark");
  },

  iniciar() {
    // Usa o tema salvo; se nunca escolheu, começa no escuro
    this.aplicar(Store.ler("tema", "dark"));
  },
};


/* =====================================================================
   4. SIDEBAR  —  monta o menu a partir do MAPA e marca o item atual
   ===================================================================== */

function montarSidebar() {
  const container = document.getElementById("sidebar-container");
  if (!container) return;

  // Qual página estou? Lemos o atributo data-page do <body>.
  const paginaAtual = document.body.dataset.page || "index";

  // Monta os grupos e links percorrendo o MAPA
  let navHTML = "";
  MENU.forEach((bloco) => {
    navHTML += `<p class="sidebar__group-label">${bloco.grupo}</p>`;
    bloco.itens.forEach((item) => {
      const ativo = item.id === paginaAtual ? "is-active" : "";
      navHTML += `
        <a href="${item.arquivo}" class="sidebar__link ${ativo}" title="${item.nome}">
          <i class="fa-solid ${item.icone}"></i>
          <span>${item.nome}</span>
        </a>`;
    });
  });

  container.innerHTML = `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar__brand">
        <div class="sidebar__logo"><i class="fa-solid fa-bolt"></i></div>
        <div>
          <p class="sidebar__title">Planner</p>
          <p class="sidebar__subtitle">Hugo Marcelo</p>
        </div>
      </div>
      <nav class="sidebar__nav">${navHTML}</nav>
      <button class="sidebar__toggle" onclick="alternarSidebar()" title="Recolher / expandir" aria-label="Recolher ou expandir o menu">
        <i class="fa-solid fa-angles-left"></i>
      </button>
    </aside>`;

  // Contador de tarefas pendentes — badge verde ao lado de "Tarefas" no menu.
  // Lê direto do Store sem precisar que a página de Tarefas esteja aberta,
  // então o número aparece em QUALQUER página do planner.
  try {
    const tarefas = Store.ler("tarefas", []);
    const pendentes = tarefas.filter(t => !t.concluida).length;
    if (pendentes > 0) {
      const linkTarefas = container.querySelector('a[href="tarefas.html"]');
      if (linkTarefas) {
        const badge = document.createElement("span");
        badge.textContent = pendentes > 99 ? "99+" : String(pendentes);
        badge.style.cssText = "margin-left:auto;background:var(--accent);color:#fff;" +
          "font-size:9px;font-weight:800;border-radius:99px;padding:2px 7px;flex-shrink:0;";
        linkTarefas.appendChild(badge);
      }
    }
  } catch(e) { /* silencia se os dados ainda não existirem */ }
}


/* =====================================================================
   4.5 RECOLHER SIDEBAR  —  expandir/recolher a barra no desktop
   ---------------------------------------------------------------------
   No computador, o botão encolhe a sidebar pra uma "trilha" só de ícones
   (e expande de volta). A escolha fica salva no Store, então a barra
   abre do jeito que você deixou da última vez. No celular isso não se
   aplica: lá a sidebar continua sendo a gaveta que desliza.
   ===================================================================== */

function aplicarSidebar(recolhida) {
  document.body.classList.toggle("sidebar-recolhida", recolhida);
  // Vira a setinha do botão pra apontar o sentido certo
  const icone = document.querySelector(".sidebar__toggle i");
  if (icone) icone.className = recolhida ? "fa-solid fa-angles-right" : "fa-solid fa-angles-left";
}

function alternarSidebar() {
  const nova = !document.body.classList.contains("sidebar-recolhida");
  aplicarSidebar(nova);
  Store.salvar("sidebar_recolhida", nova);
}


/* =====================================================================
   5. RODAPÉ  —  monta a barra de atalhos do fim da página
   ===================================================================== */

function montarRodape() {
  const container = document.getElementById("footer-container");
  if (!container) return;

  let html = "";
  ATALHOS.forEach((a) => {
    html += `<a href="${a.arquivo}" class="footer__shortcut"><i class="fa-solid ${a.icone}"></i> ${a.nome}</a>`;
  });

  container.innerHTML = `
    <footer class="footer">
      ${html}
      <p class="footer__credit">Planner Hugo Marcelo • Um dia de cada vez</p>
    </footer>`;
}


/* =====================================================================
   6. MENU MOBILE  —  abre/fecha a gaveta no celular
   ===================================================================== */

function abrirMenu() {
  document.getElementById("sidebar")?.classList.add("is-open");
  document.getElementById("overlay")?.classList.add("is-open");
}
function fecharMenu() {
  document.getElementById("sidebar")?.classList.remove("is-open");
  document.getElementById("overlay")?.classList.remove("is-open");
}


/* =====================================================================
   7. BACKUP  —  exportar e importar todos os dados como arquivo .json
   ---------------------------------------------------------------------
   Como você ainda não usa nuvem, este é o seu "cabo de transferência"
   entre celular e PC: exporta num lado, importa no outro.
   ===================================================================== */

function abrirSync()  { document.getElementById("modal-sync")?.classList.add("is-open"); }
function fecharSync() { document.getElementById("modal-sync")?.classList.remove("is-open"); }

function exportarBackup() {
  // Junta tudo que começa com "planner_" num único pacote
  const pacote = {};
  for (let i = 0; i < localStorage.length; i++) {
    const chave = localStorage.key(i);
    if (chave.startsWith("planner_")) pacote[chave] = localStorage.getItem(chave);
  }
  // Transforma em arquivo e dispara o download
  const blob = new Blob([JSON.stringify(pacote, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const data = new Date().toISOString().split("T")[0];
  link.href = url;
  link.download = `planner_backup_${data}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function importarBackup(evento) {
  const arquivo = evento.target.files[0];
  if (!arquivo) return;

  const leitor = new FileReader();
  leitor.onload = (e) => {
    try {
      const dados = JSON.parse(e.target.result);
      const valido = Object.keys(dados).some((k) => k.startsWith("planner_"));
      if (!valido) { alert("Esse arquivo não parece ser um backup do Planner Hugo Marcelo."); return; }

      if (!confirm("Isso vai SUBSTITUIR seus dados atuais pelo backup. Continuar?")) return;

      // Limpa os dados atuais do Planner e grava os do backup
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const chave = localStorage.key(i);
        if (chave.startsWith("planner_")) localStorage.removeItem(chave);
      }
      Object.keys(dados).forEach((k) => localStorage.setItem(k, dados[k]));

      alert("Backup restaurado com sucesso!");
      location.reload();
    } catch {
      alert("Não consegui ler esse arquivo. Ele pode estar corrompido.");
    }
  };
  leitor.readAsText(arquivo);
  evento.target.value = ""; // permite reimportar o mesmo arquivo depois
}


/* =====================================================================
   8. PARTIDA  —  liga tudo assim que a página termina de carregar
   ===================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  Tema.iniciar();
  montarSidebar();
  montarRodape();
  aplicarSidebar(Store.ler("sidebar_recolhida", false));
});