const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const app = express();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(cors({
  origin: ['https://react-todolist-35pu.onrender.com', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));
app.use(express.json());

const executarSQL = (text, params) => pool.query(text, params);

app.get("/", (req, res) => {
  res.send("API freshTomates no ar");
});

app.get("/usuarios", async (req, res) => {
  try {
    const q = await executarSQL("SELECT id, nome, email FROM usuarios ORDER BY id DESC LIMIT 20");
    res.json(q.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: e.message });
  }
});

app.post("/usuarios", async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    if(!nome || !email || !senha) return res.status(400).json({ mensagem: "Preencha tudo" });
    const emailLimpo = email.trim().toLowerCase();
    const existe = await executarSQL("SELECT id FROM usuarios WHERE LOWER(TRIM(email)) = $1", [emailLimpo]);
    if (existe.rowCount > 0) {
      return res.status(409).json({ tipo: "warning", mensagem: "Email já cadastrado" });
    }
    const q = await executarSQL(
      "INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING id, nome, email",
      [nome.trim(), emailLimpo, senha.trim()]
    );
    res.json({ tipo: "success", mensagem: "Cadastrado", usuario: q.rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: e.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const senha = req.body.senha?.trim();
    if(!email || !senha) return res.status(400).json({ mensagem: "Preencha email e senha" });
    const q = await executarSQL(
      "SELECT id, nome, email FROM usuarios WHERE LOWER(TRIM(email)) = $1 AND TRIM(senha) = $2",
      [email, senha]
    );
    if (q.rowCount === 0) {
      return res.status(401).json({ tipo: "warning", mensagem: "Email ou senha inválidos" });
    }
    res.json({ tipo: "success", usuario: q.rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: e.message });
  }
});

app.post("/avaliacoes", async (req, res) => {
  try {
    const { usuario_id, filme_id, nota, comentario } = req.body;
    const q = await executarSQL(
      `INSERT INTO avaliacoes (usuario_id, filme_id, nota, comentario)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (usuario_id, filme_id) 
       DO UPDATE SET nota = $3, comentario = $4
       RETURNING *`,
      [usuario_id, filme_id, nota, comentario]
    );
    res.json({ tipo: "success", avaliacao: q.rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: e.message });
  }
});

app.get("/avaliacoes/:filme_id", async (req, res) => {
  try {
    const { filme_id } = req.params;
    const q = await executarSQL(
      `SELECT a.*, u.nome FROM avaliacoes a JOIN usuarios u ON u.id = a.usuario_id WHERE a.filme_id = $1 ORDER BY a.criado_em DESC`,
      [filme_id]
    );
    res.json(q.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor on: ${PORT}`));