import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import ProviderController from './app/controllers/ProviderController';
import AppointmentController from './app/controllers/AppointmentController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/user', UserController.store);

routes.post('/session', SessionController.store);

// todos request depois do middleware vai fazer a verificacao do token
routes.use(authMiddleware);

routes.put('/user', UserController.update);

routes.get('/providers', ProviderController.index);

// agendar servicos
routes.post('/appointment', AppointmentController.strore);

// single para upar um arq e file é o nome do campo do arquivo
routes.post('/files', upload.single('file'), FileController.store);

export default routes;
