import './config/env'; // PRIMERO: carga .env y valida JWT_SECRET antes que todo lo demas

import type { Application } from 'express';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { FRONTEND_URL } from './config/env';
import { connectDB } from './config/database';

import auditMiddleware from './middlewares/auditoria.middleware';
import { manejadorErrores, noEncontrado } from './middlewares/errorHandler.middleware';

// --- Modulos (tomas)) ---
import authRoutes from './modules/auth/auth.routes';                          // login y registro
import obraSocialRoutes from './modules/obrasocial/obrasocial.routes';        // CRUD obras sociales
import consultaMedicaRoutes from './modules/consultamedica/consultamedica.routes'; // CRUD consultas

// --- Modulos (compañera) ---
import turnoRoutes from './modules/turno/turno.routes';
import pacienteRoutes from './modules/paciente/paciente.routes';
import medicoRoutes from './modules/medico/medico.routes';
import especialidadRoutes from './modules/especialidad/especialidad.routes';
import historialMedicoRoutes from './modules/historialMedico/historialMedico.routes';
import horarioAtencionRoutes from './modules/horarioAtencion/horarioAtencion.routes';
import excepcionAgendaRoutes from './modules/excepcionAgenda/excepcionAgenda.routes';
import iaRoutes from './modules/ia/ia.routes';
import usuarioRoutes from './modules/auth/usuario.routes';

const app: Application = express();

connectDB();

const origenesPermitidos = [FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'];

app.use(helmet());
app.disable('x-powered-by');
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || origenesPermitidos.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error('Origen no permitido por CORS'));
        },
        credentials: true,
    })
);
app.use(express.json({ limit: '100kb' }));
app.use(auditMiddleware);

// --- Rutas(tomas) ---
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/obrasociales', obraSocialRoutes);
app.use('/api/v1/consultasmedicas', consultaMedicaRoutes);

// --- Rutas(compañera) ---
app.use('/api/v1/turnos', turnoRoutes);
app.use('/api/v1/pacientes', pacienteRoutes);
app.use('/api/v1/medicos', medicoRoutes);
app.use('/api/v1/especialidades', especialidadRoutes);
app.use('/api/v1/historiales', historialMedicoRoutes);
app.use('/api/v1/horarioAtencion', horarioAtencionRoutes);
app.use('/api/v1/ia', iaRoutes);
app.use('/api/v1/excepciones', excepcionAgendaRoutes);
app.use('/api/v1/usuarios', usuarioRoutes)
//app.use(errorHandlerMiddleware);

// 404 y errores van al final, en este orden.
app.use(noEncontrado);
app.use(manejadorErrores);

const PORT: string | number = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`============SERVIDOR MUNICIPAL ACTIVO==========`);
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
    console.log(`Entorno: ${process.env.ENTORNO || 'Local'} `);
    console.log(`===============================================`);
});
