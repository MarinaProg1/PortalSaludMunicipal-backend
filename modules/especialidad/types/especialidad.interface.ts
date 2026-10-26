import { Document } from "mongoose";

export interface IEspecialidad extends Document {
  nombre: string;
  descripcion: string;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}