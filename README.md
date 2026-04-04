# 📚 Sistema de Gestão Escolar API

API REST desenvolvida para o desafio final de backend do **Projeto Desenvolve Itabira**. O sistema gerencia Alunos, Cursos e Matrículas utilizando uma arquitetura segura que combina **UUIDs** internos com **identificadores amigáveis** para o usuário.

---

## 🚀 Como Rodar o Projeto Localmente

### 1. Pré-requisitos
    * **Node.js** instalado (versão 18.x ou superior).
    * Gerenciador de pacotes **NPM**.

### 2. Instalação
Abra o terminal na pasta do projeto e execute:
    *git clone https://github.com/RafMacPD/DesafioFinal
    *cd seu-repositorio
    *npm install

### 3. Configuração do Banco de Dados
    O projeto utiliza **SQLite3** via **Knex.js**. 
    * Não é necessário instalar nenhum banco de dados externo.
    * O arquivo `escola.sqlite` será gerado automaticamente na raiz do projeto ao iniciar o servidor pela primeira vez.
    * **Nota:** Caso altere a estrutura das tabelas no código, delete o arquivo `.sqlite` para que ele seja recriado corretamente.

### 4. Execução
Para rodar com atualização automática (ambiente de desenvolvimento):
    
    ```bash
    
    npm run dev
    
    * O servidor iniciará em: http://localhost:3000
    
    * A documentação Swagger estará em: http://localhost:3000/docs

### 5. Lista de Endpoints

### Alunos
- **GET** `/alunos` : Lista todos ou filtra por `nome` ou `codigo_aluno`.
- **POST** `/alunos` : Cadastra novo aluno (corpo: `nome`, `email`).
- **GET** `/alunos/{codigo}` : Busca detalhes pelo código amigável.
- **PUT** `/alunos/{codigo}` : Atualiza dados do aluno pelo código.
- **DELETE** `/alunos/{codigo}` : Remove aluno do sistema pelo código.

### Cursos
- **GET** `/cursos` : Lista todos ou filtra por `nome` ou `codigo_curso`.
- **POST** `/cursos` : Cria um curso (corpo: `nome_curso`, `carga_horaria`).
- **PUT** `/cursos/{codigo}` : Atualiza curso pelo código.
- **DELETE** `/cursos/{codigo}` : Remove curso pelo código.

###  Matrículas
- **POST** `/matriculas` : Matrícula usando `codigo_aluno` e `codigo_curso`.
- **GET** `/matriculas` : Lista todas (exibe nomes de alunos e cursos).
- **PATCH** `/matriculas/{codigo}/status` : Altera status (`ativa`, `cancelada`, `concluida`).

---

## Instruções de Deploy

### Informações de Publicação
* **Plataforma de Hospedagem:** [Render]
* **Link da Aplicação:** [https://desafiofinal-tanh.onrender.com]
* **Link da Documentação (Swagger):** [(https://desafiofinal-tanh.onrender.com\docs)]

### Variáveis de Ambiente
Configure no seu serviço de hospedagem:
- `PORT`: 3000
- `NODE_ENV`: production

### Passos para o Deploy
1. Realize o `push` do código para um repositório no **GitHub**.
2. Conecte o repositório à plataforma de hospedagem.
3. Defina o comando de build: `npm rebuild sqlite3 && npm install`.
4. Defina o comando de inicialização: `npm start`.

---

## Tecnologias Utilizadas
- **Node.js & Express**
- **Knex.js & SQLite3**
- **UUID v4** (Segurança interna)
- **Swagger UI** (Documentação)
- **CORS**

---
**Desenvolvido por:** [Rafael José dos Reis Macieira] - 2026