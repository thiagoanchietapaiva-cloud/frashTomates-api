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
    const r=await pool.query('INSERT INTO usuarios (nome,email,senha) VALUES ($1,$2,$3) RETURNING id',[nome,email,senha]);
    res.json(r.rows[0]);
  }catch(e){ res.status(500).json({error:e.message}) }
});
app.listen(PORT, ()=>console.log('API '+PORT));