import keycloak from "../keycloak/keycloak-js";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8081";

async function getAuthHeader() {
	if (keycloak && keycloak.token) {
		try {
			await keycloak.updateToken(30);
		} catch {
			// Token update silently failed, proceed with current token
		}
		return {
			Authorization: `Bearer ${keycloak.token}`,
		};
	}
	return {};
}

async function request(path, options = {}) {
	const authHeaders = await getAuthHeader();
	const headers = {
		"Content-Type": "application/json",
		...authHeaders,
		...options.headers,
	};

	const url = `${BASE_URL}${path}`;

	try {
		const response = await fetch(url, {
			...options,
			headers,
		});

		if (response.status === 204) {
			return null;
		}

		const contentType = response.headers.get("content-type");
		const isJson = contentType && contentType.includes("application/json");
		const data = isJson ? await response.json() : await response.text();

		if (!response.ok) {
			const errorMsg =
				(typeof data === "object" && (data.detail || data.title || data.message)) ||
				response.statusText ||
				"Error en la petición";
			throw new Error(errorMsg);
		}

		return data;
	} catch (error) {
		console.error(`Error en llamada a ${path}:`, error);
		throw error;
	}
}

// 1. Categorías
export const categoriasApi = {
	getAll: () => request("/api/categorias"),
	getById: (id) => request(`/api/categorias/${id}`),
	create: (data) => request("/api/categorias", { method: "POST", body: JSON.stringify(data) }),
	update: (data) => request("/api/categorias", { method: "PUT", body: JSON.stringify(data) }),
	delete: (id) => request(`/api/categorias/${id}`, { method: "DELETE" }),
};

// 2. Proveedores
export const proveedoresApi = {
	getAll: () => request("/api/proveedores"),
	getById: (id) => request(`/api/proveedores/${id}`),
	create: (data) => request("/api/proveedores", { method: "POST", body: JSON.stringify(data) }),
	update: (data) => request("/api/proveedores", { method: "PUT", body: JSON.stringify(data) }),
	delete: (id) => request(`/api/proveedores/${id}`, { method: "DELETE" }),
};

// 3. Clientes
export const clientesApi = {
	getAll: () => request("/api/clientes"),
	getById: (id) => request(`/api/clientes/${id}`),
	create: (data) => request("/api/clientes", { method: "POST", body: JSON.stringify(data) }),
	update: (data) => request("/api/clientes", { method: "PUT", body: JSON.stringify(data) }),
	delete: (id) => request(`/api/clientes/${id}`, { method: "DELETE" }),
};

// 4. Productos
export const productosApi = {
	getAll: () => request("/api/productos"),
	getById: (id) => request(`/api/productos/${id}`),
	create: (data) => request("/api/productos", { method: "POST", body: JSON.stringify(data) }),
	update: (data) => request("/api/productos", { method: "PUT", body: JSON.stringify(data) }),
	delete: (id) => request(`/api/productos/${id}`, { method: "DELETE" }),
};

// 5. Lotes
export const lotesApi = {
	getAll: () => request("/api/lotes"),
	getById: (id) => request(`/api/lotes/${id}`),
	create: (data) => request("/api/lotes", { method: "POST", body: JSON.stringify(data) }),
	update: (data) => request("/api/lotes", { method: "PUT", body: JSON.stringify(data) }),
	delete: (id) => request(`/api/lotes/${id}`, { method: "DELETE" }),
};

// 6. Compras
export const comprasApi = {
	getAll: () => request("/api/compras"),
	getById: (id) => request(`/api/compras/${id}`),
	create: (data) => request("/api/compras", { method: "POST", body: JSON.stringify(data) }),
	update: (data) => request("/api/compras", { method: "PUT", body: JSON.stringify(data) }),
	delete: (id) => request(`/api/compras/${id}`, { method: "DELETE" }),
};

// 7. Detalle Compras
export const detalleComprasApi = {
	getAll: () => request("/api/detalle_compras"),
	getById: (id) => request(`/api/detalle_compras/${id}`),
	create: (data) => request("/api/detalle_compras", { method: "POST", body: JSON.stringify(data) }),
	update: (data) => request("/api/detalle_compras", { method: "PUT", body: JSON.stringify(data) }),
	delete: (id) => request(`/api/detalle_compras/${id}`, { method: "DELETE" }),
};

// 8. Ventas
export const ventasApi = {
	getAll: () => request("/api/ventas"),
	getById: (id) => request(`/api/ventas/${id}`),
	create: (data) => request("/api/ventas", { method: "POST", body: JSON.stringify(data) }),
	update: (data) => request("/api/ventas", { method: "PUT", body: JSON.stringify(data) }),
	delete: (id) => request(`/api/ventas/${id}`, { method: "DELETE" }),
};

// 9. Detalle Ventas
export const detalleVentasApi = {
	getAll: () => request("/api/detalle_ventas"),
	getById: (id) => request(`/api/detalle_ventas/${id}`),
	create: (data) => request("/api/detalle_ventas", { method: "POST", body: JSON.stringify(data) }),
	update: (data) => request("/api/detalle_ventas", { method: "PUT", body: JSON.stringify(data) }),
	delete: (id) => request(`/api/detalle_ventas/${id}`, { method: "DELETE" }),
};
