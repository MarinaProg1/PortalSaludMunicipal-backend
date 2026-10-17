import { Schema } from 'mongoose';
import { z } from 'zod';

export enum TipoTelefono {
    CELULAR = 'celular',
    FIJO = 'fijo',
    TRABAJO = 'trabajo',
}

export interface ITelefono {
  tipo:TipoTelefono;
  codigoArea: string;
  numero: string;
}

export const TelefonoZodSchema = z.object({
  tipo: z.enum(TipoTelefono),
  codigoArea: z.string().min(2, 'Código de área inválido'),
  numero: z.string().min(6, 'Número de teléfono inválido')
});

export const TelefonoSchema = new Schema<ITelefono>({
  tipo: { 
    type: String, 
    enum:TipoTelefono, 
    required: true 
  },
  codigoArea: { type: String, required: true },
  numero: { type: String, required: true }
}, { 
  _id: false
});