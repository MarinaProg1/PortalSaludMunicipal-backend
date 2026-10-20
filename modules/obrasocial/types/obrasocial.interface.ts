import { Document } from 'mongoose';

export interface IObraSocial extends Document {
    nombre: string;
    telefono?: string;
    email?: string;
    activo: boolean;
}