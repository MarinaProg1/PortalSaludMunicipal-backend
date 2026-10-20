// INTERFACE: forma de una obra social (nombre unico, email y telefono opcionales, activo para baja logica).
// Se conecta con: mongoose (Document) y ../obrasocial.models.ts.
import { Document } from 'mongoose';

export interface IObraSocial extends Document {
    nombre: string;
    telefono?: string;
    email?: string;
    activo: boolean;
}