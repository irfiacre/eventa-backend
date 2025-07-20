import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { createUser, findUserByEmail } from "../services/userService";
import { signJwt } from "../utils/jwt";

export const register = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await createUser({
      firstName,
      lastName,
      email,
      password: hashed,
      role,
    });
    return res
      .status(201)
      .json({ id: user.id, email: user.email, role: user.role });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = signJwt({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    });
    return res.json({ token });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};
