import { Schema, model, Document } from 'mongoose';
import type { ITurno } from './types/turno.interface';
import { EstadoTurno } from './enum/estadoTurno.enum';

const TurnoSchema = new Schema<ITurno>(
  {
    paciente: {
      type: Schema.Types.Mixed, // Permite guardar tanto un ObjectId (normal) como un String (DNI / Nombre en urgencias)
      required: true,
    },
    medico: {
      type: Schema.Types.ObjectId,
      ref: 'Medico',
      required: true,
    },
    especialidad: {
      type: Schema.Types.ObjectId,
      ref: 'Especialidad',
      required: true,
    },
    fecha: {
      type: Date,
      required: true,
    },
    hora: {
      type: String,
      required: true,
    }, 
    estado: {
      type: String,
      enum: Object.values(EstadoTurno),
      default: EstadoTurno.PENDIENTE,
      required: true,
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Índice parcial: solo aplicamos unicidad estricta para turnos normales donde paciente es un ObjectId
TurnoSchema.index(
  { paciente: 1, especialidad: 1, fecha: 1 }, 
  { 
    unique: true, 
    partialFilterExpression: { paciente: { $type: "objectId" } } 
  }
);

TurnoSchema.set('toJSON', {
  transform: (documento: Document, turnoRetorno: Record<string, any>) => {
    turnoRetorno.id = turnoRetorno._id;
    delete turnoRetorno._id;
    delete turnoRetorno.__v;
  },
});

export const Turno = model<ITurno>('Turno', TurnoSchema);