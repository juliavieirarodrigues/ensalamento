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