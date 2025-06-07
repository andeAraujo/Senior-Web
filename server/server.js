require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// --- Adiciona 'trust proxy' ---
// inforrma ao Express para confiar nos cabeçalhos enviados pelo proxy do Railway......
app.set('trust proxy', 1);

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
// --- Tratar erros de conexão de forma mais robusta ---
let pool;
try {
    pool = mysql.createPool({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        port: process.env.MYSQL_PORT,
        ssl: { rejectUnauthorized: false },
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
    console.log("Pool de conexões com o MySQL criado com sucesso.");
} catch (error) {
    console.error("ERRO FATAL: Falha ao criar o pool de conexões com o MySQL.", error);
    process.exit(1); // Encerra a aplicação se não conseguir criar o pool
}


// --- Rota do Formulário de Contato ---
app.post('/api/contato', async (req, res) => {
    try {
        const { nome, email, mensagem } = req.body;
        if (!nome || !email || !mensagem || !email.includes('@')) {
            return res.status(400).json({ error: 'Dados inválidos.' });
        }
        const query = 'INSERT INTO contatos (nome, email, mensagem) VALUES (?, ?, ?)';
        // Usamos pool.query() que pega uma conexão do pool e a libera automaticamente
        await pool.query(query, [nome, email, mensagem]);
        res.status(201).json({ success: true });
    } catch (error) {
        // Log do erro específico da query para depuração
        console.error('Erro na query POST /api/contato:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// --- Rota de Login ---
app.post('/api/login', (req, res) => {
    const { token } = req.body;

    // Compara o token enviado com o token seguro no ambiente
    if (token && token === process.env.ADMIN_TOKEN) {
        // Se for correto, responde com sucesso.
        res.status(200).json({ success: true, message: 'Autenticação bem-sucedida.' });
    } else {
        // Se for incorreto, responde com erro de não autorizado.
        res.status(401).json({ success: false, message: 'Chave de acesso inválida.' });
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
        console.error('Erro na query GET /api/contatos:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// --- Rota para DELETAR uma Mensagem ---
app.delete('/api/contatos/:id', async (req, res) => {
    // 1. Primeiro, verifica se quem está pedindo é um admin
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.ADMIN_TOKEN}`) {
        return res.status(401).json({ error: 'Acesso não autorizado.' });
    }

    try {
        // 2. Pega o ID da mensagem dos parâmetros da URL
        const { id } = req.params;

        // 3. Executa a query SQL para deletar a linha com o ID correspondente
        const [result] = await pool.query('DELETE FROM contatos WHERE id = ?', [id]);

        // 4. Verifica se alguma linha foi realmente deletada
        if (result.affectedRows > 0) {
            res.status(200).json({ success: true, message: 'Mensagem deletada com sucesso.' });
        } else {
            res.status(404).json({ error: 'Mensagem não encontrada.' });
        }
    } catch (error) {
        console.error('Erro na rota DELETE /api/contatos/:id:', error);
        res.status(500).json({ error: 'Erro interno do servidor ao deletar mensagem.' });
    }
});

// --- Iniciar Servidor ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});