import { Navigate } from "react-router-dom";
import keycloak from "../keycloak/keycloak-js";
import { getRolPrincipal, getRolesRealm, obtenerRutaPorRol } from "../keycloak/roles";

export default function ProtectedRoute({ children, allowedRoles }) {
	if (!keycloak.authenticated) {
		return <Navigate to="/login" replace />;
	}

	const userRoles = getRolesRealm();
	const rolPrincipal = getRolPrincipal();

	if (allowedRoles && allowedRoles.length > 0) {
		const hasAllowedRole = allowedRoles.some((role) => userRoles.includes(role));
		if (!hasAllowedRole) {
			const destination = obtenerRutaPorRol(rolPrincipal);
			return <Navigate to={destination} replace />;
		}
	}

	return children;
}
