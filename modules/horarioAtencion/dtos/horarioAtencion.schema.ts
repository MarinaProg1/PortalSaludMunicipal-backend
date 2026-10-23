import {z} from 'zod';
import { DiasSemana } from '../enum/diasSemana.enum';

export const HorarioAtencionSchema = z.object({
    body: z.object({
        medico:  z.string().length(24, 'ID del médico inválido').optional().default("Ninguna"),
        diaSemana: z.enum(DiasSemana),
        horaInicio: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        horaFin: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        duracionTurnoMinutos: z.number().default(30),
        activo: z.boolean().default(true)
    }),
});

export type IHorarioAtencionDTO = z.infer<typeof HorarioAtencionSchema>['body'];