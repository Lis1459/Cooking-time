import { jest } from "@jest/globals";
import {
  subscribe,
  unsubscribe,
  getSubscribers,
  getSubscriptions,
  isSubscribed,
  getSubscriptionCount,
} from "../controllers/subscriptionController.js";
import { SubscriptionService } from "../services/subscriptionService.js";

// Mock dependencies
jest.mock("../services/subscriptionService.js");

describe("SubscriptionController", () => {
  let mockSubscriptionService;
  let mockRequest;
  let mockResponse;
  let mockNext;

  beforeEach(() => {
    mockSubscriptionService = new SubscriptionService();
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

  describe("subscribe", () => {
    it("should subscribe successfully", async () => {
      const subscribeData = { subscribed_to_id: "2" };
      const subscription = {
        id: "1",
        subscriber_id: "1",
        subscribed_to_id: "2",
      };
      mockRequest.body = subscribeData;
      mockSubscriptionService.subscribe.mockResolvedValue(subscription);

      await subscribe(mockRequest, mockResponse, mockNext);

      expect(mockSubscriptionService.subscribe).toHaveBeenCalledWith("1", "2");
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(subscription);
    });
  });

  describe("unsubscribe", () => {
    it("should unsubscribe successfully", async () => {
      mockRequest.params.subscribedToId = "2";
      mockSubscriptionService.unsubscribe.mockResolvedValue();

      await unsubscribe(mockRequest, mockResponse, mockNext);

      expect(mockSubscriptionService.unsubscribe).toHaveBeenCalledWith(
        "1",
        "2",
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Unsubscribed successfully",
      });
    });
  });

  describe("getSubscribers", () => {
    it("should get subscribers successfully", async () => {
      const subscribers = [{ id: "1", subscriber_id: "1" }];
      mockRequest.params.userId = "1";
      mockSubscriptionService.getSubscribers.mockResolvedValue(subscribers);

      await getSubscribers(mockRequest, mockResponse, mockNext);

      expect(mockSubscriptionService.getSubscribers).toHaveBeenCalledWith("1");
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(subscribers);
    });
  });

  describe("getSubscriptions", () => {
    it("should get subscriptions successfully", async () => {
      const subscriptions = [{ id: "1", subscribed_to_id: "2" }];
      mockSubscriptionService.getSubscriptions.mockResolvedValue(subscriptions);

      await getSubscriptions(mockRequest, mockResponse, mockNext);

      expect(mockSubscriptionService.getSubscriptions).toHaveBeenCalledWith(
        "1",
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(subscriptions);
    });
  });

  describe("isSubscribed", () => {
    it("should check subscription status successfully", async () => {
      mockRequest.params.subscribedToId = "2";
      mockSubscriptionService.isSubscribed.mockResolvedValue(true);

      await isSubscribed(mockRequest, mockResponse, mockNext);

      expect(mockSubscriptionService.isSubscribed).toHaveBeenCalledWith(
        "1",
        "2",
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ isSubscribed: true });
    });
  });

  describe("getSubscriptionCount", () => {
    it("should get subscription count successfully", async () => {
      mockRequest.params.userId = "1";
      mockSubscriptionService.getSubscriptionCount.mockResolvedValue(5);

      await getSubscriptionCount(mockRequest, mockResponse, mockNext);

      expect(mockSubscriptionService.getSubscriptionCount).toHaveBeenCalledWith(
        "1",
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ count: 5 });
    });
  });
});
