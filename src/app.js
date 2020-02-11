import express from 'express';
import path from 'path';
import routes from './routes';

import './database';

class App {
  constructor() {
    this.server = express();

    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.server.use(express.json());
    // adiciona um comando para o navegador acessar arquivos estaticos
    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  routes() {
    this.server.use(routes);
  }
}

// quado usa sucrase troca para
export default new App().server;
// module.exports = new App().server;
// depois de mudar para import as coisas se tentar rodar com o node nao funciona
// então precisa rodar com sucrase
// $ yarn sucrase-node src/server.js
