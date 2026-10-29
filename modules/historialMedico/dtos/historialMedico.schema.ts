import { z } from 'zod';

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

// Esquema Zod para elementos con descripción y fecha opcional (la fecha se puede autogenerar)
const elementoConFechaSchema = z.object({
  descripcion: z.string().min(1, 'La descripción es obligatoria').max(100),
  fechaDeCreacion: z.date().optional().default(() => new Date()),
});

// Esquema para antecedentes (si tu profesor pidió que también fueran objetos con fecha)
const antecedenteConFechaSchema = z.object({
  descripcion: z.string().max(500),
  fechaDeCreacion: z.date().optional().default(() => new Date()),
});

export const historialMedicoSchema = z.object({
  body: z.object({
    paciente: z.string().regex(objectIdRegex, 'ID de Paciente inválido'),
    grupoSanguineo: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
    
    // Arrays transformados a objetos embebidos
    alergias: z.array(elementoConFechaSchema).default([]),
    enfermedadesCronicas: z.array(elementoConFechaSchema).default([]),
    medicacionActual: z.array(elementoConFechaSchema).default([]),
    
    antecedentesFamiliares: z.string().optional().default("Sin antecedentes"),
    antecedentesQuirurgicos: z.string().optional().default("Sin antecedemtes"),

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

// Esquema para la modificación (hace que los campos sean opcionales usando .partial() o un schema específico)
export const updateHistorialMedicoSchema = z.object({
  body: historialMedicoSchema.shape.body.partial().extend({
    // Puedes exigir o validar algo extra si lo deseas para el update
  })
});
export const agregarMedicacionSchema = z.object({
  body: z.object({
    descripcion: z.string().min(1, 'La descripción del medicamento es obligatoria').max(100, 'El nombre o dosis del medicamento es muy largo'),
  })
});
export const agregarAlergiaSchema = z.object({
  body: z.object({
    descripcion: z.string().min(1, 'La descripción de la alergia es obligatoria').max(100),
  })
});
export const agregarEnfermedadCronicaSchema = z.object({
  body: z.object({
    descripcion: z.string().min(1, 'La descripción de la enfermedad es obligatoria').max(100),
  })
});
export type IAgregarAlergiaDTO = z.infer<typeof agregarAlergiaSchema>['body'];
export type IAgregarEnfermedadCronicaDTO = z.infer<typeof agregarEnfermedadCronicaSchema>['body'];
export type IAgregarMedicacionDTO = z.infer<typeof agregarMedicacionSchema>['body'];
export type IHistorialMedicoDTO = z.infer<typeof historialMedicoSchema>['body'];
export type IUpdateHistorialMedicoDTO = z.infer<typeof updateHistorialMedicoSchema>['body'];