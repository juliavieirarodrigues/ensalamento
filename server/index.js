const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);


app.get('/health', (req, res) => {
  res.json({ status: 'API Online', timestamp: new Date() });
});


app.get('/api/salas', async (req, res) => {
  const { data, error } = await supabase.from('salas').select('*');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando com sucesso na porta ${PORT}`);
});