import { Link, useNavigate } from "react-router-dom";
import "./Login_Styles.css";
import logoPlaceholder from "../assets/placholder.svg";

function Login() {
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        navigate("/Home");
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

                <form onSubmit={handleSubmit}>
                    <div className="login-form-group">
                        <input className="login-input" type="text" name="Username" placeholder="Usuario" required />
                    </div>

                    <div className="login-form-group">
                        <input className="login-input" type="password" name="Password" placeholder="Contraseña" required />
                    </div>

                    <label className="login-checkbox">
                        <input type="checkbox" name="RememberMe" />
                        Recordarme
                    </label>

                    <div className="login-button-container">
                        <button className="login-button" type="submit">Ingresar</button>
                    </div>

                    <footer className="login-footer">
                        ¿No tienes una cuenta?
                        <Link className="login-register-link" to="/register">Regístrate</Link>
                    </footer>
                </form>
            </section>
        </main>
    );
}

export default Login;
