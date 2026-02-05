import { jest } from "@jest/globals";
import {
  createReport,
  getReportById,
  updateReport,
  deleteReport,
  getAllReports,
  getReportsByRecipe,
  getReportsByUser,
} from "../controllers/reportController.js";
import { ReportService } from "../services/reportService.js";

// Mock dependencies
jest.mock("../services/reportService.js");

describe("ReportController", () => {
  let mockReportService;
  let mockRequest;
  let mockResponse;
  let mockNext;

  beforeEach(() => {
    mockReportService = new ReportService();
    mockRequest = {
      body: {},
      params: {},
      query: {},
      user: { id: "1" },
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe("createReport", () => {
    it("should create report successfully", async () => {
      const reportData = { reason: "Inappropriate content", recipe_id: "1" };
      const createdReport = { id: "1", ...reportData, user_id: "1" };
      mockRequest.body = reportData;
      mockReportService.createReport.mockResolvedValue(createdReport);

      await createReport(mockRequest, mockResponse, mockNext);

      expect(mockReportService.createReport).toHaveBeenCalledWith(
        reportData,
        "1",
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(createdReport);
    });
  });

  describe("getReportById", () => {
    it("should get report by id successfully", async () => {
      const report = { id: "1", reason: "Spam" };
      mockRequest.params.id = "1";
      mockReportService.getReportById.mockResolvedValue(report);

      await getReportById(mockRequest, mockResponse, mockNext);

      expect(mockReportService.getReportById).toHaveBeenCalledWith("1");
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(report);
    });
  });

  describe("updateReport", () => {
    it("should update report successfully", async () => {
      const updateData = { status: "resolved" };
      const updatedReport = { id: "1", status: "resolved" };
      mockRequest.params.id = "1";
      mockRequest.body = updateData;
      mockReportService.updateReport.mockResolvedValue(updatedReport);

      await updateReport(mockRequest, mockResponse, mockNext);

      expect(mockReportService.updateReport).toHaveBeenCalledWith(
        "1",
        updateData,
        "1",
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedReport);
    });
  });

  describe("deleteReport", () => {
    it("should delete report successfully", async () => {
      mockRequest.params.id = "1";
      mockReportService.deleteReport.mockResolvedValue();

      await deleteReport(mockRequest, mockResponse, mockNext);

      expect(mockReportService.deleteReport).toHaveBeenCalledWith("1", "1");
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Report deleted successfully",
      });
    });
  });

  describe("getAllReports", () => {
    it("should get all reports successfully", async () => {
      const reports = [{ id: "1", reason: "Spam" }];
      mockReportService.getAllReports.mockResolvedValue(reports);

      await getAllReports(mockRequest, mockResponse, mockNext);

      expect(mockReportService.getAllReports).toHaveBeenCalledWith({});
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(reports);
    });
  });

  describe("getReportsByRecipe", () => {
    it("should get reports by recipe successfully", async () => {
      const reports = [{ id: "1", reason: "Inappropriate" }];
      mockRequest.params.recipeId = "1";
      mockReportService.getReportsByRecipe.mockResolvedValue(reports);

      await getReportsByRecipe(mockRequest, mockResponse, mockNext);

      expect(mockReportService.getReportsByRecipe).toHaveBeenCalledWith("1");
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(reports);
    });
  });

  describe("getReportsByUser", () => {
    it("should get reports by user successfully", async () => {
      const reports = [{ id: "1", reason: "Spam" }];
      mockRequest.params.userId = "1";
      mockReportService.getReportsByUser.mockResolvedValue(reports);

      await getReportsByUser(mockRequest, mockResponse, mockNext);

      expect(mockReportService.getReportsByUser).toHaveBeenCalledWith("1");
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(reports);
    });
  });
});
