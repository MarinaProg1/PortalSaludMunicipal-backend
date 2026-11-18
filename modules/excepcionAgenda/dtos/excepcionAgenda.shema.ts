import { z } from 'zod';
import { TipoExcepcion } from '../enum/tipoExcepcion.enum';

const esFechaValida = (valor: string) => {
  const fecha = new Date(`${valor}T00:00:00.000Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor;
};

export const excepcionAgendaZodSchema = z.object({
  body: z.object({
    medico: z.string({ error: 'El ID del médico es obligatorio' }).min(1, 'El ID del médico no puede estar vacío'),

    fecha: z.string({ error: 'La fecha es obligatoria' })
      .regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'El formato de la fecha debe ser YYYY-MM-DD',
      })
      .refine(esFechaValida, {
        message: 'La fecha indicada no es válida.',
      })
      .refine((val) => {
        if (!esFechaValida(val)) {
          return true;
        }

        const hoy = new Date();
        const fechaActualStr = [
          hoy.getFullYear(),
          String(hoy.getMonth() + 1).padStart(2, '0'),
          String(hoy.getDate()).padStart(2, '0'),
        ].join('-');

        return val >= fechaActualStr;
      }, {
        message: 'No se pueden registrar excepciones de agenda para fechas pasadas.',
      }),

    tipo: z.enum(Object.values(TipoExcepcion) as [string, ...string[]], {
      error: 'El tipo de excepción es obligatorio'
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
  ),
});