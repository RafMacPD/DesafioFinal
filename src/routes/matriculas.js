const express = require('express');
const router = express.Router();
const { knex } = require('../database/knex');
const { v4: uuidv4 } = require('uuid'); // Adicionado para gerar o ID da matrícula

// Matricular um aluno em um curso
router.post('/', async (req, res) => {
  const { aluno_id, curso_id } = req.body;

  try {
    // 1. Validar se aluno e curso existem (IDs agora são strings/UUIDs)
    const aluno = await knex('alunos').where({ id: aluno_id }).first();
    const curso = await knex('cursos').where({ id: curso_id }).first();
    
    if (!aluno || !curso) {
      return res.status(404).json({ 
        error: "Aluno ou Curso inexistente no sistema", 
        statusCode: 404 
      });
    }

    // 2. Regra: Máximo de 5 matrículas ATIVAS por aluno
    const ativas = await knex('matriculas')
      .where({ aluno_id, status: 'ativa' })
      .count('id as total')
      .first();

    if (ativas.total >= 5) {
      return res.status(400).json({ 
        error: "O aluno já possui o limite de 5 matrículas ativas", 
        statusCode: 400 
      });
    }

    // 3. Efetivar matrícula com UUID manual
    const id = uuidv4();
    await knex('matriculas').insert({ id, aluno_id, curso_id });
    
    res.status(201).json({ id, mensagem: "Matrícula realizada com sucesso" });

  } catch (e) {
    res.status(400).json({ 
      error: "Este aluno já está matriculado neste curso", 
      statusCode: 400 
    });
  }
});

// Listagem geral de matrículas
router.get('/', async (req, res) => {
  try {
    const lista = await knex('matriculas')
      .join('alunos', 'matriculas.aluno_id', 'alunos.id')
      .join('cursos', 'matriculas.curso_id', 'cursos.id')
      .select(
        'matriculas.id',
        'alunos.nome as nome_aluno',
        'cursos.nome_curso',
        'matriculas.status'
      );
    res.json(lista);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar matrículas", statusCode: 500 });
  }
});

// Listar cursos de um aluno específico
router.get('/aluno/:id', async (req, res) => {
  const lista = await knex('matriculas')
    .join('cursos', 'matriculas.curso_id', 'cursos.id')
    .where('matriculas.aluno_id', req.params.id)
    .select('cursos.nome_curso', 'cursos.carga_horaria', 'matriculas.status');
  res.json(lista);
});

// Listar alunos de um curso específico
router.get('/curso/:id', async (req, res) => {
  const lista = await knex('matriculas')
    .join('alunos', 'matriculas.aluno_id', 'alunos.id')
    .where('matriculas.curso_id', req.params.id)
    .select('alunos.nome', 'alunos.email', 'matriculas.status');
  res.json(lista);
});

// Alterar status da matrícula
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  const validos = ['ativa', 'cancelada', 'concluida'];

  if (!validos.includes(status)) {
    return res.status(400).json({ 
      error: "Status inválido. Use: ativa, cancelada ou concluida", 
      statusCode: 400 
    });
  }

  try {
    const atualizado = await knex('matriculas')
      .where({ id: req.params.id })
      .update({ status });

    if (!atualizado) {
      return res.status(404).json({ 
        error: "Matrícula não encontrada", 
        statusCode: 404 
      });
    }

    res.json({ mensagem: `Status da matrícula alterado para: ${status}` });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar status", statusCode: 500 });
  }
});

module.exports = router;