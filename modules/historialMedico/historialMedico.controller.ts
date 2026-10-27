import type { Request, Response } from 'express';
import HistorialMedico from './historialMedico.models';
import { respuestaEstandar } from '../../utils/respuestaEstandar';


const getHistorialMedico = async (req: Request, res: Response) => {
  try {
    const { paciente } = req.query;
    const filtro: any = { activo: true };
    if (paciente) filtro.paciente = paciente;

    const historiales = await HistorialMedico.find(filtro)
      .populate('paciente', 'nombre apellido dni')
      .populate('ultimaActualizacionPor', 'nombre apellido');

    return respuestaEstandar(res, 200, true, 'Historiales obtenidos', historiales);
  } catch (error: any) {
    return respuestaEstandar(res, 500, false, 'Error al obtener historiales', error.message);
  }
};


const getHistorialByPaciente = async (req: Request<{ pacienteId: string }>, res: Response) => {
  try {
    const historial = await HistorialMedico.findOne({ paciente: req.params.pacienteId, activo: true })
      .populate('paciente');

    if (!historial) return respuestaEstandar(res, 404, false, 'Este paciente aún no tiene historial médico');

    return respuestaEstandar(res, 200, true, 'Historial encontrado', historial);
  } catch (error: any) {
    return respuestaEstandar(res, 500, false, 'Error al buscar historial', error.message);
  }
};

const createHistorialMedico = async (req: Request, res: Response) => {
  try {
    const existe = await HistorialMedico.findOne({ paciente: req.body.paciente });
    if (existe) {
      return respuestaEstandar(res, 409, false, 'El paciente ya posee un historial médico. Use PUT para actualizarlo');
    }

    const nuevo = await HistorialMedico.create(req.body);
    return respuestaEstandar(res, 201, true, 'Historial médico creado', nuevo);
  } catch (error: any) {
    return respuestaEstandar(res, 500, false, 'Error al crear historial', error.message);
  }
};

const updateHistorialMedico = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const actualizado = await HistorialMedico.findByIdAndUpdate(
      req.params.id,
      { ...req.body, ultimaActualizacionPor: req.body.ultimaActualizacionPor },
      { new: true, runValidators: true }
    );
    if (!actualizado) return respuestaEstandar(res, 404, false, 'Historial no encontrado');
    return respuestaEstandar(res, 200, true, 'Historial actualizado correctamente', actualizado);
  } catch (error: any) {
    return respuestaEstandar(res, 400, false, 'Error al actualizar', error.message);
  }
};


const deleteHistorialMedico = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const borrado = await HistorialMedico.findByIdAndUpdate(req.params.id, { activo: false }, { new: true });
    if (!borrado) return respuestaEstandar(res, 404, false, 'Historial no encontrado');
    return respuestaEstandar(res, 200, true, 'Historial archivado (baja lógica)', borrado);
  } catch (error: any) {
    return respuestaEstandar(res, 400, false, 'Error al archivar', error.message);
  }
};

export { getHistorialMedico, getHistorialByPaciente, createHistorialMedico, updateHistorialMedico, deleteHistorialMedico };