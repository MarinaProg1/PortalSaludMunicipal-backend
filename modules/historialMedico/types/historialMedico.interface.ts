import { Document, Types } from "mongoose";


export interface IHistorialMedico extends Document {
  paciente: Types.ObjectId | string;
  grupoSanguineo: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  alergias: string[];
  enfermedadesCronicas: string[];
  medicacionActual: string[];
  antecedentesFamiliares: string;
  antecedentesQuirurgicos: string;
  habitos: {
    tabaquismo: boolean;
    alcoholismo: boolean;
    drogas: boolean;
  };
  observacionesGenerales: string;
  ultimaActualizacionPor: string; 
  activo: boolean;
}