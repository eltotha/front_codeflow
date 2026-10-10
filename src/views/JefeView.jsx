import { useEffect, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import DataTable from "../components/DataTable";
import {
	productosApi,
	lotesApi,
	comprasApi,
	ventasApi,
	proveedoresApi,
	clientesApi,
} from "../api/api";
import "./AdminView.css";

export default function JefeView() {
	const [activeTab, setActiveTab] = useState("ventas");
	const [loading, setLoading] = useState(true);
	const [alert, setAlert] = useState(null);

	const [productos, setProductos] = useState([]);
	const [lotes, setLotes] = useState([]);
	const [compras, setCompras] = useState([]);
	const [ventas, setVentas] = useState([]);
	const [proveedores, setProveedores] = useState([]);
	const [clientes, setClientes] = useState([]);

	const showAlert = (message, type = "success") => {
		setAlert({ message, type });
		setTimeout(() => setAlert(null), 4000);
	};

	const loadData = useCallback(async () => {
		try {
			const [prodRes, lotRes, compRes, ventRes, provRes, cliRes] = await Promise.allSettled([
				productosApi.getAll(),
				lotesApi.getAll(),
				comprasApi.getAll(),
				ventasApi.getAll(),
				proveedoresApi.getAll(),
				clientesApi.getAll(),
			]);

			if (prodRes.status === "fulfilled" && Array.isArray(prodRes.value)) setProductos(prodRes.value);
			if (lotRes.status === "fulfilled" && Array.isArray(lotRes.value)) setLotes(lotRes.value);
			if (compRes.status === "fulfilled" && Array.isArray(compRes.value)) setCompras(compRes.value);
			if (ventRes.status === "fulfilled" && Array.isArray(ventRes.value)) setVentas(ventRes.value);
			if (provRes.status === "fulfilled" && Array.isArray(provRes.value)) setProveedores(provRes.value);
			if (cliRes.status === "fulfilled" && Array.isArray(cliRes.value)) setClientes(cliRes.value);
		} catch {
			showAlert("Error al cargar los registros de auditoría", "error");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadData();
	}, [loadData]);

	// Métricas calculadas para supervisión
	const totalIngresos = ventas.reduce((acc, v) => acc + Number(v.total || 0), 0);
	const totalGastosCompras = compras.reduce((acc, c) => acc + Number(c.total || 0), 0);
	const lotesPorVencer = lotes.filter((l) => {
		if (!l.fechaVencimiento) return false;
		const diffDays = (new Date(l.fechaVencimiento) - new Date()) / (1000 * 60 * 60 * 24);
		return diffDays <= 90 && diffDays >= 0;
	}).length;

	return (
		<div>
			<Navbar />
			<main className="view-layout">
				<header className="view-header">
					<div>
						<h1 className="view-title">Supervisión y Auditoría (Jefe de Farmacia)</h1>
						<p className="view-subtitle">
							Modo Solo Lectura: Consulta de ingresos, auditoría de compras, inventario y existencias.
						</p>
					</div>
					<div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
						<span className="badge badge-jefe">Modo Solo Lectura</span>
						<button
							type="button"
							className="btn btn-secondary btn-sm"
							onClick={() => {
								setLoading(true);
								loadData();
							}}
							disabled={loading}
						>
							{loading ? "Actualizando..." : "Recargar"}
						</button>
					</div>
				</header>

				{alert && (
					<div className={`alert-box ${alert.type === "error" ? "alert-error" : "alert-success"}`}>
						{alert.message}
					</div>
				)}

				<section className="stats-grid">
					<StatCard
						label="Ingresos Totales"
						value={`$${totalIngresos.toFixed(2)}`}
						description={`${ventas.length} ventas auditadas`}
						color="var(--color-green)"
					/>
					<StatCard
						label="Compras Realizadas"
						value={`$${totalGastosCompras.toFixed(2)}`}
						description={`${compras.length} compras a proveedores`}
						color="var(--color-blue)"
					/>
					<StatCard
						label="Catálogo de Productos"
						value={productos.length}
						description="Medicamentos registrados"
						color="var(--color-cyan)"
					/>
					<StatCard
						label="Lotes Próximos a Vencer"
						value={lotesPorVencer}
						description="Menos de 90 días"
						color="var(--color-mint)"
					/>
				</section>

				<nav className="tabs-container" aria-label="Secciones de supervisión">
					{[
						{ id: "ventas", label: "Auditoría de Ventas" },
						{ id: "compras", label: "Auditoría de Compras" },
						{ id: "lotes", label: "Control de Lotes y Vencimientos" },
						{ id: "productos", label: "Inventario de Productos" },
						{ id: "proveedores", label: "Proveedores" },
						{ id: "clientes", label: "Clientes" },
					].map((tab) => (
						<button
							key={tab.id}
							type="button"
							className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
							onClick={() => setActiveTab(tab.id)}
						>
							{tab.label}
						</button>
					))}
				</nav>

				{activeTab === "ventas" && (
					<DataTable
						columns={[
							{ key: "id", header: "ID", width: "60px" },
							{ key: "numeroFactura", header: "N° Factura" },
							{
								key: "fechaVenta",
								header: "Fecha",
								render: (item) =>
									item.fechaVenta ? new Date(item.fechaVenta).toLocaleString() : "-",
							},
							{ key: "metodoPago", header: "Método Pago" },
							{
								key: "total",
								header: "Total",
								render: (item) => `$${Number(item.total || 0).toFixed(2)}`,
							},
							{
								key: "estado",
								header: "Estado",
								render: (item) => (
									<span className="badge badge-success">{item.estado || "PAGADA"}</span>
								),
							},
							{ key: "idUsuario", header: "Cajero / Usuario" },
						]}
						data={ventas}
						searchPlaceholder="Buscar venta auditada..."
					/>
				)}

				{activeTab === "compras" && (
					<DataTable
						columns={[
							{ key: "id", header: "ID", width: "60px" },
							{ key: "numeroFacturaProveedor", header: "Factura Prov." },
							{ key: "fechaEmision", header: "Fecha Emisión" },
							{
								key: "proveedor",
								header: "Proveedor",
								render: (item) => item.proveedor?.razonSocial || "-",
							},
							{
								key: "total",
								header: "Total",
								render: (item) => `$${Number(item.total || 0).toFixed(2)}`,
							},
							{
								key: "estado",
								header: "Estado",
								render: (item) => (
									<span className="badge badge-info">{item.estado || "RECIBIDO"}</span>
								),
							},
						]}
						data={compras}
						searchPlaceholder="Buscar compra a proveedor..."
					/>
				)}

				{activeTab === "lotes" && (
					<DataTable
						columns={[
							{ key: "id", header: "ID", width: "60px" },
							{ key: "numeroLote", header: "N° Lote" },
							{
								key: "producto",
								header: "Producto",
								render: (item) => item.producto?.nombreComercial || "-",
							},
							{
								key: "fechaVencimiento",
								header: "Vencimiento",
								render: (item) => {
									const diffDays =
										item.fechaVencimiento &&
										(new Date(item.fechaVencimiento) - new Date()) / (1000 * 60 * 60 * 24);
									const isSoon = diffDays !== null && diffDays <= 90;
									return (
										<span style={{ color: isSoon ? "#b91c1c" : "inherit", fontWeight: isSoon ? 700 : 400 }}>
											{item.fechaVencimiento || "-"} {isSoon && "(Próximo)"}
										</span>
									);
								},
							},
							{ key: "stockActual", header: "Stock Disponible" },
							{
								key: "activo",
								header: "Disponibilidad",
								render: (item) => (
									<span className={`badge ${item.activo ? "badge-success" : "badge-warning"}`}>
										{item.activo ? "En Circulación" : "Retirado"}
									</span>
								),
							},
						]}
						data={lotes}
						searchPlaceholder="Auditar lotes por producto..."
					/>
				)}

				{activeTab === "productos" && (
					<DataTable
						columns={[
							{ key: "id", header: "ID", width: "60px" },
							{ key: "codigoBarras", header: "Código de Barras" },
							{ key: "sku", header: "SKU" },
							{ key: "nombreComercial", header: "Nombre Comercial" },
							{ key: "laboratorio", header: "Laboratorio" },
							{
								key: "precioCompra",
								header: "Costo Compra",
								render: (item) => `$${Number(item.precioCompra || 0).toFixed(2)}`,
							},
							{
								key: "precioVenta",
								header: "Precio Venta",
								render: (item) => `$${Number(item.precioVenta || 0).toFixed(2)}`,
							},
							{
								key: "margen",
								header: "Margen Bruto",
								render: (item) => {
									const compra = Number(item.precioCompra || 0);
									const venta = Number(item.precioVenta || 0);
									const margen = venta - compra;
									return `$${margen.toFixed(2)}`;
								},
							},
						]}
						data={productos}
						searchPlaceholder="Auditar catálogo y margen de productos..."
					/>
				)}

				{activeTab === "proveedores" && (
					<DataTable
						columns={[
							{ key: "id", header: "ID", width: "60px" },
							{ key: "rucIdentificacion", header: "RUC / ID" },
							{ key: "razonSocial", header: "Razón Social" },
							{ key: "telefono", header: "Teléfono" },
							{ key: "email", header: "Email" },
						]}
						data={proveedores}
						searchPlaceholder="Buscar en proveedores..."
					/>
				)}

				{activeTab === "clientes" && (
					<DataTable
						columns={[
							{ key: "id", header: "ID", width: "60px" },
							{ key: "cedula", header: "Cédula" },
							{ key: "nombreCompleto", header: "Nombre Completo" },
							{ key: "telefono", header: "Teléfono" },
						]}
						data={clientes}
						searchPlaceholder="Buscar clientes registrados..."
					/>
				)}
			</main>
		</div>
	);
}
