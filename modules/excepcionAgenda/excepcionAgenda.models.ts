import { Schema, model } from 'mongoose';
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

ExcepcionAgendaSchema.pre('save', function () {
  if (this.fecha) {
    this.fecha.setHours(0, 0, 0, 0);
  }
});

//El índice compuesto se queda aquí, justo antes de compilar el modelo
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