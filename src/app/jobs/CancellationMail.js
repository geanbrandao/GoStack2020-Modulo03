import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

// isso vai representar um job.
class CancellationMail {
  get key() {
    // isso cria uma variavel key que pode ser acessada CancellationMail.key
    return 'CancellationMail'; // retorna uma chave unica. Cada job precisa de um chave unica
  }

  // vai ser chamado para o envio de cada email.
  // a tarefa que vai ser executada quando o processo executar
  async handle({ data }) {
    const { appointment } = data;

    console.log('A fila executou');

    await Mail.sendMail({
      to: `${appointment.provider.name} <${appointment.provider.email}>`,
      subject: 'Agendamento cancelado',
      template: 'cancellation',
      context: {
        // envia as variaveis que o template esta esperando
        provider: appointment.provider.name,
        user: appointment.user.name,
        date: format(
          parseISO(appointment.date),
          "'dia' dd 'de' MMMM', às' H:mm'h'",
          {
            locale: pt,
          }
        ),
      },
    });
    console.log('enviou o email');
  }
}

export default new CancellationMail();
