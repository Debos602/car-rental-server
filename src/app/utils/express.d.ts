import { User } from './UserModel'; // Adjust the path as necessary

declare global {
  namespace Express {
    interface Request {
      user?: User; // or the appropriate type for your user
    }
  }
}
