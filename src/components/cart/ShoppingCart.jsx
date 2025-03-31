// ShoppingCart.jsx
import React, { useContext, useState, useEffect } from "react";
import { Context } from "../../App";
import { useNavigate } from "react-router-dom";

function ShoppingCart() {
  const { user, setCartCounter } = useContext(Context);
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetch(`/api/users/${user.id}/cart`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) => res.json())
      .then((data) => setCartItems(data))
      .catch((err) => console.error(err));
  }, [user, navigate]);

  const handleRemoveItem = (cartItemId) => {
    fetch(`/api/users/${user.id}/cart/${cartItemId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) => res.json())
      .then(() => {
        const updated = cartItems.filter((item) => item.id !== cartItemId);
        setCartItems(updated);
        const counter = updated.reduce((acc, curr) => acc + curr.quantity, 0);
        setCartCounter(counter);
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="shopping-cart-container p-8">
      <h2 className="text-2xl font-bold mb-4">Carrito de Compras</h2>
      {cartItems.length === 0 ? (
        <p>No hay productos en tu carrito.</p>
      ) : (
        <ul>
          {cartItems.map((item) => (
            <li key={item.id}>
              <span>
                Producto ID: {item.product_id} | Cantidad: {item.quantity}
              </span>
              <button onClick={() => handleRemoveItem(item.id)}>Eliminar</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ShoppingCart;
