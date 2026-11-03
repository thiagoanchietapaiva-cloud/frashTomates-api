const express = require("express");
const cors = require("cors");
const executarSQL = require("./services");
const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("API freshTomates no ar");
});
app.post("/usuarios", async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    const existe = await executarSQL("SELECT id FROM usuarios WHERE email = $1", [email]);
    if (existe.rowCount > 0) {
      return res.json({ tipo: "warning", mensagem: "Email já cadastrado" });
    }
    const q = await executarSQL(
      "INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING id, nome, email",
      [nome, email, senha]
    );
    res.json({ tipo: "success", mensagem: "Cadastrado", usuario: q.rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ mensagem: e.message });
  }
});
app.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;
    const q = await executarSQL(
      "SELECT id, nome, email FROM usuarios WHERE email = $1 AND senha = $2",
      [email, senha]
    );
    if (q.rowCount === 0) {
      return res.json({ tipo: "warning", mensagem: "Email ou senha inválidos" });
    }
    res.json({ tipo: "success", usuario: q.rows[0] });
  } catch (e) {
    res.status(500).json({ mensagem: e.message });
  }
});
app.get("/usuarios", async (req, res) => {
  try {
    const q = await executarSQL("SELECT id, nome, email FROM usuarios");
    res.json(q.rows);
  } catch (e) {
    res.status(500).json({ mensagem: e.message });
  }
});
// Salvar avaliação
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
    res.status(500).json({ mensagem: e.message });
  }
});
const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Servidor on: ${PORT}`));