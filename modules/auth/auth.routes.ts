import { Router } from 'express';
import { login, registro } from './auth.controller';
import { validarSchema } from '../../middlewares/validarDatos.middleware';
import { loginSchema, registroSchema } from './dtos/auth.schemas';

const router = Router();

router.post('/login', validarSchema(loginSchema), login);
router.post('/registro', validarSchema(registroSchema), registro);

export default router;