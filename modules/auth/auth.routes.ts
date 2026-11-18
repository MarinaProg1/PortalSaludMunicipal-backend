// ROUTES DE AUTH
// Hace: une POST /login (público + rate limit), POST /registro (solo ADMIN) y PUT /cambiar-password (autenticado).
// Se conecta con: ./auth.controller, ./dtos/auth.schemas, ../../middlewares/validarDatos.middleware,
//                 ../../middlewares/autenticar.middleware.
// Se monta en app.ts con: app.use('/api/v1/auth', authRoutes)
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, registro, cambiarPasswordPrimerLogin } from './auth.controller';
import { validarSchema } from '../../middlewares/validarDatos.middleware';
import { loginSchema, registroSchema, CambiarPasswordSchema } from './dtos/auth.schemas';
import { autenticar, permitirRoles } from '../../middlewares/autenticar.middleware';

const router = Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { ok: false, message: 'Demasiados intentos. Esperá 15 minutos e intentá de nuevo.' },
});

router.post('/login', loginLimiter, validarSchema(loginSchema), login);
router.post('/registro', autenticar, permitirRoles('ADMIN'), validarSchema(registroSchema), registro);
router.put('/cambiar-password', autenticar, validarSchema(CambiarPasswordSchema), cambiarPasswordPrimerLogin);

export default router;
