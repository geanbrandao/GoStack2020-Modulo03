import User from '../models/User';
import File from '../models/File';

class ProviderController {
  async index(req, res) {
    const providers = await User.findAll({
      where: { provider: true }, // condicao de busca na base
      attributes: ['id', 'name', 'email', 'avatar_id'], // seleciona os campos que quer no retorno
      include: [
        {
          model: File, // inclui os relacionamentos da tabela.
          as: 'avatar',
          attributes: ['name', 'path', 'url'],
        },
      ],
    });

    return res.json({ status: 'ok', providers });
  }
}

export default new ProviderController();
