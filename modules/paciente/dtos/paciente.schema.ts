import { z } from 'zod';
import {DireccionZodSchema} from '../../../utils/direccion.interfaces';
import { TelefonoZodSchema } from '../../../utils/telefono.interfaces';


export const CrearPacienteSchema = z.object({
    body: z.object({
         nombre: z.string(),
         apellido: z.string(),
         dni: z.string(),
         sexo:z.string(),
         email:z.string(),
         
         user: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres').optional(),
         password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),

         direccion:DireccionZodSchema,
         telefono:TelefonoZodSchema,
         obraSocial: z.string()
           .length(24, 'ID de Obra Social inválido')
           .optional().default("Sin obra social"),
         activo: z.boolean()
    })
})

export const queryPacientesSchema = z.object ({
    query: z.object({
        obraSocial: z.string().optional(),
        dni: z.string().optional()
    })
});

export const ActualizarPacienteSchema = z.object({
    params: z.object({
        id: z.string().length(24, 'ID de paciente inválido')
    }),
    body: z.object({
         nombre: z.string().optional(),
         apellido: z.string().optional(),
         dni: z.string().regex(/^[0-9]{7,8}$/, 'El DNI debe tener 7 u 8 dígitos').optional(),
         sexo: z.string().optional(),
         email: z.string().email('Correo electrónico no válido').optional(),
         direccion: DireccionZodSchema.optional(),
         telefono: TelefonoZodSchema.optional(),
         obraSocial: z.string().length(24, 'ID de Obra Social inválido').nullable().optional(),
         activo: z.boolean().optional()
    })
});

export const ActualizarContactoDireccionSchema = z.object({
    params: z.object({
        id: z.string().length(24, 'ID de paciente inválido')
    }),
    body: z.object({
         email: z.string().email('Correo electrónico no válido').optional(),
         direccion: DireccionZodSchema.optional(),
         telefono: TelefonoZodSchema.optional(),
    }).refine(data => data.email || data.direccion || data.telefono, {
        message: 'Debe proporcionar al menos un campo para actualizar (email, dirección o teléfono)'
    })
});

export type IActualizarPacienteDTO = z.infer<typeof ActualizarPacienteSchema>['body'];
export type IActualizarContactoDireccionDTO = z.infer<typeof ActualizarContactoDireccionSchema>['body'];
export type ICrearPacienteDTO = z.infer<typeof CrearPacienteSchema>['body']
export type IQueryPacientes = z.infer<typeof queryPacientesSchema>['query']