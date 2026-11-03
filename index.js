const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors({
  origin: 'https://react-todolist-35pu.onrender.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.options('*', cors({
  origin: 'https://react-todolist-35pu.onrender.com',
  credentials: true
}));
app.use(express.json());
app.get('/', (req, res) => {
  res.send('API freshTomates no ar');
});
app.use('/usuarios', require('./routes/usuarios'));
app.use('/avaliacoes', require('./routes/avaliacoes'));
app.listen(PORT, () => {
  console.log(`API rodando na porta ${PORT}`);
});