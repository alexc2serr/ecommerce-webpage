import React, { useContext, useState } from "react";
import { Context } from "../../App.jsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AddToCartButton({ product }) {
    const { user, cartCounter, setCartCounter } = useContext(Context);
    const [quantity, setQuantity] = useState(1);

    const handleAddToCart = async () => {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];

        // Buscar si el producto ya está en el carrito
        const itemIndex = cart.findIndex((item) => item.id === product.id);

        if (itemIndex !== -1) {
            cart[itemIndex].quantity += quantity;
        } else {
            cart.push({ id: product.id, quantity: quantity });
        }

        // Si el usuario está autenticado, guardamos en la base de datos
        if (user) {
            try {
                await fetch(`/api/users/${user.id}/cart`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user.token}`,
                    },
                    body: JSON.stringify({ product_id: product.id, quantity }),
                });
            } catch (error) {
                console.error("Error al guardar en la base de datos:", error);
            }
        }

        // Guardar en `localStorage` para usuarios no autenticados
        localStorage.setItem("cart", JSON.stringify(cart));

        // Actualizar contador del carrito
        setCartCounter(cartCounter + quantity);

        // Mostrar notificación
        displayCartNotification(product.title);
    };

    const displayCartNotification = (title) => {
        toast.success(`${title} has been added to cart`, {
            position: toast.POSITION.BOTTOM_RIGHT,
        });
    };

    const handleQuantityChange = (event) => {
        const btnValue = event.currentTarget.textContent;

        if (btnValue === "+" && quantity < 99) {
            setQuantity(quantity + 1);
        }

        if (btnValue === "−" && quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    return (
        <>
            <label className="sr-only">Quantity</label>

            <div className="flex items-center border border-gray-200 rounded w-32 mt-4">
                <button
                    type="button"
                    className="w-10 h-10 leading-10 text-gray-600 transition hover:opacity-75 border-gray-200 border-r"
                    onClick={(event) => handleQuantityChange(event)}
                >
                    &#8722;
                </button>

                <input
                    type="number"
                    id="Quantity"
                    className="h-10 w-16 border-transparent text-center [-moz-appearance:_textfield] sm:text-sm [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none bg-white"
                    value={quantity}
                    disabled
                />

                <button
                    type="button"
                    className="w-10 h-10 leading-10 text-gray-600 transition hover:opacity-75 border-gray-200 border-l"
                    onClick={(event) => handleQuantityChange(event)}
                >
                    &#43;
                </button>
            </div>

            <button
                className="w-full md:w-60 py-2 px-8 md:p-2 text-sm mt-4 transition ease-in duration-200 bg-white hover:bg-gray-800 hover:text-white text-black border hover:border-gray-800 border-gray-300"
                onClick={handleAddToCart}
            >
                Add to Cart
            </button>
        </>
    );
}

export default AddToCartButton;
