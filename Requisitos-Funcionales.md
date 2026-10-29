# REQUISITOS FUNCIONALES SISTEMAS DE TURNOS.

## Módulo 1: Autenticación, Autorización y Roles

- **RF-1.1** - Sistema de Roles: El sistema debe manejar al menos tres niveles de acceso: CIUDADANO (Paciente), RECEPCIONISTA (Gestión diaria) y ADMIN (Gestión de configuración y personal).

- **RF-1.2** - Autenticación de Ciudadanos (Baja Fricción): El ciudadano ingresará al sistema utilizando únicamente su número de DNI y su Teléfono. Si los datos coinciden con un registro existente, se emite su sesión (JWT). Si no existe, el sistema lo registra automáticamente en ese momento. No se utilizarán contraseñas.

- **RF-1.3** - Autenticación del Personal: Los Recepcionistas y Administradores ingresarán mediante Correo Electrónico y Contraseña encriptada, generando un JWT con validación de rol.

- **RF-1.4** - Protección de Rutas: El Backend debe rechazar (HTTP 401/403) cualquier intento de acceso a endpoints protegidos si el usuario no presenta un token válido o no posee el rol necesario.

## Módulo 2: Gestión de Especialidades (Solo ADMIN)

- **RF-2.1** - Catálogo de Especialidades: El sistema debe permitir crear, listar, modificar y dar de baja (borrado lógico) especialidades médicas (ej. Pediatría, Odontología). Los campos obligatorios son, nombre, descripcion, activo (para el borrado logico)

- **RF-2.2** Unicidad y Restricciones:El sistema debe garantizar la unicidad de las especialidades mediante las siguiente regla de validación:
- No se permitirá registrar dos especialidades con la mismo nombre (ignorando mayúsculas, minúsculas y espacios innecesarios).

- **RF-2.3** - Protección de Rutas: El Backend debe rechazar (HTTP 401/403) cualquier intento de acceso a endpoints protegidos si el usuario no presenta un token válido o no posee el rol (ADMIN).

## Módulo 3: Gestión de obrasSociales (ADMIN)

- **RF-3.1** - Catálogo de ObrasSociales: El sistema debe permitir crear, listar, modificar y dar de baja (borrado lógico) ObrasSociales. Los campos obligatorios son, razonSocial, cuit, direccion, telefono (Reutilización del esquema base de telefono.interfaces.ts y direccion.interfaces.ts), activo (para el borrado logico)

- **RF-3.2** Unicidad y Restricciones:El sistema debe garantizar la unicidad de las Obras Sociales mediante las siguientes reglas de validación:

-No se permitirá el registro o modificación de una Obra Social con un CUIT que ya exista en el sistema.
-No se permitirá registrar dos Obras Sociales con la misma Razón Social (ignorando mayúsculas, minúsculas y espacios innecesarios).

- **RF-3.3** - Protección de Rutas: El Backend debe rechazar (HTTP 401/403) cualquier intento de acceso a endpoints protegidos si el usuario no presenta un token válido o no posee el rol (ADMIN).

## Módulo 4: Gestión Personal Médico (ADMIN-MEDICO(parcial))

- **RF-4.1** - Catálogo de Medico: El sistema debe permitir crear, listar, modificar y dar de baja (borrado lógico) médicos.

- **RF-4.2** -RF-4.2 - Alta de Médicos con Creación de Usuario Asociado
  Descripción:
  -El sistema debe permitir registrar un nuevo médico en la plataforma. La operación debe ser atómica, de modo que el alta del perfil profesional del médico y la creación de su cuenta de usuario en el sistema ocurran de manera conjunta.

  Datos Obligatorios (Payload del Médico):

-nombre: Nombre/s del médico (String).
-apellido: Apellido/s del médico (String).
-dni: Documento Nacional de Identidad (String, único).
-email: Correo electrónico de contacto y de acceso (String, único, validado con formato de email).
-numeroMatricula: Número de matrícula profesional (String, único).
-especialidades: Listado de identificadores asociados (Array<ObjectId> referenciando a la colección de Especialidades).
-direccion: Estructura de dirección, reutilizando el esquema base definido en direccion.interfaces.ts.
-telefono: Estructura de teléfono, reutilizando el esquema base definido en telefono.interfaces.ts.
-obrasSociales: Listado de obras sociales asociadas (Array<ObjectId> referenciando a la colección de ObrasSociales).
-activo: Indicador de estado para soporte de borrado lógico (Boolean, por defecto true).

Reglas de Negocio y Transaccionalidad:
-Operación Atómica (Transacción de Base de Datos):Se debe iniciar una sesión de transacción (ClientSession en Mongoose / Replica Set).Se persiste el documento del médico en la colección correspondiente.Utilizando el \_id generado del médico, se crea de forma vinculada el registro en la colección de Usuarios (medicoId apuntando al médico, asignando el rol correspondiente Rol.MEDICO, el email y la contraseña hasheada).

-Manejo de Errores y Rollback:
Si alguna de las operaciones falla (por ejemplo, duplicidad de DNI, email o matrícula, o errores de validación de esquema), la transacción debe abortarse por completo (abortTransaction), revirtiendo cualquier inserción parcial para evitar registros huérfanos o inconsistencias en el sistema.

- **RF-4.3** Unicidad y Restricciones:El sistema debe garantizar la unicidad de Medico mediante las siguientes reglas de validación:

-No se permitirá registrar dos Medicos con el mismo numero de matricula
-No se permitirá registrar dos Medicos con del mismo DNI

- **RF-4.4** - Modificación de Médicos: El sistema debe permitir modificar los datos de médicos. Los usuarios con rol de ADMIN, podran modificar cualquiera de los campos. Los usuarios con rol de MEDICO solo podran modificar email, direccion y telefono

- **RF-4.5** - Borrado Lógico: No se podrán eliminar médicos físicamente de la base de datos para preservar el historial. Se utilizará un estado activo: booleano. Si se inactiva, no aparecerá en la grilla de nuevos turnos.

- **RF-4.6** - Protección de Rutas: El Backend debe rechazar (HTTP 401/403) cualquier intento de acceso a endpoints protegidos si el usuario no presenta un token válido o no posee el rol (ADMIN).

## Módulo 5: Gestión Personal Pacientes (Solo ADMIN - RECEPCIONISTA)

- **RF-5.1** - Catálogo de Paciente: El sistema debe permitir crear, listar, modificar y dar de baja (borrado lógico) pacientes.

- **RF-5.2** - Alta de pacientes:
  Descripción:
  El sistema debe permitir registrar un nuevo paciente en la plataforma. La operación debe ser atómica, de modo que el alta del perfil del paciente y la creación de su cuenta de usuario en el sistema ocurran de manera conjunta.

  Datos Obligatorios (Payload del Paciente):
  -nombre: Nombre/s del paciente (String).
  -apellido: Apellido/s del paciente (String).
  -dni: Documento Nacional de Identidad (String, único).
  -sexo: Sexo biológico o de registro (String / Enum según valores permitidos).
  -email: Correo electrónico de contacto y de acceso (String, único, validado con formato de email).
  -direccion: Estructura de dirección, reutilizando el esquema base definido en direccion.interfaces.ts.
  -telefono: Estructura de teléfono, reutilizando el esquema base definido en telefono.interfaces.ts.
  -obrasSociales: Listado de obras sociales asociadas (Array<ObjectId> referenciando a la colección de ObrasSociales).
  -activo: Indicador de estado para soporte de borrado lógico (Boolean, por defecto true).
  -password: Credencial de acceso inicial para la cuenta de usuario (String, que será hasheada en el backend).

Reglas de Negocio y Transaccionalidad:
Operación Atómica (Transacción de Base de Datos):Se debe iniciar una sesión de transacción (ClientSession en Mongoose / Replica Set).Se persiste el documento del paciente en la colección correspondiente.

Utilizando el \_id generado del paciente, se crea de forma vinculada el registro en la colección de Usuarios (pacienteId apuntando al paciente, asignando el rol correspondiente Rol.PACIENTE, el email y la contraseña hasheada).

Validaciones Previas y Unicidad:
Se debe validar que no exista previamente un paciente registrado con el mismo dni o email antes de ejecutar la transacción.

Manejo de Errores y Rollback:
Si alguna de las operaciones falla (por ejemplo, duplicidad de DNI/email, errores de validación de esquemas o fallo al guardar el usuario), la transacción debe abortarse por completo (abortTransaction), revirtiendo cualquier inserción parcial para mantener la consistencia de la base de datos.

- **RF-5.3** Unicidad y Restricciones:El sistema debe garantizar la unicidad de Pacientes mediante las siguientes reglas de validación:

-No se permitirá registrar dos Pacientes con del mismo DNI

- **RF-5.2** - Modificación de pacientes: El sistema debe permitir modificar pacientes. Los usuarios con rol ADMIN o RECEPCIONISTA podran modificar todos los datos. El usuario con ron de PACIENTE solo podra modificar, email, direccion, telefono.

- **RF-5.4** - Borrado Lógico: No se podrán eliminar médicos físicamente de la base de datos para preservar el historial. Se utilizará un estado activo: booleano. Si se inactiva, no aparecerá en la grilla de nuevos turnos.

- **RF-5.5** - Protección de Rutas: El Backend debe rechazar (HTTP 401/403) cualquier intento de acceso a endpoints protegidos si el usuario no presenta un token válido o no posee el rol (ADMIN).

## Módulo 6: Gestión Horarios de Atención (Solo ADMIN - MEDICO)

- **RF-6.1** Creación y Actualización de Horarios de Atención:
  El sistema debe permitir a los usuarios con rol de Administrador o Médico definir o modificar la disponibilidad horaria de un profesional. Los campos obligatorios requeridos son:
  medico: Identificador único (ObjectId) de un médico existente en el sistema.
  diaSemana: Día de la semana correspondiente (ej: Lunes, Martes, etc.).
  horaInicio y horaFin: Rango horario en el que el médico atenderá.
  duracionTurnoMinutos: Duración estimada de cada turno (con un valor predeterminado de 30 minutos).

- **RF-6.2** Validaciones y Reglas de Negocio del Horario:
  El sistema debe validar automáticamente la disponibilidad antes de registrar o actualizar un horario mediante las siguientes reglas:
  Validación de Esquema y Formato: Los datos de entrada deben validarse obligatoriamente mediante el esquema Zod correspondiente (HorarioAtencionSchema).

Coherencia temporal: La hora de fin (horaFin) debe ser estrictamente posterior a la hora de inicio (horaInicio).

Múltiplo de duración: El rango horario total debe ser un múltiplo exacto de la duración configurada para cada turno.

Control de Solapamientos: El sistema no debe permitir registrar solapamientos de horarios activos para un mismo médico en el mismo día de la semana.

## Módulo 7: Gestión de Turnos (El Core)

-**RF-7.1** Ciclo de Vida del Turno (Máquina de Estados):
El sistema debe gestionar el ciclo de vida de un turno mediante una máquina de estados estricta. Todo turno creado nace obligatoriamente con el estado PENDIENTE y solo puede transitar hacia los siguientes estados permitidos:
ATENDIDO: Cuando el paciente concurre a la consulta y es atendido por el profesional.
CANCELADO: Cuando el turno es anulado por el paciente o la administración.
AUSENTE: Cuando el paciente no se presenta a la cita.

-**RF-7.2** Solicitud y Validación de Turnos:
El sistema debe permitir la creación de un nuevo turno validando de forma rigurosa las reglas de negocio y disponibilidad médica:

Datos requeridos: El sistema debe registrar la relación con el médico, la especialidad solicitada, la fecha y la hora exacta del turno.

Validación de Especialidad: El sistema debe verificar que el médico seleccionado atienda efectivamente la especialidad indicada.

Validación de Disponibilidad Horaria: El sistema debe comprobar que el médico posea un horario de atención activo (HorarioAtencion) configurado para ese día específico de la semana.

Coincidencia de Intervalos: La hora solicitada debe encontrarse estrictamente dentro del rango de inicio y fin del bloque horario del médico, y coincidir exactamente con el intervalo de duración preestablecido (ej. múltiplos de la duración del turno).

-**RF-7.3** Consulta y Listado de Turnos:
El sistema debe permitir listar y consultar los turnos registrados, ofreciendo opciones de filtrado (por ejemplo, según el médico asignado, fecha o estado del turno).

-**RF-7.4** Actualización de Estados del Turno:
El sistema debe proveer endpoints específicos para la gestión operativa de los turnos, permitiendo marcar un turno como atendido (PATCH) o proceder a su cancelación/baja según corresponda.

## Módulo 8: Interfaz de Usuario (Portal Ciudadano - Mobile First)

- **RF-8.1** - Navegación Lineal (Wizard): El proceso para sacar un turno debe ser guiado paso a paso, impidiendo avanzar si no se completó el paso anterior:

Seleccionar Especialidad -> 2. Seleccionar Profesional (opcional) -> 3. Seleccionar Fecha -> 4. Seleccionar Horario libre -> 5. Confirmar.

- **RF-8.2** - Retroalimentación Visual Inmediata: Toda acción asíncrona (como buscar horarios) debe mostrar un indicador de carga (Skeleton o Spinner). El ciudadano nunca debe ver una pantalla estática y pensar que el sistema se colgó.

- **RF-8.3** - Panel "Mis Turnos": Al ingresar con su DNI, la primera pantalla que verá el ciudadano será un listado de sus próximos turnos (PENDIENTES) con el detalle de fecha, hora y consultorio, resaltando un botón para Cancelar.

## Módulo 9: Interfaz de Usuario (Panel Recepción/Admin - Desktop)

- **RF-9.1** - Dashboard Diario: La pantalla principal de los usuarios administrativos será el calendario del día actual.

- **RF-9.2** - Operación en Nombre de Terceros (Sobreturnos): La recepcionista debe poder otorgar un turno a un ciudadano presencialmente. Para esto, contará con un buscador rápido por DNI en el panel.

- **RF-9.3** - Tolerancia a Fallos de Red: Si un formulario administrativo (ej. carga de un nuevo médico) falla por validación del servidor o caída de red, los datos ya tipeados en los inputs no deben borrarse (estado persistente con React Hook Form) para que el operario pueda reintentar.

## Componente Reutilizable / Plantilla

**RF-10.1** Reutilización del esquema base de telefono.interfaces.ts y direccion.interfaces.ts (que se encuentra en la carpeta utils)
Todas las entidades del sistema que requieran almacenar información de contacto telefónico y dirección deberán importar y reutilizar el modelo. Ninguna entidad debe definir estructuras de teléfonos personalizadas o independientes, asegurando así la integridad y el formato homogéneo de los datos de contacto en toda la aplicación.
