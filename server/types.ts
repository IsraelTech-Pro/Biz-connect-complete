import { User, AdminUser } from "@shared/schema";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      adminUser?: AdminUser;
    }
  }
}

export {};