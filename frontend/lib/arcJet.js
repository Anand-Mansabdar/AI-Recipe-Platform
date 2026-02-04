import arcjet, { tokenBucket } from "@arcjet/next";

export const aj = arcjet({
  key: process.env.ARCJET_KEY,
  rules: [],
});

// Free tier - 10 scans
export const freePantryScans = aj.withRule(
  tokenBucket({
    mode: "LIVE",
    characteristics: ["userId"],
    refillRate: 10,
    interval: "30d",
    capacity: 10,
  }),
);

// Free - 5 meal recommendations
export const freeMealRecommendations = aj.withRule(
  tokenBucket({
    mode: "LIVE",
    characteristics: ["userId"],
    refillRate: 5,
    interval: "30d",
    capacity: 5,
  }),
);

// Pro - Unlimited
export const proTierLimit = aj.withRule(
  tokenBucket({
    mode: "LIVE",
    characteristics: ["userId"],
    refillRate: 1000,
    interval: "1d",
    capacity: 1000,
  }),
);
