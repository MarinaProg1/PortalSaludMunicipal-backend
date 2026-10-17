import {Document, Types} from 'mongoose';
import type {IMedico} from '../../medico/types/medico.interface';
import type {IPaciente} from '../../pacientes/types/paciente.interface';
import type {IEspecialidad} from '../../especialidad/types/especialidad.interface';
import { EstadoTurno } from '../emun/estadoTurno.emun';

export interface ITurno extends Document {
  id?: Types.ObjectId,
  paciente: Types.ObjectId | string | IPaciente;
  medico: Types.ObjectId | string | IMedico;
  especialidad: Types.ObjectId | string | IEspecialidad;
  fecha: Date;
  hora: string; 
  estado: EstadoTurno;
  activo: boolean;
}