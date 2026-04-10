const express = require('express');
const router = express.Router();
const { knex } = require('../database/knex');
const { v4: uuidv4 } = require('uuid');

// 1. Matricular um aluno usando códigos amigáveis (UUID oculto)
router.post('/', async (req, res) => {
  const codigo_aluno = Number(req.body.codigo_aluno);
  const codigo_curso = Number(req.body.codigo_curso);
  try {
    // Busca UUIDs internamente para processar a regra de negócio
    const aluno = await knex('alunos').where({codigo_aluno}).select('id').first();
    const curso = await knex('cursos').where({codigo_curso}).select('id').first();
    
    if (!aluno || !curso) {
      return res.status(404).json({ 
        error: "Aluno ou Curso inexistente para os códigos fornecidos", 
        statusCode: 404 
      });
    }

    // Regra: Máximo de 5 matrículas ATIVAS
    const ativas = await knex('matriculas')
      .where({ aluno_id: aluno.id, status: 'ativa' })
      .count('id as total')
      .first();

    if (ativas.total >= 5) {
      return res.status(400).json({ 
        error: "O aluno já possui o limite de 5 matrículas ativas", 
        statusCode: 400 
      });
    }

    const id = uuidv4();
    await knex('matriculas').insert({ 
      id, 
      aluno_id: aluno.id, 
      curso_id: curso.id 
    });
    
    res.status(201).json({ 
      mensagem: "Matrícula realizada com sucesso",
      detalhes: { codigo_aluno, codigo_curso } 
    });

  } catch (e) {
    res.status(400).json({ 
      error: "Este aluno já está matriculado neste curso", 
      statusCode: 400 
    });
  }
});

// 2. Listagem geral
router.get('/', async (req, res) => {
  const { codigo_matricula } = req.query;

  try {
    let query = knex('matriculas')
      .join('alunos', 'matriculas.aluno_id', 'alunos.id')
      .join('cursos', 'matriculas.curso_id', 'cursos.id')
      .select(
        'matriculas.codigo_matricula', 
        'alunos.nome as nome_aluno',
        'alunos.codigo_aluno',
        'cursos.nome_curso',
        'cursos.codigo_curso',
        'matriculas.status'
      );

    if (codigo_matricula) {
      query = query.where('matriculas.codigo_matricula', codigo_matricula);
    }

    const lista = await query;
    res.json(lista);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar matrículas", statusCode: 500 });
  }
});

// 3. Listar cursos de um aluno
router.get('/aluno/:codigo_aluno', async (req, res) => {
  try {
    const aluno = await knex('alunos').where({ codigo_aluno: req.params.codigo_aluno }).first();
    if (!aluno) return res.status(404).json({ error: "Aluno não encontrado" });

    const lista = await knex('matriculas')
      .join('cursos', 'matriculas.curso_id', 'cursos.id')
      .where('matriculas.aluno_id', aluno.id)
      .select('cursos.nome_curso', 'cursos.codigo_curso', 'cursos.carga_horaria', 'matriculas.status');
    
    res.json(lista);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar cursos do aluno" });
  }
});

// 4. Alterar status da matrícula
router.patch('/:codigo/status', async (req, res) => {
  const { status } = req.body;
  const validos = ['ativa', 'cancelada', 'concluida', 'suspensa'];

  if (!validos.includes(status)) {
    return res.status(400).json({ error: "Status inválido", statusCode: 400 });
  }

  try {
    const atualizado = await knex('matriculas')
      .where({ codigo_matricula: req.params.codigo })
      .update({ status });

    if (!atualizado) {
      return res.status(404).json({ error: "Matrícula não encontrada", statusCode: 404 });
    }

    res.json({ mensagem: `Status alterado para: ${status}` });
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar status" });
  }
});

module.exports = router;