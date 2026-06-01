import { verifyAccessToken } from "../utils/jwt.js";

export const optionalAuth = (req, res, next) => {
  const accessToken = req.headers.authorization?.split(" ")[1];

  if (!accessToken) {
    req.user = null;
    return next();
  }

  const user = verifyAccessToken(accessToken);

  if (!user) {
    req.user = null;
    return next();
  }

  req.user = user;
  next();
};
