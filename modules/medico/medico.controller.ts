import type { Request, Response } from "express";
import Medico from './medico.models';
import { respuestaEstandar } from '../../utils/respuestaEstandar';
import type { IMedicoDTO, IMedicoUpdateDTO } from './dtos/medico.schema';

const getMedico = async (req: Request, res: Response) => {
  try {
    const { nombre, especialidades, page = "1", limit = "10" } = req.query as any;
    const filtro: any = { activo: true };


    if (nombre) filtro.nombre = { $regex: nombre, $options: 'i' };
    if (especialidades) filtro.especialidades = { $in: Array.isArray(especialidades) ? especialidades : [especialidades] };

    const medicos = await Medico.find(filtro)
      .populate('especialidades', 'nombre')
      .populate('obraSocial', 'nombre')
      .sort({ apellido: 1 })
      .skip((Number(page)-1)*Number(limit))
      .limit(Number(limit));

    return respuestaEstandar(res, 200, true, 'Médicos obtenidos', medicos);
  } catch (error: any) {
    return respuestaEstandar(res, 500, false, 'Error al obtener Médicos', error.message);
  }
};

const createMedico = async (req: Request<unknown, unknown, IMedicoDTO>, res: Response) => {
  try {
    
    const { numeroMatricula, dni, email } = req.body;
    if (await Medico.findOne({ numeroMatricula })) return respuestaEstandar(res, 409, false, 'Matrícula ya registrada');
    if (await Medico.findOne({ dni })) return respuestaEstandar(res, 409, false, 'DNI ya registrado');
    if (await Medico.findOne({ email })) return respuestaEstandar(res, 409, false, 'Email ya registrado');

    const nuevo = await Medico.create(req.body);
    return respuestaEstandar(res, 201, true, 'Médico creado exitosamente', nuevo);
  } catch (error: any) {
    return respuestaEstandar(res, 500, false, 'Error al crear', error.message);
  }
};


const updateMedico = async (req: Request<{ id: string }, unknown, IMedicoUpdateDTO>, res: Response) => {
  try {
    const actualizado = await Medico.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!actualizado) return respuestaEstandar(res, 404, false, 'Médico no encontrado');
    return respuestaEstandar(res, 200, true, 'Médico actualizado correctamente', actualizado);
  } catch (error: any) {
    return respuestaEstandar(res, 400, false, 'Error al actualizar', error.message);
  }
};

const deleteMedico = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const borrado = await Medico.findByIdAndUpdate(req.params.id, { activo: false }, { new: true });
    if (!borrado) return respuestaEstandar(res, 404, false, 'Médico no encontrado');
    return respuestaEstandar(res, 200, true, 'Médico desactivado correctamente', borrado);
  } catch (error: any) {
    return respuestaEstandar(res, 400, false, 'Error al eliminar', error.message);
  }
};

export { getMedico, createMedico, updateMedico, deleteMedico };