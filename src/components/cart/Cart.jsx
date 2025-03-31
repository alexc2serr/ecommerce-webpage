import React, { useState, useEffect, useContext } from "react";
import TotalPrice from "./TotalPrice";
import CartTable from "./CartTable";
import CheckOutButton from "./CheckOutButton";
import TitleMessage from "./TitleMessage";
import { Context } from "../../App";

function Cart() {
  const { user } = useContext(Context);
  const [cartItems, setCartItems] = useState([]);
  const [productData, setProductData] = useState({
    products: [],
    isDataLoaded: false,
  });

  // Cargar los productos disponibles
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await fetch("/api/products");
        const data = await response.json();
        setProductData({ products: data, isDataLoaded: true });
      } catch (error) {
        console.error("Problem with API connectivity", error);
      }
    };
    fetchProductData();
  }, []);

  // Cargar el carrito desde la base de datos o `localStorage`
  useEffect(() => {
    const loadCart = async () => {
      let cart = [];

      if (user) {
        try {
          const res = await fetch(`/api/users/${user.id}/cart`, {
            headers: { Authorization: `Bearer ${user.token}` },
          });
          cart = await res.json();
        } catch (error) {
          console.error("Error loading cart from database:", error);
        }
      } else {
        cart = JSON.parse(localStorage.getItem("cart")) || [];
      }

      const matchingItems = productData.products.filter((product) =>
        cart.find((cartItem) => cartItem.product_id === product.id)
      );

      setCartItems(
        matchingItems.map((product) => {
          const item = cart.find((item) => item.product_id === product.id);
          const totalProductPrice = (item.quantity * product.price).toFixed(2);
          let totalDiscountedPrice;
          if (product.discounted_price) {
            totalDiscountedPrice = (item.quantity * product.discounted_price).toFixed(2);
          }
          return {
            ...product,
            quantity: item.quantity,
            total_price: totalDiscountedPrice || totalProductPrice,
          };
        })
      );
    };
    if (productData.isDataLoaded) loadCart();
  }, [productData, user]);

  return (
    <div className="max-w-screen-2xl mx-auto p-9 flex-col pt-24">
      <TitleMessage />
      {cartItems.length > 0 ? (
        <>
          <CartTable cartItems={cartItems} setCartItems={setCartItems} />
          <div className="flex flex-col items-end justify-between text-right w-11/12 md:w-4/5 mx-auto">
            <TotalPrice cartItems={cartItems} />
            <CheckOutButton cartItems={cartItems} />
          </div>
        </>
      ) : (
        <p className="text-center mb-32">No Items in cart. Try adding some products.</p>
      )}
    </div>
  );
}

export default Cart;
