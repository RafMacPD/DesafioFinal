const express = require('express');
const router = express.Router();
const { knex } = require('../database/knex');
const { v4: uuidv4 } = require('uuid'); // Importação necessária para gerar o ID

// Listar todos os alunos ou filtrar por parte do nome
router.get('/', async (req, res) => {
  const { nome } = req.query;

  try {
    let query = knex('alunos');

    if (nome) {
  
      query = query.where('nome', 'like', `%${nome}%`);
    }

    const alunos = await query.select('*');
    res.json(alunos);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar alunos", statusCode: 500 });
  }
});

// Buscar um aluno específico pelo ID (UUID)
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const aluno = await knex('alunos').where({ id }).first();

    if (!aluno) {
      return res.status(404).json({ error: "Aluno não encontrado", statusCode: 404 });
    }

    res.json(aluno);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar aluno por ID", statusCode: 500 });
  }
});

// Criar um novo aluno
router.post('/', async (req, res) => {
  const { nome, email } = req.body;

  if (!nome || !email || nome.trim() === "" || email.trim() === "") {
    return res.status(400).json({ 
      error: "Nome e Email são campos obrigatórios", 
      statusCode: 400 
    });
  }

  try {
    const id = uuidv4(); // Gerando o UUID manualmente antes do insert
    await knex('alunos').insert({ id, nome, email });
    
    res.status(201).json({ id, nome, email });
  } catch (err) {
    res.status(400).json({ 
      error: "Este e-mail já está cadastrado no sistema", 
      statusCode: 400 
    });
  }
});

// Atualizar dados de um aluno existente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, email } = req.body;

  if (!nome || !email) {
    return res.status(400).json({ 
      error: "Dados incompletos para atualização", 
      statusCode: 400 
    });
  }

  try {
    const atualizado = await knex('alunos')
      .where({ id })
      .update({ nome, email });

    if (!atualizado) {
      return res.status(404).json({ 
        error: "Aluno não encontrado", 
        statusCode: 404 
      });
    }

    res.json({ mensagem: "Aluno atualizado com sucesso" });
  } catch (error) {
    res.status(400).json({ 
      error: "Erro ao atualizar. Verifique se o e-mail já pertence a outro aluno.", 
      statusCode: 400 
    });
  }
});

// Remover um aluno
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletado = await knex('alunos').where({ id }).delete();

    if (!deletado) {
      return res.status(404).json({ 
        error: "Aluno não encontrado", 
        statusCode: 404 
      });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ 
      error: "Erro ao excluir aluno", 
      statusCode: 500 
    });
  }
});

module.exports = router;