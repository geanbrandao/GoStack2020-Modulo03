import jwt from 'jsonwebtoken';
import * as Yup from 'yup';

import User from '../models/User';
import authConfig from '../../config/auth';

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      console.log(req.body);
      return res.status(400).json({ message: 'Dados incompletos' });
    }

    const { email, password } = req.body;

    // passa so email quando o nome da propriedade e da var sao iguais
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: 'Usuário não existe' });
    }

    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ status: 'nok', message: 'Senha incoreta' });
    }

    const { id, name } = user;

    return res.json({
      user: {
        id,
        name,
        email,
      },
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new SessionController();
