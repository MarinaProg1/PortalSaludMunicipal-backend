import { Schema } from 'mongoose';
import { z } from 'zod';

export interface IDireccion {
  calle: string;
  numero: number;
  piso?: string ;
  departamento?: string;
  barrio?: string;
}
export const DireccionZodSchema = z.object({
  calle: z.string().min(1, 'La calle es requerida'),
  numero: z.number().int().positive('El número debe ser un entero positivo'),
  piso: z.string().optional().default(""),
  departamento: z.string().optional().default(""),
  barrio: z.string().optional().default("")
});

export const DireccionSchema = new Schema<IDireccion>({
  calle: { type: String, required: true },
  numero: { type: Number, required: true },
  piso: { type: String},
  departamento: { type: String},
  barrio: { type: String}
}, { 
  _id: false
});