import { Document, Types } from "mongoose";
import type { IDireccion } from "../../../utils/direccion.interfaces";
import type { ITelefono } from "../../../utils/telefono.interfaces";
import type { IObraSocial } from "../../obrasocial/types/obrasocial.interface";
import type { IEspecialidad } from "../../especialidad/types/especialidad.interface";

export interface IMedico extends Document{
  nombre: string,
  apellido: string,
  dni: string,
  email: string,
  especialidades: Types.ObjectId[] | IEspecialidad[],
  numeroMatricula: number,
  direccion: IDireccion,
  telefono: ITelefono,
  obraSocial?: Types.ObjectId | IObraSocial | null,
  activo: boolean,
  nombreCompleto?: string 
}