import { Link, useNavigate } from "react-router-dom";
import "./register.css";
import logoPlaceholder from "../assets/placholder.svg";

function Register() {
	const navigate = useNavigate();

	const handleSubmit = (event) => {
		event.preventDefault();
		navigate("/login");
	};

	return (
		<main className="login-background">
			<section className="login-card">
				<header className="login-header">
					<div className="login-logo" aria-label="FarmaFia">
						<img className="login-logo-image" src={logoPlaceholder} alt="" />
						<span>FarmaFia</span>
					</div>
					<h1>Crear Cuenta</h1>
				</header>

				<form onSubmit={handleSubmit}>
					<div className="login-form-group">
						<input
							className="login-input"
							type="text"
							name="Username"
							placeholder="Usuario"
							required
						/>
					</div>

					<div className="login-form-group">
						<input
							className="login-input"
							type="email"
							name="Email"
							placeholder="Correo electrónico"
							required
						/>
					</div>

					<div className="login-form-group">
						<input
							className="login-input"
							type="password"
							name="Password"
							placeholder="Contraseña"
							required
						/>
					</div>

					<div className="login-form-group">
						<input
							className="login-input"
							type="password"
							name="ConfirmPassword"
							placeholder="Confirmar contraseña"
							required
						/>
					</div>

					<div className="login-button-container">
						<button className="login-button" type="submit">Registrarme</button>
					</div>

					<footer className="login-footer">
						¿Ya tienes una cuenta?
						<Link className="login-register-link" to="/login">Inicia sesión</Link>
					</footer>
				</form>
			</section>
		</main>
	);
}

export default Register;
