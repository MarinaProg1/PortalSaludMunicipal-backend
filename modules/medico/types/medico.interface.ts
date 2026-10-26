import { Document } from "mongoose";

export interface IMedico extends Document {
  nombre: string;
  apellido: string;
  dni: string;
  matricula: string; 
  especialidad: string;
  activo: boolean;
}