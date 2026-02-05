import { jest } from "@jest/globals";
import { ReportService } from "../services/reportService.js";
import { ReportRepository } from "../repositories/reportRepository.js";

// Mock dependencies
jest.mock("../repositories/reportRepository.js");

describe("ReportService", () => {
  let reportService;
  let mockReportRepo;

  beforeEach(() => {
    mockReportRepo = new ReportRepository();
    reportService = new ReportService();
    jest.clearAllMocks();
  });

  describe("createReport", () => {
    it("should create report successfully", async () => {
      const reportData = {
        reason: "Inappropriate content",
        recipe_id: "1",
        user_id: "1",
      };
      const createdReport = { id: "1", ...reportData };
      mockReportRepo.create.mockResolvedValue(createdReport);

      const result = await reportService.createReport(reportData);

      expect(mockReportRepo.create).toHaveBeenCalledWith(reportData);
      expect(result).toBe(createdReport);
    });
  });

  describe("getReportById", () => {
    it("should return report by id", async () => {
      const report = { id: "1", reason: "Spam" };
      mockReportRepo.findById.mockResolvedValue(report);

      const result = await reportService.getReportById("1");

      expect(mockReportRepo.findById).toHaveBeenCalledWith("1");
      expect(result).toBe(report);
    });

    it("should throw error if report not found", async () => {
      mockReportRepo.findById.mockResolvedValue(null);

      await expect(reportService.getReportById("1")).rejects.toThrow(
        "Report not found",
      );
    });
  });

  describe("updateReport", () => {
    it("should update report successfully", async () => {
      const reportId = "1";
      const updateData = { status: "resolved" };
      const updatedReport = { id: reportId, status: "resolved" };
      mockReportRepo.update.mockResolvedValue(updatedReport);

      const result = await reportService.updateReport(reportId, updateData);

      expect(mockReportRepo.update).toHaveBeenCalledWith(reportId, updateData);
      expect(result).toBe(updatedReport);
    });
  });

  describe("deleteReport", () => {
    it("should delete report successfully", async () => {
      mockReportRepo.delete.mockResolvedValue({ id: "1" });

      const result = await reportService.deleteReport("1");

      expect(mockReportRepo.delete).toHaveBeenCalledWith("1");
      expect(result).toHaveProperty("id", "1");
    });
  });

  describe("getAllReports", () => {
    it("should return paginated reports", async () => {
      const reports = [{ id: "1", reason: "Spam" }];
      mockReportRepo.findAll.mockResolvedValue(reports);

      const result = await reportService.getAllReports(1, 10);

      expect(mockReportRepo.findAll).toHaveBeenCalledWith(1, 10);
      expect(result).toBe(reports);
    });
  });

  describe("getReportsByRecipe", () => {
    it("should return reports by recipe", async () => {
      const reports = [{ id: "1", reason: "Inappropriate" }];
      mockReportRepo.findByRecipeId.mockResolvedValue(reports);

      const result = await reportService.getReportsByRecipe("1", 1, 10);

      expect(mockReportRepo.findByRecipeId).toHaveBeenCalledWith("1", 1, 10);
      expect(result).toBe(reports);
    });
  });

  describe("getReportsByUser", () => {
    it("should return reports by user", async () => {
      const reports = [{ id: "1", reason: "Spam" }];
      mockReportRepo.findByUserId.mockResolvedValue(reports);

      const result = await reportService.getReportsByUser("1", 1, 10);

      expect(mockReportRepo.findByUserId).toHaveBeenCalledWith("1", 1, 10);
      expect(result).toBe(reports);
    });
  });
});
