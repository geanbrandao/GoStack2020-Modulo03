import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore } from 'date-fns';

import User from '../models/User';
import Appointment from '../models/Appointment';

class AppointmentController {
  async strore(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res
        .status(400)
        .json({ status: 'nok', message: 'Campos Imcompletos' });
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

    return res.json({
      status: 'ok',
      message: 'Agendado com sucesso',
      data: appointment,
    });
  }
}

export default new AppointmentController();
