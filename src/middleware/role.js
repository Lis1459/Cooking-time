export const requireRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
};

export const requireAdmin = requireRole("ADMIN");
export const requireUser = requireRole("USER");
