// a importacao fica assim pq o yup nao tem export default dentro dele
import * as Yup from 'yup';
import User from '../models/User';

class UserController {
  // recebe os mesmos parametros do node
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });

    if (!(await schema.isValid(req.body))) {
      console.log(req.body);
      return res.status(400).json({ message: 'Dados incompletos' });
    }

    const userExist = await User.findOne({ where: { email: req.body.email } });

    if (userExist) {
      // passa o body e o sequelize se acha pelo nome dos campos
      return res.status(400).json({ message: 'Email já cadastrado.' });
    }

    const { id, name, email, provider } = await User.create(req.body);

    return res.json({
      usuario: {
        id,
        name,
        email,
        provider,
      },
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    console.log(req.body);
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ message: 'Dados incompletos' });
    }

    let { email } = req.body;
    const { oldPassword } = req.body;

    // userId vem do token
    const user = await User.findByPk(req.userId);

    if (email && email !== user.email) {
      const userExist = await User.findOne({ where: { email } });
      // se tentar mudar para um email que ja existe
      if (userExist) {
        // passa o body e o sequelize se acha pelo nome dos campos
        return res.status(400).json({ message: 'Email já cadastrado.' });
      }
    }

    if (!email) {
      email = user.email;
    }

    // verifica se oldpassword existe
    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ message: 'Senha não confere.' });
    }

    const { id, name, provider } = await user.update(req.body);

    return res.json({
      usuario: {
        id,
        name,
        email,
        provider,
      },
    });
  }
}

export default new UserController();
