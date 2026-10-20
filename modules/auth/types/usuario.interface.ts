import { Document, Types } from 'mongoose';
import type { Rol } from '../enum/rol.enum';

export interface IUsuario extends Document {
    id?: Types.ObjectId;
    email: string;
    user: string;
    password: string;
    rol: Rol;
    activo: boolean;
}