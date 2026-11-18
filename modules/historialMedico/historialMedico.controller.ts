import type { Request, Response } from 'express';
import HistorialMedico from './historialMedico.models';
import { respuestaEstandar } from '../../utils/respuestaEstandar';
import { obtenerMedicoId, idsPacientesDelMedico, pacientePerteneceAlMedico } from '../../utils/medicoScope';

// Los arrays del historial son subdocumentos { descripcion, fechaDeCreacion },
// pero la interfaz los declara como string[]. Este helper tolera ambas formas.
const descripcionesNormalizadas = (items: unknown): string[] =>
  (Array.isArray(items) ? items : [])
    .map((item: any) => (typeof item === 'string' ? item : item?.descripcion || ''))
    .map((descripcion: string) => descripcion.trim().toLowerCase())
    .filter(Boolean);

// Carga el historial y valida que el medico logueado pueda operar sobre el.
// ADMIN y RECEPCIONISTA no tienen restriccion de paciente.
const buscarHistorialAutorizado = async (req: Request, id: string) => {
  const historial = await HistorialMedico.findById(id);

  if (!historial) {
    return { historial: null, existe: false, autorizado: false };
  }

  const medicoId = obtenerMedicoId(req);

  if (medicoId && !(await pacientePerteneceAlMedico(medicoId, String(historial.paciente)))) {
    return { historial, existe: true, autorizado: false };
  }

  return { historial, existe: true, autorizado: true };
};

const getHistorialMedico = async (req: Request, res: Response) => {
  try {
    const { paciente } = req.query as { paciente?: string };
    const medicoId = obtenerMedicoId(req);
    const filtro: any = { activo: true };

    if (medicoId) {
      // El medico solo ve historiales de pacientes con turnos propios.
      const ids = await idsPacientesDelMedico(medicoId);

      if (paciente) {
        const permitido = ids.some((id) => String(id) === String(paciente));
        if (!permitido) {
          return respuestaEstandar(res, 200, true, 'Historiales obtenidos', []);
        }
        filtro.paciente = paciente;
      } else {
        filtro.paciente = { $in: ids };
      }
    } else if (paciente) {
      filtro.paciente = paciente;
    }

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
    const medicoId = obtenerMedicoId(req);

    if (medicoId && !(await pacientePerteneceAlMedico(medicoId, req.params.pacienteId))) {
      return respuestaEstandar(res, 403, false, 'No tenés acceso al historial de este paciente');
    }

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
    const medicoId = obtenerMedicoId(req);

    if (medicoId) {
      if (!(await pacientePerteneceAlMedico(medicoId, String(req.body.paciente)))) {
        return respuestaEstandar(res, 403, false, 'El paciente no pertenece a los pacientes del médico');
      }
      req.body.ultimaActualizacionPor = medicoId;
    }

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
    const { historial, existe, autorizado } = await buscarHistorialAutorizado(req, req.params.id);

    if (!existe || !historial) return respuestaEstandar(res, 404, false, 'Historial no encontrado');
    if (!autorizado) {
      return respuestaEstandar(res, 403, false, 'No tenés acceso al historial de este paciente');
    }

    const updateData: Record<string, unknown> = { ...req.body };
    const medicoId = obtenerMedicoId(req);
    if (medicoId) updateData.ultimaActualizacionPor = medicoId;

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

// Agrega un elemento evitando duplicados (comparacion sin mayusculas/minusculas).
const agregarElemento = async (
  req: Request<{ id: string }>,
  res: Response,
  campo: 'alergias' | 'medicacionActual' | 'enfermedadesCronicas',
  mensajeDuplicado: string,
  mensajeOk: string,
  mensajeError: string
) => {
  try {
    const { historial, existe, autorizado } = await buscarHistorialAutorizado(req, req.params.id);

    if (!existe || !historial) {
      return respuestaEstandar(res, 404, false, 'Historial médico no encontrado');
    }
    if (!autorizado) {
      return respuestaEstandar(res, 403, false, 'No tenés acceso al historial de este paciente');
    }

    const descripcion = String(req.body.descripcion || '').trim();

    if (!descripcion) {
      return respuestaEstandar(res, 400, false, 'La descripción es obligatoria');
    }

    if (descripcionesNormalizadas(historial[campo]).includes(descripcion.toLowerCase())) {
      return respuestaEstandar(res, 400, false, mensajeDuplicado);
    }

    const update: Record<string, any> = {
      $push: {
        [campo]: { descripcion, fechaDeCreacion: new Date() },
      },
    };

    const medicoId = obtenerMedicoId(req);
    if (medicoId) update.$set = { ultimaActualizacionPor: medicoId };

    const historialActualizado = await HistorialMedico.findByIdAndUpdate(
      req.params.id,
      update,
      { returnDocument: 'after', runValidators: true, context: 'query' }
    );

    if (!historialActualizado) {
      return respuestaEstandar(res, 404, false, 'Historial médico no encontrado');
    }

    return respuestaEstandar(res, 200, true, mensajeOk, historialActualizado);
  } catch (error: any) {
    return respuestaEstandar(res, 400, false, mensajeError, error.message);
  }
};

const agregarAlergia = async (req: Request<{ id: string }>, res: Response) =>
  agregarElemento(
    req,
    res,
    'alergias',
    'Esta alergia ya se encuentra registrada en el historial del paciente',
    'Alergia agregada correctamente',
    'Error al agregar alergia'
  );

const agregarMedicacion = async (req: Request<{ id: string }>, res: Response) =>
  agregarElemento(
    req,
    res,
    'medicacionActual',
    'Este medicamento ya figura en la medicación actual del paciente',
    'Medicamento agregado correctamente',
    'Error al agregar el medicamento'
  );

const agregarEnfermedadCronica = async (req: Request<{ id: string }>, res: Response) =>
  agregarElemento(
    req,
    res,
    'enfermedadesCronicas',
    'Esta enfermedad ya figura en la historia médica del paciente',
    'La enfermedad se agregó correctamente',
    'Error al agregar la nueva enfermedad crónica'
  );

const deleteHistorialMedico = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const { existe, autorizado } = await buscarHistorialAutorizado(req, req.params.id);

    if (!existe) return respuestaEstandar(res, 404, false, 'Historial no encontrado');
    if (!autorizado) {
      return respuestaEstandar(res, 403, false, 'No tenés acceso al historial de este paciente');
    }

    const borrado = await HistorialMedico.findByIdAndUpdate(req.params.id, { activo: false }, { new: true });
    if (!borrado) return respuestaEstandar(res, 404, false, 'Historial no encontrado');
    return respuestaEstandar(res, 200, true, 'Historial archivado (baja lógica)', borrado);
  } catch (error: any) {
    return respuestaEstandar(res, 400, false, 'Error al archivar', error.message);
  }
};

export { getHistorialMedico, getHistorialByPaciente, createHistorialMedico, updateHistorialMedico, agregarMedicacion, agregarAlergia, deleteHistorialMedico, agregarEnfermedadCronica };
