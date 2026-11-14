import type { Request, Response, NextFunction } from 'express';

// 404: ninguna ruta coincidio.
export const noEncontrado = (req: Request, res: Response) => {
    res.status(404).json({
        ok: false,
        message: `La ruta ${req.originalUrl} no existe en el servidor`,
    });
};

// Manejador de errores real: SIEMPRE 4 argumentos (asi lo reconoce Express).
// El detalle se loguea en el servidor; al cliente no se le devuelve el stack.
export const manejadorErrores = (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    console.error('[ERROR]', err);

    if (res.headersSent) return;

    if (err?.name === 'CastError' || err?.name === 'ValidationError') {
        return res.status(400).json({ ok: false, message: 'Datos invalidos' });
    }

    if (err?.code === 11000) {
        return res.status(409).json({ ok: false, message: 'El registro ya existe' });
    }

    const status = Number(err?.status) || 500;

    return res.status(status).json({
        ok: false,
        message: status >= 500 ? 'Error interno del servidor' : err.message,
    });
};
