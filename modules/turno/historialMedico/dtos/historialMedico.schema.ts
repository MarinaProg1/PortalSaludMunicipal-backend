import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const historialMedicoSchema = z.object({
  body: z.object({
    paciente: z.string().regex(objectIdRegex, 'ID de Paciente inválido'),
    grupoSanguineo: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
    alergias: z.array(z.string().max(100)).default([]),
    enfermedadesCronicas: z.array(z.string().max(100)).default([]),
    medicacionActual: z.array(z.string().max(100)).default([]),
    antecedentesFamiliares: z.string().max(500).default("Sin antecedentes"),
    antecedentesQuirurgicos: z.string().max(500).default("Ninguno"),
    habitos: z.object({
      tabaquismo: z.boolean().default(false),
      alcoholismo: z.boolean().default(false),
      drogas: z.boolean().default(false),
    }).optional(),
    observacionesGenerales: z.string().max(500).optional(),
    ultimaActualizacionPor: z.string().regex(objectIdRegex).optional(),
    activo: z.boolean().default(true)
  })
});

export type IHistorialMedicoDTO = z.infer<typeof historialMedicoSchema>['body']