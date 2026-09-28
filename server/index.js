const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const { executarAlocacao } = require('./heuristica');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
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
    const { nome, capacidade, tipo } = req.body;

    const { data, error } = await supabase
      .from('salas')
      .insert([{ nome, capacidade, tipo }])
      .select();

    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json(data[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/ensalamento/gerar', async (req, res) => {
  try {
    const { data: salas, error: errSalas } = await supabase.from('salas').select('*');
    const { data: turmas, error: errTurmas } = await supabase.from('turmas').select('*');
    const { data: encontros, error: errEncontros } = await supabase.from('encontros').select('*');

    if (errSalas || errTurmas || errEncontros) {
      return res.status(400).json({ error: 'Erro ao buscar dados do banco de dados' });
    }

    const resultado = executarAlocacao(turmas, encontros, salas);

    return res.json(resultado);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});