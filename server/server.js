require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// --- Middlewares de Segurança ---
app.use(helmet());
app.use(cors({ origin: 'https://seniorweb.netlify.app' }));
app.use(express.json({ limit: '10kb' }));

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// --- Conexão com o Banco de Dados MySQL ---
const pool = mysql.createPool({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    port: process.env.MYSQL_PORT,
    ssl: { rejectUnauthorized: true }
});

// --- Rota do Formulário de Contato ---
app.post('/api/contato', async (req, res) => {
    try {
        const { nome, email, mensagem } = req.body;
        if (!nome || !email || !mensagem || !email.includes('@')) {
            return res.status(400).json({ error: 'Dados inválidos.' });
        }
        const query = 'INSERT INTO contatos (nome, email, mensagem) VALUES (?, ?, ?)';
        await pool.query(query, [nome, email, mensagem]);
        res.status(201).json({ success: true });
    } catch (error) {
        console.error('Erro no POST /api/contato:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// --- Rota do Painel Admin ---
app.get('/api/contatos', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.ADMIN_TOKEN}`) {
        return res.status(401).json({ error: 'Acesso não autorizado.' });
    }
    try {
        const [rows] = await pool.query('SELECT id, nome, email, mensagem, data_envio FROM contatos ORDER BY data_envio DESC');
        res.json(rows);
    } catch (error) {
        console.error('Erro no GET /api/contatos:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// --- Iniciar Servidor ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});