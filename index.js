const express = require('express');
const cors = require('cors');
const knex = require('knex')({
  client: 'sqlite3',
  connection: { filename: "./escola.sqlite" },
  useNullAsDefault: true
});

const app = express();
app.use(cors());
app.use(express.json());

// --- INICIALIZAÇÃO DO BANCO ---
async function inicializar() {
  if (!await knex.schema.hasTable('alunos')) {
    await knex.schema.createTable('alunos', t => {
      t.increments('id');
      t.string('nome').notNullable();
      t.string('email').unique().notNullable();
    });
  }
  if (!await knex.schema.hasTable('cursos')) {
    await knex.schema.createTable('cursos', t => {
      t.increments('id');
      t.string('nome_curso').unique().notNullable();
      t.integer('carga_horaria').notNullable();
    });
  }
  if (!await knex.schema.hasTable('matriculas')) {
    await knex.schema.createTable('matriculas', t => {
      t.increments('id');
      t.integer('aluno_id').references('id').inTable('alunos');
      t.integer('curso_id').references('id').inTable('cursos');
      t.string('status').defaultTo('ativa'); // ativa, cancelada, concluida
      t.unique(['aluno_id', 'curso_id']); 
    });
  }
}
inicializar();

// --- ENDPOINTS DE MATRÍCULA ---

app.post('/matriculas', async (req, res) => {
  const { aluno_id, curso_id } = req.body;

  try {
    // Validação de existência
    const aluno = await knex('alunos').where({ id: aluno_id }).first();
    const curso = await knex('cursos').where({ id: curso_id }).first();
    if (!aluno || !curso) return res.status(404).json({ erro: "Aluno ou Curso inexistente" });

    // Limite de 5 matrículas ativas
    const ativas = await knex('matriculas').where({ aluno_id, status: 'ativa' }).count('id as total').first();
    if (ativas.total >= 5) return res.status(400).json({ erro: "Limite de 5 matrículas ativas atingido" });

    const [id] = await knex('matriculas').insert({ aluno_id, curso_id, status: 'ativa' });
    res.status(201).json({ id, status: 'ativa' });
  } catch (e) {
    res.status(400).json({ erro: "Aluno já matriculado neste curso" });
  }
});

app.get('/matriculas', async (req, res) => {
  const lista = await knex('matriculas')
    .join('alunos', 'matriculas.aluno_id', 'alunos.id')
    .join('cursos', 'matriculas.curso_id', 'cursos.id')
    .select('matriculas.*', 'alunos.nome as nome_aluno', 'cursos.nome_curso');
  res.json(lista);
});

app.patch('/matriculas/:id', async (req, res) => {
  const { status } = req.body;
  await knex('matriculas').where({ id: req.params.id }).update({ status });
  res.json({ mensagem: "Status atualizado" });
});

// --- CRUD DE ALUNOS ---

// Listar todos
app.get('/alunos', async (req, res) => {
  const resultado = await knex('alunos').select('*');
  res.json(resultado);
});

// Criar aluno
app.post('/alunos', async (req, res) => {
  const { nome, email } = req.body;
  try {
    const [id] = await knex('alunos').insert({ nome, email });
    res.status(201).json({ id, nome, email });
  } catch (err) {
    res.status(400).json({ erro: "Email já cadastrado ou dados inválidos" });
  }
});

// Atualizar aluno
app.put('/alunos/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, email } = req.body;
  await knex('alunos').where({ id }).update({ nome, email });
  res.json({ mensagem: "Aluno atualizado com sucesso" });
});

// Deletar aluno
app.delete('/alunos/:id', async (req, res) => {
  const { id } = req.params;
  await knex('alunos').where({ id }).delete();
  res.status(204).send();
});

// --- CRUD DE CURSOS ---

// Listar todos
app.get('/cursos', async (req, res) => {
  const resultado = await knex('cursos').select('*');
  res.json(resultado);
});

// Criar curso
app.post('/cursos', async (req, res) => {
  const { nome_curso, carga_horaria } = req.body;
  const [id] = await knex('cursos').insert({ nome_curso, carga_horaria });
  res.status(201).json({ id, nome_curso, carga_horaria });
});

// Atualizar curso
app.put('/cursos/:id', async (req, res) => {
  const { id } = req.params;
  const { nome_curso, carga_horaria } = req.body;
  await knex('cursos').where({ id }).update({ nome_curso, carga_horaria });
  res.json({ mensagem: "Curso atualizado com sucesso" });
});

// Deletar curso
app.delete('/cursos/:id', async (req, res) => {
  const { id } = req.params;
  await knex('cursos').where({ id }).delete();
  res.status(204).send();
});


app.get('/alunos', async (req, res) => res.json(await knex('alunos')));
app.post('/alunos', async (req, res) => {
    const { nome, email } = req.body;
    if(!nome || !email) return res.status(400).json({erro: "Campos obrigatórios"});
    try {
        await knex('alunos').insert({nome, email});
        res.status(201).send();
    } catch(e) { res.status(400).json({erro: "Email duplicado"}); }
});
app.get('/cursos', async (req, res) => res.json(await knex('cursos')));
app.post('/cursos', async (req, res) => {
    const { nome_curso, carga_horaria } = req.body;
    if(!nome_curso) return res.status(400).json({erro: "Título obrigatório"});
    await knex('cursos').insert({nome_curso, carga_horaria});
    res.status(201).send();
});

app.listen(3000, () => console.log("Servidor ON em lhttp://localhost:3000"));