import type { Application } from 'express';

import * as dotenv from "dotenv";
dotenv.config();
import cors from 'cors';
import express from 'express';
import { connectDB } from './config/database';


import auditMiddleware from './middlewares/auditoria.middleware';
import errorHandlerMiddleware from './middlewares/errorHandler.middleware';

import turnoRoutes from './modules/turno/turno.routes';





const app: Application = express();

connectDB();

app.use(express.json());
app.use(auditMiddleware);
app.use(cors());

app.use('/api/v1/turnos', turnoRoutes);


app.use(errorHandlerMiddleware);

const PORT: string | number = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`============SERVIDOR MUNICIPAL ACTIVO==========`);
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
    console.log(`Entorno: ${process.env.ENTORNO || 'Local'} `);
    console.log(`===============================================`);
});