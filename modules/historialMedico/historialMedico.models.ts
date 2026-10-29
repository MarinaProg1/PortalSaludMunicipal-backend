import { Schema, model } from 'mongoose';
import type { IHistorialMedico } from './types/historialMedico.interface';

// Subesquema reutilizable para los elementos que requieren texto y fecha de creación
const elementoConFechaSchema = new Schema({
  descripcion: { type: String, required: true },
  fechaDeCreacion: { type: Date, default: Date.now }
}, { _id: true }); // _id: true permite identificar cada ítem individualmente si lo necesitas

const historialMedicoSchema = new Schema({
  paciente: {
    type: Schema.Types.ObjectId,
    ref: 'Paciente',
    required: [true, 'El paciente es obligatorio'],
    unique: true,
  },
  grupoSanguineo: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    required: [true, 'El grupo sanguíneo es obligatorio'],
  },
  // Atributos convertidos a arrays de objetos embebidos con fecha de creación
  alergias: { 
    type: [elementoConFechaSchema], 
    default: [] 
  },
   medicacionActual: { 
    type: [elementoConFechaSchema], 
    default: [] 
  },
  enfermedadesCronicas: { 
    type: [elementoConFechaSchema], 
    default: [] 
  },
 antecedentesFamiliares: { 
  type: String, 
  default: "Sin antecedentes" 
},
  antecedentesQuirurgicos: { 
    type: String,
    default: "Sin antecedentes"
  },
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