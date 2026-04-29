import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../../../domain/errors/DomainErrors.js";

export const protect = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer "))
      throw new UnauthorizedError("No token provided.");

    const token   = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user      = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Not authorized." });
  }
};
