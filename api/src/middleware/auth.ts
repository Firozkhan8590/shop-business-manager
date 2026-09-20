import type {
  Request,
  Response,
  NextFunction,
} from "express";

import jwt from "jsonwebtoken";

import { validateSession } from "../services/auth.service";

const JWT_SECRET = process.env.JWT_SECRET ?? "";

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET is not configured in environment variables"
  );
}

export interface AuthenticatedRequest
  extends Request {
  user?: {
    id: number;
    username: string;
    tokenId: string;
  };
}

interface JwtPayload {
  userId: number;
  username: string;
  jti: string;
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    if (!authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Invalid authorization format",
      });
      return;
    }

    const token = authHeader.substring(7);

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Authentication token missing",
      });
      return;
    }

    const decoded = jwt.verify(
      token,
      JWT_SECRET
    ) as JwtPayload;

    if (
      !decoded.userId ||
      !decoded.username ||
      !decoded.jti
    ) {
      res.status(401).json({
        success: false,
        message: "Invalid authentication token",
      });
      return;
    }

    const sessionValid = await validateSession(
      decoded.jti,
      decoded.userId
    );

    if (!sessionValid) {
      res.status(401).json({
        success: false,
        message: "Session expired or logged out",
      });
      return;
    }

    (
      req as AuthenticatedRequest
    ).user = {
      id: decoded.userId,
      username: decoded.username,
      tokenId: decoded.jti,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);

    res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
}