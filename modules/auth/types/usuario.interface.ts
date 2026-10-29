// INTERFACE: forma de un documento Usuario (email, user, password hasheada, rol, activo).
// Se conecta con: mongoose (Document/Types) y ../enum/rol.enum (Rol).
import { Document, Types } from 'mongoose';
import type { Rol } from '../enum/rol.enum';

export interface IUsuario extends Document {
    id?: Types.ObjectId;
    email: string;
    user: string;
    password: string;
    rol: Rol;
    activo: boolean;
    debeCambiarPassword?: boolean;
}