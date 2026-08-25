'use client'

import { useState, useEffect } from 'react'

// true cuando el viewport es de teléfono (≤ 768px). Empieza en false para que
// el HTML del servidor coincida con el primer render del cliente (evita #418).
export function useIsMobile(breakpoint = 768): boolean {
  const [mobile, setMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`)
    const update = () => setMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [breakpoint])
  return mobile
}
