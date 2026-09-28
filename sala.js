const URL_API = 'https://ensalamento-backend-8o7r.onrender.com/api/salas';

// Dados locais de fallback para exibição consistente da interface (RF-35 a RF-39)
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
    diaSemana: 2, // Terça-feira
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
  },
  {
    id: 4,
    turma: "CC-1A",
    disciplina: "Algoritmos e Estrutura de Dados I",
    professor: "Roberto Albuquerque",
    diaSemana: 1,
    inicio: "19:00",
    fim: "22:30",
    campus: "Campus Central",
    predio: "Bloco B",
    andar: "1º Andar",
    sala: "Lab 101",
    capacidade: 35,
    recursos: ["Projetor", "35 Computadores"],
    acessibilidade: "Rampa e portas alargadas",
    alterada: false,
    dataAtualizacao: "10/09/2026"
  }
];

let modoVisualizacao = "semana"; // Padrão 'semana' para garantir que os cards carreguem de imediato

// Identificação de aula atual e próxima aula (RF-35)
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

// Renderização dinâmica dos cartões de aula (RF-35 e RF-37)
function renderizarAgenda() {
  const container = document.getElementById("container-aulas");
  if (!container) return;

  const select = document.getElementById("select-turma");
  let turmaSelecionada = select ? select.value : "ES-3A";
  if (turmaSelecionada.includes(" ")) {
    turmaSelecionada = turmaSelecionada.split(" ")[0].trim();
  }
  if (!turmaSelecionada) turmaSelecionada = "ES-3A";

  const diaHoje = new Date().getDay();

  container.innerHTML = "";

  const aulasFiltradas = aulasExemplo.filter(aula => {
    if (turmaSelecionada && !aula.turma.includes(turmaSelecionada) && !turmaSelecionada.includes(aula.turma)) {
      return false;
    }
    if (modoVisualizacao === "hoje") {
      return aula.diaSemana === diaHoje;
    }
    return true;
  });

  if (aulasFiltradas.length === 0) {
    if (modoVisualizacao === "hoje") {
      container.innerHTML = `
        <div style="background: #e0f2fe; border: 1px solid #bae6fd; padding: 14px; border-radius: 8px; color: #0369a1; font-size: 0.95rem;">
          Não constam mais aulas agendadas para o horário atual de hoje. Alterne para <strong>"Semana Completa"</strong> para conferir as demais datas da turma.
        </div>
      `;
    } else {
      container.innerHTML = `<p class="aviso-vazio">Nenhuma aula encontrada para esta turma.</p>`;
    }
    return;
  }

  aulasFiltradas.forEach(aula => {
    const statusHorario = calcularStatusHorario(aula.inicio, aula.fim, aula.diaSemana);
    
    const card = document.createElement("article");
    card.className = `card-aula ${statusHorario}`;

    card.innerHTML = `
      <div class="card-cabecalho">
        <strong>${aula.inicio} - ${aula.fim}</strong>
        ${aula.alterada ? `<span style="color: #dc2626; font-weight: bold;"> [Alterada]</span>` : ""}
        ${statusHorario === "tag-atual" ? `<span style="color: #16a34a; font-weight: bold;"> (Aula Atual)</span>` : ""}
        ${statusHorario === "tag-proxima" ? `<span style="color: #2563eb; font-weight: bold;"> (Próxima Aula)</span>` : ""}
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

// Modal de detalhes físicos e acessibilidade (RF-38 e RF-39)
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

// Autenticação e Perfis de Acesso (RF-01 a RF-04, RF-36)
const usuariosCadastrados = {
  "frankalcantara@gmail.com": { nome: "Prof. Frank Alcantara", papel: "admin" },
  "professor@exemplo.com": { nome: "Prof. Carlos Eduardo", papel: "professor" }
};

function aplicarLoginUsuario(email, nomeInformado) {
  const dados = usuariosCadastrados[email.toLowerCase()];
  let usuario;

  if (dados) {
    usuario = { email: email, nome: dados.nome, papel: dados.papel };
  } else {
    usuario = { email: email, nome: nomeInformado || email.split("@")[0], papel: "aluno" };
  }

  sessionStorage.setItem("usuario_autenticado", JSON.stringify(usuario));
  checarSessaoUsuario();
}

function handleCredentialResponse(response) {
  try {
    const base64Url = response.credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    const payload = JSON.parse(jsonPayload);

    aplicarLoginUsuario(payload.email, payload.name);
  } catch (e) {
    console.error("Erro ao decodificar token Google", e);
  }
}

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

    if (usuarioLogado.papel === "professor" || usuarioLogado.papel === "admin") {
      if (seletorTurmaArea) seletorTurmaArea.style.display = "none";
    } else {
      if (seletorTurmaArea) seletorTurmaArea.style.display = "block";
    }
  } else {
    if (authBotoes) authBotoes.style.display = "flex";
    if (authUsuario) authUsuario.style.display = "none";
    if (seletorTurmaArea) seletorTurmaArea.style.display = "block";
  }
}

function encerrarSessao() {
  sessionStorage.removeItem("usuario_autenticado");
  checarSessaoUsuario();
}

// Inicialização e Vínculo de Eventos
document.addEventListener("DOMContentLoaded", () => {
  const selectTurma = document.getElementById("select-turma");
  const btnHoje = document.getElementById("btn-hoje");
  const btnSemana = document.getElementById("btn-semana");
  const btnFecharModal = document.getElementById("btn-fechar-modal");
  const modal = document.getElementById("modal-sala");
  const btnDemo = document.getElementById("btn-login-demo");
  const btnLogout = document.getElementById("btn-logout");

  // Carrega turma salva no localStorage (RF-05, RF-06)
  const turmaSalva = localStorage.getItem("turma_preferida");
  if (turmaSalva && selectTurma) {
    selectTurma.value = turmaSalva;
  }

  if (selectTurma) {
    selectTurma.addEventListener("change", () => {
      localStorage.setItem("turma_preferida", selectTurma.value);
      renderizarAgenda();
    });
  }

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

  if (btnDemo) {
    btnDemo.addEventListener("click", () => {
      aplicarLoginUsuario("frankalcantara@gmail.com", "Prof. Frank Alcantara");
    });
  }

  if (btnLogout) {
    btnLogout.addEventListener("click", encerrarSessao);
  }

  checarSessaoUsuario();
  renderizarAgenda();
});