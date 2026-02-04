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

    const imageFile = formData.get("image");
    if (!imageFile) {
      throw new Error("No image provided");
    }

    // convert to base64 image
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");

    const model = genai.getGenerativeModel({
      model: "gemini-3-pro-image-preview",
    });

    const prompt = `
You are a professional chef and ingredient recognition expert. Analyze this image of a pantry/fridge and identify all visible food ingredients.

Return ONLY a valid JSON array with this exact structure (no markdown, no explanations):
[
  {
    "name": "ingredient name",
    "quantity": "estimated quantity with unit",
    "confidence": 0.95
  }
]

Rules:
- Only identify food ingredients (not containers, utensils, or packaging)
- Be specific (e.g., "Cheddar Cheese" not just "Cheese")
- Estimate realistic quantities (e.g., "3 eggs", "1 cup milk", "2 tomatoes")
- Confidence should be 0.7-1.0 (omit items below 0.7)
- Maximum 20 items
- Common pantry staples are acceptable (salt, pepper, oil)
`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: imageFile.type,
          data: base64Image,
        },
      },
    ]);

    const response = await result.response;
    const test = response.text();

    let ingredients;
    try {
      const cleanText = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      ingredients = JSON.parse(cleanText);
    } catch (error) {
      console.error("Failed to parse gemini response:", test);
      throw new Error("Failed to parse ingredients. Please try again.");
    }

    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      throw new Error(
        "No ingredients detected in the image. Please try a cleaner photo.",
      );
    }

    return {
      success: true,
      ingredients: ingredients.slice(0, 20),
      scansLimit: isPro ? "unlimited" : 10,
      message: `Found ${ingredients.length} ingredients!`,
    };
  } catch (error) {
    console.error("Error scanning pantry:", error);
    throw new Error(error.message || "Failed to scan image");
  }
}

export async function saveToPantry(formData) {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const ingredientsJSON = formData.get("ingredients");
    const ingredients = JSON.parse(ingredientsJSON);

    if (!ingredients || ingredients.length === 0) {
      throw new Error("No ingredients to save");
    }

    const savedItems = [];
    for (const ingredient of ingredients) {
      const response = await fetch(`${STRAPI_URL}/api/pantry-items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${STRAPI_API_KEY}`,
        },
        body: JSON.stringify({
          data: {
            name: ingredient.name,
            quantity: ingredient.quantity,
            imageUrl: "",
            owner: user.id,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        savedItems.push(data.data);
      }
    }

    return {
      success: true,
      savedItems,
      message: `Saved ${savedItems.length} items to your pantry...`,
    };
  } catch (error) {
    console.error("Error saving to pantry:", error);
    throw new Error(error.message || "Failed to save items");
  }
}

export async function addPantryItemManually(formData) {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const name = formData.get("name");
    const quantity = formData.get("quantity");

    if (!name || !quantity) {
      throw new Error("Name and quantity are required");
    }

    const response = await fetch(`${STRAPI_URL}/api/pantry-items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_API_KEY}`,
      },
      body: JSON.stringify({
        data: {
          name: name,
          quantity: quantity,
          imageUrl: "",
          owner: user.id,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Failed to add item:", errorText);
      throw new Error("Failed to add to pantry");
    }

    const data = response.json();
    return {
      success: true,
      item: data.data,
      message: "Item added successfully",
    };
  } catch (error) {
    console.error("Error adding item manually:", error);
    throw new Error(error.message || "Failed to add item");
  }
}

export async function getPantryItems() {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const response = await fetch(
      `${STRAPI_URL}/api/pantry-items?filters[owner][id][$eq]=${user.id}&sort=createdAt:desc`,
      {
        headers: {
          Authorization: `Bearer ${STRAPI_API_KEY}`,
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch pantry items");
    }

    const data = await response.json();

    const isPro = user.subscriptionTier === "pro";

    return {
      success: true,
      items: data.data || [],
      scansLimit: isPro ? "unlimited" : 10,
    };
  } catch (error) {
    console.error("Error fetching pantry:", error);
    throw new Error(error.message || "Failed to load pantry");
  }
}

export async function deletePantryItems(formData) {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const itemId = formData.get("itemId");

    const response = await fetch(`${STRAPI_URL}/api/pantry-items/${itemId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${STRAPI_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete item");
    }

    return {
      success: true,
      message: "Item removed from pantry",
    };
  } catch (error) {
    console.error("Error deleting item:", error);
    throw new Error(error.message || "Failed to delete item");
  }
}

export async function updatePantryItems(formData) {
  try {
    const user = await checkUser();
    if (!user) {
      throw new Error("User not authenticated");
    }

    const itemId = formData.get("itemId");
    const name = formData.get("name");
    const quantity = formData.get("quantity");

    const response = await fetch(`${STRAPI_URL}/api/pantry-items/${itemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_API_KEY}`,
      },
      body: JSON.stringify({
        data: {
          name,
          quantity,
        },
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update item");
    }

    const data = await response.json();

    return {
      success: true,
      item: data.data,
      message: "Item updated successfully",
    };
  } catch (error) {
    console.error("Error updating item:", error);
    throw new Error(error.message || "Failed to update item");
  }
}
