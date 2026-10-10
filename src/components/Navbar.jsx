import { Link, useLocation } from "react-router-dom";
import keycloak from "../keycloak/keycloak-js";
import { getRolesAsignados, getRolPrincipal, ROLES } from "../keycloak/roles";
import "./Navbar.css";

export default function Navbar() {
	const location = useLocation();
	const rol = getRolPrincipal();
	const roles = getRolesAsignados();
	const perfil = keycloak.tokenParsed;
	const nombre = perfil?.name ?? perfil?.preferred_username ?? "Usuario";

	const esAdmin = roles.includes(ROLES.ADMINISTRADOR);
	const esCajero = roles.includes(ROLES.CAJERO);
	const esJefe = roles.includes(ROLES.JEFE);

	const handleLogout = () => {
		keycloak.logout({ redirectUri: `${window.location.origin}/login` });
	};

	const getBadgeClass = (roleName) => {
		if (roleName === ROLES.ADMINISTRADOR) return "badge badge-admin";
		if (roleName === ROLES.CAJERO) return "badge badge-cajero";
		if (roleName === ROLES.JEFE) return "badge badge-jefe";
		return "badge";
	};

	const isActive = (path) => (location.pathname === path ? "active" : "");

	return (
		<nav className="navbar">
			<Link to="/home" className="navbar-brand">
				<div className="navbar-logo">FS</div>
				<span className="navbar-title">FarmaSys</span>
			</Link>

			<div className="navbar-nav">
				{esAdmin && (
					<Link to="/admin" className={`navbar-link ${isActive("/admin")}`}>
						Panel Administrador
					</Link>
				)}

				{(esAdmin || esCajero) && (
					<Link to="/cajero" className={`navbar-link ${isActive("/cajero")}`}>
						{esAdmin ? "Terminal Cajero" : "Terminal de Caja"}
					</Link>
				)}

				{(esAdmin || esJefe) && (
					<Link to="/jefe" className={`navbar-link ${isActive("/jefe")}`}>
						{esAdmin ? "Auditoría Jefe" : "Panel de Supervisión"}
					</Link>
				)}
			</div>

			<div className="navbar-user">
				<div className="navbar-user-info">
					<span className="navbar-username">{nombre}</span>
					{rol && <span className={getBadgeClass(rol)}>{rol}</span>}
				</div>
				<button type="button" className="navbar-logout" onClick={handleLogout}>
					Salir
				</button>
			</div>
		</nav>
	);
}
