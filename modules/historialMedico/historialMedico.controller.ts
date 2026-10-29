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
    // Opcional: si quieres asegurarte de que se guarde la fecha actual en los nuevos elementos si el cliente no la manda
    const updateData = { ...req.body };

    const actualizado = await HistorialMedico.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!actualizado) return respuestaEstandar(res, 404, false, 'Historial no encontrado');
    
    return respuestaEstandar(res, 200, true, 'Historial actualizado correctamente', actualizado);
  } catch (error: any) {
    return respuestaEstandar(res, 400, false, 'Error al actualizar', error.message);
  }
};
const agregarAlergia = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { descripcion } = req.body; 

    if (!descripcion) {
      return respuestaEstandar(res, 400, false, 'La descripción es obligatoria');
    }

    // 1. Verificar si ya existe una alergia con la misma descripción (ignorando mayúsculas/minúsculas)
    const yaExiste = await HistorialMedico.findOne({
      _id: req.params.id,
      alergias: {
        $elemMatch: {
          descripcion: { $regex: new RegExp(`^${descripcion.trim()}$`, 'i') }
        }
      }
    });

    if (yaExiste) {
      return respuestaEstandar(res, 400, false, 'Esta alergia ya se encuentra registrada en el historial del paciente');
    }

    // 2. Si no existe, procedemos a agregarla con $push
    const historialActualizado = await HistorialMedico.findByIdAndUpdate(
      req.params.id,
      { 
        $push: { 
          alergias: { 
            descripcion: descripcion.trim(), 
            fechaDeCreacion: new Date() 
          } 
        } 
      },
      { 
        returnDocument: 'after', 
        runValidators: true,
        context: 'query' 
      }
    );

    if (!historialActualizado) {
      return respuestaEstandar(res, 404, false, 'Historial médico no encontrado');
    }

    return respuestaEstandar(res, 200, true, 'Alergia agregada correctamente', historialActualizado);
  } catch (error: any) {
    return respuestaEstandar(res, 400, false, 'Error al agregar alergia', error.message);
  }
};

const agregarMedicacion = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { descripcion } = req.body;

    // Verificar duplicados en medicacionActual
    const yaExiste = await HistorialMedico.findOne({
      _id: req.params.id,
      medicacionActual: {
        $elemMatch: {
          descripcion: { $regex: new RegExp(`^${descripcion.trim()}$`, 'i') }
        }
      }
    });

    if (yaExiste) {
      return respuestaEstandar(res, 400, false, 'Este medicamento ya figura en la medicación actual del paciente');
    }

    const historialActualizado = await HistorialMedico.findByIdAndUpdate(
      req.params.id,
      { 
        $push: { 
          medicacionActual: { 
            descripcion: descripcion.trim(), 
            fechaDeCreacion: new Date() 
          } 
        } 
      },
      { returnDocument: 'after', runValidators: true, context: 'query' }
    );

    if (!historialActualizado) {
      return respuestaEstandar(res, 404, false, 'Historial médico no encontrado');
    }

    return respuestaEstandar(res, 200, true, 'Medicamento agregado correctamente', historialActualizado);
  } catch (error: any) {
    return respuestaEstandar(res, 400, false, 'Error al agregar el medicamento', error.message);
  }
};

const agregarEnfermedadCronica = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { descripcion } = req.body;

    // Verificar duplicados en de enfermedad crónica
    const yaExiste = await HistorialMedico.findOne({
      _id: req.params.id,
      enfermedadesCronicas: {
        $elemMatch: {
          descripcion: { $regex: new RegExp(`^${descripcion.trim()}$`, 'i') }
        }
      }
    });

    if (yaExiste) {
      return respuestaEstandar(res, 400, false, 'Esta enfermedad ya figura en la historia médica del paciente');
    }

    const historialActualizado = await HistorialMedico.findByIdAndUpdate(
      req.params.id,
      { 
        $push: { 
          enfermedadesCronicas: { 
            descripcion: descripcion.trim(), 
            fechaDeCreacion: new Date() 
          } 
        } 
      },
      { returnDocument: 'after', runValidators: true, context: 'query' }
    );

    if (!historialActualizado) {
      return respuestaEstandar(res, 404, false, 'Historial médico no encontrado');
    }

    return respuestaEstandar(res, 200, true, 'La enfermedad se agregó correctamente', historialActualizado);
  } catch (error: any) {
    return respuestaEstandar(res, 400, false, 'Error al agregar el nueva enfermedad cronica', error.message);
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

export { getHistorialMedico, getHistorialByPaciente, createHistorialMedico, updateHistorialMedico, agregarMedicacion, agregarAlergia, deleteHistorialMedico, agregarEnfermedadCronica };