// MODEL: schema de ObraSocial en MongoDB (coleccion obrasSociales).
// Se conecta con: ./types/obrasocial.interface. Lo usa obrasocial.controller.ts (CRUD).
// OJO: el nombre del model 'ObraSocial' es el que usa Paciente en su ref.
import { Document, Schema, model } from 'mongoose';
import type { IObraSocial } from './types/obrasocial.interface';

const ObraSocialSchema = new Schema<IObraSocial>({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'], 
        unique: [true, 'Esta obra social ya existe'],
        trim: true
    },
    telefono: { 
        type: String,
        trim: true, 
    },
    email: { 
        type: String,
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'El email debe tener un formato válido'],
    },
    activo: { 
        type: Boolean,
        default: true,
    }
},
{
    timestamps: true,
    versionKey: false
});

ObraSocialSchema.set('toJSON', {
    transform: (_documento: Document, obraSocialRetorno: Record<string, any>) => {
        obraSocialRetorno.id = obraSocialRetorno._id;
        delete obraSocialRetorno._id;
        delete obraSocialRetorno.__v;
    },
});

export const ObraSocial = model<IObraSocial>('ObraSocial', ObraSocialSchema, 'obrasSociales');
