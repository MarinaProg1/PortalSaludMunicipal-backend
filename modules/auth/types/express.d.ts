
import { IUser } from '../models/usuario.model';

declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id: string;
        rol: string;
        [key: string]: unknown;
      };
    }
  }
}
export {};