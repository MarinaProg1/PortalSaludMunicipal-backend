import { Document, Types } from "mongoose";
import type {IDireccion} from "../../../utils/direccion.interfaces";
import type {ITelefono } from "../../../utils/telefono.interfaces";
import { pacienteSexo } from "../enum/pacienteSexo.enum";


export interface IPaciente extends Document{
    id?: Types.ObjectId,
    nombre: string,
    apellido: string,
    dni:string,
    sexo: pacienteSexo,
    email: string,
    direccion: IDireccion,
    telefono:ITelefono,
    obraSocial?: Types.ObjectId | string | null;
    numeroAfiliado?: string | null;
    activo: boolean  
}