import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';

import User from '../models/User';
import File from '../models/File';
import Appointment from '../models/Appointment';
import Notification from '../schemas/Notification';

import Queue from '../../lib/Queue';
import CancellationMail from '../jobs/CancellationMail';

class AppointmentController {
  async index(req, res) {
    // valor padrao 1 caso nao seja informado
    const { page = 1 } = req.query;

    const appointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date', 'past', 'cancelable'],
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

    if (provider_id === req.userId) {
      return res.status(401).json({
        status: 'nok',
        message: 'Provider não pode marcar um appointment para si mesmo.',
      });
    }

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

  async delete(req, res) {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
      ],
    });

    if (!appointment) {
      return res.status(400).json({
        status: 'nok',
        message: 'Appointment não existe',
      });
    }

    if (appointment.user_id !== req.userId) {
      return res.status(401).json({
        status: 'nok',
        message: 'Você não pode cancelar este appointment',
      });
    }

    // remove duas horas do horário de agendamento
    const dateWithSub = subHours(appointment.date, 2);
    console.log(appointment.date, '-', dateWithSub, '-', new Date());
    if (isBefore(dateWithSub, new Date())) {
      return res.status(401).json({
        status: 'nok',
        message:
          'Você só pode cancelar appointments com 2 horas de antecedência',
      });
    }

    appointment.canceled_at = new Date();

    await appointment.save();

    await Queue.add(CancellationMail.key, {
      appointment,
    });

    return res.json({
      status: 'ok',
      appointment,
    });
  }
}

export default new AppointmentController();
