// AverageStarRatings.jsx
import React, { useState, useEffect } from "react";
import StarRatings from "./StarRatings";

function AverageStarRatings({ productId }) {
  const [averageRating, setAverageRating] = useState(null);

  useEffect(() => {
    const fetchAverageRating = async () => {
      try {
        const response = await fetch(`/api/products/${productId}/averageRating`);
        const data = await response.json();
        // Convertir a número y redondear (puedes ajustar para mostrar decimales o medios)
        const avg = Number(data.avgRating);
        setAverageRating(Math.round(avg));
      } catch (error) {
        console.error("Error fetching average rating", error);
        setAverageRating(0);
      }
    };
    fetchAverageRating();
  }, [productId]);

  if (averageRating === null) {
    return <p className="text-sm">Loading rating...</p>;
  }

  return <StarRatings rating={averageRating} />;
}

export default AverageStarRatings;
