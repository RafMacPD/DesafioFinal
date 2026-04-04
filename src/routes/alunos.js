const express = require('express');
const router = express.Router();
const { knex } = require('../database/knex');
const { v4: uuidv4 } = require('uuid');

// Listar todos os alunos ou filtrar por nome/codigo (UUID oculto)
router.get('/', async (req, res) => {
  const { nome, codigo_aluno } = req.query;

  try {
    // Definimos explicitamente as colunas amigáveis
    let query = knex('alunos').select('codigo_aluno', 'nome', 'email');

    if (codigo_aluno) {
      query = query.where({ codigo_aluno });
    } else if (nome) {
      query = query.where('nome', 'like', `%${nome}%`);
    }

    const alunos = await query;
    res.json(alunos);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar alunos", statusCode: 500 });
  }
});

// Buscar um aluno específico pelo CÓDIGO amigável
router.get('/:codigo', async (req, res) => {
  const { codigo } = req.params;

  try {
    const aluno = await knex('alunos')
      .where({ codigo_aluno: codigo })
      .select('codigo_aluno', 'nome', 'email') // Garante que o UUID não vaze
      .first();

    if (!aluno) {
      return res.status(404).json({ error: "Aluno não encontrado", statusCode: 404 });
    }

    res.json(aluno);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar aluno", statusCode: 500 });
  }
});

// Criar um novo aluno
router.post('/', async (req, res) => {
  const { nome, email } = req.body;

  if (!nome || !email || nome.trim() === "" || email.trim() === "") {
    return res.status(400).json({ error: "Nome e Email são obrigatórios", statusCode: 400 });
  }

  try {
    const id = uuidv4();
    // O banco gera o codigo_aluno (increment) sozinho
    await knex('alunos').insert({ id, nome, email });
    
    // Buscamos o código gerado para retornar ao usuário sem expor o UUID
    const novoAluno = await knex('alunos').where({ id }).select('codigo_aluno', 'nome', 'email').first();
    
    res.status(201).json(novoAluno);
  } catch (err) {
    res.status(400).json({ error: "E-mail já cadastrado", statusCode: 400 });
  }
});

// Atualizar dados usando o CÓDIGO
router.put('/:codigo', async (req, res) => {
  const { codigo } = req.params;
  const { nome, email } = req.body;

  try {
    const atualizado = await knex('alunos')
      .where({ codigo_aluno: codigo })
      .update({ nome, email });

    if (!atualizado) {
      return res.status(404).json({ error: "Aluno não encontrado", statusCode: 404 });
    }

    res.json({ mensagem: "Aluno atualizado com sucesso" });
  } catch (error) {
    res.status(400).json({ error: "Erro ao atualizar. Verifique os dados.", statusCode: 400 });
  }
});

// Remover aluno usando o CÓDIGO
router.delete('/:codigo', async (req, res) => {
  const { codigo } = req.params;

  try {
    const deletado = await knex('alunos').where({ codigo_aluno: codigo }).delete();

    if (!deletado) {
      return res.status(404).json({ error: "Aluno não encontrado", statusCode: 404 });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Erro ao excluir aluno", statusCode: 500 });
  }
});

module.exports = router;