'use client'

import { useEffect, useRef } from 'react'

// Nube de partículas glow (esfera azul→naranja) de fondo en el hero.
// Liviana: Three.js se carga de forma diferida y con pocas partículas en mobile.
export function HeroParticles() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let cleanup = () => {}
    let raf = 0
    let cancelled = false

    ;(async () => {
      const THREE = await import('three')
      const el = ref.current
      if (!el || cancelled) return
      const w = el.clientWidth || window.innerWidth
      const h = el.clientHeight || 500

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100)
      camera.position.z = 7.2
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
      renderer.setSize(w, h)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.domElement.style.width = '100%'
      renderer.domElement.style.height = '100%'
      el.appendChild(renderer.domElement)

      const isMobile = w < 640
      const N = isMobile ? 3200 : 8500
      const positions = new Float32Array(N * 3)
      const colors = new Float32Array(N * 3)
      const cBottom = new THREE.Color(0.2, 0.4, 1.0) // azul
      const cTop = new THREE.Color(1.0, 0.3, 0.2)    // naranja

      for (let i = 0; i < N; i++) {
        const u = Math.random(), v = Math.random()
        const theta = 2 * Math.PI * u
        const phi = Math.acos(2 * v - 1)
        const r = 4.4 * (0.86 + Math.random() * 0.14)
        const x = r * Math.sin(phi) * Math.cos(theta)
        const y = r * Math.cos(phi)
        const z = r * Math.sin(phi) * Math.sin(theta)
        positions[i * 3] = x
        positions[i * 3 + 1] = y
        positions[i * 3 + 2] = z
        const t = Math.min(Math.max((y / 4.4) * 0.5 + 0.5, 0), 1)
        const c = cBottom.clone().lerp(cTop, t)
        colors[i * 3] = c.r
        colors[i * 3 + 1] = c.g
        colors[i * 3 + 2] = c.b
      }

      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      const mat = new THREE.PointsMaterial({
        size: isMobile ? 0.05 : 0.04,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      })
      const points = new THREE.Points(geo, mat)
      scene.add(points)

      let mx = 0, my = 0
      const onMove = (e: MouseEvent) => {
        mx = e.clientX / window.innerWidth - 0.5
        my = e.clientY / window.innerHeight - 0.5
      }
      window.addEventListener('mousemove', onMove)
      const onResize = () => {
        const w2 = el.clientWidth || window.innerWidth
        const h2 = el.clientHeight || 500
        camera.aspect = w2 / h2
        camera.updateProjectionMatrix()
        renderer.setSize(w2, h2)
      }
      window.addEventListener('resize', onResize)

      const animate = () => {
        raf = requestAnimationFrame(animate)
        points.rotation.y += 0.0009
        points.rotation.x += (my * 0.25 - points.rotation.x) * 0.02
        points.position.x += (mx * 0.6 - points.position.x) * 0.02
        renderer.render(scene, camera)
      }
      animate()

      cleanup = () => {
        cancelAnimationFrame(raf)
        window.removeEventListener('mousemove', onMove)
        window.removeEventListener('resize', onResize)
        geo.dispose()
        mat.dispose()
        renderer.dispose()
        if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement)
      }
    })()

    return () => { cancelled = true; cleanup() }
  }, [])

  return <div ref={ref} aria-hidden style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
}
