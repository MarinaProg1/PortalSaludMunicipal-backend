import { z } from 'zod';
import { Types } from 'mongoose';
import { DireccionZodSchema } from '../../../utils/direccion.interfaces';
import { TelefonoZodSchema } from '../../../utils/telefono.interfaces';


const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: "El ID no tiene un formato ObjectId válido"
});

export const MedicoSchema = z.object({
  body: z.object({
    nombre: z.string()
      .trim()
      .min(2, "Mínimo 2 caracteres")
      .max(50)
      .transform(v => v.toUpperCase()),
    
    apellido: z.string()
      .trim()
      .min(2, "Mínimo 2 caracteres")
      .max(50)
      .transform(v => v.toUpperCase()),
    
    dni: z.string()
      .trim()
      .regex(/^[0-9]{7,8}$/, "DNI debe tener 7 u 8 dígitos"), 
    
    email: z.string()
      .trim()
      .email("Email no válido")
      .toLowerCase(),
     
    user: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres').optional(),
  
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
      
    
    especialidades: z.array(objectIdSchema)
      .min(1, "Debe incluir al menos una especialidad")
      .max(5, "Máximo 5 especialidades"),
    
    numeroMatricula: z.number()
      .int()
      .positive("La matrícula debe ser positiva"),
    
    direccion: DireccionZodSchema,
    telefono: TelefonoZodSchema,
    
    obraSocial: objectIdSchema.optional().nullable().default(null),
    
    activo: z.boolean().optional().default(true),
  })
});

export const MedicoUpdateSchema = z.object({
  body: MedicoSchema.shape.body.partial()
});

export type IMedicoDTO = z.infer<typeof MedicoSchema>['body'];
export type IMedicoUpdateDTO = z.infer<typeof MedicoUpdateSchema>['body'];