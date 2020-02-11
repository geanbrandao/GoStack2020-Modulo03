import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';

class User extends Model {
  // metodo chamado automaticamente pelo sequelize
  // os campos que estao aqui no model nao sao um refelxo do que esta na base
  // eles podem ser usados só para o usuario preencher sem ir pra base de dados
  // um campo virtual quer dizer que nao existe na base
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
        provider: Sequelize.BOOLEAN,
      },
      {
        sequelize,
      }
    );
    // hooks sao trechos de código que são executados de forma automatica
    // quando determinadas ações acontecem dentro do código.
    // com o beforeSave a funcao vai ser executada antes de salvar qualquer usuario
    this.addHook('beforeSave', async user => {
      if (user.password) {
        user.password_hash = await bcrypt.hash(user.password, 8);
      }
    });

    return this;
  }

  static associate(models) {
    // isto quer dizer que tem um id de arquivo sendo armazenado dentro do usuario
    this.belongsTo(models.File, {
      foreignKey: 'avatar_id',
      as: 'avatar',
    });
  }

  checkPassword(password) {
    return bcrypt.compare(password, this.password_hash);
  }
}

export default User;
