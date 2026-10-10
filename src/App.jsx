import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import keycloak from "./keycloak/keycloak-js";
import Login from "./Login/Login";
import Register from "./register/register";

function Home() {
  const username = keycloak.tokenParsed?.preferred_username;
  const realmRoles = keycloak.tokenParsed?.realm_access?.roles ?? [];

  return (
    /* Este es un ejemplo de como mostrar los roles de la sesión */
    /* En base a eso se renderiza el contenido para x o y rol. */
    <main>
      <h1>FarmaSys</h1>
      <p>Sesión iniciada{username ? ` como ${username}` : ""}.</p>
      <section aria-labelledby="roles-heading">
        <h3>Roles del realm</h3>
        {realmRoles.length > 0 ? (
          <ul>
            {realmRoles.map((role) => <li key={`realm-${role}`}>{role}</li>)}
          </ul>
        ) : (
          <p>No se recibieron roles de realm.</p>
        )}
      </section>
      <button
        type="button"
        onClick={() => keycloak.logout({ redirectUri: `${window.location.origin}/login` })}
      >
        Cerrar sesión
      </button>
    </main>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={keycloak.authenticated ? "/home" : "/login"} replace />}
        />
        <Route
          path="/login"
          element={keycloak.authenticated ? <Navigate to="/home" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={keycloak.authenticated ? <Navigate to="/home" replace /> : <Register />}
        />
        <Route
          path="/home"
          element={keycloak.authenticated ? <Home /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
