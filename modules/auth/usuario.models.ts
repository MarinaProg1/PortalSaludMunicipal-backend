import { Schema, model, Document } from 'mongoose';
import type { IUsuario } from './types/usuario.interface';
import { Rol } from './enum/rol.enum';

const UsuarioSchema = new Schema<IUsuario>(
    {
        email: {
            type: String,
            required: [true, 'El email es obligatorio'],
            unique: [true, 'Este email ya está registrado'],
            lowercase: true,
            trim: true,
            match: [/\S+@\S+\.\S+/, 'El email debe tener un formato válido'],
        },
        user: {
            type: String,
            required: [true, 'El nombre de usuario es obligatorio'],
            unique: [true, 'Este nombre de usuario ya está registrado'],
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'La contraseña es obligatoria'],
        },
        rol: {
            type: String,
            enum: Object.values(Rol),
            default: Rol.RECEPCIONISTA,
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

UsuarioSchema.set('toJSON', {
    transform: (_documento: Document, usuarioRetorno: Record<string, any>) => {
        usuarioRetorno.id = usuarioRetorno._id;
        delete usuarioRetorno._id;
        delete usuarioRetorno.__v;
    },
});

export const Usuario = model<IUsuario>('Usuario', UsuarioSchema, 'usuarios');