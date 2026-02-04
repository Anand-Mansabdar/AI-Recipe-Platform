import Link from "next/link";
import React from "react";
import { Card, CardHeader, CardTitle } from "./ui/card";
import Image from "next/image";

const RecipeCard = ({ recipe, variant = "default" }) => {
  const getRecipeData = () => {
    // For fetching data from theMealDB
    if (recipe.strMeal) {
      return {
        title: recipe.strMeal,
        image: recipe.strMealThumb,
        href: `/recipe?cook=${encodeURIComponent(recipe.strMeal)}`,
        showImage: true,
      };
    }

    // more conditions

    return {};
  };

  const data = getRecipeData();

  if (variant === "grid") {
    return (
      <Link href={data.href}>
        <Card
          className={
            "rounded-none overflow-hidden border-stone-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group pt-0 h-full flex flex-col"
          }
        >
          {data.showImage ? (
            <div className="relative aspect-square">
              <Image
                src={data.image}
                alt={data.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />

              <div className="absolute inset-0 bg-linear-to-r from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white text-sm font-medium">
                    Click to view recipe
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="aspect-square bg-gray-100 flex items-center justify-center">
              <div className="text-center p-4">
                <div className="text-gray-400 text-4xl mb-2">🍽️</div>
                <p className="text-gray-500 text-sm">No image available</p>
              </div>
            </div>
          )}

          <CardHeader className="grow">
            <CardTitle
              className={
                "text-lg font-bold text-stone-900 group-hover:text-orange-600 transition-colors line-clamp-2"
              }
            >
              {data.title}
            </CardTitle>
          </CardHeader>
        </Card>
      </Link>
    );
  }
  return <div></div>;
};

export default RecipeCard;
