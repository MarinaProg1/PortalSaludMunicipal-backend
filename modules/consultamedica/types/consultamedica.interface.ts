// INTERFACE: forma de un documento ConsultaMédica.
// Se conecta con: mongoose (Document/Types),
//                 ../enum/estadoConsulta.enum (EstadoConsulta),
//                 ref a models de otros módulos: 'Paciente' (ella), 'Turno' (ella), 'Medico' (pendiente).
import { Document, Types } from 'mongoose';
import type { EstadoConsulta } from '../enum/estadoConsulta.enum';

export interface IConsultaMedica extends Document {
    id?: Types.ObjectId;
    paciente: Types.ObjectId | string;
    medico: Types.ObjectId | string;
    turno?: Types.ObjectId | string;   // opcional: si vino por turno se linkea
    fecha: Date;                        // hibrida: siempre tiene fecha propia
    motivo: string;
    diagnostico?: string;
    tratamiento?: string;
    observaciones?: string;
    estado: EstadoConsulta;
    activo: boolean;
}