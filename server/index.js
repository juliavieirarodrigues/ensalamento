const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const { executarAlocacao } = require('./heuristica');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

app.get('/api/salas', async (req, res) => {
  try {
    const { data: salas, error } = await supabase.from('salas').select('*');
    if (error) return res.status(400).json({ error: error.message });
    return res.json(salas);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/turmas', async (req, res) => {
  try {
    const { data: turmas, error } = await supabase.from('turmas').select('*');
    if (error) return res.status(400).json({ error: error.message });
    return res.json(turmas);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get('/api/encontros', async (req, res) => {
  try {
    const { data: encontros, error } = await supabase.from('encontros').select('*');
    if (error) return res.status(400).json({ error: error.message });
    return res.json(encontros);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/salas', async (req, res) => {
  try {
    const { nome, capacidade, tipo, ativo, possui_acessibilidade, recursos } = req.body;
    const { data, error } = await supabase
      .from('salas')
      .insert([{ nome, capacidade, tipo, ativo, possui_acessibilidade, recursos }])
      .select();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json(data[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/turmas', async (req, res) => {
  try {
    const { nome, curso, tamanho_previsto, tamanho_confirmado, exige_acessibilidade, recursos_obrigatorios } = req.body;
    const { data, error } = await supabase
      .from('turmas')
      .insert([{ nome, curso, tamanho_previsto, tamanho_confirmado, exige_acessibilidade, recursos_obrigatorios }])
      .select();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json(data[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/encontros', async (req, res) => {
  try {
    const { turma_id, dia_semana, horario_inicio, horario_fim } = req.body;
    const { data, error } = await supabase
      .from('encontros')
      .insert([{ turma_id, dia_semana, horario_inicio, horario_fim }])
      .select();
    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json(data[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/salas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('salas').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/turmas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('turmas').delete().eq('id', id);
    if (error) return res.status(400).json({ error: error.message });
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/ensalamento/gerar', async (req, res) => {
  try {
    const { data: salas } = await supabase.from('salas').select('*');
    const { data: turmas } = await supabase.from('turmas').select('*');
    const { data: encontros } = await supabase.from('encontros').select('*');

    const resultado = executarAlocacao(turmas, encontros, salas);
    return res.json(resultado);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/ensalamento/confirmar', async (req, res) => {
  try {
    const { alocacoes } = req.body;
    const { data, error } = await supabase
      .from('alocacoes')
      .insert(alocacoes)
      .select();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json({ mensagem: 'Ensalamento guardado com sucesso!', data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor a rodar na porta ${PORT}`);
});