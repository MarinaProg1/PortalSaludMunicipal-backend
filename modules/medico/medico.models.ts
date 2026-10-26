import { Schema, model } from 'mongoose';
import type { IMedico } from './types/medico.interface';

const medicoSchema = new Schema<IMedico>({
  nombre: { type: String, required: true, uppercase: true, trim: true },
  apellido: { type: String, required: true, uppercase: true, trim: true },
  dni: { type: String, required: true, unique: true },
  matricula: {
    type: String,
    required: [true, 'La matrícula es obligatoria'],
    unique: true, 
    trim: true,
    uppercase: true,
    index: true
  },
  especialidad: { type: String, required: true },
  activo: { type: Boolean, default: true }
}, { timestamps: true });

const MedicoModel = model<IMedico>('Medico', medicoSchema);
export default MedicoModel;