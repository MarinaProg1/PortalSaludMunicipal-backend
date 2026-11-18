import { Schema, model, Document } from 'mongoose';
import { IExcepcionAgenda } from './types/excepcionAgenda.interface';
import { CategoriaMotivo, TipoExcepcion } from './enum/tipoExcepcion.enum';

const ExcepcionAgendaSchema = new Schema<IExcepcionAgenda>(
  {
    medico: {
      type: Schema.Types.ObjectId,
      ref: 'Medico',
      required: true,
    },
    fecha: {
      type: Date,
      required: true,
    },
    tipo: {
      type: String,
      enum: Object.values(TipoExcepcion),
      required: true,
    },
    horaInicio: {
      type: String,
    },
    horaFin: {
      type: String,
    },
    duracionTurnoMinutos: {
      type: Number,
      default: 30,
    },
    motivo: {
      type: String,
      enum: Object.values(CategoriaMotivo),
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

// Solución: Tipamos explícitamente 'this' con el documento y omitimos 'next' si Mongoose maneja promesas, o lo tipamos como any
ExcepcionAgendaSchema.pre('save', function (this: IExcepcionAgenda & Document) {
  if (this.fecha) {
    const fechaIso = this.fecha.toISOString().split('T')[0];
    this.fecha = new Date(`${fechaIso}T00:00:00.000Z`);
  }
});

// El índice compuesto se queda aquí, justo antes de compilar el modelo
ExcepcionAgendaSchema.index(
  { medico: 1, fecha: 1 }, 
  { unique: true, partialFilterExpression: { activo: true } }
);

ExcepcionAgendaSchema.set('toJSON', {
  transform: (documento: any, retorno: Record<string, any>) => {
    retorno.id = retorno._id;
    delete retorno._id;
    delete retorno.__v;
  },
});

export const ExcepcionAgenda = model<IExcepcionAgenda>('ExcepcionAgenda', ExcepcionAgendaSchema);