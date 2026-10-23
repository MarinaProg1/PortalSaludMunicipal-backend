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
         direccion:DireccionZodSchema,
         telefono:TelefonoZodSchema,
         obraSocial: z.string().length(24, 'ID de Obra Social inválido').optional().default("Ninguna"),
         activo: z.boolean()
    })
})

export const queryPacientesSchema = z.object ({
    query: z.object({
        obraSocial: z.string().optional(),
        dni: z.string().optional()
    })
});
export type ICrearPacienteDTO = z.infer<typeof CrearPacienteSchema>['body']
export type IQueryPacientes = z.infer<typeof queryPacientesSchema>['query']