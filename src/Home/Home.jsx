import { Link } from "react-router-dom";
import keycloak from "../keycloak/keycloak-js";
import {
	ACCESO,
	DESCRIPCIONES_ROL,
	MODULOS,
	ROLES,
	getAccesoModulo,
	getRolPrincipal,
	getRolesAsignados,
	obtenerRutaPorRol,
} from "../keycloak/roles";
import "./Home_Styles.css";

const ICONOS = {
	ventas: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
			<circle cx="9" cy="21" r="1" />
			<circle cx="20" cy="21" r="1" />
			<path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
		</svg>
	),
	compras: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
			<path d="M16.5 9.4 7.55 4.24" />
			<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
			<polyline points="3.29 7 12 12 20.71 7" />
			<line x1="12" y1="22" x2="12" y2="12" />
		</svg>
	),
	productos: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
			<circle cx="12" cy="12" r="10" />
			<path d="M12 8v8" />
			<path d="M8 12h8" />
		</svg>
	),
	lotes: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
			<polygon points="12 2 2 7 12 12 22 7 12 2" />
			<polyline points="2 17 12 22 22 17" />
			<polyline points="2 12 12 17 22 12" />
		</svg>
	),
	proveedores: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
			<rect x="1" y="3" width="15" height="13" rx="1" />
			<polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
			<circle cx="5.5" cy="18.5" r="2.5" />
			<circle cx="18.5" cy="18.5" r="2.5" />
		</svg>
	),
	clientes: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
			<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
			<circle cx="12" cy="7" r="4" />
		</svg>
	),
	categorias: (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
			<path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
			<line x1="7" y1="7" x2="7.01" y2="7" />
		</svg>
	),
};

const VISTAS = [
	{
		rol: ROLES.ADMINISTRADOR,
		titulo: "Panel Administrador",
		clase: "btn-blue",
	},
	{
		rol: ROLES.CAJERO,
		titulo: "Terminal de Caja",
		clase: "btn-green",
	},
	{
		rol: ROLES.JEFE,
		titulo: "Panel de Supervisión",
		clase: "btn-primary",
	},
];

function Home() {
	const perfil = keycloak.tokenParsed;
	const nombre = perfil?.given_name ?? perfil?.name ?? perfil?.preferred_username ?? "Usuario";
	const roles = getRolesAsignados();
	const rolPrincipal = getRolPrincipal();
	const modulosVisibles = MODULOS.filter((modulo) => getAccesoModulo(modulo) !== null);
	const vistasDisponibles = VISTAS.filter((vista) => roles.includes(vista.rol));

	return (
		<main className="home-background">
			<div className="home-container">
				{rolPrincipal ? (
					<>
						<section className="home-welcome" aria-labelledby="home-title">
							<p className="home-eyebrow">FarmaSys</p>
							<h1 id="home-title">Hola, {nombre}</h1>
							<div className="home-role-badges">
								{roles.map((rol) => (
									<span key={rol} className="home-role-badge">
										{rol}
									</span>
								))}
							</div>
							<p className="home-role-description">{DESCRIPCIONES_ROL[rolPrincipal]}</p>
							<div className="home-views">
								{vistasDisponibles.map((vista) => (
									<Link
										key={vista.rol}
										to={obtenerRutaPorRol(vista.rol)}
										className={`btn ${vista.clase}`}
									>
										{vista.titulo}
									</Link>
								))}
							</div>
						</section>

						<section className="home-modules" aria-labelledby="home-modules-title">
							<h2 id="home-modules-title">Módulos disponibles</h2>
							<ul className="home-module-grid">
								{modulosVisibles.map((modulo) => {
									const acceso = getAccesoModulo(modulo);

									return (
										<li key={modulo.id} className="home-module-card">
											<span className="home-module-icon" aria-hidden="true">
												{ICONOS[modulo.id]}
											</span>
											<h3 className="home-module-title">{modulo.titulo}</h3>
											<p className="home-module-description">{modulo.descripcion}</p>
											<span
												className={`home-module-access${acceso === ACCESO.ESCRITURA ? " home-module-access--escritura" : ""}`}
											>
												{acceso === ACCESO.ESCRITURA ? "Lectura y escritura" : "Solo lectura"}
											</span>
										</li>
									);
								})}
							</ul>
						</section>
					</>
				) : (
					<section className="home-welcome" role="alert">
						<h1>Sin acceso</h1>
						<p className="home-role-description">
							Tu usuario no tiene roles asignados. Comunícate con el administrador del sistema.
						</p>
					</section>
				)}
			</div>
		</main>
	);
}

export default Home;
