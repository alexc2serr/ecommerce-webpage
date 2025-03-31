// server.js
require("dotenv").config({ path: "./.env" });

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const database = require("./database");

const app = express();
const PORT = process.env.PORT || 3006;

app.use(cors());
app.use(express.json());

/* ================================
   AUTENTICACIÓN
================================ */

// REGISTRO DE USUARIO
app.post("/api/auth/register", async (req, res) => {
  const { username, email, password, full_name, address } = req.body;
  if (!username || !email || !password || !full_name) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  try {
    // Verificar si el usuario ya existe
    const existingUser = await new Promise((resolve, reject) => {
      database.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
        if (err) reject(err);
        resolve(results.length > 0);
      });
    });
    if (existingUser) {
      return res.status(400).json({ error: "El usuario ya existe" });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario en la base de datos
    database.query(
      "INSERT INTO users (username, email, password_hash, full_name, address, role) VALUES (?, ?, ?, ?, ?, 'user')",
      [username, email, hashedPassword, full_name, address],
      (err) => {
        if (err) return res.status(500).json({ error: "Error al registrar usuario" });
        res.status(201).json({ message: "Usuario registrado exitosamente" });
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// LOGIN DE USUARIO
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email y contraseña son requeridos" });
  }

  database.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: "Error en la base de datos" });
    if (results.length === 0) {
      return res.status(400).json({ error: "Usuario no encontrado" });
    }
    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    // Generar token JWT
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
    res.json({
      message: "Login exitoso",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  });
});

/* ================================
   PRODUCTOS
================================ */

// GET todos los productos
app.get("/api/products", (req, res) => {
  database.query("SELECT * FROM products", (error, results) => {
    if (error) return res.status(500).json({ error: "Error al obtener productos" });
    res.json(results);
  });
});

// GET producto por ID (si lo necesitas)
app.get("/api/products/:id", (req, res) => {
  const productId = req.params.id;
  database.query("SELECT * FROM products WHERE id = ? LIMIT 1", [productId], (error, results) => {
    if (error) return res.status(500).json({ error: "Error al obtener el producto" });
    res.json(results[0] || {});
  });
});

// GET producto por URI (slug)
app.get("/api/products/uri/:uri", (req, res) => {
  const { uri } = req.params;
  database.query("SELECT * FROM products WHERE uri = ? LIMIT 1", [uri], (error, results) => {
    if (error) return res.status(500).json({ error: "Error al obtener el producto" });
    res.json(results[0] || {});
  });
});

// POST nuevo producto (restringido a admin)
app.post("/api/products", (req, res) => {
  const { title, category, description, image, price, rating, color, discounted_price, uri } = req.body;
  if (!title || !category || !description || !image || !price || !rating || !color || !uri) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  database.query(
    "INSERT INTO products (title, category, description, image, price, rating, color, discounted_price, uri) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [title, category, description, image, price, rating, color, discounted_price, uri],
    (error, results) => {
      if (error) return res.status(500).json({ error: "Error al crear producto" });
      res.status(201).json({ message: "Producto creado exitosamente", productId: results.insertId });
    }
  );
});

/* ================================
   ORDENES y ORDER ITEMS
================================ */

// GET todas las órdenes de un usuario
app.get("/api/users/:userId/orders", (req, res) => {
  const userId = req.params.userId;
  database.query("SELECT * FROM orders WHERE user_id = ?", [userId], (error, results) => {
    if (error) return res.status(500).json({ error: "Error al obtener órdenes" });
    res.json(results);
  });
});

// GET orden por ID
app.get("/api/orders/:orderId", (req, res) => {
  const orderId = req.params.orderId;
  database.query("SELECT * FROM orders WHERE id = ?", [orderId], (error, results) => {
    if (error) return res.status(500).json({ error: "Error al obtener la orden" });
    res.json(results[0] || {});
  });
});

// POST crear orden (por checkout)
app.post("/api/orders", (req, res) => {
  const { user_id, total_price, status } = req.body;
  if (!user_id || !total_price) {
    return res.status(400).json({ error: "Faltan datos para crear la orden" });
  }

  database.query(
    "INSERT INTO orders (user_id, total_price, status) VALUES (?, ?, ?)",
    [user_id, total_price, status || "pending"],
    (error, results) => {
      if (error) return res.status(500).json({ error: "Error al crear la orden" });
      res.status(201).json({ message: "Orden creada exitosamente", orderId: results.insertId });
    }
  );
});

// ORDER ITEMS
// GET items de una orden
// GET items de una orden con datos del producto (JOIN con products)
app.get("/api/orders/:orderId/items", (req, res) => {
    const orderId = req.params.orderId;
    const query = `
      SELECT oi.*, p.title, p.image, p.uri, p.price AS product_price
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `;
    database.query(query, [orderId], (error, results) => {
      if (error) return res.status(500).json({ error: "Error al obtener items de la orden" });
      res.json(results);
    });
  });
  

// POST agregar item a una orden
app.post("/api/orders/:orderId/items", (req, res) => {
  const orderId = req.params.orderId;
  const { product_id, quantity, price } = req.body;
  if (!product_id || !quantity || !price) {
    return res.status(400).json({ error: "Faltan datos para crear el item" });
  }
  database.query(
    "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
    [orderId, product_id, quantity, price],
    (error, results) => {
      if (error) return res.status(500).json({ error: "Error al agregar item a la orden" });
      res.status(201).json({ message: "Item agregado exitosamente", itemId: results.insertId });
    }
  );
});

/* ================================
   REVIEWS
================================ */

// GET todas las reviews de un producto
app.get("/api/products/:productId/reviews", (req, res) => {
  const productId = req.params.productId;
  database.query("SELECT * FROM reviews WHERE product_id = ?", [productId], (error, results) => {
    if (error) return res.status(500).json({ error: "Error al obtener reviews" });
    res.json(results);
  });
});

// POST nueva review
app.post("/api/products/:productId/reviews", (req, res) => {
  const productId = req.params.productId;
  const { user_id, rating, review_text } = req.body;
  if (!user_id || !rating) {
    return res.status(400).json({ error: "Faltan datos para crear la review" });
  }
  database.query(
    "INSERT INTO reviews (user_id, product_id, rating, review_text) VALUES (?, ?, ?, ?)",
    [user_id, productId, rating, review_text || null],
    (error, results) => {
      if (error) return res.status(500).json({ error: "Error al crear la review" });
      res.status(201).json({ message: "Review creada exitosamente", reviewId: results.insertId });
    }
  );
});

// DELETE review por ID
app.delete("/api/reviews/:reviewId", (req, res) => {
    const reviewId = req.params.reviewId;
    database.query("DELETE FROM reviews WHERE id = ?", [reviewId], (error, results) => {
      if (error) return res.status(500).json({ error: "Error al eliminar la reseña" });
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Reseña no encontrada" });
      }
      res.json({ message: "Reseña eliminada con éxito" });
    });
  });

// GET todas las reseñas de un usuario
app.get("/api/users/:userId/reviews", (req, res) => {
    const userId = req.params.userId;
    database.query(
      `SELECT r.id, r.product_id, r.rating, r.review_text, p.title, p.image 
       FROM reviews r 
       JOIN products p ON r.product_id = p.id 
       WHERE r.user_id = ?`, 
      [userId], 
      (error, results) => {
        if (error) return res.status(500).json({ error: "Error al obtener reseñas del usuario" });
        res.json(results);
      }
    );
  });
  

  // GET productos reseñados por el usuario
app.get("/api/users/:userId/reviewedProducts", (req, res) => {
    const userId = req.params.userId;
    database.query(
      "SELECT DISTINCT product_id FROM reviews WHERE user_id = ?",
      [userId],
      (error, results) => {
        if (error) return res.status(500).json({ error: "Error al obtener productos reseñados" });
        const reviewedProductIds = results.map((row) => row.product_id);
        res.json(reviewedProductIds);
      }
    );
  });
  

/* ================================
   SHOPPING CART
================================ */

// GET user cart items
app.get("/api/users/:userId/cart", (req, res) => {
    const userId = req.params.userId;
    database.query(
      `SELECT sc.id, sc.product_id, p.title, p.image, p.price, sc.quantity 
       FROM shopping_cart sc
       JOIN products p ON sc.product_id = p.id
       WHERE sc.user_id = ?`, 
      [userId],
      (error, results) => {
        if (error) return res.status(500).json({ error: "Error al obtener el carrito" });
        res.json(results);
      }
    );
  });
  
  // ADD item to cart
  app.post("/api/users/:userId/cart", (req, res) => {
    const { userId } = req.params;
    const { product_id, quantity } = req.body;
  
    database.query(
      `INSERT INTO shopping_cart (user_id, product_id, quantity)
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
      [userId, product_id, quantity, quantity],
      (error) => {
        if (error) return res.status(500).json({ error: "Error al agregar al carrito" });
        res.json({ message: "Producto agregado al carrito" });
      }
    );
  });
  
  // DELETE cart item
  app.delete("/api/users/:userId/cart/:cartItemId", (req, res) => {
    const { cartItemId } = req.params;
    database.query("DELETE FROM shopping_cart WHERE id = ?", [cartItemId], (error) => {
      if (error) return res.status(500).json({ error: "Error al eliminar item del carrito" });
      res.json({ message: "Item eliminado del carrito con éxito" });
    });
  });
  
  // CLEAR CART after checkout
  app.delete("/api/users/:userId/cart", (req, res) => {
    const { userId } = req.params;
    database.query("DELETE FROM shopping_cart WHERE user_id = ?", [userId], (error) => {
      if (error) return res.status(500).json({ error: "Error al limpiar el carrito" });
      res.json({ message: "Carrito limpiado con éxito" });
    });
  });
  

/* ================================
   CHECK PURCHASE (for reviews)
================================ */

app.get("/api/users/:userId/hasPurchased/:productId", (req, res) => {
  const { userId, productId } = req.params;
  database.query(
    `SELECT oi.* FROM orders o 
     JOIN order_items oi ON o.id = oi.order_id 
     WHERE o.user_id = ? AND oi.product_id = ?`,
    [userId, productId],
    (error, results) => {
      if (error) return res.status(500).json({ error: "Error checking purchase" });
      res.json({ purchased: results.length > 0 });
    }
  );
});

// GET producto por URI (slug)
app.get("/api/products/uri/:uri", (req, res) => {
    const { uri } = req.params;
    database.query("SELECT * FROM products WHERE uri = ? LIMIT 1", [uri], (error, results) => {
      if (error) return res.status(500).json({ error: "Error al obtener el producto" });
      res.json(results[0] || {});
    });
  });
  
  // GET productos relacionados por categoría
  app.get("/api/products/related/:category", (req, res) => {
    const category = req.params.category;
    database.query("SELECT * FROM products WHERE category = ?", [category], (error, results) => {
      if (error) return res.status(500).json({ error: "Error fetching related products" });
      res.json(results);
    });
  });

  // GET promedio de rating para un producto
app.get("/api/products/:productId/averageRating", (req, res) => {
    const productId = req.params.productId;
    database.query(
      "SELECT AVG(rating) AS avgRating FROM reviews WHERE product_id = ?",
      [productId],
      (error, results) => {
        if (error) return res.status(500).json({ error: "Error al obtener promedio de rating" });
        // Si no hay reviews, devolvemos 0
        res.json({ avgRating: results[0].avgRating || 0 });
      }
    );
  });

  // GET producto por URI (slug)
app.get("/api/products/uri/:uri", (req, res) => {
    const { uri } = req.params;
    database.query("SELECT * FROM products WHERE uri = ? LIMIT 1", [uri], (error, results) => {
      if (error) return res.status(500).json({ error: "Error al obtener el producto" });
      res.json(results[0] || {});
    });
  });
  
  // GET productos relacionados por categoría
  app.get("/api/products/related/:category", (req, res) => {
    const category = req.params.category;
    database.query("SELECT * FROM products WHERE category = ?", [category], (error, results) => {
      if (error) return res.status(500).json({ error: "Error fetching related products" });
      res.json(results);
    });
  });
  
  
  

/* ================================
   INICIAR SERVIDOR
================================ */

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
