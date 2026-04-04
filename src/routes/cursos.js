const express = require('express');
const router = express.Router();
const { knex } = require('../database/knex');
const { v4: uuidv4 } = require('uuid');

// 1. Listar todos os cursos ou filtrar por nome/código (Esconde o UUID)
router.get('/', async (req, res) => {
  const { nome, codigo_curso } = req.query;

  try {
    // Filtramos o SELECT para retornar apenas as colunas amigáveis
    let query = knex('cursos').select('codigo_curso', 'nome_curso', 'carga_horaria');

    if (codigo_curso) {
      query = query.where({ codigo_curso });
    } else if (nome) {
      query = query.where('nome_curso', 'like', `%${nome}%`);
    }

    const cursos = await query;
    res.json(cursos);
  } catch (error) {
    res.status(500).json({ error: "Erro ao listar cursos", statusCode: 500 });
  }
});

// 2. Buscar um curso específico pelo CÓDIGO (inteiro)
router.get('/:codigo', async (req, res) => {
  const { codigo } = req.params;

  try {
    const curso = await knex('cursos')
      .where({ codigo_curso: codigo })
      .select('codigo_curso', 'nome_curso', 'carga_horaria') // UUID oculto
      .first();
    
    if (!curso) {
      return res.status(404).json({ error: "Curso não encontrado", statusCode: 404 });
    }
    res.json(curso);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar curso", statusCode: 500 });
  }
});

// 3. Criar um novo curso
router.post('/', async (req, res) => {
  const { nome_curso, carga_horaria } = req.body;

  if (!nome_curso || nome_curso.trim() === "") {
    return res.status(400).json({ error: "O título do curso é obrigatório", statusCode: 400 });
  }

  try {
    const id = uuidv4(); // O UUID é gerado aqui, mas não é devolvido ao usuário
    
    await knex('cursos').insert({ 
      id,
      nome_curso: nome_curso.trim(), 
      carga_horaria: carga_horaria || 0 
    });
    
    // Buscamos o curso criado para retornar o código amigável gerado pelo banco
    const novoCurso = await knex('cursos')
      .where({ id })
      .select('codigo_curso', 'nome_curso', 'carga_horaria')
      .first();

    res.status(201).json(novoCurso);
  } catch (err) {
    res.status(400).json({ error: "Já existe um curso cadastrado com este nome", statusCode: 400 });
  }
});

// 4. Atualizar curso usando o CÓDIGO
router.put('/:codigo', async (req, res) => {
  const { codigo } = req.params;
  const { nome_curso, carga_horaria } = req.body;

  if (!nome_curso) {
    return res.status(400).json({ error: "O título é obrigatório para atualização", statusCode: 400 });
  }

  try {
    const atualizado = await knex('cursos')
      .where({ codigo_curso: codigo }) // Filtra pelo código amigável
      .update({ 
        nome_curso: nome_curso.trim(), 
        carga_horaria: carga_horaria || 0 
      });

    if (!atualizado) {
      return res.status(404).json({ error: "Curso não encontrado para atualizar", statusCode: 404 });
    }

    res.json({ mensagem: "Curso atualizado com sucesso" });
  } catch (error) {
    res.status(400).json({ error: "Erro ao atualizar curso", statusCode: 400 });
  }
});

// 5. Remover um curso usando o CÓDIGO
router.delete('/:codigo', async (req, res) => {
  const { codigo } = req.params;

  try {
    const deletado = await knex('cursos').where({ codigo_curso: codigo }).delete();

    if (!deletado) {
      return res.status(404).json({ error: "Curso não encontrado para exclusão", statusCode: 404 });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Erro ao excluir curso", statusCode: 500 });
  }
});

module.exports = router;