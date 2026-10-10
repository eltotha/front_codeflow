import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import keycloak from "./keycloak/keycloak-js";
import Login from "./Login/Login";
import Register from "./register/register";
import Home from "./Home/Home";

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
