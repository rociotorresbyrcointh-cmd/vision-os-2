import sharp from 'sharp'
import { writeFileSync, mkdirSync } from 'fs'

mkdirSync('public', { recursive: true })

const svg = (radius) => `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#3b82f6"/>
      <stop offset="1" stop-color="#2563FF"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="${radius}" fill="#0a0a14"/>
  <circle cx="256" cy="256" r="168" fill="none" stroke="#2563FF" stroke-opacity="0.22" stroke-width="10"/>
  <path d="M150 168 L246 360 L266 360 L362 168 L306 168 L256 280 L206 168 Z" fill="url(#g)"/>
</svg>`

async function gen(name, size, radius) {
  const png = await sharp(Buffer.from(svg(radius))).resize(size, size).png().toBuffer()
  writeFileSync(`public/${name}`, png)
  console.log('✓', name, size)
}

await gen('icon-192.png', 192, 112)
await gen('icon-512.png', 512, 112)
await gen('icon-maskable-512.png', 512, 0)
await gen('apple-icon.png', 180, 0)
console.log('Listo')
