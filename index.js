const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const app = express();
const PORT = process.env.PORT || 3000;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
app.use(cors({
  origin: 'https://react-todolist-35pu.onrender.com',
  credentials: true
}));
app.use(express.json());
app.get('/', (req, res) => res.send('API freshTomates no ar'));
app.post('/usuarios', async (req, res) => {
  const { nome, email, senha } = req.body;
  console.log('Cadastro recebido:', nome, email);
  try {
    const result = await pool.query(
      'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING id',
      [nome, email, senha]
    );
    res.json({ id: result.rows[0].id });
  } catch (err) {
    console.error('ERRO BANCO:', err.message);
    res.status(500).json({ error: err.message });
  }
});
app.listen(PORT, () => console.log(`API na porta ${PORT}`));