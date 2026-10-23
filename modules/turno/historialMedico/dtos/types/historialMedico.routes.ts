import { Router } from "express";
import { getHistorialMedico, getHistorialByPaciente, createHistorialMedico, updateHistorialMedico, deleteHistorialMedico } from "./historialMedico.controller";

const router = Router();

router.get('/', getHistorialMedico);
router.get('/paciente/:pacienteId', getHistorialByPaciente); // nueva ruta diferenciadora
router.post('/', createHistorialMedico);
router.put('/:id', updateHistorialMedico);
router.delete('/:id', deleteHistorialMedico);

export default router;