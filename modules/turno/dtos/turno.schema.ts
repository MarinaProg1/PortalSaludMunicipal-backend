import { z } from 'zod';
import { EstadoTurno } from '../emun/estadoTurno.emun';

const regexHora = /^([01]\d|2[0-3]):[0-5]\d$/;
const regexFecha = /^\d{4}-\d{2}-\d{2}$/;

export const CreateTurnoSchema = z.object({
    body: z.object({
        medico:z.string().length(24, 'ID de Médico inválido').optional().default("Ninguna"),
        paciente:z.string().length(24, 'ID de Paciente inválido').optional().default("Ninguna"),
        especialidad:z.string().length(24, 'ID de Especialidad inválido').optional().default("Ninguna"),
        fecha: z
            .string({ message: 'La fecha es obligatoria' })
            .regex(regexFecha, 'La fecha debe tener el formato YYYY-MM-DD (ej: 2026-10-12)')
            .transform((val) => new Date(val)),
        hora: z
            .string({ message: 'La hora es obligatoria' })
            .regex(regexHora, 'La hora debe tener el formato HH:mm válido (ej: 08:30)'),
        estado: z.enum(EstadoTurno).optional().default(EstadoTurno.PENDIENTE),
        activo: z.boolean().optional().default(true),
    }),
});

export const queryUrgenciaSchema = z.object({
    query: z.object({
        urgencia: z.enum(['true', 'false']).optional()
    })
});

export const UpdateTurnoSchema = CreateTurnoSchema.partial();


export type ICreateTurnoDTO = z.infer<typeof CreateTurnoSchema>['body'];
export type IUpdateTurnoDTO = z.infer<typeof UpdateTurnoSchema>['body'];
export type IQueryUrgencia = z.infer<typeof queryUrgenciaSchema>['query']