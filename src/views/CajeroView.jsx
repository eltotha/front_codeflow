import { useEffect, useState, useCallback, useId } from "react";
import Navbar from "../components/Navbar";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";
import keycloak from "../keycloak/keycloak-js";
import {
	productosApi,
	lotesApi,
	clientesApi,
	ventasApi,
	detalleVentasApi,
} from "../api/api";
import "./AdminView.css";
import "./CajeroView.css";

function generarNumeroFactura() {
	return `FAC-${Date.now().toString().slice(-8)}`;
}

export default function CajeroView() {
	const customerSelectId = useId();
	const paymentMethodSelectId = useId();
	const [activeTab, setActiveTab] = useState("caja");
	const [loading, setLoading] = useState(true);
	const [alert, setAlert] = useState(null);

	// Datos
	const [productos, setProductos] = useState([]);
	const [lotes, setLotes] = useState([]);
	const [clientes, setClientes] = useState([]);
	const [ventas, setVentas] = useState([]);

	// Carrito TPV
	const [cart, setCart] = useState([]);
	const [selectedCliente, setSelectedCliente] = useState("");
	const [metodoPago, setMetodoPago] = useState("EFECTIVO");
	const [productSearch, setProductSearch] = useState("");
	const [processingSale, setProcessingSale] = useState(false);

	// Modal rápido para cliente
	const [showClientModal, setShowClientModal] = useState(false);
	const [newClient, setNewClient] = useState({ cedula: "", nombreCompleto: "", telefono: "" });

	const showAlert = (message, type = "success") => {
		setAlert({ message, type });
		setTimeout(() => setAlert(null), 4000);
	};

	const loadData = useCallback(async () => {
		try {
			const [prodRes, lotRes, cliRes, ventRes] = await Promise.allSettled([
				productosApi.getAll(),
				lotesApi.getAll(),
				clientesApi.getAll(),
				ventasApi.getAll(),
			]);

			if (prodRes.status === "fulfilled" && Array.isArray(prodRes.value)) setProductos(prodRes.value);
			if (lotRes.status === "fulfilled" && Array.isArray(lotRes.value)) setLotes(lotRes.value);
			if (cliRes.status === "fulfilled" && Array.isArray(cliRes.value)) setClientes(cliRes.value);
			if (ventRes.status === "fulfilled" && Array.isArray(ventRes.value)) setVentas(ventRes.value);
		} catch {
			showAlert("Error al cargar los datos operativos", "error");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadData();
	}, [loadData]);

	// TPV Handlers
	const handleAddToCart = (producto) => {
		// Buscar lotes disponibles con stock para este producto (FEFO: el que vence primero)
		const lotesDisponibles = lotes
			.filter((l) => l.producto?.id === producto.id && l.activo && (l.stockActual || 0) > 0)
			.sort((a, b) => (a.fechaVencimiento || "").localeCompare(b.fechaVencimiento || ""));

		const loteElegido = lotesDisponibles[0] ?? null;

		if (!loteElegido) {
			showAlert(`"${producto.nombreComercial}" no tiene stock disponible en lotes activos.`, "error");
			return;
		}

		setCart((prev) => {
			const existingIndex = prev.findIndex((item) => item.producto.id === producto.id);
			if (existingIndex >= 0) {
				const updated = [...prev];
				const current = updated[existingIndex];
				const maxStock = current.lote?.stockActual || 999;
				if (current.cantidad < maxStock) {
					updated[existingIndex] = {
						...current,
						cantidad: current.cantidad + 1,
						subtotal: (current.cantidad + 1) * Number(producto.precioVenta || 0),
					};
				}
				return updated;
			}
			return [
				...prev,
				{
					producto,
					lote: loteElegido,
					cantidad: 1,
					precioUnitario: Number(producto.precioVenta || 0),
					subtotal: Number(producto.precioVenta || 0),
				},
			];
		});
	};

	const handleUpdateQty = (index, delta) => {
		setCart((prev) => {
			const updated = [...prev];
			const item = updated[index];
			const maxStock = item.lote?.stockActual || 999;
			const newQty = item.cantidad + delta;
			if (newQty <= 0) {
				return updated.filter((_, i) => i !== index);
			}
			if (newQty > maxStock) return prev;
			updated[index] = {
				...item,
				cantidad: newQty,
				subtotal: newQty * item.precioUnitario,
			};
			return updated;
		});
	};

	const handleRemoveItem = (index) => {
		setCart((prev) => prev.filter((_, i) => i !== index));
	};

	const totalVenta = cart.reduce((acc, item) => acc + item.subtotal, 0);

	const handleFinalizarVenta = async () => {
		if (cart.length === 0) {
			showAlert("El carrito de venta está vacío.", "error");
			return;
		}

		setProcessingSale(true);
		try {
			const usuarioId =
				keycloak.tokenParsed?.preferred_username || keycloak.tokenParsed?.sub || "cajero";
			const numeroFactura = generarNumeroFactura();

			// 1. Crear cabecera de la venta
			const ventaPayload = {
				numeroFactura,
				metodoPago,
				total: Number(totalVenta.toFixed(2)),
				estado: "PAGADA",
				idUsuario: String(usuarioId),
				cliente: selectedCliente ? { id: parseInt(selectedCliente, 10) } : null,
			};

			const ventaGuardada = await ventasApi.create(ventaPayload);

			// 2. Crear los detalles de la venta si se tiene el ID de la venta creada
			if (ventaGuardada?.id) {
				for (const item of cart) {
					await detalleVentasApi.create({
						cantidad: item.cantidad,
						precioUnitario: item.precioUnitario,
						subtotal: Number(item.subtotal.toFixed(2)),
						venta: { id: ventaGuardada.id },
						producto: { id: item.producto.id },
						lote: item.lote?.id ? { id: item.lote.id } : null,
					});
				}
			}

			showAlert(`¡Venta emitida con éxito! Factura: ${numeroFactura}`);
			setCart([]);
			setSelectedCliente("");
			loadData();
		} catch (err) {
			showAlert(err.message || "Error al registrar la venta", "error");
		} finally {
			setProcessingSale(false);
		}
	};

	const handleCreateClient = async (e) => {
		e.preventDefault();
		try {
			const creado = await clientesApi.create({
				cedula: newClient.cedula,
				nombreCompleto: newClient.nombreCompleto,
				telefono: newClient.telefono || "",
				activo: true,
			});
			showAlert("Cliente registrado con éxito");
			setShowClientModal(false);
			setNewClient({ cedula: "", nombreCompleto: "", telefono: "" });
			await loadData();
			if (creado?.id) {
				setSelectedCliente(String(creado.id));
			}
		} catch (err) {
			showAlert(err.message || "Error al crear cliente", "error");
		}
	};

	const filteredProducts = productos.filter((p) => {
		if (!productSearch) return true;
		const query = productSearch.toLowerCase();
		return (
			p.nombreComercial?.toLowerCase().includes(query) ||
			p.sku?.toLowerCase().includes(query) ||
			p.codigoBarras?.toLowerCase().includes(query)
		);
	});

	return (
		<div>
			<Navbar />
			<main className="view-layout">
				<header className="view-header">
					<div>
						<h1 className="view-title">Terminal de Caja</h1>
						<p className="view-subtitle">
							Emisión de ventas, cobro en mostrador y consulta de inventario.
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
						{loading ? "Actualizando..." : "Recargar"}
					</button>
				</header>

				{alert && (
					<div className={`alert-box ${alert.type === "error" ? "alert-error" : "alert-success"}`}>
						{alert.message}
					</div>
				)}

				<nav className="tabs-container" aria-label="Secciones de cajero">
					{[
						{ id: "caja", label: "Punto de Venta" },
						{ id: "ventas", label: "Historial de Ventas" },
						{ id: "productos", label: "Consultar Catálogo" },
						{ id: "lotes", label: "Consultar Lotes" },
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

				{activeTab === "caja" && (
					<div className="pos-container">
						<section className="pos-catalog">
							<div style={{ display: "flex", gap: "0.5rem" }}>
								<input
									type="text"
									className="input-field"
									placeholder="Buscar medicamento por nombre, SKU o código de barras..."
									value={productSearch}
									onChange={(e) => setProductSearch(e.target.value)}
								/>
							</div>

							<div className="pos-products-grid">
								{filteredProducts.map((p) => (
									<button
										key={p.id}
										type="button"
										className="pos-product-card"
										onClick={() => handleAddToCart(p)}
									>
										<div className="pos-product-title">{p.nombreComercial}</div>
										<div className="pos-product-meta">{p.laboratorio || "Genérico"}</div>
										{p.requiereReceta && (
											<span className="badge badge-warning" style={{ alignSelf: "flex-start" }}>
												Receta
											</span>
										)}
										<div className="pos-product-price">
											${Number(p.precioVenta || 0).toFixed(2)}
										</div>
									</button>
								))}
							</div>
						</section>

						<aside className="pos-cart">
							<div className="pos-cart-title">
								<span>Ticket de Venta</span>
								<span className="badge badge-info">{cart.length} items</span>
							</div>

							<div className="form-group">
								<label htmlFor={customerSelectId} className="form-label" style={{ display: "flex", justifyContent: "space-between" }}>
									<span>Cliente</span>
									<button
										type="button"
										onClick={() => setShowClientModal(true)}
										style={{ background: "none", border: "none", color: "#0284c7", cursor: "pointer", fontWeight: 600, fontSize: "0.75rem" }}
									>
										+ Nuevo Cliente
									</button>
								</label>
								<select
									id={customerSelectId}
									className="input-field"
									value={selectedCliente}
									onChange={(e) => setSelectedCliente(e.target.value)}
								>
									<option value="">Consumidor Final (Sin registrar)</option>
									{clientes.map((c) => (
										<option key={c.id} value={c.id}>
											{c.nombreCompleto} ({c.cedula || "S/C"})
										</option>
									))}
								</select>
							</div>

							<div className="form-group">
								<label htmlFor={paymentMethodSelectId} className="form-label">Método de Pago</label>
								<select
									id={paymentMethodSelectId}
									className="input-field"
									value={metodoPago}
									onChange={(e) => setMetodoPago(e.target.value)}
								>
									<option value="EFECTIVO">Efectivo</option>
									<option value="TARJETA_DEBITO">Tarjeta de Débito</option>
									<option value="TARJETA_CREDITO">Tarjeta de Crédito</option>
									<option value="TRANSFERENCIA">Transferencia</option>
								</select>
							</div>

							<ul className="pos-cart-items">
								{cart.length === 0 ? (
									<li className="pos-cart-empty">Selecciona productos para agregar a la venta</li>
								) : (
									cart.map((item, index) => (
										<li key={item.producto.id} className="pos-cart-item">
											<div className="pos-cart-item-info">
												<span className="pos-cart-item-name">{item.producto.nombreComercial}</span>
												<span className="pos-cart-item-sub">
													${item.precioUnitario.toFixed(2)} c/u
													{item.lote && ` • Lote: ${item.lote.numeroLote}`}
												</span>
											</div>
											<div className="pos-cart-qty">
												<button
													type="button"
													className="btn btn-secondary btn-sm"
													onClick={() => handleUpdateQty(index, -1)}
												>
													-
												</button>
												<span>{item.cantidad}</span>
												<button
													type="button"
													className="btn btn-secondary btn-sm"
													onClick={() => handleUpdateQty(index, 1)}
												>
													+
												</button>
												<button
													type="button"
													className="btn btn-danger btn-sm"
													onClick={() => handleRemoveItem(index)}
												>
													&times;
												</button>
											</div>
										</li>
									))
								)}
							</ul>

							<div className="pos-cart-totals">
								<div className="pos-cart-total-row">
									<span>Total a Cobrar:</span>
									<span>${totalVenta.toFixed(2)}</span>
								</div>
								<button
									type="button"
									className="btn btn-green"
									style={{ width: "100%", padding: "0.75rem", fontSize: "1rem" }}
									onClick={handleFinalizarVenta}
									disabled={cart.length === 0 || processingSale}
								>
									{processingSale ? "Procesando Venta..." : "Cobrar y Emitir Factura"}
								</button>
							</div>
						</aside>
					</div>
				)}

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
						]}
						data={ventas}
						searchPlaceholder="Buscar por factura o método..."
					/>
				)}

				{activeTab === "productos" && (
					<DataTable
						columns={[
							{ key: "id", header: "ID", width: "60px" },
							{ key: "codigoBarras", header: "Código Barras" },
							{ key: "nombreComercial", header: "Nombre Comercial" },
							{ key: "laboratorio", header: "Laboratorio" },
							{
								key: "precioVenta",
								header: "Precio de Venta",
								render: (item) => `$${Number(item.precioVenta || 0).toFixed(2)}`,
							},
							{
								key: "requiereReceta",
								header: "Receta",
								render: (item) => (
									<span className={`badge ${item.requiereReceta ? "badge-warning" : "badge-info"}`}>
										{item.requiereReceta ? "Obligatoria" : "Venta Libre"}
									</span>
								),
							},
						]}
						data={productos}
						searchPlaceholder="Consultar precio y receta de producto..."
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
							{ key: "fechaVencimiento", header: "Fecha Vencimiento" },
							{ key: "stockActual", header: "Stock Disponible" },
						]}
						data={lotes}
						searchPlaceholder="Consultar disponibilidad de lote..."
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
						searchPlaceholder="Buscar cliente para venta..."
						toolbarAction={
							<button
								type="button"
								className="btn btn-primary"
								onClick={() => setShowClientModal(true)}
							>
								+ Registrar Cliente
							</button>
						}
					/>
				)}

				<Modal
					isOpen={showClientModal}
					onClose={() => setShowClientModal(false)}
					title="Registrar Cliente para Facturación"
				>
					<form onSubmit={handleCreateClient} className="form-grid">
						<div className="form-group">
							<label className="form-label">Cédula / Identificación *</label>
							<input
								required
								className="input-field"
								value={newClient.cedula}
								onChange={(e) => setNewClient((p) => ({ ...p, cedula: e.target.value }))}
							/>
						</div>
						<div className="form-group">
							<label className="form-label">Nombre Completo *</label>
							<input
								required
								className="input-field"
								value={newClient.nombreCompleto}
								onChange={(e) => setNewClient((p) => ({ ...p, nombreCompleto: e.target.value }))}
							/>
						</div>
						<div className="form-group" style={{ gridColumn: "1 / -1" }}>
							<label className="form-label">Teléfono</label>
							<input
								className="input-field"
								value={newClient.telefono}
								onChange={(e) => setNewClient((p) => ({ ...p, telefono: e.target.value }))}
							/>
						</div>
						<div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
							<button
								type="button"
								className="btn btn-secondary"
								onClick={() => setShowClientModal(false)}
							>
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
