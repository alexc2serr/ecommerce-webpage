// App.jsx
import React, { useState, createContext } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import AnnouncementBar from "./components/AnnouncementBar";
import Header from "./components/Header";
import CategoryDescription from "./components/product-grid/CategoryDescription";
import ProductGrid from "./components/product-grid/ProductGrid";
import Footer from "./components/Footer";
import Cart from "./components/cart/Cart";
import ProductPage from "./components/product-page/ProductPage";
import NotFound from "./components/NotFound";
import Login from "./components/auth/login";
import Register from "./components/auth/Register";
import Account from "./components/Account";
import Orders from "./components/orders/Orders";
import Reviews from "./components/Reviews";

export const Context = createContext();

function App() {
  const [cartCounter, setCartCounter] = useState(0);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const navigationItems = ["Shoes", "Bags", "Hats"];

  return (
    <Context.Provider value={{ cartCounter, setCartCounter, user, setUser }}>
      <AnnouncementBar title="ME VOY A PEGAR UN TIRO" />
      <Header navigationItems={navigationItems} />

      <Router>
        <Routes>
          <Route path="/cart" element={<Cart />} />
          <Route
            path="/"
            element={
              <>
                <CategoryDescription
                  title="Products"
                  desc="Experience the latest in fashion trends! Explore a curated collection of stylish shoes, trendy bags, and chic hats for a complete and elevated look. Shop now and define your personal style."
                />
                <ProductGrid />
              </>
            }
          />
          <Route
            path="/shoes"
            element={
              <>
                <CategoryDescription
                  title="Shoes"
                  desc="Using mostly recycled fibers, we create sustainable shoes that combine comfort with timeless style. Experience artisanal craftsmanship."
                />
                <ProductGrid category="shoes" />
              </>
            }
          />
          <Route
            path="/bags"
            element={
              <>
                <CategoryDescription
                  title="Bags"
                  desc="Discover artisanal excellence in every bag."
                />
                <ProductGrid category="bags" />
              </>
            }
          />
          <Route
            path="/hats"
            element={
              <>
                <CategoryDescription
                  title="Hats"
                  desc="Our remarkable assortment of hats, where artistry meets functionality."
                />
                <ProductGrid category="hats" />
              </>
            }
          />
          {/* Cambiamos :id por :uri para que ProductPage reciba el slug */}
          <Route path="/products/:uri" element={<ProductPage />} />

          {/* Rutas de autenticación */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas de cuenta y pedidos */}
          <Route path="/account" element={<Account />} />
          <Route path="/orders" element={<Orders />} />


            {/* Reviews */}
           <Route path="/products/:productId/reviews" element={<Reviews />} />

          {/* Ruta para páginas no encontradas */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>

      <Footer />
    </Context.Provider>
  );
}

export default App;
