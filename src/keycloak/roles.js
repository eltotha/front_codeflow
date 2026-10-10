import keycloak from "./keycloak-js";

export const ROLES = ["ADMINISTRADOR", "JEFE", "CAJERO"];

export const ACCESO = {
	ESCRITURA: "escritura",
	LECTURA: "lectura",
};

export const DESCRIPCIONES_ROL = {
	ADMINISTRADOR: "Puede leer y escribir en todos los módulos del sistema.",
	CAJERO: "Puede crear ventas y consultar la mayoría de los datos.",
	JEFE: "Jefe de la farmacia: puede consultar toda la información, pero no editarla.",
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
		descripcion: "Consulta el catálogo de productos y medicamentos.",
		acceso: {
			ADMINISTRADOR: ACCESO.ESCRITURA,
			CAJERO: ACCESO.LECTURA,
			JEFE: ACCESO.LECTURA,
		},
	},
	{
		id: "lotes",
		titulo: "Lotes",
		descripcion: "Consulta lotes, existencias y fechas de vencimiento.",
		acceso: {
			ADMINISTRADOR: ACCESO.ESCRITURA,
			CAJERO: ACCESO.LECTURA,
			JEFE: ACCESO.LECTURA,
		},
	},
	{
		id: "proveedores",
		titulo: "Proveedores",
		descripcion: "Administra la información de los proveedores.",
		acceso: {
			ADMINISTRADOR: ACCESO.ESCRITURA,
			JEFE: ACCESO.LECTURA,
		},
	},
	{
		id: "clientes",
		titulo: "Clientes",
		descripcion: "Consulta y registra los clientes de la farmacia.",
		acceso: {
			ADMINISTRADOR: ACCESO.ESCRITURA,
			CAJERO: ACCESO.LECTURA,
			JEFE: ACCESO.LECTURA,
		},
	},
	{
		id: "categorias",
		titulo: "Categorías",
		descripcion: "Organiza el catálogo por categorías.",
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
	return ROLES.filter((rol) => rolesRealm.includes(rol));
}

export function getRolPrincipal() {
	return getRolesAsignados()[0] ?? null;
}

export function getAccesoModulo(modulo) {
	const accesos = getRolesAsignados()
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
