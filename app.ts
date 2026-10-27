import type { Application } from 'express';

import * as dotenv from "dotenv";
dotenv.config();
import cors from 'cors';
import express from 'express';
import { connectDB } from './config/database';


import auditMiddleware from './middlewares/auditoria.middleware';
import errorHandlerMiddleware from './middlewares/errorHandler.middleware';

// --- Modulos (tomas)) ---
import authRoutes from './modules/auth/auth.routes';                          // login y registro
import obraSocialRoutes from './modules/obrasocial/obrasocial.routes';        // CRUD obras sociales
import consultaMedicaRoutes from './modules/consultamedica/consultamedica.routes'; // CRUD consultas

// --- Modulos (compañera) ---
import turnoRoutes from './modules/turno/turno.routes';
import pacienteRoutes from './modules/paciente/paciente.routes';


const app: Application = express();

connectDB();

app.use(express.json());
app.use(auditMiddleware);
app.use(cors());

// --- Rutas(tomas) ---
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/obrasociales', obraSocialRoutes);
app.use('/api/v1/consultasmedicas', consultaMedicaRoutes);

// --- Rutas(compañera) ---
app.use('/api/v1/turnos', turnoRoutes);
app.use('/api/v1/pacientes', pacienteRoutes);


app.use(errorHandlerMiddleware);

const PORT: string | number = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`============SERVIDOR MUNICIPAL ACTIVO==========`);
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
    console.log(`Entorno: ${process.env.ENTORNO || 'Local'} `);
    console.log(`===============================================`);
});