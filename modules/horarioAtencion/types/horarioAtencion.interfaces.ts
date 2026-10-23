import {Document, Types} from 'mongoose';
import { DiasSemana } from '../enum/diasSemana.enum';

export interface IHorarioAtencion extends Document{
    medico: Types.ObjectId | string,
    diaSemana: DiasSemana,
    horaInicio:string, // Formato "HH:mm" (ej: "08:00")
    horaFin:string,    // Formato "HH:mm" (ej: "13:00")
    duracionTurnoMinutos:number, 
    activo:boolean,
}