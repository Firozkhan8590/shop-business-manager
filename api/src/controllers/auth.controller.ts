import type { Request, Response } from "express";
import { login, logout } from "../services/auth.service";
import { AuthenticatedRequest } from "../middleware/auth";

export async function loginController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
      return;
    }

    const result = await login(username, password);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    console.error("========== LOGIN ERROR ==========");
    console.error(error);
    console.error("=================================");

    const message =
      error instanceof Error
        ? error.message
        : "Login failed";

    res.status(500).json({
      success: false,
      message,
    });
  }

}

export async function logoutController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const authenticatedRequest =
      req as AuthenticatedRequest;

    const tokenId =
      authenticatedRequest.user?.tokenId;

    if (!tokenId) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    await logout(tokenId);

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to logout",
    });
  }
}