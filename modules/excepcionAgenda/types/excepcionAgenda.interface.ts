import { Document, Schema } from "mongoose";
import { TipoExcepcion, CategoriaMotivo  } from "../enum/tipoExcepcion.enum";

export interface IExcepcionAgenda extends Document {
  medico: Schema.Types.ObjectId | string; 
  fecha: Date; 
  tipo: TipoExcepcion;
  horaInicio?: string; 
  horaFin?: string;    
  duracionTurnoMinutos?: number;
  motivo: CategoriaMotivo;      
  activo: boolean;
}