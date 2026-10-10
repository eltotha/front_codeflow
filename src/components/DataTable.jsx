import { useState } from "react";
import "./DataTable.css";

export default function DataTable({
	columns,
	data = [],
	searchPlaceholder = "Buscar en la tabla...",
	toolbarAction,
	loading = false,
}) {
	const [search, setSearch] = useState("");

	const filteredData = data.filter((item) => {
		if (!search.trim()) return true;
		const query = search.toLowerCase();
		return Object.values(item).some((val) => {
			if (val === null || val === undefined) return false;
			if (typeof val === "object") {
				return Object.values(val).some(
					(nestedVal) => nestedVal && String(nestedVal).toLowerCase().includes(query),
				);
			}
			return String(val).toLowerCase().includes(query);
		});
	});

	return (
		<div className="datatable-container">
			<div className="datatable-toolbar">
				<input
					type="text"
					className="input-field datatable-search"
					placeholder={searchPlaceholder}
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
				{toolbarAction && <div>{toolbarAction}</div>}
			</div>

			<div className="datatable-wrapper">
				<table className="datatable">
					<thead>
						<tr>
							{columns.map((col) => (
								<th key={col.key || col.header} style={{ width: col.width }}>
									{col.header}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr>
								<td colSpan={columns.length} className="datatable-empty">
									Cargando datos...
								</td>
							</tr>
						) : filteredData.length === 0 ? (
							<tr>
								<td colSpan={columns.length} className="datatable-empty">
									{search ? "No se encontraron coincidencias." : "No hay registros disponibles."}
								</td>
							</tr>
						) : (
							filteredData.map((item, index) => (
								<tr key={item.id ?? index}>
									{columns.map((col) => (
										<td key={col.key || col.header}>
											{col.render ? col.render(item) : item[col.key]}
										</td>
									))}
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
