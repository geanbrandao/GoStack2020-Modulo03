import Notification from '../schemas/Notification';
import User from '../models/User';

class NotificationController {
  async index(req, res) {
    const user = await User.findByPk(req.userId);

    if (!user.provider) {
      return res.status(401).json({
        status: 'nok',
        message: 'Usuário não é um provider',
      });
    }

    // no mongoose a sintaxe é diferente do sequelize
    const notifications = await Notification.find({
      user: req.userId,
    })
      .sort({ createdAt: 'desc' })
      .limit(20);

    return res.json({
      status: 'ok',
      data: notifications,
    });
  }

  async update(req, res) {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id, // parametro da busca
      { read: true }, // campos a serem atualizados
      { new: true } // depois de atualizar retorna o registro atualizado
    );
    return res.json({
      status: 'ok',
      data: notification,
    });
  }
}

export default new NotificationController();
