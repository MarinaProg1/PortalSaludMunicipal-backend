// DTOS: validacion zod de crear y editar obra social (el PUT es partial: manda solo lo que cambia).
// Se conecta con: ../../middlewares/validarDatos.middleware via obrasocial.routes.ts (validarSchema).
import { z } from 'zod';

export const crearObraSocialSchema = z.object({
    body: z.object({
        nombre: z.string({ error: 'El nombre es obligatorio' })
            .trim()
            .min(1, 'El nombre es obligatorio'),
        email: z.email({ error: 'El email debe tener un formato válido' })
            .optional(),
        telefono: z.string({ error: 'El teléfono debe ser texto' })
            .trim()
            .optional(),
    })
});

export const actualizarObraSocialSchema = z.object({
    body: crearObraSocialSchema.shape.body.partial(),
});

export type ICrearObraSocialDTO = z.infer<typeof crearObraSocialSchema>['body'];
export type IActualizarObraSocialDTO = z.infer<typeof actualizarObraSocialSchema>['body'];