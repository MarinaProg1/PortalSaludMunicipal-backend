import { Schema, model, Document } from 'mongoose';
import type { ITurno } from './types/turno.interface';
import { EstadoTurno } from './estadoTurno.emun';
// tenemos que ver que por pacientes y especialidad solo se pueda crear un turno diario.

const TurnoSchema = new Schema<ITurno>(
  {
    paciente: {
      type: Schema.Types.ObjectId,
      ref: 'Paciente',
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
    }, // Formato "HH:mm" (ej: "08:30")
    estado: {
      type: String,
      enum: Object.values(EstadoTurno),
      default: EstadoTurno.PENDIENTE, // O PENDIENTE según tu enum
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

// Índice compuesto para evitar que dos pacientes reserven el mismo turno exacto
TurnoSchema.index({ medico: 1, fecha: 1, hora: 1 }, { unique: true });

TurnoSchema.set('toJSON', {
  transform: (documento: Document, turnoRetorno: Record<string, any>) => {
    turnoRetorno.id = turnoRetorno._id;
    delete turnoRetorno._id;
    delete turnoRetorno.__v;
  },
});

export const Turno = model<ITurno>('Turno', TurnoSchema);