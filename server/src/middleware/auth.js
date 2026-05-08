import { verifyAccessToken } from "../utils/jwt.js";

const isProd = process.env.NODE_ENV === "production";

export const authenticate = async (req, res, next) => {
  const accessToken = req.headers.authorization?.split(" ")[1];

  if (!accessToken) {
    console.log("Authentication failed: No access token provided");
    return res.status(401).json({ message: "No access token provided" });
  }

  let user = verifyAccessToken(accessToken);

  if (!user) {
    console.log("Authentication failed: Invalid access token");
    return res.status(401).json({ message: "Invalid access token" });
  }

  req.user = user;
  console.log(user);
  next();
};
