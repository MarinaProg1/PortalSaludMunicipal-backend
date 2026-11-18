import { Request, Response } from 'express';
import { Usuario } from '../auth/usuario.models';
import Medico from '../medico/medico.models'; 
import Paciente from '../paciente/paciente.models'; 
import { respuestaEstandar } from '../../utils/respuestaEstandar';
import { Rol } from '../auth/enum/rol.enum';

export const obtenerPerfil = async (req: Request, res: Response): Promise<Response> => {
  try {
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return respuestaEstandar(res, 401, false, 'No autorizado: Token no válido o ausente.');
    }

    const usuario = await Usuario.findById(usuarioId).select('-password');
    if (!usuario) {
      return respuestaEstandar(res, 404, false, 'Usuario no encontrado.');
    }

    let datosPersonales = {
      nombre: '',
      apellido: '',
      telefono: '',
      matricula: '',
    };

    // Buscamos en la colección correspondiente según el rol del usuario
    if (usuario.rol === Rol.MEDICO) {
      const medico = await Medico.findOne({ email: usuario.email.toLowerCase() });
      if (medico) {
        datosPersonales = {
          nombre: medico.nombre || '',
          apellido: medico.apellido || '',
          telefono: medico.telefono ? String(medico.telefono) : '',
          matricula: medico.numeroMatricula ? String(medico.numeroMatricula) : '',
        };
      }
    } else if (usuario.rol === Rol.PACIENTE) {
      const paciente = await Paciente.findOne({ email: usuario.email.toLowerCase() });
      if (paciente) {
        datosPersonales = {
          nombre: paciente.nombre || '',
          apellido: paciente.apellido || '',
          telefono: paciente.telefono ? String(paciente.telefono) : '',
          matricula: '',
        };
      }
    }

    return respuestaEstandar(res, 200, true, 'Perfil obtenido exitosamente', {
      id: usuario._id,
      email: usuario.email,
      user: usuario.user,
      rol: usuario.rol,
      ...datosPersonales,
    });
  } catch (error: unknown) {
    const mensajeError = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error al obtener perfil:', mensajeError);
    return respuestaEstandar(res, 500, false, 'Error interno del servidor', mensajeError);
  }
};

export const actualizarPerfil = async (req: Request, res: Response): Promise<Response> => {
  try {
    const usuarioId = req.usuario?.id;
    if (!usuarioId) {
      return respuestaEstandar(res, 401, false, 'No autorizado.');
    }

    const { nombre, apellido, email, telefono } = req.body as {
      nombre?: string;
      apellido?: string;
      email?: string;
      telefono?: string;
    };

    const usuarioActual = await Usuario.findById(usuarioId);
    if (!usuarioActual) {
      return respuestaEstandar(res, 404, false, 'Usuario no encontrado.');
    }

    const emailAnterior = usuarioActual.email;

    // Actualizamos el email en el modelo Usuario
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      usuarioId,
      { email, user: email },
      { new: true, runValidators: true }
    ).select('-password');

    if (!usuarioActualizado) {
      return respuestaEstandar(res, 404, false, 'Usuario no encontrado.');
    }

    // Actualizamos también los datos en su respectiva colección (Médico o Paciente)
    if (usuarioActual.rol === Rol.MEDICO) {
      await Medico.findOneAndUpdate(
        { email: emailAnterior.toLowerCase() },
        { nombre, apellido, email, telefono },
        { new: true, runValidators: true }
      );
    } else if (usuarioActual.rol === Rol.PACIENTE) {
      await Paciente.findOneAndUpdate(
        { email: emailAnterior.toLowerCase() },
        { nombre, apellido, email, telefono },
        { new: true, runValidators: true }
      );
    }

    return respuestaEstandar(res, 200, true, 'Perfil actualizado correctamente', {
      id: usuarioActualizado._id,
      email: usuarioActualizado.email,
      rol: usuarioActualizado.rol,
      nombre: nombre || '',
      apellido: apellido || '',
      telefono: telefono || '',
    });
  } catch (error: unknown) {
    const mensajeError = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error al actualizar perfil:', mensajeError);
    return respuestaEstandar(res, 500, false, 'Error interno del servidor', mensajeError);
  }
};