import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format } from 'date-fns';
import pt from 'date-fns/locale/pt';

import User from '../models/User';
import File from '../models/File';
import Appointment from '../models/Appointment';
import Notification from '../schemas/Notification';

class AppointmentController {
  async index(req, res) {
    // valor padrao 1 caso nao seja informado
    const { page = 1 } = req.query;

    const appointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date'],
      limit: 20,
      offset: (page - 1) * 20, // serve para fazer a conta de quantos registros pular de acordo com a pag que esta
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name', 'email'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });

    return res.json({
      status: 'ok',
      data: appointments,
    });
  }

  async strore(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res
        .status(400)
        .json({ status: 'nok', message: 'Campos Inválidos' });
    }

    const { provider_id, date } = req.body;

    /**
     * Check if provider id is a provider
     */
    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!isProvider) {
      return res.status(400).json({
        status: 'nok',
        message: 'Você só pode agendar serviços com providers',
      });
    }

    // validacao - se a data ja nao passou
    // start of hour pega o inicio da hora
    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({
        status: 'nok',
        message: 'Datas passadas não são permitidas',
      });
    }

    // validacao - se a data ja nao esta em uso
    const checkAvalilability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    if (checkAvalilability) {
      return res.status(400).json({
        status: 'nok',
        message: 'Este horário não está disponível',
      });
    }

    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date: hourStart,
    });
    // vai pegar as informacoes do usuario atual
    const user = await User.findByPk(req.userId);
    // o date-fns nao trabalha em cima de caracters que estao entre aspas simples
    // caso precise escrever algo com d
    const formattedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM', às' H:mm'h'",
      { locale: pt }
    );
    // cria a notificacao
    await Notification.create({
      content: `Novo agendamento de ${user.name} para ${formattedDate}`,
      user: provider_id,
    });

    return res.json({
      status: 'ok',
      message: 'Agendado com sucesso',
      data: appointment,
    });
  }
}

export default new AppointmentController();
