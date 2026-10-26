import { z } from 'zod';

export const MedicoSchema = z.object({
  body: z.object({
    nombre: z.string().min(2).max(50),
    apellido: z.string().min(2).max(50),
    dni: z.string().length(8, 'DNI debe tener 8 digitos'),
    matricula: z.string()
      .min(4, 'Mínimo 4 caracteres')
      .max(10, 'Máximo 10 caracteres')
      .regex(/^[0-9]+$/, 'La matrícula solo debe contener números')
      .transform(val => val.trim()),
    especialidad: z.string().min(3),
    activo: z.boolean().default(true)
  })
});