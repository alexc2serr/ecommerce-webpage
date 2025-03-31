import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [address, setAddress] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("http://localhost:3006/api/auth/register", { 
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password, full_name: fullName, address }),
            });

            const data = await res.json();
            if (res.ok) {
                alert("Registro exitoso! Redirigiendo al login...");
                navigate("/login");
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            alert("Error al registrarse. Inténtelo de nuevo.");
        }
    };

    return (
        <div className="register-container">
            <div className="register-box">
                <h2>Registrarse</h2>
                <form onSubmit={handleRegister} className="register-form">
                    <input
                        type="text"
                        placeholder="Nombre de usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="register-input"
                    />
                    <input
                        type="text"
                        placeholder="Nombre completo"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="register-input"
                    />
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="register-input"
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="register-input"
                    />
                    <textarea
                        placeholder="Dirección (opcional)"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="register-input"
                    />
                    <button type="submit" className="register-btn">Registrarse</button>
                </form>
                <p className="login-link">
                    ¿Ya tienes cuenta? <a href="/login">Inicia sesión</a>
                </p>
            </div>
        </div>
    );
}

export default Register;
