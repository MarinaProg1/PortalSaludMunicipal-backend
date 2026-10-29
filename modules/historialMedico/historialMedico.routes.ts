import { Router } from "express";
import { getHistorialMedico, getHistorialByPaciente, createHistorialMedico, updateHistorialMedico, deleteHistorialMedico, agregarAlergia, agregarMedicacion , agregarEnfermedadCronica} from "./historialMedico.controller";
import { validarSchema } from '../../middlewares/validarDatos.middleware';
import { agregarAlergiaSchema, agregarMedicacionSchema, agregarEnfermedadCronicaSchema } from "./dtos/historialMedico.schema";
const router = Router();

router.get('/', getHistorialMedico);
router.get('/paciente/:pacienteId', getHistorialByPaciente);  
router.post('/', createHistorialMedico);
router.put('/:id', updateHistorialMedico);
router.delete('/:id', deleteHistorialMedico);
router.post('/:id/alergias', validarSchema(agregarAlergiaSchema), agregarAlergia);
router.post('/:id/medicamentos', validarSchema(agregarMedicacionSchema), agregarMedicacion);
router.post('/:id/enfermedad', validarSchema(agregarEnfermedadCronicaSchema), agregarEnfermedadCronica);

export default router;