import bcrypt from "bcryptjs";
import { UserRepository } from "../repositories/userRepository.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import prisma from "../config/database.js";

const userRepo = new UserRepository();

export class AuthService {
  async register(userData) {
    const { email, password, name } = userData;

    const existingUser = await userRepo.findByEmail(email);
    console.log("existingUser", existingUser);
    if (existingUser) {
      console.log("User already exists");
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userRepo.create({
      email,
      password_hash: hashedPassword,
      profile: {
        create: { name },
      },
    });

    console.log("Created user:", user);

    return user;
  }

  async login(email, password) {
    console.log("email, pass", email, password);
    const user = await userRepo.findByEmail(email);
    if (!user || user.is_blocked) {
      throw new Error("Invalid credentials");
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Save refresh token
    await prisma.refreshToken.create({
      data: {
        user_id: user.id,
        token: refreshToken,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    return { accessToken, refreshToken, user };
  }

  async logout(refreshToken) {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  async refreshToken(oldRefreshToken) {
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { token: oldRefreshToken },
    });
    if (!tokenRecord) {
      throw new Error("Invalid refresh token");
    }

    const user = await userRepo.findById(tokenRecord.user_id);
    if (!user) {
      throw new Error("User not found");
    }

    const payload = { id: user.id, email: user.email, role: user.role };
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    // Update token
    await prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { token: newRefreshToken },
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}
