import { z } from 'zod';

export const crearEspecialidadSchema = z.object({
  body: z.object({
    nombre: z.string({ error: "El nombre es obligatorio" })
      .trim()
      .min(3, "Mínimo 3 caracteres")
      .max(50, "Máximo 50 caracteres"),
    descripcion: z.string().trim().max(200).optional().default(""),
    activo: z.boolean().optional().default(true)
  })
});

export const actualizarEspecialidadSchema = z.object({
  body: z.object({
    nombre: z.string().trim().min(3).max(50).optional(),
    descripcion: z.string().trim().max(200).optional(),
    activo: z.boolean().optional()
  }),
  params: z.object({
    id: z.string().min(1, "Id requerido")
  })
});

export type ICrearEspecialidadDTO = z.infer<typeof crearEspecialidadSchema>['body'];
export type IActualizarEspecialidadDTO = z.infer<typeof actualizarEspecialidadSchema>;