
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import keycloak from "./keycloak/keycloak-js";
import App from "./App";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('No se encontró el elemento "root" en index.html.');
}

const root = createRoot(rootElement);

async function iniciarAplicacion() {
  try {
    await keycloak.init({
      onLoad: "check-sso",
      pkceMethod: "S256",
    });

    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  } catch (error) {
    console.error("Error al inicializar Keycloak:", error);
    root.render(
      <main role="alert">
        No se pudo conectar con el servicio de autenticación. Inténtalo de nuevo más tarde.
      </main>,
    );
  }
}

iniciarAplicacion();
