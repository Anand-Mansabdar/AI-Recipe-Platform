"use server";

const MEALDB_BASE_URL = "https://www.themealdb.com/api/json/v1/1";

export async function getRecipeOfTheDay() {
  try {
    const response = await fetch(`${MEALDB_BASE_URL}/random.php`, {
      next: { revalidate: 86400 }, // New recipe of the day every 24 hrs
    });

    if (!response.ok) {
      throw new Error("Failed to fetch recipe of the day");
    }

    const data = await response.json();
    return {
      success: true,
      recipe: data.meals[0],
    };
  } catch (error) {
    console.log("Error fetching recipe of the day:", error);
    throw new Error(error.message || "Failed to load recipe.");
  }
}

export async function getCategories() {
  try {
    const response = await fetch(`${MEALDB_BASE_URL}/list.php?c=list`, {
      next: { revalidate: 604800 }, // Refreshes every 1 week
    });

    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }

    const data = await response.json();
    return {
      success: true,
      categories: data.meals,
    };
  } catch (error) {
    console.log("Error fetching categories:", error);
    throw new Error(error.message || "Failed to load categories.");
  }
}

export async function getAreas() {
  try {
    const response = await fetch(`${MEALDB_BASE_URL}/list.php?a=list`, {
      next: { revalidate: 604800 }, // Refreshes every 1 week
    });

    if (!response.ok) {
      throw new Error("Failed to fetch areas");
    }

    const data = await response.json();
    return {
      success: true,
      areas: data.meals || [],
    };
  } catch (error) {
    console.log("Error fetching areas:", error);
    throw new Error(error.message || "Failed to load areas.");
  }
}

export async function getMealsByCategory(category) {
  try {
    const response = await fetch(
      `${MEALDB_BASE_URL}/filter.php?c=${category}`,
      {
        next: { revalidate: 86400 }, // Refreshes every day
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch meals");
    }

    const data = await response.json();
    return {
      success: true,
      meals: data.meals || [],
      category: category,
    };
  } catch (error) {
    console.log("Error fetching meals by category:", error);
    throw new Error(error.message || "Failed to load meals.");
  }
}

export async function getMealsByArea(area) {
  try {
    const response = await fetch(`${MEALDB_BASE_URL}/filter.php?a=${area}`, {
      next: { revalidate: 86400 }, // Refreshes every day
    });

    if (!response.ok) {
      throw new Error("Failed to fetch meals by area");
    }

    const data = await response.json();
    return {
      success: true,
      meals: data.meals || [],
      area: area,
    };
  } catch (error) {
    console.log("Error fetching meals by area:", error);
    throw new Error(error.message || "Failed to load meals by area.");
  }
}
