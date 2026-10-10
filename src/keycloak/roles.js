import keycloak from "./keycloak-js";

export const ROLES = {
	ADMINISTRADOR: "ADMINISTRADOR",
	CAJERO: "CAJERO",
	JEFE: "JEFE",
};

export const ACCESO = {
	ESCRITURA: "escritura",
	LECTURA: "lectura",
};

export const DESCRIPCIONES_ROL = {
	ADMINISTRADOR: "Control total: puede leer y escribir en todos los endpoints y módulos.",
	CAJERO: "Operación de caja: puede crear ventas y consultar la información operativa.",
	JEFE: "Supervisión y auditoría: puede consultar y auditar toda la información sin editarla.",
};

export const MODULOS = [
	{
		id: "ventas",
		titulo: "Ventas",
		descripcion: "Registra y consulta las ventas de la farmacia.",
		acceso: {
			ADMINISTRADOR: ACCESO.ESCRITURA,
			CAJERO: ACCESO.ESCRITURA,
			JEFE: ACCESO.LECTURA,
		},
	},
	{
		id: "compras",
		titulo: "Compras",
		descripcion: "Gestiona las compras de stock a proveedores.",
		acceso: {
			ADMINISTRADOR: ACCESO.ESCRITURA,
			JEFE: ACCESO.LECTURA,
		},
	},
	{
		id: "productos",
		titulo: "Productos",
		descripcion: "Catálogo de medicamentos y productos.",
		acceso: {
			ADMINISTRADOR: ACCESO.ESCRITURA,
			CAJERO: ACCESO.LECTURA,
			JEFE: ACCESO.LECTURA,
		},
	},
	{
		id: "lotes",
		titulo: "Lotes",
		descripcion: "Control de lotes, existencias y fechas de vencimiento.",
		acceso: {
			ADMINISTRADOR: ACCESO.ESCRITURA,
			CAJERO: ACCESO.LECTURA,
			JEFE: ACCESO.LECTURA,
		},
	},
	{
		id: "proveedores",
		titulo: "Proveedores",
		descripcion: "Directorio e información de proveedores.",
		acceso: {
			ADMINISTRADOR: ACCESO.ESCRITURA,
			JEFE: ACCESO.LECTURA,
		},
	},
	{
		id: "clientes",
		titulo: "Clientes",
		descripcion: "Registro y consulta de clientes.",
		acceso: {
			ADMINISTRADOR: ACCESO.ESCRITURA,
			CAJERO: ACCESO.ESCRITURA,
			JEFE: ACCESO.LECTURA,
		},
	},
	{
		id: "categorias",
		titulo: "Categorías",
		descripcion: "Clasificación y categorías de productos.",
		acceso: {
			ADMINISTRADOR: ACCESO.ESCRITURA,
			CAJERO: ACCESO.LECTURA,
			JEFE: ACCESO.LECTURA,
		},
	},
];

export function getRolesRealm() {
	return keycloak.tokenParsed?.realm_access?.roles ?? [];
}

export function getRolesAsignados() {
	const rolesRealm = getRolesRealm();
	const rolesPrioridad = [ROLES.ADMINISTRADOR, ROLES.JEFE, ROLES.CAJERO];
	return rolesPrioridad.filter((rol) => rolesRealm.includes(rol));
}

export function getRolPrincipal() {
	return getRolesAsignados()[0] ?? null;
}

export function esAdministrador() {
	return getRolesRealm().includes(ROLES.ADMINISTRADOR);
}

export function esCajero() {
	return getRolesRealm().includes(ROLES.CAJERO);
}

export function esJefe() {
	return getRolesRealm().includes(ROLES.JEFE);
}

export function obtenerRutaPorRol(rol) {
	switch (rol) {
		case ROLES.ADMINISTRADOR:
			return "/admin";
		case ROLES.CAJERO:
			return "/cajero";
		case ROLES.JEFE:
			return "/jefe";
		default:
			return "/home";
	}
}

export function getAccesoModulo(modulo) {
	const roles = getRolesAsignados();
	const accesos = roles
		.map((rol) => modulo.acceso?.[rol])
		.filter(Boolean);

	if (accesos.includes(ACCESO.ESCRITURA)) {
		return ACCESO.ESCRITURA;
	}
	if (accesos.includes(ACCESO.LECTURA)) {
		return ACCESO.LECTURA;
	}
	return null;
}
