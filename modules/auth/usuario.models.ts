// MODEL: schema de Usuario en MongoDB (coleccion usuarios). Password SIEMPRE hasheada (bcrypt en controller).
// Se conecta con: ./types/usuario.interface, ./enum/rol.enum. Lo usa auth.controller.ts (login/registro).
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
        debeCambiarPassword: {
    type: Boolean,
    default: true, 
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
    transform: (documento, usuarioRetorno: Record<string, any>) => {
        usuarioRetorno.id = documento._id;
        delete usuarioRetorno._id;
        delete usuarioRetorno.__v;
        delete usuarioRetorno.password;
    },
});

export const Usuario = model<IUsuario>('Usuario', UsuarioSchema, 'usuarios');