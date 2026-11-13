import { z } from 'zod';
import { TipoExcepcion, CategoriaMotivo } from '../enum/tipoExcepcion.enum';

export const excepcionAgendaZodSchema = z.object({
  medico: z.string({error: 'El ID del médico es obligatorio',}).min(1, 'El ID del médico no puede estar vacío'),

  fecha: z.string({error: 'La fecha es obligatoria',
  }).refine((val) => !isNaN(Date.parse(val)), {
    message: 'Formato de fecha inválido',
  }),
  tipo: z.enum(TipoExcepcion, {error: 'El tipo de excepción es obligatorio',
  }),
  horaInicio: z.string().optional(),
  horaFin: z.string().optional(),
  duracionTurnoMinutos: z.number().optional().default(30),
  motivo: z.string({ error: 'El motivo es obligatorio' }).min(3, 'El motivo debe tener al menos 3 caracteres'),
  activo: z.boolean().optional().default(true),
}).refine(
  (data) => {
    if (data.tipo === TipoExcepcion.MODIFICACION_HORARIO) {
      return Boolean(data.horaInicio && data.horaFin);
    }
    return true;
  },
  {
    message: 'La hora de inicio y fin son obligatorias cuando se modifica el horario',
    path: ['horaInicio'],
  }
);