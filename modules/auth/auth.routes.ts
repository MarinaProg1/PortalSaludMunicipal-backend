// ROUTES DE AUTH
// Hace: une POST /login y POST /registro con el controller + su validador zod.
// Se conecta con: ./auth.controller, ./dtos/auth.schemas, ../../middlewares/validarDatos.middleware.
// Se monta en app.ts con: app.use('/api/v1/auth', authRoutes)
import { Router } from 'express';
import { login, registro } from './auth.controller';
import { validarSchema } from '../../middlewares/validarDatos.middleware';
import { loginSchema, registroSchema } from './dtos/auth.schemas';

const router = Router();

router.post('/login', validarSchema(loginSchema), login);
router.post('/registro', validarSchema(registroSchema), registro);

export default router;