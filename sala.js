const URL_API = 'https://ensalamento-backend-8o7r.onrender.com/api/salas';

async function carregarSalas() {
  const container = document.getElementById('lista-salas');
  if (!container) return;

  try {
    const resposta = await fetch(URL_API);
    const dados = await resposta.json();

    if (dados.length === 0) {
      container.innerHTML = '<p>Nenhuma sala cadastrada de momento.</p>';
      return;
    }

    container.innerHTML = '';
    dados.forEach(sala => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <h3>${sala.nome || sala.codigo || 'Sala sem identificação'}</h3>
        <p><strong>Capacidade:</strong> ${sala.capacidade || 0} alunos</p>
      `;
      container.appendChild(card);
    });
  } catch (erro) {
    container.innerHTML = '<p style="color: red;">Erro ao ligar ao servidor.</p>';
    console.error(erro);
  }
}

// LÓGICA DE PREFERÊNCIA DO ALUNO (RF-05 E RF-06)
const selectTurma = document.getElementById('select-turma');
const btnSalvar = document.getElementById('btn-salvar-turma');

function carregarOpcoesTurmas() {
  const turmasExemplo = [
    { codigo: 'ES-3A', nome: 'Engenharia de Software - 3º Período' },
    { codigo: 'CC-1A', nome: 'Ciência da Computação - 1º Período' },
    { codigo: 'SI-2A', nome: 'Sistemas de Informação - 2º Período' }
  ];
  
  if (!selectTurma) return;
  selectTurma.innerHTML = '<option value="">-- Escolha uma turma --</option>';
  
  turmasExemplo.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.codigo;
    opt.textContent = `${t.codigo} - ${t.nome}`;
    selectTurma.appendChild(opt);
  });

  const turmaSalva = localStorage.getItem('turma_preferida');
  if (turmaSalva) {
    selectTurma.value = turmaSalva;
  }
}

if (btnSalvar) {
  btnSalvar.addEventListener('click', () => {
    const escolha = selectTurma.value;
    if (!escolha) {
      alert('Por favor, selecione uma turma!');
      return;
    }
    localStorage.setItem('turma_preferida', escolha);
    alert('Turma guardada com sucesso: ' + escolha);
    renderizarAgenda();
  });
}

// Dados simulados para desenvolvimento da interface (RF-35 a RF-39)[cite: 7]
const aulasExemplo = [
  {
    id: 1,
    turma: "ES-3A",
    disciplina: "Prática Profissional em Dev Web",
    professor: "Frank Alcantara",
    diaSemana: 1, // 1 = Segunda-feira
    inicio: "19:00",
    fim: "20:40",
    campus: "Campus Central",
    predio: "Bloco de Tecnologia",
    andar: "2º Andar",
    sala: "Lab 204",
    capacidade: 40,
    recursos: ["Projetor", "Ar-condicionado", "40 Computadores"],
    acessibilidade: "Elevador e portas adaptadas",
    alterada: true,
    dataAtualizacao: "28/09/2026"
  },
  {
    id: 2,
    turma: "ES-3A",
    disciplina: "Banco de Dados e Modelagem",
    professor: "Carlos Eduardo",
    diaSemana: 1, // Segunda-feira
    inicio: "20:50",
    fim: "22:30",
    campus: "Campus Central",
    predio: "Bloco de Tecnologia",
    andar: "1º Andar",
    sala: "Sala 102",
    capacidade: 50,
    recursos: ["Projetor", "Quadro branco"],
    acessibilidade: "Acesso em nível térreo",
    alterada: false,
    dataAtualizacao: "20/09/2026"
  },
  {
    id: 3,
    turma: "ES-3A",
    disciplina: "Engenharia de Requisitos",
    professor: "Mariana Souza",
    diaSemana: 2, // 2 = Terça-feira
    inicio: "19:00",
    fim: "22:30",
    campus: "Campus Central",
    predio: "Bloco A",
    andar: "3º Andar",
    sala: "Sala 305",
    capacidade: 45,
    recursos: ["Projetor interativo"],
    acessibilidade: "Elevador disponível",
    alterada: false,
    dataAtualizacao: "15/09/2026"
  }
];

let modoVisualizacao = "hoje"; // "hoje" ou "semana"[cite: 7]

// Função que calcula se a aula é atual ou a próxima (RF-35)[cite: 7]
function calcularStatusHorario(horaInicio, horaFim, diaAula) {
  const agora = new Date();
  const diaHoje = agora.getDay();

  if (diaHoje !== diaAula) return "";

  const [hIni, mIni] = horaInicio.split(":").map(Number);
  const [hFim, mFim] = horaFim.split(":").map(Number);

  const minAtual = agora.getHours() * 60 + agora.getMinutes();
  const minInicio = hIni * 60 + mIni;
  const minFim = hFim * 60 + mFim;

  if (minAtual >= minInicio && minAtual <= minFim) {
    return "tag-atual";
  } else if (minAtual < minInicio && minInicio - minAtual <= 60) {
    return "tag-proxima";
  }
  return "";
}

// Renderiza os cartões de aula (RF-35 e RF-37)[cite: 7]
function renderizarAgenda() {
  const container = document.getElementById("container-aulas");
  if (!container) return;

  const turmaSelecionada = localStorage.getItem("turma_preferida") || "ES-3A";
  const diaHoje = new Date().getDay();

  container.innerHTML = "";

  const aulasFiltradas = aulasExemplo.filter(aula => {
    if (aula.turma !== turmaSelecionada) return false;
    if (modoVisualizacao === "hoje") {
      return aula.diaSemana === diaHoje;
    }
    return true;
  });

  if (aulasFiltradas.length === 0) {
    container.innerHTML = `<p class="aviso-vazio">Nenhuma aula encontrada para o período selecionado.</p>`;
    return;
  }

  aulasFiltradas.forEach(aula => {
    const statusHorario = calcularStatusHorario(aula.inicio, aula.fim, aula.diaSemana);
    
    const card = document.createElement("article");
    card.className = `card-aula ${statusHorario}`;
    card.style.border = "1px solid #ccc";
    card.style.padding = "12px";
    card.style.margin = "8px 0";
    card.style.cursor = "pointer";

    card.innerHTML = `
      <div class="card-cabecalho">
        <strong>${aula.inicio} - ${aula.fim}</strong>
        ${aula.alterada ? `<span style="color: red; font-weight: bold;"> [Alterada]</span>` : ""}
        ${statusHorario === "tag-atual" ? `<span style="color: green; font-weight: bold;"> (Aula Atual)</span>` : ""}
        ${statusHorario === "tag-proxima" ? `<span style="color: blue; font-weight: bold;"> (Próxima Aula)</span>` : ""}
      </div>
      <h4>${aula.disciplina}</h4>
      <p>Prof. ${aula.professor}</p>
      <p><strong>${aula.sala}</strong> &bull; ${aula.predio} (${aula.andar})</p>
      <button class="btn-detalhes" type="button">Ver detalhes da sala</button>
    `;

    card.onclick = () => abrirDetalhesSala(aula);
    container.appendChild(card);
  });
}

// Exibe modal com detalhes físicos e acessibilidade (RF-38 e RF-39)[cite: 7]
function abrirDetalhesSala(aula) {
  const modal = document.getElementById("modal-sala");
  if (!modal) return;

  document.getElementById("modal-titulo-sala").textContent = `Detalhes: ${aula.sala}`;
  document.getElementById("modal-predio").textContent = `${aula.campus} - ${aula.predio}`;
  document.getElementById("modal-andar").textContent = aula.andar;
  document.getElementById("modal-capacidade").textContent = aula.capacidade;
  document.getElementById("modal-recursos").textContent = Array.isArray(aula.recursos) ? aula.recursos.join(", ") : aula.recursos;
  document.getElementById("modal-acessibilidade").textContent = aula.acessibilidade;

  modal.showModal();
}

// Inicialização de eventos da página
document.addEventListener("DOMContentLoaded", () => {
  carregarSalas();
  carregarOpcoesTurmas();

  const btnHoje = document.getElementById("btn-hoje");
  const btnSemana = document.getElementById("btn-semana");
  const btnFecharModal = document.getElementById("btn-fechar-modal");
  const modal = document.getElementById("modal-sala");

  if (btnHoje && btnSemana) {
    btnHoje.addEventListener("click", () => {
      modoVisualizacao = "hoje";
      btnHoje.classList.add("active");
      btnSemana.classList.remove("active");
      renderizarAgenda();
    });

    btnSemana.addEventListener("click", () => {
      modoVisualizacao = "semana";
      btnSemana.classList.add("active");
      btnHoje.classList.remove("active");
      renderizarAgenda();
    });
  }

  if (btnFecharModal && modal) {
    btnFecharModal.addEventListener("click", (e) => {
      e.stopPropagation();
      modal.close();
    });
  }

  renderizarAgenda();
});
// --- GESTÃO DE AUTENTICAÇÃO E PAPÉIS (RF-01 a RF-04, RF-36) ---

// Base de e-mails pré-cadastrados (Secções 6.4.1 e 6.4.4 do edital)
const usuariosCadastrados = {
  "frankalcantara@gmail.com": { nome: "Prof. Frank Alcantara", papel: "admin" },
  "professor@exemplo.com": { nome: "Prof. Carlos Eduardo", papel: "professor" }
};

function checarSessaoUsuario() {
  const usuarioLogado = JSON.parse(sessionStorage.getItem("usuario_autenticado"));
  const authBotoes = document.getElementById("auth-botoes");
  const authUsuario = document.getElementById("auth-usuario");
  const userInfo = document.getElementById("user-info");
  const seletorTurmaArea = document.getElementById("turma-selector-area");

  if (usuarioLogado) {
    if (authBotoes) authBotoes.style.display = "none";
    if (authUsuario) authUsuario.style.display = "block";
    if (userInfo) userInfo.textContent = `Olá, ${usuarioLogado.nome} (${usuarioLogado.papel.toUpperCase()})`;

    // Se for Professor ou Admin (avaliador), oculta escolha de turma do aluno (RF-04 e RF-36)
    if (usuarioLogado.papel === "professor" || usuarioLogado.papel === "admin") {
      if (seletorTurmaArea) seletorTurmaArea.style.display = "none";
    } else {
      if (seletorTurmaArea) seletorTurmaArea.style.display = "block";
    }
  } else {
    if (authBotoes) authBotoes.style.display = "block";
    if (authUsuario) authUsuario.style.display = "none";
    if (seletorTurmaArea) seletorTurmaArea.style.display = "block";
  }
}

function simularLoginFederado(provedor) {
  const email = prompt(`Simulação de login com ${provedor}:\nDigite um e-mail de teste (ex: frankalcantara@gmail.com, professor@exemplo.com ou aluno@exemplo.com):`, "frankalcantara@gmail.com");
  
  if (!email) return;

  const dadosPreCadastro = usuariosCadastrados[email.toLowerCase()];
  let usuario;

  if (dadosPreCadastro) {
    usuario = { email: email, nome: dadosPreCadastro.nome, papel: dadosPreCadastro.papel };
  } else {
    // Caso padrão para qualquer outra conta: tratado como Aluno (RF-04)
    usuario = { email: email, nome: email.split("@")[0], papel: "aluno" };
  }

  sessionStorage.setItem("usuario_autenticado", JSON.stringify(usuario));
  checarSessaoUsuario();
}

function encerrarSessao() {
  sessionStorage.removeItem("usuario_autenticado");
  checarSessaoUsuario();
}

// Vincula os botões de autenticação
window.addEventListener("DOMContentLoaded", () => {
  const btnGoogle = document.getElementById("btn-login-google");
  const btnGithub = document.getElementById("btn-login-github");
  const btnLogout = document.getElementById("btn-logout");

  if (btnGoogle) btnGoogle.addEventListener("click", () => simularLoginFederado("Google"));
  if (btnGithub) btnGithub.addEventListener("click", () => simularLoginFederado("GitHub"));
  if (btnLogout) btnLogout.addEventListener("click", encerrarSessao);

  checarSessaoUsuario();
});