// 1. Importação de dependências externas
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');

// 2. Importação da configuração do banco de dados (Knex + UUID Config)
const { inicializarBanco } = require('./database/knex');

// 3. Importação dos módulos de rotas (Roteadores Modulares)
const rotaAlunos = require('./routes/alunos');
const rotaCursos = require('./routes/cursos');
const rotaMatriculas = require('./routes/matriculas');

const app = express();

// 4. Middlewares Globais
app.use(cors()); // Permite acesso de diferentes origens
app.use(express.json()); // Essencial para ler o corpo das requisições

// --- Rota da Documentação Swagger ---
// Disponível em http://localhost:3000/docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 5. Inicialização do Banco de Dados
inicializarBanco().catch(err => {
    console.error("Falha crítica ao iniciar o banco de dados:", err);
});

// 6. Definição dos Prefixos das Rotas
app.use('/alunos', rotaAlunos);
app.use('/cursos', rotaCursos);
app.use('/matriculas', rotaMatriculas);

// 7. Inicialização do Servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📖 Documentação Swagger disponível em http://localhost:${PORT}/docs`);
});