import { Document, Schema, model } from "mongoose";
import type { IHorarioAtencion } from "./types/horarioAtencion.interfaces";
import { DiasSemana } from "./enum/diasSemana.enum";

export const horaAMinutos = (hora: string): number => {
  const [h = 0, m = 0] = hora.split(':').map(Number);
  return h * 60 + m;
};

const HorarioAtencionSchema = new Schema<IHorarioAtencion>({
    medico: { 
        type: Schema.Types.ObjectId, 
        ref: "Medico", 
        required: true 
    },
    diaSemana: { 
        type: String, 
        enum: Object.values(DiasSemana), 
        required: true 
    },
    horaInicio: { 
        type: String, 
        required: true 
    }, // Formato "HH:mm" (ej: "08:00")
    horaFin: { 
    type: String, 
    required: true,
          validate: {
              validator: function (this: any, value: string) {
              // En creación 'this.horaInicio' tiene valor; en updates lo busca en 'this.getUpdate()' o en la instancia.
              const horaInicio = this.horaInicio || (this.getUpdate && this.getUpdate().$set?.horaInicio);
              if (!horaInicio || !value) return true;
              return horaAMinutos(value) > horaAMinutos(horaInicio);
      },
      message: 'La horaFin debe ser posterior a la horaInicio'
    },
},
    duracionTurnoMinutos: { 
        type: Number, 
        default: 30 
    }, // Permite calcular turnos dinámicamente
    activo: { 
        type: Boolean, 
        default: true 
    }
}, 
{
    timestamps: true

});
HorarioAtencionSchema.set('toJSON', {
    transform: (documento: Document, horarioRetorno: Record<string, any>) => {
        horarioRetorno.id = horarioRetorno._id;
        delete horarioRetorno._id;
        delete horarioRetorno.__v;
    }
});
export const HorarioAtencion = model<IHorarioAtencion>("HorarioAtencion", HorarioAtencionSchema);