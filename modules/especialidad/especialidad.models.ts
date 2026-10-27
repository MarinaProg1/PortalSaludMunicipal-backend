import { Schema, model } from "mongoose";
import type { IEspecialidad } from "./types/especialidad.interface";

const EspecialidadSchema = new Schema<IEspecialidad>({
  nombre: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    minlength: 3,
    maxlength: 50
  },
  descripcion: {
    type: String,
    trim: true,
    maxlength: 200,
    default: ""
  },
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  versionKey: false
});

const EspecialidadModel = model<IEspecialidad>('Especialidad', EspecialidadSchema);
export default EspecialidadModel;