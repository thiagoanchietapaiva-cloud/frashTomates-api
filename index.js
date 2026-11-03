const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const app = express();
const PORT = process.env.PORT || 3000;
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
app.use(cors({ origin: '*' }));
app.use(express.json());
app.get('/', (req,res)=>res.send('API freshTomates no ar'));
app.post('/usuarios', async (req,res)=>{
  try{
    const {nome,email,senha}=req.body;
    const r=await pool.query('INSERT INTO usuarios (nome,email,senha) VALUES ($1,$2,$3) ON CONFLICT (email) DO NOTHING RETURNING id, nome, email',[nome.trim(), email.trim().toLowerCase(), senha.trim()]);
    if(r.rowCount===0) return res.status(409).json({mensagem:'Email já cadastrado'});
    res.json(r.rows[0]);
  }catch(e){ console.error(e); res.status(500).json({error:e.message}) }
});
app.post('/login', async (req,res)=>{
  try{
    const email = req.body.email?.trim().toLowerCase()
    const senha = req.body.senha?.trim()
    const r=await pool.query('SELECT id, nome, email FROM usuarios WHERE LOWER(TRIM(email))=$1 AND TRIM(senha)=$2',[email, senha]);
    if(r.rowCount===0) return res.status(401).json({mensagem:'Email ou senha inválidos'});
    res.json(r.rows[0]);
  }catch(e){ console.error(e); res.status(500).json({error:e.message}) }
});
app.post('/avaliacoes', async (req,res)=>{
  try{
    const { usuario_id, filme_id, nota, comentario } = req.body
    const r = await pool.query(`INSERT INTO avaliacoes (usuario_id, filme_id, nota, comentario) VALUES ($1,$2,$3,$4) ON CONFLICT (usuario_id, filme_id) DO UPDATE SET nota=$3, comentario=$4 RETURNING *`,[usuario_id, filme_id, nota, comentario])
    res.json(r.rows[0])
  }catch(e){ res.status(500).json({error:e.message}) }
});
app.get('/avaliacoes/:filme_id', async (req,res)=>{
  const r = await pool.query('SELECT a.*, u.nome FROM avaliacoes a JOIN usuarios u ON u.id=a.usuario_id WHERE a.filme_id=$1 ORDER BY a.criado_em DESC', [req.params.filme_id])
  res.json(r.rows)
});
app.listen(PORT, ()=>console.log('API '+PORT));