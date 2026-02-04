"use server";

import { freePantryScans, proTierLimit } from "@/lib/arcJet";
import { checkUser } from "@/lib/checkUser";
import { request } from "@arcjet/next";

const { GoogleGenerativeAI } = require("@google/generative-ai");

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const STRAPI_API_KEY = process.env.STRAPI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const genai = new GoogleGenerativeAI();

export async function scanPantryImage(formData) {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const isPro = user.subscriptionTier === "pro";

    // Apply arjet limitng
    const arcJetClient = isPro ? proTierLimit : freePantryScans;

    // Req object for arcjet
    const req = await request();

    const decision = await arcJetClient.protect(req, {
      userId: user.clerkId,
      requested: 1,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        throw new Error(
          `Monthly scans limit reached. ${
            isPro
              ? "Please contact support if you need more scans."
              : "Upgrade to Pro for unlimited scans!"
          }`,
        );
      }

      throw new Error("Request denied by security system.");
    }
  } catch (error) {}
}
