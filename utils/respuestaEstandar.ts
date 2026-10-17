import type { Response } from 'express';

export const respuestaEstandar = <T>(
    res: Response,
    statusCode: number,
    ok: boolean,
    message: string,
    data?: T
): Response => {
    return res.status(statusCode).json({ ok, message, data });
};