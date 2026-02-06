import { jest } from "@jest/globals";
import { SubscriptionService } from "../services/subscriptionService.js";
import { SubscriptionRepository } from "../repositories/subscriptionRepository.js";

// Mock dependencies
jest.mock("../repositories/subscriptionRepository.js");

describe("SubscriptionService", () => {
  let subscriptionService;
  let mockSubscriptionRepo;

  beforeEach(() => {
    mockSubscriptionRepo = new SubscriptionRepository();
    subscriptionService = new SubscriptionService();
    jest.clearAllMocks();
  });

  describe("subscribe", () => {
    it("should subscribe successfully", async () => {
      const subscriptionData = { subscriber_id: "1", subscribed_to_id: "2" };
      const createdSubscription = { id: "1", ...subscriptionData };
      mockSubscriptionRepo.create.mockResolvedValue(createdSubscription);

      const result = await subscriptionService.subscribe(subscriptionData);

      expect(mockSubscriptionRepo.create).toHaveBeenCalledWith(
        subscriptionData,
      );
      expect(result).toBe(createdSubscription);
    });
  });

  describe("unsubscribe", () => {
    it("should unsubscribe successfully", async () => {
      mockSubscriptionRepo.delete.mockResolvedValue({ id: "1" });

      const result = await subscriptionService.unsubscribe("1", "2");

      expect(mockSubscriptionRepo.delete).toHaveBeenCalledWith("1", "2");
      expect(result).toHaveProperty("id", "1");
    });
  });

  describe("getSubscribers", () => {
    it("should return subscribers", async () => {
      const subscribers = [{ id: "1", subscriber_id: "1" }];
      mockSubscriptionRepo.findSubscribers.mockResolvedValue(subscribers);

      const result = await subscriptionService.getSubscribers("1", 1, 10);

      expect(mockSubscriptionRepo.findSubscribers).toHaveBeenCalledWith(
        "1",
        1,
        10,
      );
      expect(result).toBe(subscribers);
    });
  });

  describe("getSubscriptions", () => {
    it("should return subscriptions", async () => {
      const subscriptions = [{ id: "1", subscribed_to_id: "2" }];
      mockSubscriptionRepo.findSubscriptions.mockResolvedValue(subscriptions);

      const result = await subscriptionService.getSubscriptions("1", 1, 10);

      expect(mockSubscriptionRepo.findSubscriptions).toHaveBeenCalledWith(
        "1",
        1,
        10,
      );
      expect(result).toBe(subscriptions);
    });
  });

  describe("isSubscribed", () => {
    it("should return true if subscribed", async () => {
      mockSubscriptionRepo.exists.mockResolvedValue(true);

      const result = await subscriptionService.isSubscribed("1", "2");

      expect(mockSubscriptionRepo.exists).toHaveBeenCalledWith("1", "2");
      expect(result).toBe(true);
    });

    it("should return false if not subscribed", async () => {
      mockSubscriptionRepo.exists.mockResolvedValue(false);

      const result = await subscriptionService.isSubscribed("1", "2");

      expect(result).toBe(false);
    });
  });

  describe("getSubscriptionCount", () => {
    it("should return subscription count", async () => {
      mockSubscriptionRepo.countSubscribers.mockResolvedValue(5);

      const result = await subscriptionService.getSubscriptionCount("1");

      expect(mockSubscriptionRepo.countSubscribers).toHaveBeenCalledWith("1");
      expect(result).toBe(5);
    });
  });
});
