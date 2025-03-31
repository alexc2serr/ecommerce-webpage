# 🛒 E-Commerce Web App

![E-Commerce Banner](https://th.bing.com/th/id/OIP.ftH46ANJ14YkQNmle5Ts2QHaEc?rs=1&pid=ImgDetMain)

<p align="center">
  <img src="https://img.shields.io/github/languages/top/alexc2serr/ecommerce-webpage?style=for-the-badge"/>
  <img src="https://img.shields.io/github/license/alexc2serr/ecommerce-webpage?style=for-the-badge"/>
  <img src="https://img.shields.io/github/stars/alexc2serr/ecommerce-webpage?style=for-the-badge"/>
  <img src="https://img.shields.io/github/forks/alexc2serr/ecommerce-webpage?style=for-the-badge"/>
</p>

---

## 🚀 Overview
Welcome to my **E-Commerce Web Application**! This is a **full-stack** application built using:

- 🌟 **Frontend:** React.js
- ⚙️ **Backend:** Node.js (Express)
- 🗄️ **Database:** MySQL

This project allows users to **browse products**, add them to the **cart**, and securely **checkout**. <br>
Also they will have to **Register**, **Login**, post **Reviews** and check their **order history**.

---

## 🎨 Tech Stack

| **Frontend** | **Backend** | **Database** | **Styling** |
|-------------|------------|-------------|-------------|
| ![React](https://img.shields.io/badge/React-19.0.0-blue?style=for-the-badge&logo=react) | ![Node.js](https://img.shields.io/badge/Node.js-Express--4.21.2-green?style=for-the-badge&logo=node.js) | ![MySQL](https://img.shields.io/badge/MySQL-Database-orange?style=for-the-badge&logo=mysql) | ![Styled Components](https://img.shields.io/badge/Styled--Components-💅-pink?style=for-the-badge) |

---

## 📂 Project Structure

<details>
  <summary>Click to expand project structure</summary>
<code>
  e-commerce-app
├── node_modules/ 📦
├── public/ 🌍
├── screenshots/ 📸
├── src/ 🖥️
│ ├── api/ 🌐
│ ├── components/ ⚙️
│ │ ├── auth/ 🔐
│ │ ├── cart/ 🛒
│ │ ├── orders/ 📦
│ │ ├── product-grid/ 🛍️
│ │ ├── product-page/ 📄
│ │ ├── Account.jsx 👤
│ │ ├── AnnouncementBar.jsx 📢
│ │ ├── AverageStarRatings.jsx ⭐
│ │ ├── Footer.jsx 🦶
│ │ ├── Header.jsx 🔝
│ │ ├── NotFound.jsx ❌
│ │ ├── Reviews.jsx 📝
│ ├── App.jsx 📱
│ ├── main.jsx 🔑
│ ├── styles.css 🎨
├── .gitignore 🚫
├── index.html 🗂️
├── package-lock.json 🔒
├── package.json 📦
├── postcss.config.js ⚙️
├── README.md 📘
├── tailwind.config.js 🌬️
├── toImplement.txt 📝
├── vite.config.js ⚡

</code>

</details>

---

## 🔥 Features

✔️ **User Authentication (JWT-based)**  
✔️ **Product Listing & Filtering**  
✔️ **Shopping Cart & Checkout**  
✔️ **Order Management**   
✔️ **MySQL Database Integration**  

---

## 🛠️ Installation
  ## ❗REQUIREMENTS
    ├── Node.js
    ├── Npm or similar
    ├── IDE (Visual Studio Code or Similar)
    ├── XAMPP (For MySQL server)
    ├── MySQL WorkBench (For easy management)

    !!You do not need everything in this list but it makes easier the process.

  1️⃣ Setup MySQL Side
  - We have to setup the SQL enviroment, for that we have to open a localhost Server using XAMPP and starting Apache and SQL Servers.  
  - Open MySQL Workbench, entero your database with your credentials and create the 5 tables using the SQL code from this section [MySQL](#-mysql).
  - If everything seems okay go on :)
  
 2️⃣ Install Dependencies
 - Firstly we have to install Node


  
  ## 📑 MySQL 
  <details>

    //0. Products Table (Products available)
    
      CREATE TABLE products(
         id               INTEGER  NOT NULL PRIMARY KEY 
        ,title            VARCHAR(255) NOT NULL
        ,category         VARCHAR(5) NOT NULL
        ,description      VARCHAR(255) NOT NULL
        ,image            VARCHAR(255) NOT NULL
        ,price            NUMERIC(5,2) NOT NULL
        ,rating           INTEGER  NOT NULL
        ,color            VARCHAR(6) NOT NULL
        ,discounted_price NUMERIC(5,2)
        ,uri              VARCHAR(255) NOT NULL
      );
    
    //1. Users Table (for Authentication)
    
    CREATE TABLE users (
       id               INTEGER AUTO_INCREMENT PRIMARY KEY,
       username         VARCHAR(255) NOT NULL UNIQUE,
       email            VARCHAR(255) NOT NULL UNIQUE,
       password_hash    VARCHAR(255) NOT NULL,
       full_name        VARCHAR(255) NOT NULL,
       address          TEXT,
       role             ENUM('user', 'admin') DEFAULT 'user',
       created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    
    //2. Orders Table (to track purchases)
    
    CREATE TABLE orders (
       id               INTEGER AUTO_INCREMENT PRIMARY KEY,
       user_id          INTEGER NOT NULL,
       total_price      NUMERIC(10, 2) NOT NULL,
       status           ENUM('pending', 'paid', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
       created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
       FOREIGN KEY (user_id) REFERENCES users(id)
    );
    
    
    //3. Order Items Table (to store products in each order)
    
    
    CREATE TABLE order_items (
       id               INTEGER AUTO_INCREMENT PRIMARY KEY,
       order_id         INTEGER NOT NULL,
       product_id       INTEGER NOT NULL,
       quantity         INTEGER NOT NULL,
       price            NUMERIC(5,2) NOT NULL,
       FOREIGN KEY (order_id) REFERENCES orders(id),
       FOREIGN KEY (product_id) REFERENCES products(id)
    );
    
    
    
    //Product Reviews Table (for user reviews)
    
    
    CREATE TABLE reviews (
       id               INTEGER AUTO_INCREMENT PRIMARY KEY,
       user_id          INTEGER NOT NULL,
       product_id       INTEGER NOT NULL,
       rating           INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
       review_text      TEXT,
       created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (user_id) REFERENCES users(id),
       FOREIGN KEY (product_id) REFERENCES products(id)
    );
    
    
     //Shopping Cart Table (to temporarily store items in the cart)
    
    CREATE TABLE shopping_cart (
       id               INTEGER AUTO_INCREMENT PRIMARY KEY,
       user_id          INTEGER NOT NULL,
       product_id       INTEGER NOT NULL,
       quantity         INTEGER NOT NULL,
       created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
       FOREIGN KEY (user_id) REFERENCES users(id),
       FOREIGN KEY (product_id) REFERENCES products(id)
    );

  </details>

### 📥 Clone the Repository
```sh
git clone https://github.com/yourusername/ecommerce-app.git
cd ecommerce-app
