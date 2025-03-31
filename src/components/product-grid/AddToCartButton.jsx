import React, { useContext } from "react";
import { Context } from "../../App";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AddToCartButton({ product }) {
  const { user, cartCounter, setCartCounter } = useContext(Context);

  const handleAddToCart = async () => {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const itemIndex = cart.findIndex((item) => item.id === product.id);

    if (itemIndex !== -1) {
      cart[itemIndex].quantity++;
    } else {
      cart.push({ id: product.id, quantity: 1 });
    }

    // Si el usuario está autenticado, guardar en la base de datos
    if (user) {
      try {
        await fetch(`/api/users/${user.id}/cart`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ product_id: product.id, quantity: 1 }),
        });
      } catch (error) {
        console.error("Error al guardar en la base de datos:", error);
      }
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    setCartCounter(cartCounter + 1);
    displayCartNotification(product.title);
  };

  const displayCartNotification = (title) => {
    toast.success(`${title} has been added to cart`, {
      position: toast.POSITION.BOTTOM_RIGHT,
    });
  };

  return (
    <button
      className="w-full md:w-50 py-2 px-8 md:p-2 text-sm mt-4 transition ease-in duration-200 bg-white hover:bg-gray-800 hover:text-white text-black border hover:border-gray-800 border-gray-300"
      onClick={handleAddToCart}
    >
      Add to Cart
    </button>
  );
}

export default AddToCartButton;
