import { AuthService } from "../services/authService.js";

const authService = new AuthService();
const isProd = process.env.NODE_ENV === "production";

export const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const { accessToken, refreshToken, user } = await authService.register({
      email,
      password,
      name,
    });
    console.log(user);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "None" : "Lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.status(201).json({
      message: "User registered successfully",
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  } catch (error) {
    console.log("controller", error.message);
    res.status(400).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken, user } = await authService.login(
      email,
      password,
    );
    console.log(user);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "None" : "Lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.profile.name,
      },
    });
  } catch (error) {
    console.log("controller", error.message);
    res.status(401).json({ message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token" });
    }
    const tokens = await authService.refreshToken(refreshToken);
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.json({ accessToken: tokens.accessToken });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};
