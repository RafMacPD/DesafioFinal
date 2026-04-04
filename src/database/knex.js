const knex = require('knex')({
  client: 'sqlite3',
  connection: { 
    filename: "./escola.sqlite" 
  },
  useNullAsDefault: true 
});

async function inicializarBanco() {
  try {
    // 1. Tabela de Alunos
    if (!await knex.schema.hasTable('alunos')) {
      await knex.schema.createTable('alunos', t => {
        t.uuid('id').primary(); // Chave primária UUID
        t.increments('codigo_aluno'); // Código de pesquisa do aluno
        t.string('nome').notNullable();
        t.string('email').unique().notNullable();
      });
      console.log('Tabela "alunos" criada.');
    }

    // 2. Tabela de Cursos
    if (!await knex.schema.hasTable('cursos')) {
      await knex.schema.createTable('cursos', t => {
        t.uuid('id').primary(); // Chave primária UUID
          t.increments('codigo_curso'); // Código de pesquisa do Curso
        t.string('nome_curso').unique().notNullable();
        t.integer('carga_horaria').notNullable();
      });
      console.log('Tabela "cursos" criada.');
    }

    // 3. Tabela de Matrículas
    if (!await knex.schema.hasTable('matriculas')) {
      await knex.schema.createTable('matriculas', t => {
        t.uuid('id').primary(); // Chave primária UUID
        t.increments('codigo_matricula'); // Código de pesquisa da matricula
        t.uuid('aluno_id').references('id').inTable('alunos').onDelete('CASCADE');
        t.uuid('curso_id').references('id').inTable('cursos').onDelete('CASCADE');
        
        t.string('status').defaultTo('ativa');
        t.unique(['aluno_id', 'curso_id']);
      });
      console.log('Tabela "matriculas" criada.');
    }
  } catch (error) {
    console.error("Erro ao inicializar o banco de dados:", error);
  }
}

module.exports = { knex, inicializarBanco };