import { Types } from 'mongoose';
import type { RequestMedico } from '../middlewares/autenticar.middleware';
import { Turno } from '../modules/turno/turno.models';

// Devuelve el id de la ficha Medico que dejo resolverMedicoAutenticado.
// Es null para ADMIN y RECEPCIONISTA: esos roles no tienen alcance limitado.
export const obtenerMedicoId = (req: unknown): string | null =>
  (req as RequestMedico).medicoId || null;

// ObjectIds de los pacientes que tienen al menos un turno con el medico.
// Turno.paciente es Mixed, por eso se normaliza con String antes de validar.
export const idsPacientesDelMedico = async (medicoId: string): Promise<Types.ObjectId[]> => {
  const valores = await Turno.distinct('paciente', {
    medico: new Types.ObjectId(medicoId),
  });

  return valores
    .map((valor) => String(valor))
    .filter((valor) => Types.ObjectId.isValid(valor))
    .map((valor) => new Types.ObjectId(valor));
};

// Indica si el paciente tuvo o tiene algun turno con el medico.
// Se consultan las dos representaciones posibles de Turno.paciente (ObjectId o string).
export const pacientePerteneceAlMedico = async (
  medicoId: string,
  pacienteId: string
): Promise<boolean> => {
  if (!Types.ObjectId.isValid(medicoId) || !Types.ObjectId.isValid(pacienteId)) {
    return false;
  }

  const existe = await Turno.exists({
    medico: new Types.ObjectId(medicoId),
    paciente: { $in: [new Types.ObjectId(pacienteId), pacienteId] },
  });

  return Boolean(existe);
};
