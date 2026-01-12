import type { TUser } from '../modules/user/user.interface';

declare global {
  namespace Express {
    interface Request {
      // We keep this partial to avoid coupling to mongoose document methods
      user?: Partial<TUser> & { _id?: string; };
    }
  }
}

export { };
