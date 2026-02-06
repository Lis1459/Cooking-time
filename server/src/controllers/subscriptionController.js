import { SubscriptionService } from "../services/subscriptionService.js";

const subscriptionService = new SubscriptionService();

export const getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await subscriptionService.getUserSubscriptions(
      req.user.id,
    );
    res.json(subscriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFollowers = async (req, res) => {
  try {
    const followers = await subscriptionService.getFollowers(req.params.userId);
    res.json(followers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const subscribe = async (req, res) => {
  try {
    const subscription = await subscriptionService.subscribe(
      req.user.id,
      req.params.userId,
    );
    res.status(201).json(subscription);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const unsubscribe = async (req, res) => {
  try {
    await subscriptionService.unsubscribe(req.user.id, req.params.userId);
    res.json({ message: "Unsubscribed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const isSubscribed = async (req, res) => {
  try {
    const subscribed = await subscriptionService.isSubscribed(
      req.user.id,
      req.params.userId,
    );
    res.json({ subscribed });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
