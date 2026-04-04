const express = require('express');
const router = express.Router();
const { knex } = require('../database/knex');
const { v4: uuidv4 } = require('uuid'); // Adicionado para suporte a UUID

// Listar todos os cursos
router.get('/', async (req, res) => {
  try {
    const cursos = await knex('cursos').select('*');
    res.json(cursos);
  } catch (error) {
    res.status(500).json({ 
      error: "Erro ao listar cursos", 
      statusCode: 500 
    });
  }
});

// Buscar um curso específico pelo ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const curso = await knex('cursos').where({ id }).first();
  
  if (!curso) {
    return res.status(404).json({ 
      error: "Curso não encontrado", 
      statusCode: 404 
    });
  }
  res.json(curso);
});

// Criar um novo curso
router.post('/', async (req, res) => {
  const { nome_curso, carga_horaria } = req.body;

  if (!nome_curso || nome_curso.trim() === "") {
    return res.status(400).json({ 
      error: "O título do curso é obrigatório", 
      statusCode: 400 
    });
  }

  try {
    const id = uuidv4(); // Gerando UUID manual
    
    await knex('cursos').insert({ 
      id,
      nome_curso: nome_curso.trim(), 
      carga_horaria: carga_horaria || 0 
    });
    
    res.status(201).json({ id, nome_curso, carga_horaria });
  } catch (err) {
    res.status(400).json({ 
      error: "Já existe um curso cadastrado com este nome", 
      statusCode: 400 
    });
  }
});

// Atualizar dados do curso
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nome_curso, carga_horaria } = req.body;

  if (!nome_curso) {
    return res.status(400).json({ 
      error: "O título do curso é obrigatório para atualização", 
      statusCode: 400 
    });
  }

  try {
    const atualizado = await knex('cursos')
      .where({ id })
      .update({ 
        nome_curso: nome_curso.trim(), 
        carga_horaria: carga_horaria || 0 
      });

    if (!atualizado) {
      return res.status(404).json({ 
        error: "Curso não encontrado para atualizar", 
        statusCode: 404 
      });
    }

    res.json({ mensagem: "Curso atualizado com sucesso" });
  } catch (error) {
    res.status(400).json({
      error: "Erro ao atualizar curso",
      statusCode: 400
    });
  }
});

// Remover um curso
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletado = await knex('cursos').where({ id }).delete();

    if (!deletado) {
      return res.status(404).json({ 
        error: "Curso não encontrado para exclusão", 
        statusCode: 404 
      });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      error: "Erro ao excluir curso",
      statusCode: 500
    });
  }
});

module.exports = router;