import { redirect } from 'next/navigation'

// La raíz no tiene contenido propio: el proxy decide login o inicio.
export default function Home() {
  redirect('/inicio')
}
