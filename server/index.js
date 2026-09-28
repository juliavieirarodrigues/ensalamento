const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
require('dotenv').config();

const { executarAlocacao } = require('./heuristica');

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.get('/health', (req, res) => {
  res.json({ status: 'API Online', timestamp: new Date() });
});

app.get('/api/salas', async (req, res) => {
  const { data, error } = await supabase.from('salas').select('*');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.post('/api/importar/salas', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });

  const resultados = [];
  const erros = [];
  let linhaNum = 1;

  fs.createReadStream(req.file.path)
    .pipe(csv({ separator: ';' }))
    .on('data', (data) => {
      linhaNum++;
      if (!data.codigo || !data.capacidade || !data.andar) {
        erros.push({ linha: linhaNum, motivo: 'Campos obrigatórios ausentes (codigo, capacidade, andar).' });
      } else {
        resultados.push({
          codigo: data.codigo,
          andar: parseInt(data.andar),
          capacidade: parseInt(data.capacidade),
          tipo: data.tipo || 'SALA_COMUM',
          possui_acessibilidade: data.possui_acessibilidade === 'true'
        });
      }
    })
    .on('end', async () => {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      if (erros.length > 0) {
        return res.status(422).json({ 
          sucesso: false, 
          validos: resultados.length, 
          erros_count: erros.length, 
          erros 
        });
      }

      const { data, error } = await supabase.from('salas').insert(resultados);
      if (error) return res.status(400).json({ error: error.message });

      res.json({ sucesso: true, inseridos: resultados.length });
    });
});

app.post('/api/ensalamento/gerar', async (req, res) => {
  try {
    const { data: turmas, error: errTurmas } = await supabase.from('turmas').select('*');
    const { data: encontros, error: errEncontros } = await supabase.from('encontros').select('*');
    const { data: salas, error: errSalas } = await supabase.from('salas').select('*');

    if (errTurmas || errEncontros || errSalas) {
      return res.status(400).json({ 
        error: errTurmas?.message || errEncontros?.message || errSalas?.message 
      });
    }

    const resultado = executarAlocacao(turmas || [], encontros || [], salas || []);
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});