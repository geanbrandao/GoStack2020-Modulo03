import { Router } from 'express';

import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.post('/user', UserController.store);

routes.post('/session', SessionController.store);

// todos request depois do middleware vai fazer a verificacao do token
routes.use(authMiddleware);

routes.put('/user', UserController.update);

export default routes;
