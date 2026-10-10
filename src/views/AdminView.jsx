import { useEffect, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import {
	categoriasApi,
	proveedoresApi,
	clientesApi,
	productosApi,
	lotesApi,
	ventasApi,
	comprasApi,
} from "../api/api";
import "./AdminView.css";

export default function AdminView() {
	const [activeTab, setActiveTab] = useState("productos");
	const [loading, setLoading] = useState(true);
	const [alert, setAlert] = useState(null);

	// Datos
	const [productos, setProductos] = useState([]);
	const [lotes, setLotes] = useState([]);
	const [categorias, setCategorias] = useState([]);
	const [proveedores, setProveedores] = useState([]);
	const [clientes, setClientes] = useState([]);
	const [ventas, setVentas] = useState([]);
	const [compras, setCompras] = useState([]);

	// Modales
	const [modalType, setModalType] = useState(null);
	const [formData, setFormData] = useState({});

	const showAlert = (message, type = "success") => {
		setAlert({ message, type });
		setTimeout(() => setAlert(null), 4000);
	};

	const loadData = useCallback(async () => {
		try {
			const [prodRes, lotRes, catRes, provRes, cliRes, ventRes, compRes] =
				await Promise.allSettled([
					productosApi.getAll(),
					lotesApi.getAll(),
					categoriasApi.getAll(),
					proveedoresApi.getAll(),
					clientesApi.getAll(),
					ventasApi.getAll(),
					comprasApi.getAll(),
				]);

			if (prodRes.status === "fulfilled" && Array.isArray(prodRes.value)) setProductos(prodRes.value);
			if (lotRes.status === "fulfilled" && Array.isArray(lotRes.value)) setLotes(lotRes.value);
			if (catRes.status === "fulfilled" && Array.isArray(catRes.value)) setCategorias(catRes.value);
			if (provRes.status === "fulfilled" && Array.isArray(provRes.value)) setProveedores(provRes.value);
			if (cliRes.status === "fulfilled" && Array.isArray(cliRes.value)) setClientes(cliRes.value);
			if (ventRes.status === "fulfilled" && Array.isArray(ventRes.value)) setVentas(ventRes.value);
			if (compRes.status === "fulfilled" && Array.isArray(compRes.value)) setCompras(compRes.value);
		} catch {
			showAlert("Error al cargar algunos datos del backend", "error");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadData();
	}, [loadData]);

	// Handlers de creación
	const handleOpenModal = (type) => {
		setModalType(type);
		setFormData({});
	};

	const handleCloseModal = () => {
		setModalType(null);
		setFormData({});
	};

	const handleInputChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			if (modalType === "producto") {
				await productosApi.create({
					codigoBarras: formData.codigoBarras,
					sku: formData.sku,
					nombreComercial: formData.nombreComercial,
					nombreGenerico: formData.nombreGenerico || "",
					laboratorio: formData.laboratorio || "",
					presentacion: formData.presentacion || "",
					precioCompra: parseFloat(formData.precioCompra || 0),
					precioVenta: parseFloat(formData.precioVenta || 0),
					stockMin: parseInt(formData.stockMin || 5, 10),
					requiereReceta: !!formData.requiereReceta,
					activo: true,
				});
				showAlert("Producto creado con éxito.");
			} else if (modalType === "lote") {
				await lotesApi.create({
					numeroLote: formData.numeroLote,
					fechaVencimiento: formData.fechaVencimiento,
					stockActual: parseInt(formData.stockActual || 0, 10),
					activo: true,
					producto: { id: parseInt(formData.productoId, 10) },
				});
				showAlert("Lote registrado con éxito.");
			} else if (modalType === "categoria") {
				await categoriasApi.create({
					nombre: formData.nombre,
					descripcion: formData.descripcion || "",
					activo: true,
				});
				showAlert("Categoría creada con éxito.");
			} else if (modalType === "proveedor") {
				await proveedoresApi.create({
					rucIdentificacion: formData.rucIdentificacion,
					razonSocial: formData.razonSocial,
					telefono: formData.telefono || "",
					email: formData.email || "",
					activo: true,
				});
				showAlert("Proveedor registrado con éxito.");
			} else if (modalType === "cliente") {
				await clientesApi.create({
					cedula: formData.cedula,
					nombreCompleto: formData.nombreCompleto,
					telefono: formData.telefono || "",
					activo: true,
				});
				showAlert("Cliente registrado con éxito.");
			}
			handleCloseModal();
			loadData();
		} catch (err) {
			showAlert(err.message || "Error al guardar el registro", "error");
		}
	};

	return (
		<div>
			<Navbar />
			<main className="view-layout">
				<header className="view-header">
					<div>
						<h1 className="view-title">Panel de Administración</h1>
						<p className="view-subtitle">
							Control total de farmacia: lectura y escritura en todos los módulos del sistema.
						</p>
					</div>
					<button
						type="button"
						className="btn btn-secondary btn-sm"
						onClick={() => {
							setLoading(true);
							loadData();
						}}
						disabled={loading}
					>
						{loading ? "Actualizando..." : "Recargar datos"}
					</button>
				</header>

				{alert && (
					<div className={`alert-box ${alert.type === "error" ? "alert-error" : "alert-success"}`}>
						{alert.message}
					</div>
				)}

				<section className="stats-grid">
					<StatCard
						label="Medicamentos"
						value={productos.length}
						description="En catálogo activo"
						color="var(--color-cyan)"
					/>
					<StatCard
						label="Lotes"
						value={lotes.length}
						description="Lotes registrados"
						color="var(--color-mint)"
					/>
					<StatCard
						label="Clientes"
						value={clientes.length}
						description="Clientes registrados"
						color="var(--color-blue)"
					/>
					<StatCard
						label="Ventas Realizadas"
						value={ventas.length}
						description="Histórico total"
						color="var(--color-green)"
					/>
				</section>

				<nav className="tabs-container" aria-label="Secciones de administración">
					{[
						{ id: "productos", label: "Productos" },
						{ id: "lotes", label: "Lotes" },
						{ id: "categorias", label: "Categorías" },
						{ id: "proveedores", label: "Proveedores" },
						{ id: "clientes", label: "Clientes" },
						{ id: "ventas", label: "Ventas" },
						{ id: "compras", label: "Compras" },
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
								header: "P. Compra",
								render: (item) => `$${Number(item.precioCompra || 0).toFixed(2)}`,
							},
							{
								key: "precioVenta",
								header: "P. Venta",
								render: (item) => `$${Number(item.precioVenta || 0).toFixed(2)}`,
							},
							{
								key: "activo",
								header: "Estado",
								render: (item) => (
									<span className={`badge ${item.activo ? "badge-success" : "badge-warning"}`}>
										{item.activo ? "Activo" : "Inactivo"}
									</span>
								),
							},
						]}
						data={productos}
						searchPlaceholder="Buscar por nombre, SKU, código..."
						toolbarAction={
							<button
								type="button"
								className="btn btn-primary"
								onClick={() => handleOpenModal("producto")}
							>
								+ Nuevo Producto
							</button>
						}
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
								render: (item) => item.producto?.nombreComercial || `Prod #${item.producto?.id || "-"}`,
							},
							{ key: "fechaVencimiento", header: "Fecha Vencimiento" },
							{ key: "stockActual", header: "Stock Actual" },
							{
								key: "activo",
								header: "Estado",
								render: (item) => (
									<span className={`badge ${item.activo ? "badge-success" : "badge-warning"}`}>
										{item.activo ? "Disponible" : "Agotado"}
									</span>
								),
							},
						]}
						data={lotes}
						searchPlaceholder="Buscar por lote o producto..."
						toolbarAction={
							<button
								type="button"
								className="btn btn-primary"
								onClick={() => handleOpenModal("lote")}
							>
								+ Nuevo Lote
							</button>
						}
					/>
				)}

				{activeTab === "categorias" && (
					<DataTable
						columns={[
							{ key: "id", header: "ID", width: "60px" },
							{ key: "nombre", header: "Nombre" },
							{ key: "descripcion", header: "Descripción" },
							{
								key: "activo",
								header: "Estado",
								render: (item) => (
									<span className={`badge ${item.activo ? "badge-success" : "badge-warning"}`}>
										{item.activo ? "Activa" : "Inactiva"}
									</span>
								),
							},
						]}
						data={categorias}
						searchPlaceholder="Buscar categoría..."
						toolbarAction={
							<button
								type="button"
								className="btn btn-primary"
								onClick={() => handleOpenModal("categoria")}
							>
								+ Nueva Categoría
							</button>
						}
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
						searchPlaceholder="Buscar proveedor..."
						toolbarAction={
							<button
								type="button"
								className="btn btn-primary"
								onClick={() => handleOpenModal("proveedor")}
							>
								+ Nuevo Proveedor
							</button>
						}
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
						searchPlaceholder="Buscar cliente por cédula o nombre..."
						toolbarAction={
							<button
								type="button"
								className="btn btn-primary"
								onClick={() => handleOpenModal("cliente")}
							>
								+ Nuevo Cliente
							</button>
						}
					/>
				)}

				{activeTab === "ventas" && (
					<DataTable
						columns={[
							{ key: "id", header: "ID", width: "60px" },
							{ key: "numeroFactura", header: "Factura" },
							{
								key: "fechaVenta",
								header: "Fecha",
								render: (item) =>
									item.fechaVenta ? new Date(item.fechaVenta).toLocaleDateString() : "-",
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
							{ key: "idUsuario", header: "Usuario" },
						]}
						data={ventas}
						searchPlaceholder="Buscar venta..."
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
								render: (item) => item.proveedor?.razonSocial || `Prov #${item.proveedor?.id || "-"}`,
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
						searchPlaceholder="Buscar compra..."
					/>
				)}

				{/* Modales de Creación */}
				<Modal
					isOpen={modalType === "producto"}
					onClose={handleCloseModal}
					title="Crear Nuevo Medicamento / Producto"
				>
					<form onSubmit={handleSubmit} className="form-grid">
						<div className="form-group">
							<label className="form-label">Nombre Comercial *</label>
							<input
								required
								className="input-field"
								name="nombreComercial"
								value={formData.nombreComercial || ""}
								onChange={handleInputChange}
							/>
						</div>
						<div className="form-group">
							<label className="form-label">Código de Barras *</label>
							<input
								required
								className="input-field"
								name="codigoBarras"
								value={formData.codigoBarras || ""}
								onChange={handleInputChange}
							/>
						</div>
						<div className="form-group">
							<label className="form-label">SKU *</label>
							<input
								required
								className="input-field"
								name="sku"
								value={formData.sku || ""}
								onChange={handleInputChange}
							/>
						</div>
						<div className="form-group">
							<label className="form-label">Laboratorio</label>
							<input
								className="input-field"
								name="laboratorio"
								value={formData.laboratorio || ""}
								onChange={handleInputChange}
							/>
						</div>
						<div className="form-group">
							<label className="form-label">Precio de Compra ($) *</label>
							<input
								required
								type="number"
								step="0.01"
								min="0"
								className="input-field"
								name="precioCompra"
								value={formData.precioCompra || ""}
								onChange={handleInputChange}
							/>
						</div>
						<div className="form-group">
							<label className="form-label">Precio de Venta ($) *</label>
							<input
								required
								type="number"
								step="0.01"
								min="0"
								className="input-field"
								name="precioVenta"
								value={formData.precioVenta || ""}
								onChange={handleInputChange}
							/>
						</div>
						<div className="form-group">
							<label className="form-label">Stock Mínimo</label>
							<input
								type="number"
								min="0"
								className="input-field"
								name="stockMin"
								value={formData.stockMin || 5}
								onChange={handleInputChange}
							/>
						</div>
						<div className="form-group">
							<label className="form-checkbox">
								<input
									type="checkbox"
									name="requiereReceta"
									checked={!!formData.requiereReceta}
									onChange={handleInputChange}
								/>
								Requiere Receta Médica
							</label>
						</div>
						<div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
							<button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
								Cancelar
							</button>
							<button type="submit" className="btn btn-primary">
								Guardar Producto
							</button>
						</div>
					</form>
				</Modal>

				<Modal
					isOpen={modalType === "lote"}
					onClose={handleCloseModal}
					title="Registrar Nuevo Lote"
				>
					<form onSubmit={handleSubmit} className="form-grid">
						<div className="form-group" style={{ gridColumn: "1 / -1" }}>
							<label className="form-label">Producto Asociado *</label>
							<select
								required
								className="input-field"
								name="productoId"
								value={formData.productoId || ""}
								onChange={handleInputChange}
							>
								<option value="">Selecciona un producto...</option>
								{productos.map((p) => (
									<option key={p.id} value={p.id}>
										{p.nombreComercial} ({p.sku})
									</option>
								))}
							</select>
						</div>
						<div className="form-group">
							<label className="form-label">Número de Lote *</label>
							<input
								required
								className="input-field"
								name="numeroLote"
								value={formData.numeroLote || ""}
								onChange={handleInputChange}
							/>
						</div>
						<div className="form-group">
							<label className="form-label">Fecha de Vencimiento *</label>
							<input
								required
								type="date"
								className="input-field"
								name="fechaVencimiento"
								value={formData.fechaVencimiento || ""}
								onChange={handleInputChange}
							/>
						</div>
						<div className="form-group">
							<label className="form-label">Stock Inicial *</label>
							<input
								required
								type="number"
								min="0"
								className="input-field"
								name="stockActual"
								value={formData.stockActual || ""}
								onChange={handleInputChange}
							/>
						</div>
						<div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
							<button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
								Cancelar
							</button>
							<button type="submit" className="btn btn-primary">
								Guardar Lote
							</button>
						</div>
					</form>
				</Modal>

				<Modal
					isOpen={modalType === "categoria"}
					onClose={handleCloseModal}
					title="Crear Nueva Categoría"
				>
					<form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
						<div className="form-group">
							<label className="form-label">Nombre de Categoría *</label>
							<input
								required
								className="input-field"
								name="nombre"
								value={formData.nombre || ""}
								onChange={handleInputChange}
							/>
						</div>
						<div className="form-group">
							<label className="form-label">Descripción</label>
							<textarea
								className="input-field"
								rows={3}
								name="descripcion"
								value={formData.descripcion || ""}
								onChange={handleInputChange}
							/>
						</div>
						<div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
							<button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
								Cancelar
							</button>
							<button type="submit" className="btn btn-primary">
								Guardar Categoría
							</button>
						</div>
					</form>
				</Modal>

				<Modal
					isOpen={modalType === "proveedor"}
					onClose={handleCloseModal}
					title="Registrar Nuevo Proveedor"
				>
					<form onSubmit={handleSubmit} className="form-grid">
						<div className="form-group">
							<label className="form-label">RUC / Identificación *</label>
							<input
								required
								className="input-field"
								name="rucIdentificacion"
								value={formData.rucIdentificacion || ""}
								onChange={handleInputChange}
							/>
						</div>
						<div className="form-group">
							<label className="form-label">Razón Social *</label>
							<input
								required
								className="input-field"
								name="razonSocial"
								value={formData.razonSocial || ""}
								onChange={handleInputChange}
							/>
						</div>
						<div className="form-group">
							<label className="form-label">Teléfono</label>
							<input
								className="input-field"
								name="telefono"
								value={formData.telefono || ""}
								onChange={handleInputChange}
							/>
						</div>
						<div className="form-group">
							<label className="form-label">Email</label>
							<input
								type="email"
								className="input-field"
								name="email"
								value={formData.email || ""}
								onChange={handleInputChange}
							/>
						</div>
						<div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
							<button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
								Cancelar
							</button>
							<button type="submit" className="btn btn-primary">
								Guardar Proveedor
							</button>
						</div>
					</form>
				</Modal>

				<Modal
					isOpen={modalType === "cliente"}
					onClose={handleCloseModal}
					title="Registrar Nuevo Cliente"
				>
					<form onSubmit={handleSubmit} className="form-grid">
						<div className="form-group">
							<label className="form-label">Cédula / Identificación *</label>
							<input
								required
								className="input-field"
								name="cedula"
								value={formData.cedula || ""}
								onChange={handleInputChange}
							/>
						</div>
						<div className="form-group">
							<label className="form-label">Nombre Completo *</label>
							<input
								required
								className="input-field"
								name="nombreCompleto"
								value={formData.nombreCompleto || ""}
								onChange={handleInputChange}
							/>
						</div>
						<div className="form-group" style={{ gridColumn: "1 / -1" }}>
							<label className="form-label">Teléfono</label>
							<input
								className="input-field"
								name="telefono"
								value={formData.telefono || ""}
								onChange={handleInputChange}
							/>
						</div>
						<div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
							<button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
								Cancelar
							</button>
							<button type="submit" className="btn btn-primary">
								Guardar Cliente
							</button>
						</div>
					</form>
				</Modal>
			</main>
		</div>
	);
}
