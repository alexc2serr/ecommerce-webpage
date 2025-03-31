// Orders.jsx
import React, { useEffect, useState, useContext } from "react";
import { Context } from "../../App";
import { useNavigate, Link } from "react-router-dom";

function Orders() {
  const { user } = useContext(Context);
  const [orders, setOrders] = useState([]);
  const [reviewedProducts, setReviewedProducts] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      navigate("/login");
      return;
    }

    // 1. Obtener los productos que el usuario ya ha reseñado
    fetch(`/api/users/${user.id}/reviewedProducts`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) => res.json())
      .then((reviewedProductIds) => {
        setReviewedProducts(new Set(reviewedProductIds));
      })
      .catch((err) => console.error("Error obteniendo productos reseñados:", err));

    // 2. Obtener los pedidos del usuario con los ítems
    fetch(`/api/users/${user.id}/orders`, {
      headers: { Authorization: `Bearer ${user.token}` },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Error en la respuesta de la red");
        }
        return res.json();
      })
      .then(async (ordersData) => {
        if (!Array.isArray(ordersData)) return [];
        const ordersWithItems = await Promise.all(
          ordersData.map(async (order) => {
            const itemsRes = await fetch(`/api/orders/${order.id}/items`, {
              headers: { Authorization: `Bearer ${user.token}` },
            });
            if (!itemsRes.ok) {
              throw new Error("Error al obtener items del pedido");
            }
            const itemsData = await itemsRes.json();
            return { ...order, items: itemsData };
          })
        );
        return ordersWithItems;
      })
      .then((finalOrders) => {
        setOrders(finalOrders);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Error al obtener los pedidos");
        setLoading(false);
      });
  }, [user, navigate]);

  if (loading) {
    return <div className="p-8">Cargando pedidos...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="orders-container p-8">
      <h2 className="text-2xl font-bold mb-4">Tus Pedidos</h2>
      {orders.length === 0 ? (
        <p>No se encontraron pedidos.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="mb-6 border p-4 rounded-lg shadow-md">
            <p className="font-bold">
              <strong>ID de Pedido:</strong> {order.id} | <strong>Total:</strong> ${order.total_price}
            </p>
            {order.items && order.items.length > 0 ? (
              <table className="w-full mt-4 border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Producto</th>
                    <th className="text-right py-2">Precio Unitario</th>
                    <th className="text-right py-2">Cantidad</th>
                    <th className="text-right py-2">Total</th>
                    <th className="text-center py-2">Reseña</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-2 flex items-center">
                        <img src={`/${item.image}`} alt={item.title} className="w-12 h-12 object-cover rounded-md mr-4" />
                        <span>{item.title}</span>
                      </td>
                      <td className="py-2 text-right">${item.price}</td>
                      <td className="py-2 text-right">{item.quantity}</td>
                      <td className="py-2 text-right">
                        ${(Number(item.price) * Number(item.quantity)).toFixed(2)}
                      </td>
                      <td className="py-2 text-center">
                        {reviewedProducts.has(item.product_id) ? (
                          <span className="text-green-500 font-bold">Reseña añadida ✅</span>
                        ) : (
                          <Link
                            to={`/products/${item.product_id}/reviews`}
                            className="text-blue-500 underline"
                          >
                            Añadir Reseña
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="mt-2">No hay productos en este pedido.</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default Orders;
