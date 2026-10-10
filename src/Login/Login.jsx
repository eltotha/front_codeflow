import { useState } from "react";
import { Link } from "react-router-dom";
import keycloak from "../keycloak/keycloak-js";
import "./Login_Styles.css";
import logoPlaceholder from "../assets/placholder.svg";

function Login() {
    const [error, setError] = useState("");

    const handleLogin = async () => {
        setError("");
        try {
            await keycloak.login({ redirectUri: `${window.location.origin}/home` });
        } catch (loginError) {
            console.error("Error al iniciar sesión con Keycloak:", loginError);
            setError("No se pudo iniciar el acceso. Inténtalo de nuevo.");
        }
    };

    return (
        <main className="login-background">
            <section className="login-card">
                <header className="login-header">
                    <div className="login-brand" aria-label="FarmaSys">
                        <div className="login-logo-placeholder">
                            <img className="login-logo-image" src={logoPlaceholder} alt="Espacio para el logo" />
                        </div>
                        <span className="login-brand-name">FarmaSys</span>
                    </div>
                    <p className="login-eyebrow">Acceso al sistema</p>
                    <h1>Inicio de sesión</h1>
                </header>

                <div>
                    {error && <p role="alert">{error}</p>}
                    <div className="login-button-container">
                        <button className="login-button" type="button" onClick={handleLogin}>
                            Ingresar con Keycloak
                        </button>
                    </div>

                </div>
            </section>
        </main>
    );
}

export default Login;
