// remove salas que violam regras obrigatórias
function filtrarSalasValidas(turma, encontro, salas, alocacoesExistentes) {
  return salas.filter(sala => {
    if (!sala.ativo) return false;

    const tamanhoTurma = turma.tamanho_confirmado || turma.tamanho_previsto;
    if (sala.capacidade < tamanhoTurma) return false;

    if (turma.exige_acessibilidade && !sala.possui_acessibilidade) return false;

    const recursosObrigatorios = turma.recursos_obrigatorios || [];
    const possuiTodosRecursos = recursosObrigatorios.every(rec => 
      (sala.recursos || []).includes(rec)
    );
    if (!possuiTodosRecursos) return false;

    const temConflito = alocacoesExistentes.some(aloc => {
      if (aloc.sala_id !== sala.id) return false;
      const enc = aloc.encontro;
      if (enc.dia_semana !== encontro.dia_semana) return false;
      return (encontro.horario_inicio < enc.horario_fim && encontro.horario_fim > enc.horario_inicio);
    });

    return !temConflito;
  });
}

// ordena salas válidas pelo menor desperdício de espaço
function calcularIndiceAdequacao(turma, sala) {
  const tamanhoTurma = turma.tamanho_confirmado || turma.tamanho_previsto;
  const sobraLugares = sala.capacidade - tamanhoTurma;
  
  let pontuacao = 1000 - sobraLugares;
  return pontuacao;
}

function executarAlocacao(turmas, encontros, salas) {
  const alocacoesPropostas = [];
  const pendencias = [];

  encontros.forEach(encontro => {
    const turma = turmas.find(t => t.id === encontro.turma_id);
    const salasValidas = filtrarSalasValidas(turma, encontro, salas, alocacoesPropostas);

    if (salasValidas.length === 0) {
      pendencias.push({
        turma_id: turma.id,
        encontro_id: encontro.id,
        motivo: 'Nenhuma sala válida disponível (capacidade, acessibilidade ou conflito de horário).'
      });
    } else {
      salasValidas.sort((a, b) => 
        calcularIndiceAdequacao(turma, b) - calcularIndiceAdequacao(turma, a)
      );

      const melhorSala = salasValidas[0];
      alocacoesPropostas.push({
        encontro_id: encontro.id,
        sala_id: melhorSala.id,
        encontro: encontro,
        status: 'RASCUNHO'
      });
    }
  });

  return { alocacoesPropostas, pendencias };
}

module.exports = { executarAlocacao };