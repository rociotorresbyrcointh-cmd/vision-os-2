export type PayStatus = 'none' | 'partial' | 'paid'

// Compara lo cobrado contra el precio del servicio
export function payStatus(paid: number, price: number): PayStatus {
  if (paid <= 0) return 'none'
  if (price > 0 && paid < price) return 'partial' // seña / pago parcial
  return 'paid'
}

export const money = (n: number) =>
  n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 })
