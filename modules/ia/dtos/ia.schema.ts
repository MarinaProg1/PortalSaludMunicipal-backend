import { z } from 'zod';

export const sugerirAsistenciaSchema = z.object({
    body: z.object({
        pacienteId: z.string()
            .length(24, 'El ID del paciente debe tener 24 caracteres')
            .regex(/^[0-9a-fA-F]{24}$/, 'El ID del paciente no es válido'),
        motivo: z.string().trim().optional(),
        sintomas: z.string().trim().optional()
    })
});

export type ISugerirAsistenciaDTO = z.infer<typeof sugerirAsistenciaSchema>['body'];