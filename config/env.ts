import * as dotenv from 'dotenv';

dotenv.config();

const leerObligatoria = (nombre: string): string => {
    const valor = process.env[nombre];
    if (!valor || valor.trim().length === 0) {
        throw new Error(`Falta la variable de entorno ${nombre}`);
    }
    return valor;
};

export const JWT_SECRET = leerObligatoria('JWT_SECRET');

if (JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET debe tener al menos 32 caracteres');
}

export const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
