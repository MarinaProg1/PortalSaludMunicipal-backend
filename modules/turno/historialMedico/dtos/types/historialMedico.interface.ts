import { Document } from "mongoose";
import type { IPaciente } from "../../pacientes/types/paciente.interface";

export interface IHistorialMedico extends Document {
  paciente: IPaciente | string;
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
  ultimaActualizacionPor: string; // id del medico que lo edito
  activo: boolean;
}