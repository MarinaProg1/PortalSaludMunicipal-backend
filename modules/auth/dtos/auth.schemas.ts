// DTOS: validacion zod de login (email+password) y registro (user min 3, password min 6, rol opcional).
// Se conecta con: ../../middlewares/validarDatos.middleware via auth.routes.ts (validarSchema).
import { z } from 'zod';
import { Rol } from '../enum/rol.enum';

export const loginSchema = z.object({
    body: z.object({
        email: z.email(),
        password: z.string().min(1, 'La contraseña es obligatoria'),
    }),
});

export const registroSchema = z.object({
    body: z.object({
        email: z.email(),
        user: z.string().min(3, 'El usuario debe tener al menos 3 caracteres'),
        password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
        rol: z.enum([Rol.ADMIN, Rol.RECEPCIONISTA]).optional(),
    }),
});