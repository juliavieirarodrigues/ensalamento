const URL_API = 'https://ensalamento-backend-8o7r.onrender.com/api/salas';

async function carregarSalas() {
  const container = document.getElementById('lista-salas');

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

document.addEventListener('DOMContentLoaded', carregarSalas);

//  LÓGICA DE PREFERÊNCIA DO ALUNO (RF-05 E RF-06)

const selectTurma = document.getElementById('select-turma');
const btnSalvar = document.getElementById('btn-salvar-turma');

function carregarOpcoesTurmas() {
  const turmasExemplo = [
    'Engenharia de Software - 3º Período',
    'Ciência da Computação - 1º Período',
    'Sistemas de Informação - 2º Período'
  ];
  
  if (!selectTurma) return;
  selectTurma.innerHTML = '<option value="">-- Escolha uma turma --</option>';
  
  turmasExemplo.forEach(turma => {
    const opt = document.createElement('option');
    opt.value = turma;
    opt.textContent = turma;
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
  });
}

carregarOpcoesTurmas();