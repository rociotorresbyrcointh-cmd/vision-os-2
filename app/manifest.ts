import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Vision OS — Agenda',
    short_name: 'Vision',
    description: 'Tu agenda, caja y marketing con IA en un solo lugar.',
    start_url: '/inicio',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#07070F',
    theme_color: '#07070F',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
