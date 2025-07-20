import { Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema } from "../validators/authValidator";

// interface AuthRequest extends Request {
//   user?: {
//     id: string;
//     role: string;
//   };
// }

export const registerSchemaValidation = (req: any, res: Response, next: NextFunction) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({ errors: parsed.error.issues });
        }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const loginSchemaValidation = (req: any, res: Response, next: NextFunction) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
          return res.status(400).json({ errors: parsed.error.issues });
        }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

