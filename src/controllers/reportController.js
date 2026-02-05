import { ReportService } from "../services/reportService.js";

const reportService = new ReportService();

export const getReports = async (req, res) => {
  try {
    const filters = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const reports = await reportService.getReports(filters, page, limit);
    const total = await reportService.getReportCount(filters);
    res.json({ reports, total, page, limit });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createReport = async (req, res) => {
  try {
    const reportData = {
      reporter_id: req.user.id,
      target_type: req.body.target_type,
      target_id: req.body.target_id,
      reason: req.body.reason,
      status: "PENDING",
    };
    const report = await reportService.createReport(reportData);
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateReport = async (req, res) => {
  try {
    const report = await reportService.updateReport(req.params.id, req.body);
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
