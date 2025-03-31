require("dotenv").config();
const mysql = require("mysql2");

//console.log("DATABASE CONFIG:", {
//    host: process.env.DATABASE_HOST,
//    user: process.env.DATABASE_USER,
//    password: process.env.DATABASE_PASSWORD,
//    database: process.env.DATABASE_NAME,
//    connectionLimit: process.env.DATABASE_CONNECTION_LIMIT,
//});

const pool = mysql.createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    connectionLimit: Number(process.env.DATABASE_CONNECTION_LIMIT) || 10,
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error("❌ Error de conexión a la base de datos:", err.message);
        return;
    }
    console.log("✅ Conexión exitosa a la base de datos MySQL");
    connection.release();
});

module.exports = pool;
