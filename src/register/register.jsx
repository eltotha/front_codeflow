import { useState } from "react";
import { Link } from "react-router-dom";
import keycloak from "../keycloak/keycloak-js";
import "./register.css";
import logoPlaceholder from "../assets/placholder.svg";

function Register() {
	const [error, setError] = useState("");

	const handleRegister = async () => {
		setError("");
		try {
			await keycloak.register({ redirectUri: `${window.location.origin}/login` });
		} catch (registerError) {
			console.error("Error al registrarse con Keycloak:", registerError);
			setError("No se pudo abrir el registro. Inténtalo de nuevo.");
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
					<h1>Crear Cuenta</h1>
				</header>

				<div>
					{error && <p role="alert">{error}</p>}
					<div className="login-button-container">
						<button className="login-button" type="button" onClick={handleRegister}>
							Crear cuenta con Keycloak
						</button>
					</div>

					<footer className="login-footer">
						¿Ya tienes una cuenta?
						<Link className="login-register-link" to="/login">Inicia sesión</Link>
					</footer>
				</div>
			</section>
		</main>
	);
}

export default Register;
