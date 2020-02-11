module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'users', // nome da tabela
      'avatar_id', // nome da coluna // todo avatar_id da tabela user vai ser tambem um id contido na tabela files.
      {
        type: Sequelize.INTEGER, // vai referenciar o id da imagem
        references: { model: 'files', key: 'id' }, // cria uma chave estrangeira. Passa a tabela a que se refere e a chave que vai ser referenciada
        onUpdate: 'CASCADE', // quando atualizar no files atualiza aqui
        onDelete: 'SET NULL', // se for deletado a chave estrangeira vira null
        allowNull: true,
      }
    );
  },

  down: queryInterface => {
    return queryInterface.removeColumn('users', 'avatar_id');
  },
};
