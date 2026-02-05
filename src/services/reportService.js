import { ReportRepository } from "../repositories/reportRepository.js";

const reportRepo = new ReportRepository();

export class ReportService {
  async getReports(filters, page, limit) {
    return reportRepo.findAll(filters, page, limit);
  }

  async createReport(reportData) {
    return reportRepo.create(reportData);
  }

  async updateReport(id, data) {
    return reportRepo.update(id, data);
  }

  async getReportCount(filters) {
    return reportRepo.count(filters);
  }
}
