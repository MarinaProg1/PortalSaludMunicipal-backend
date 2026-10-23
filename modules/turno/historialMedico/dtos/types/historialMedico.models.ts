import { Schema, model } from 'mongoose';
import type { IHistorialMedico } from './types/historialMedico.interface';

const historialMedicoSchema = new Schema<IHistorialMedico>({
  paciente: {
    type: Schema.Types.ObjectId,
    ref: 'Paciente',
    required: [true, 'El paciente es obligatorio'],
    unique: true, // CLAVE: no puede tener 2 historiales el mismo paciente
  },
  grupoSanguineo: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: [true, 'El grupo sanguíneo es obligatorio'],
  },
  alergias: { type: [String], default: [] },
  enfermedadesCronicas: { type: [String], default: [] },
  medicacionActual: { type: [String], default: [] },
  antecedentesFamiliares: { type: String, default: "Sin antecedentes" },
  antecedentesQuirurgicos: { type: String, default: "Ninguno" },
  habitos: {
    tabaquismo: { type: Boolean, default: false },
    alcoholismo: { type: Boolean, default: false },
    drogas: { type: Boolean, default: false },
  },
  observacionesGenerales: { type: String },
  ultimaActualizacionPor: { type: Schema.Types.ObjectId, ref: 'Medico' },
  activo: { type: Boolean, default: true }
}, {
  timestamps: true
});

historialMedicoSchema.set('toJSON', {
  transform: (doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

const HistorialMedicoModel = model<IHistorialMedico>('HistorialMedico', historialMedicoSchema);
export default HistorialMedicoModel;