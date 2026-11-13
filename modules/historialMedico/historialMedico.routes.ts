import { Router } from "express";
import { getHistorialMedico, getHistorialByPaciente, createHistorialMedico, updateHistorialMedico, deleteHistorialMedico, agregarAlergia, agregarMedicacion , agregarEnfermedadCronica} from "./historialMedico.controller";
import { validarSchema } from '../../middlewares/validarDatos.middleware';
import { autenticar, permitirRoles } from '../../middlewares/autenticar.middleware';
import { agregarAlergiaSchema, agregarMedicacionSchema, agregarEnfermedadCronicaSchema } from "./dtos/historialMedico.schema";
const router = Router();

const puedeLeer = [autenticar, permitirRoles('ADMIN', 'RECEPCIONISTA', 'MEDICO')];
const puedeAdministrar = [autenticar, permitirRoles('ADMIN', 'MEDICO')];

router.get('/', ...puedeLeer, getHistorialMedico);
router.get('/paciente/:pacienteId', ...puedeLeer, getHistorialByPaciente);  
router.post('/', ...puedeAdministrar, createHistorialMedico);
router.put('/:id', ...puedeAdministrar, updateHistorialMedico);
router.delete('/:id', ...puedeAdministrar, deleteHistorialMedico);
router.post('/:id/alergias', ...puedeAdministrar, validarSchema(agregarAlergiaSchema), agregarAlergia);
router.post('/:id/medicamentos', ...puedeAdministrar, validarSchema(agregarMedicacionSchema), agregarMedicacion);
router.post('/:id/enfermedad', ...puedeAdministrar, validarSchema(agregarEnfermedadCronicaSchema), agregarEnfermedadCronica);

export default router;