import multer from 'multer';
import crypto from 'crypto';
import { extname, resolve } from 'path';

// exportar um objeto de configuracao
export default {
  storage: multer.diskStorage({
    destination: resolve(__dirname, '..', '..', 'tmp', 'uploads'),
    filename: (req, file, cb) => {
      crypto.randomBytes(16, (err, res) => {
        if (err) return cb(err);

        // first param é null
        return cb(null, res.toString('hex') + extname(file.originalname));
      });
    },
  }),
};
