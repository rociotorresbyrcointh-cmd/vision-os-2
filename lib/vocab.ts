// Diccionario de vocabulario por rubro. Una peluquería/estética tiene "clientes";
// un consultorio/salud tiene "pacientes". Se decide por el flag de historia
// clínica del negocio (clinical_history_enabled): activado ⇒ paciente.
export type Vocab = {
  one: string       // "cliente" / "paciente"
  oneCap: string    // "Cliente" / "Paciente"
  many: string      // "clientes" / "pacientes"
  manyCap: string   // "Clientes" / "Pacientes"
}

export function vocab(clinical: boolean): Vocab {
  return clinical
    ? { one: 'paciente', oneCap: 'Paciente', many: 'pacientes', manyCap: 'Pacientes' }
    : { one: 'cliente', oneCap: 'Cliente', many: 'clientes', manyCap: 'Clientes' }
}
