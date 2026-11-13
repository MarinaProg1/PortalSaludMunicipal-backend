import { z } from 'zod';
import { EstadoTurno } from '../enum/estadoTurno.enum';

const regexHora = /^([01]\d|2[0-3]):[0-5]\d$/;
const regexFecha = /^\d{4}-\d{2}-\d{2}$/;
const mongoIdRegex = /^[0-9a-fA-F]{24}$/;

export const CreateTurnoSchema = z.object({
    query: z.object({
        urgencia: z.enum(['true', 'false']).optional(),
    }).optional(),
    body: z.object({
        medico: z
            .string({ message: 'El ID del médico es obligatorio' })
            .regex(mongoIdRegex, 'ID de Médico inválido'),
        
        paciente: z.string({ message: 'El paciente es obligatorio' }),
        
        especialidad: z
            .string({ message: 'El ID de la especialidad es obligatorio' })
            .regex(mongoIdRegex, 'ID de Especialidad inválido'),
        
        fecha: z
            .string({ message: 'La fecha es obligatoria' })
            .regex(regexFecha, 'La fecha debe tener el formato YYYY-MM-DD')
            .transform((val) => new Date(val)),
        
        hora: z
            .string({ message: 'La hora es obligatoria' })
            .regex(regexHora, 'Formato de hora inválido (HH:mm)'),
        
        estado: z.enum(EstadoTurno).optional().default(EstadoTurno.PENDIENTE),
        activo: z.boolean().optional().default(true),
    }),
}).refine((data) => {
    const esUrgente = data.query?.urgencia === 'true';
    if (!esUrgente) {
        // Para turnos normales, validamos estrictamente que el paciente sea un ObjectId válido de Mongo
        return mongoIdRegex.test(data.body.paciente);
    }
    return true; // Si es urgencia, se permite texto libre (ej: "DNI 40123456 - Juan")
}, {
    message: 'Para turnos normales se requiere un ID de paciente válido.',
    path: ['body', 'paciente'],
});

export const queryUrgenciaSchema = z.object({
    query: z.object({
        urgencia: z.enum(['true', 'false']).optional()
    })
});

export const UpdateTurnoSchema = z.object({
    body: CreateTurnoSchema.shape.body.partial(),
});

// Tipos inferidos automáticamente para usar en controladores y servicios
export type ICreateTurnoDTO = z.infer<typeof CreateTurnoSchema>['body'];
export type IUpdateTurnoDTO = z.infer<typeof UpdateTurnoSchema>['body'];
export type IQueryUrgencia = z.infer<typeof queryUrgenciaSchema>['query'];