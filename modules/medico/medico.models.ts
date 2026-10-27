import { Schema, model } from "mongoose";
import type { IMedico } from './types/medico.interface';
import { DireccionSchema } from "../../utils/direccion.interfaces";
import { TelefonoSchema } from "../../utils/telefono.interfaces";

const medicoSchema = new Schema<IMedico>({
    nombre: { type: String, required: [true, 'El nombre es obligatorio'], uppercase: true, trim: true },
    apellido: { type: String, required: [true, 'El apellido es obligatorio'], uppercase: true, trim: true },
    dni: { type: String, required: true, unique: true, match: [/^[0-9]{7,8}$/, 'DNI inválido'] },
    email: { type: String, required: true, unique: true, lowercase: true },
    especialidades: [{ type: Schema.Types.ObjectId, ref: 'Especialidad', required: true }],
    numeroMatricula: { type: Number, required: true, unique: true, index: true },
    direccion: { type: DireccionSchema, required: true },
    telefono: { type: TelefonoSchema, required: true },
    obraSocial: { type: Schema.Types.ObjectId, ref: 'ObraSocial', default: null },
    activo: { type: Boolean, default: true }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});


medicoSchema.virtual('nombreCompleto').get(function() {
  return `${this.apellido}, ${this.nombre}`;
});

medicoSchema.index({ apellido: 1, nombre: 1 });

const MedicoModel = model<IMedico>('Medico', medicoSchema);
export default MedicoModel;