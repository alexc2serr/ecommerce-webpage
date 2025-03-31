// CheckOutButton.jsx
import React, { useContext } from "react";
import { Context } from "../../App";
import { useNavigate } from "react-router-dom";

function CheckOutButton({ cartItems }) {
  const { user, setCartCounter } = useContext(Context);
  const navigate = useNavigate();

  const handleCheckOut = async () => {
    // Usa cartItems del prop o del localStorage
    const items = cartItems || JSON.parse(localStorage.getItem("cart")) || [];
    if (items.length === 0) {
      alert("El carrito está vacío.");
      return;
    }

    // Calcula el total sumando el precio de cada item
    const totalPrice = items.reduce((acc, item) => {
      const price = parseFloat(item.discounted_price || item.price) || 0;
      return acc + price * item.quantity;
    }, 0).toFixed(2);

    const payload = {
      user_id: user.id,
      total_price: totalPrice,
      status: "pending",
    };

    try {
      // 1. Crear la orden
      const orderRes = await fetch("http://localhost:3006/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        alert("Error al crear la orden: " + orderData.error);
        return;
      }
      const newOrderId = orderData.orderId;

      // 2. Guardar cada item en la tabla order_items
      for (let item of items) {
        const price = item.discounted_price || item.price;
        await fetch(`http://localhost:3006/api/orders/${newOrderId}/items`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            product_id: item.id,
            quantity: item.quantity,
            price: price,
          }),
        });
      }

      // 3. Eliminar los productos del carrito en la base de datos
      await fetch(`http://localhost:3006/api/users/${user.id}/cart`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      // 4. Vaciar el carrito en `localStorage`
      localStorage.removeItem("cart");

      // 5. Resetear el contador del carrito
      setCartCounter(0);

      alert("Orden creada exitosamente");
      navigate("/orders");
    } catch (error) {
      console.error("Error en checkout:", error);
      alert("Error al procesar la orden. Intenta nuevamente.");
    }
  };

  return (
    <button
      type="button"
      className="washed-gray-bg hover:bg-gray-700 text-white font-bold py-2 px-4 mb-8 w-48 mt-8"
      onClick={handleCheckOut}
    >
      Checkout
    </button>
  );
}

export default CheckOutButton;
