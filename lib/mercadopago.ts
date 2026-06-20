import { MercadoPagoConfig, PreApproval } from 'mercadopago'

// Lazy: se crea recién al usarse (en build el token no existe).
let _client: MercadoPagoConfig | null = null
function client(): MercadoPagoConfig {
  if (!_client) _client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! })
  return _client
}

export function preApproval(): PreApproval {
  return new PreApproval(client())
}
