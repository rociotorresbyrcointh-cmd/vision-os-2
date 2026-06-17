import Link from 'next/link'
import { VisionLogoWhite } from '@/components/VisionLogo'

export function LegalShell({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#07070F', padding: '40px 20px 80px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <Link href="/login" style={{ textDecoration: 'none', display: 'inline-block', marginBottom: 28 }}>
          <VisionLogoWhite size={32} />
        </Link>
        <h1 style={{ color: 'white', fontSize: 30, fontWeight: 800, margin: '0 0 6px' }}>{title}</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13.5, margin: '0 0 32px' }}>Última actualización: {updated}</p>
        <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 15, lineHeight: 1.7 }}>
          {children}
        </div>
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: 18 }}>
          <Link href="/privacidad" style={{ color: '#60a5fa', fontSize: 13.5, textDecoration: 'none' }}>Política de Privacidad</Link>
          <Link href="/terminos" style={{ color: '#60a5fa', fontSize: 13.5, textDecoration: 'none' }}>Términos y Condiciones</Link>
          <Link href="/login" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13.5, textDecoration: 'none' }}>Volver</Link>
        </div>
      </div>
    </div>
  )
}

export function H2({ children }: { children: React.ReactNode }) {
  return <h2 style={{ color: 'white', fontSize: 19, fontWeight: 700, margin: '30px 0 10px' }}>{children}</h2>
}
