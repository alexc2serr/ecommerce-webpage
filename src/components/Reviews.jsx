// Reviews.jsx
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Context } from "../App";

function Reviews() {
  const { productId } = useParams();
  const { user } = useContext(Context);
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [loadingReviewCheck, setLoadingReviewCheck] = useState(true);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");

  // Obtener datos del producto
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const res = await fetch(`/api/products/${productId}`);
        const data = await res.json();
        setProduct(data);
      } catch (error) {
        console.error("Error al obtener el producto:", error);
      }
    };
    fetchProductData();
  }, [productId]);

  // Obtener reseñas del producto
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/products/${productId}/reviews`);
        const data = await res.json();
        setReviews(data);
      } catch (error) {
        console.error("Error al obtener reseñas:", error);
      }
    };
    fetchReviews();
  }, [productId]);

  // Verificar si el usuario ha comprado el producto
  useEffect(() => {
    const checkPurchase = async () => {
      if (!user) {
        setCanReview(false);
        setLoadingReviewCheck(false);
        return;
      }
      try {
        const res = await fetch(`/api/users/${user.id}/hasPurchased/${productId}`);
        const data = await res.json();
        setCanReview(data.purchased);
      } catch (error) {
        console.error("Error verificando la compra:", error);
        setCanReview(false);
      } finally {
        setLoadingReviewCheck(false);
      }
    };
    checkPurchase();
  }, [user, productId]);

  // Agregar una nueva reseña
  const handleAddReview = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!canReview) {
      alert("Solo puedes reseñar un producto si lo has comprado.");
      return;
    }
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          rating,
          review_text: reviewText,
        }),
      });
      if (!res.ok) {
        throw new Error("Error al crear la reseña");
      }
      // Recargar reseñas
      const updatedRes = await fetch(`/api/products/${productId}/reviews`);
      const updatedData = await updatedRes.json();
      setReviews(updatedData);
      setRating(5);
      setReviewText("");
    } catch (error) {
      console.error("Error al agregar reseña:", error);
    }
  };

  // Función para eliminar una reseña
const handleDeleteReview = async (reviewId) => {
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Error al eliminar la reseña");
      }
      // Recargar reseñas
      const updatedRes = await fetch(`/api/products/${productId}/reviews`);
      const updatedData = await updatedRes.json();
      setReviews(updatedData);
    } catch (error) {
      console.error("Error al eliminar reseña:", error);
    }
  };

  return (
    <div className="reviews-container p-8">
      {/* Mostrar imagen y nombre del producto */}
      {product && (
        <div className="flex items-center mb-6">
          <img
            src={`/${product.image}`}
            alt={product.title}
            className="w-24 h-24 object-cover rounded-lg shadow-md"
          />
          <h2 className="text-2xl font-bold ml-4">{product.title}</h2>
        </div>
      )}

      {/* Lista de reseñas */}
      <ul className="list-disc ml-5 mb-4">
        {reviews.map((review) => (
          <li key={review.id} className="mb-2 border-b pb-2">
            <div className="flex justify-between items-center">
              <div>
                <strong>Rating:</strong> {review.rating}
              </div>
              {user && user.id === review.user_id && (
                <button
                  onClick={() => handleDeleteReview(review.id)}
                  className="text-red-500 text-sm underline"
                >
                  Eliminar
                </button>
              )}
            </div>
            <p>{review.review_text}</p>
          </li>
        ))}
      </ul>

      {/* Formulario para añadir reseña */}
      {loadingReviewCheck ? (
        <p>Verificando estado de compra...</p>
      ) : canReview ? (
        <div className="review-form bg-white p-6 rounded shadow max-w-md mx-auto">
          <h3 className="text-xl font-bold mb-4">Añadir Reseña</h3>
          <div className="mb-4">
            <label htmlFor="rating" className="block text-sm font-medium mb-1">
              Rating:
            </label>
            <select
              id="rating"
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="register-input w-full"
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="reviewText" className="block text-sm font-medium mb-1">
              Reseña:
            </label>
            <textarea
              id="reviewText"
              placeholder="Escribe tu reseña..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="register-input w-full h-24"
            />
          </div>
          <button onClick={handleAddReview} className="register-btn w-full">
            Enviar Reseña
          </button>
        </div>
      ) : (
        <p className="text-center">
          {user
            ? "Solo puedes reseñar un producto si lo has comprado."
            : "Por favor, inicia sesión para reseñar este producto."}
        </p>
      )}
    </div>
  );
}

export default Reviews;
