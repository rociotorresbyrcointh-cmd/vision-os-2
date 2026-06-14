// Fondo "4D" de Vision OS: orbes ambientales, grilla 3D, línea de
// horizonte y esfera orbital. Solo decorativo (pointerEvents: none).
// Se usa en las pantallas de entrada (login / register), NO en el workspace.
export function AuthBackground() {
  return (
    <>
      {/* Orbes ambientales */}
      <div style={{ position: 'fixed', top: '-20%', left: '-15%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,255,0.13) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-10%', right: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,255,0.09) 0%, transparent 65%)', pointerEvents: 'none' }} />

      {/* Grilla 3D animada */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: '75vh',
        backgroundImage: [
          'linear-gradient(rgba(37,99,255,0.18) 1px, transparent 1px)',
          'linear-gradient(90deg, rgba(37,99,255,0.18) 1px, transparent 1px)',
        ].join(','),
        backgroundSize: '70px 70px',
        transform: 'perspective(420px) rotateX(80deg)',
        transformOrigin: '50% 100%',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 25%, black 60%)',
        maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.5) 25%, black 60%)',
        pointerEvents: 'none', animation: 'gridScroll 2.5s linear infinite', zIndex: 0,
      }} />

      {/* Línea de horizonte */}
      <div style={{
        position: 'fixed', bottom: '25vh', left: 0, right: 0, height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(37,99,255,0.6) 30%, rgba(37,99,255,0.8) 50%, rgba(37,99,255,0.6) 70%, transparent)',
        boxShadow: '0 0 20px rgba(37,99,255,0.5)', pointerEvents: 'none', zIndex: 1,
      }} />

      {/* Esfera 4D orbital */}
      <div style={{ position: 'fixed', right: '6%', top: '50%', transform: 'translateY(-50%)', width: 280, height: 280, pointerEvents: 'none', zIndex: 2 }}>
        <div style={{ position: 'absolute', inset: 0, border: '1.5px solid rgba(37,99,255,0.55)', borderRadius: '50%', boxShadow: '0 0 16px rgba(37,99,255,0.2)', animation: 'dim4ring1 12s linear infinite' }} />
        <div style={{ position: 'absolute', inset: 12, border: '1px solid rgba(37,99,255,0.4)', borderRadius: '50%', animation: 'dim4ring2 9s linear infinite' }} />
        <div style={{ position: 'absolute', inset: 24, border: '1px solid rgba(37,99,255,0.3)', borderRadius: '50%', animation: 'dim4ring3 7s linear infinite reverse' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 14, height: 14, borderRadius: '50%', background: '#2563FF', boxShadow: '0 0 30px 10px rgba(37,99,255,0.5)' }} />
      </div>
    </>
  )
}
