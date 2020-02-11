module.exports = {
  dialect: 'postgres',
  host: '192.168.99.100',
  username: 'postgres',
  password: 'docker',
  database: 'gobarber',
  port: 5432,
  define: {
    // isso cria uma coluna de created e edited na tabela com a data
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
};
