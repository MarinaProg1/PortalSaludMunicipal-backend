import type {Request, Response} from "express";
import { HorarioAtencion }  from "./horarioAtencion.models";
import type { IHorarioAtencionDTO } from "./dtos/horarioAtencion.schema";
import { respuestaEstandar } from "../../utils/respuestaEstandar";

const getHorarioAtencion = async (req: Request<unknown, unknown, unknown, IHorarioAtencionDTO>, res: Response) => { 
   try{
        const { medico, diaSemana } = req.query;
        const filtro: Record<string, string> = {};

        if (medico) filtro.medico = medico;
        if (diaSemana) filtro.diaSemana = diaSemana;

        const horario = await HorarioAtencion.find(filtro);

        return respuestaEstandar(res, 200, true, 'Horario de atención obtenido correctamente', horario);    


   }catch(error: any){
         return respuestaEstandar(res, 500, false, 'Error al obtener el horario de atención', error.message);   
   }

};

const createHorarioAtencion = async (req: Request<unknown, unknown, IHorarioAtencionDTO>, res: Response) => {
    try{
         
        const nuevoHorario = await HorarioAtencion.create(req.body);

        return respuestaEstandar(res, 201, true, 'Horario de atención creado correctamente', nuevoHorario);
    }catch(error: any){
        return respuestaEstandar(res, 500, false, 'Error al crear el horario de atención', error.message);
    }   


};

const updateHorarioAtencion = async (req: Request<unknown, unknown, IHorarioAtencionDTO>, res: Response) => {
    try{
        const { id } = req.params as { id: string };
        const horarioActualizado = await HorarioAtencion.findByIdAndUpdate(id, req.body, { new: true });    

        if(!horarioActualizado){
            return respuestaEstandar(res, 404, false, 'Horario de atención no encontrado', null);
        }


        return respuestaEstandar(res, 200, true, 'Horario de atención actualizado correctamente', horarioActualizado);
    }catch(error: any){
        return respuestaEstandar(res, 500, false, 'Error al actualizar el horario de atención', error.message);
        console.log(error.id);
    }   

};
export { getHorarioAtencion, createHorarioAtencion, updateHorarioAtencion};