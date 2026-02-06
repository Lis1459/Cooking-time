import {
  verifyAccessToken,
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt.js";
import prisma from "../config/database.js";

export const authenticate = async (req, res, next) => {
  const accessToken = req.headers.authorization?.split(" ")[1];
  const refreshToken = req.cookies?.refreshToken;

  if (!accessToken && !refreshToken) {
    return res.status(401).json({ message: "No tokens provided" });
  }

  let user = null;

  if (accessToken) {
    user = verifyAccessToken(accessToken);
  }

  if (!user && refreshToken) {
    const refreshPayload = verifyRefreshToken(refreshToken);
    if (refreshPayload) {
      // Check if refresh token exists in DB
      const tokenRecord = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });
      if (tokenRecord) {
        user = {
          id: refreshPayload.id,
          email: refreshPayload.email,
          role: refreshPayload.role,
        };
        // Generate new tokens
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        // Update refresh token in DB
        await prisma.refreshToken.update({
          where: { id: tokenRecord.id },
          data: { token: newRefreshToken },
        });

        res.setHeader("Authorization", `Bearer ${newAccessToken}`);
        res.cookie("refreshToken", newRefreshToken, {
          httpOnly: true,
          secure: true,
          maxAge: 30 * 24 * 60 * 60 * 1000,
        });
      }
    }
  }

  if (!user) {
    return res.status(401).json({ message: "Invalid tokens" });
  }

  req.user = user;
  next();
};
