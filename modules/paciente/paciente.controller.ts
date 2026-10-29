import type { Request, Response } from "express";
import bcrypt from 'bcrypt';
import Paciente from './paciente.models';
import { Usuario } from '../auth/usuario.models';
import type { ICrearPacienteDTO, IQueryPacientes, IActualizarPacienteDTO, IActualizarContactoDireccionDTO } from "./dtos/paciente.schema";
import { respuestaEstandar } from '../../utils/respuestaEstandar';
import mongoose from "mongoose";
import { Rol } from "../auth/enum/rol.enum";

const getPacientes = async (req: Request<unknown, unknown, unknown, IQueryPacientes>, res: Response) => {
    try {
        const { obraSocial, dni } = req.query;
        const filtro: Record<string, string> = {};

        if (obraSocial) filtro['obraSocial.razonSocial'] = obraSocial.toUpperCase();

        if (dni) filtro.dni = dni;

        const pacientes = await Paciente.find(filtro);

        return respuestaEstandar(res, 200, true, 'Pacientes obtenidos exitosamente', pacientes);
    } catch (error: any) {
        return respuestaEstandar(res, 500, false, 'Error al obtener los pacientes', error.message);
    }
};

const getPacienteById = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const paciente = await Paciente.findById(req.params.id).populate('obraSocial');

        if (!paciente) {
            return respuestaEstandar(res, 404, false, 'Paciente no encontrado');
        }

        return respuestaEstandar(res, 200, true, 'Paciente obtenido exitosamente', paciente);
    } catch (error: any) {
        return respuestaEstandar(res, 400, false, 'Error al obtener el paciente', error.message);
    }
};

const createPaciente = async (req: Request<unknown, unknown, ICrearPacienteDTO & { password?: string; user?: string }>, res: Response) => {
    const { email, user: nombreUsuario, password, ...datosPaciente } = req.body;

    try {
        // 1. Construir el filtro dinámicamente para evitar problemas de tipos con undefined
        const condicionesOr: Array<{ email?: string; user?: string }> = [{ email: email.toLowerCase() }];

        if (nombreUsuario) {
            condicionesOr.push({ user: nombreUsuario });
        }

        // Buscamos si ya existe un usuario con el mismo email o nombre de usuario
        const usuarioExistente = await Usuario.findOne({
            $or: condicionesOr
        });

        if (usuarioExistente) {
            // Determinamos qué campo exacto duplicó para dar un mensaje más preciso
            const campoDuplicado = usuarioExistente.email === email.toLowerCase() ? 'correo electrónico' : 'nombre de usuario';
            return respuestaEstandar(res, 400, false, `El ${campoDuplicado} ya se encuentra registrado en el sistema`);
        }

        // 2. Iniciamos la sesión y la transacción de Mongoose
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // 3. Hashear la contraseña
            const passwordPlana = password || datosPaciente.dni; // Password por defecto (ej: DNI) si no viene en el body
            const hashedPassword = await bcrypt.hash(passwordPlana, 10);

           
            // 4. Crear el Usuario dentro de la transacción
const nuevoUsuario = await Usuario.create(
    [
        {
            email,
            user: nombreUsuario || email,
            password: hashedPassword,
            rol: Rol.PACIENTE, 
            debeCambiarPassword: true,
        }
    ],
    { session }
);

            // 5. Crear el Paciente dentro de la transacción
            const nuevoPaciente = await Paciente.create(
                [
                    {
                        ...datosPaciente,
                        email,
                        // usuario: nuevoUsuario[0]._id // Descomenta si guardas la referencia en el schema de paciente
                    }
                ],
                { session }
            );

            // 6. Confirmar transacción
          await session.commitTransaction();
            session.endSession();

            const usuarioCreado = nuevoUsuario[0];
            const pacienteCreado = nuevoPaciente[0];

            return respuestaEstandar(res, 201, true, 'Paciente y usuario creados exitosamente', {
                paciente: pacienteCreado,
                usuario: usuarioCreado ? {
                    id: usuarioCreado.id,
                    email: usuarioCreado.email,
                    user: usuarioCreado.user,
                } : null
            });

        } catch (innerError: any) {
            // Si algo falla dentro de la transacción, hacemos rollback
            await session.abortTransaction();
            session.endSession();
            throw innerError; // Lo lanzamos al catch externo para manejarlo
        }

    } catch (error: any) {
        // Manejo de errores por índice único de MongoDB (por si hay concurrencia exacta)
        if (error?.code === 11000) {
            return respuestaEstandar(res, 409, false, 'El email o el nombre de usuario ya están registrados');
        }

        return respuestaEstandar(res, 500, false, 'Error al crear el paciente y su usuario', error.message);
    }
};
const updatePaciente = async (req: Request<{ id: string }, unknown, IActualizarPacienteDTO>, res: Response) => {
    try {
        const pacienteActualizado = await Paciente.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { 
                returnDocument: 'after', 
                runValidators: true,
                context: 'query'
            }
        );

        if (!pacienteActualizado) {
            return respuestaEstandar(res, 404, false, 'Paciente no encontrado');
        }

        return respuestaEstandar(res, 200, true, 'Paciente actualizado exitosamente', pacienteActualizado);
    } catch (error: any) {
        return respuestaEstandar(res, 400, false, 'Error al actualizar el paciente', error.message);
    }
};

// 2. Endpoint Específico para Dirección, Teléfono y Email
const updateContactoDireccion = async (req: Request<{ id: string }, unknown, IActualizarContactoDireccionDTO>, res: Response) => {
    try {
        // Usamos $set de forma dinámica solo con los campos que llegaron en el body
        const pacienteActualizado = await Paciente.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { 
                returnDocument: 'after', 
                runValidators: true,
                context: 'query'
            }
        );

        if (!pacienteActualizado) {
            return respuestaEstandar(res, 404, false, 'Paciente no encontrado');
        }

        return respuestaEstandar(res, 200, true, 'Datos de contacto y dirección actualizados correctamente', pacienteActualizado);
    } catch (error: any) {
        return respuestaEstandar(res, 400, false, 'Error al actualizar el contacto y dirección', error.message);
    }
};

const deletePaciente = async (req: Request<{ id: string }>, res: Response) => {
    try {
        const pacienteBorrado = await Paciente.findByIdAndDelete(req.params.id);

        if (!pacienteBorrado) {
            return respuestaEstandar(res, 404, false, 'Paciente no encontrado');
        }

        return respuestaEstandar(res, 200, true, 'Paciente eliminado correctamente', pacienteBorrado);
    } catch (error: any) {
        return respuestaEstandar(res, 400, false, 'Error al eliminar el paciente', error.message);
    }
};

export { getPacientes, getPacienteById, createPaciente, deletePaciente, updatePaciente, updateContactoDireccion };