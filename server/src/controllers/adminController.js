import { AdminService } from "../services/adminService.js";

const adminService = new AdminService();

export const getAdminStatistics = async (req, res, next) => {
  try {
    const period = parseInt(req.query.period, 10) || 7;
    const statistics = await adminService.getStatistics(period);
    res.json(statistics);
  } catch (error) {
    next(error);
  }
};
