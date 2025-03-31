// Account.jsx
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../App";

function Account() {
  const { user } = useContext(Context);
  const navigate = useNavigate();
  const [localUser, setLocalUser] = useState(null);
  const [reviews, setReviews] = useState([]);

  // Obtener usuario del localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      navigate("/login");
    } else {
      setLocalUser(storedUser);
      fetchUserReviews(storedUser.id);
    }
  }, [navigate]);

  // Obtener todas las reseñas del usuario
  const fetchUserReviews = async (userId) => {
    try {
      const res = await fetch(`http://localhost:3006/api/users/${userId}/reviews`);
      if (!res.ok) throw new Error("Error al obtener reseñas");
      const data = await res.json();
      setReviews(data);
    } catch (error) {
      console.error("Error al obtener reseñas del usuario:", error);
    }
  };

  // Eliminar una reseña
  const handleDeleteReview = async (reviewId) => {
    try {
      const res = await fetch(`http://localhost:3006/api/reviews/${reviewId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Error al eliminar la reseña");
      }
      // Actualizar el estado sin recargar la página
      setReviews((prevReviews) => prevReviews.filter((review) => review.id !== reviewId));
    } catch (error) {
      console.error("Error al eliminar reseña:", error);
    }
  };

  // Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!localUser) return <div className="text-center text-lg p-8">Cargando...</div>;

  return (
    <div className="account-container max-w-3xl mx-auto p-8 bg-white shadow-lg rounded-lg">
      <h2 className="text-3xl font-bold mb-4">Mi Cuenta</h2>
      
      {/* Información del usuario */}
      <div className="mb-6">
        <p className="text-lg"><strong>Nombre de usuario:</strong> {localUser.username}</p>
        <p className="text-lg"><strong>Email:</strong> {localUser.email}</p>
        {localUser.full_name && <p className="text-lg"><strong>Nombre completo:</strong> {localUser.full_name}</p>}
        {localUser.address && <p className="text-lg"><strong>Dirección:</strong> {localUser.address}</p>}
      </div>

      {/* Botón de cerrar sesión */}
      <button 
        onClick={handleLogout} 
        className="mt-4 px-6 py-2 bg-red-500 hover:bg-red-700 text-white font-bold rounded transition"
      >
        Cerrar sesión
      </button>

      {/* Sección de reseñas */}
      <h3 className="text-2xl font-bold mt-8 mb-4">Mis Reseñas</h3>
      {reviews.length === 0 ? (
        <p className="text-gray-600">No has publicado ninguna reseña.</p>
      ) : (
        <ul className="space-y-4">
          {reviews.map((review) => (
            <li key={review.id} className="border p-4 rounded-lg shadow-md">
              <div className="flex items-center mb-2">
                <img 
                  src={`/${review.image}`} 
                  alt={review.title} 
                  className="w-16 h-16 object-cover rounded-md shadow"
                />
                <h4 className="ml-4 text-lg font-semibold">{review.title}</h4>
              </div>
              <p className="text-yellow-500 font-bold">Rating: {review.rating} / 5 ⭐</p>
              <p className="text-gray-700 mt-1">{review.review_text}</p>
              <button 
                onClick={() => handleDeleteReview(review.id)}
                className="mt-2 text-red-500 hover:text-red-700 text-sm underline"
              >
                Eliminar reseña
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Account;
