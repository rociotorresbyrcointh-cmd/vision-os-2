// Genera y descarga un archivo Excel (.xlsx) desde una lista de filas.
// Carga la librería solo cuando se usa (no pesa en el resto de la app).
export async function exportToExcel(
  filename: string,
  sheetName: string,
  rows: Record<string, string | number>[]
): Promise<void> {
  const XLSX = await import('xlsx')
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31)) // Excel limita el nombre a 31
  XLSX.writeFile(wb, filename)
}
