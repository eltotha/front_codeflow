import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import keycloak from "./keycloak/keycloak-js";
import { getRolPrincipal, obtenerRutaPorRol, ROLES } from "./keycloak/roles";
import Login from "./Login/Login";
import Register from "./register/register";
import Home from "./Home/Home";
import AdminView from "./views/AdminView";
import CajeroView from "./views/CajeroView";
import JefeView from "./views/JefeView";
import ProtectedRoute from "./components/ProtectedRoute";

function RedirectPorRol() {
	if (!keycloak.authenticated) {
		return <Navigate to="/login" replace />;
	}
	return <Navigate to={obtenerRutaPorRol(getRolPrincipal())} replace />;
}

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<RedirectPorRol />} />
				<Route
					path="/login"
					element={keycloak.authenticated ? <RedirectPorRol /> : <Login />}
				/>
				<Route
					path="/register"
					element={keycloak.authenticated ? <RedirectPorRol /> : <Register />}
				/>
				<Route
					path="/home"
					element={keycloak.authenticated ? <Home /> : <Navigate to="/login" replace />}
				/>
				<Route
					path="/admin"
					element={
						<ProtectedRoute allowedRoles={[ROLES.ADMINISTRADOR]}>
							<AdminView />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/cajero"
					element={
						<ProtectedRoute allowedRoles={[ROLES.ADMINISTRADOR, ROLES.CAJERO]}>
							<CajeroView />
						</ProtectedRoute>
					}
				/>
				<Route
					path="/jefe"
					element={
						<ProtectedRoute allowedRoles={[ROLES.ADMINISTRADOR, ROLES.JEFE]}>
							<JefeView />
						</ProtectedRoute>
					}
				/>
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
