const express = require('express');
const router = express.Router();
const { knex } = require('../database/knex');
const { v4: uuidv4 } = require('uuid');

// LISTAR alunos 
router.get('/', async (req, res) => {
  const { nome, codigo_aluno } = req.query;

  try {
    let query = knex('alunos').select('codigo_aluno', 'nome', 'email');

    if (codigo_aluno) {
      query = query.where({ codigo_aluno });
    } else if (nome) {
      query = query.where('nome', 'like', `%${nome}%`);
    }

    const alunos = await query;
    return res.json(alunos);
  } catch (error) {
    return res.status(500).json({ error: "Erro ao buscar alunos", statusCode: 500 });
  }
});

// CADASTRAR
router.post('/', async (req, res) => {
  const { nome, email } = req.body;

  if (!nome || !email || !nome.trim() || !email.trim()) {
    return res.status(400).json({ error: "Nome e Email são obrigatórios", statusCode: 400 });
  }

  try {
    const id = uuidv4();
    await knex('alunos').insert({ id, nome, email });
    
    const novoAluno = await knex('alunos')
      .where({ id })
      .select('codigo_aluno', 'nome', 'email')
      .first();
    
    return res.status(201).json(novoAluno);
  } catch (err) {
    return res.status(400).json({ error: "Erro ao cadastrar: e-mail já existe", statusCode: 400 });
  }
});

// ATUALIZAR 
router.put('/:identificador', async (req, res) => {
  const { identificador } = req.params;
  const { nome, email } = req.body;

  try {
    const atualizado = await knex('alunos')
      .where('codigo_aluno', identificador)
      .orWhere('nome', identificador)
      .orWhere('email', identificador)
      .update({ nome, email });

    if (!atualizado) {
      return res.status(404).json({ error: "Aluno não encontrado com o identificador fornecido", statusCode: 404 });
    }

    return res.json({ mensagem: "Aluno atualizado com sucesso" });
  } catch (error) {
    return res.status(400).json({ error: "Erro ao atualizar. Verifique os dados ou se o novo e-mail já existe.", statusCode: 400 });
  }
});

/// REMOVER 
router.delete('/:identificador', async (req, res) => {
  const { identificador } = req.params;

  try {
    const alunoParaRemover = await knex('alunos')
      .where('codigo_aluno', identificador)
      .orWhere('nome', identificador)
      .orWhere('email', identificador)
      .select('codigo_aluno', 'nome', 'email')
      .first();

    if (!alunoParaRemover) {
      return res.status(404).json({ error: "Aluno não encontrado", statusCode: 404 });
    }

    await knex('alunos')
      .where({ codigo_aluno: alunoParaRemover.codigo_aluno })
      .delete();

    // 3. Aluno removido
    return res.json({
      mensagem: "Aluno removido com sucesso",
      alunoRemovido: alunoParaRemover
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao excluir aluno", statusCode: 500 });
  }
});

module.exports = router;