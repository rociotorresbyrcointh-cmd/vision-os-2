'use client'

import { useEffect, useRef } from 'react'

// Fondo 3D orgánico (raymarching "lava lamp") en la paleta de Vision (azul/violeta/cyan).
// Liviano: resolución interna capada, ~30fps, muy borroso y sutil. Sin imágenes ni figuras.
const FRAG = `precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_speed;
uniform float u_blend;
uniform vec3 u_col1; uniform vec3 u_col2; uniform vec3 u_col3; uniform vec3 u_col4; uniform vec3 u_col5;
float smin(float a,float b,float k){float h=clamp(0.5+0.5*(b-a)/k,0.0,1.0);return mix(b,a,h)-k*h*(1.0-h);}
float sdCapsule(vec3 p,vec3 a,vec3 b,float r){vec3 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0);return length(pa-ba*h)-r;}
float map(vec3 p){
  float t=u_time*u_speed; vec3 q=p;
  q.x+=sin(p.y*0.5+t)*1.0; q.z+=cos(p.x*0.4+t*0.8)*1.0;
  float d=100.0; float k=u_blend;
  vec3 a0=vec3(sin(t*0.2)*1.0,-100.0,cos(t*0.3)*1.0); vec3 b0=vec3(sin(t*0.4)*1.0,100.0,cos(t*0.5)*1.0); d=smin(d,sdCapsule(q,a0,b0,2.0),k);
  vec3 a1=vec3(sin(t*0.5)*3.0,-40.0+fract(t*0.15+0.0)*80.0,sin(t*0.6)*2.0); vec3 b1=a1+vec3(cos(t*0.7)*3.0,6.0,sin(t*0.5)*-2.0); d=smin(d,sdCapsule(q,a1,b1,1.8),k);
  vec3 a2=vec3(cos(t*0.6)*-4.0,-40.0+fract(t*0.17+0.3)*80.0,cos(t*0.4)*1.5); vec3 b2=a2+vec3(sin(t*0.9)*2.5,4.5,cos(t*0.8)*2.5); d=smin(d,sdCapsule(q,a2,b2,1.5),k);
  vec3 a3=vec3(sin(t*0.4)*-3.5,-40.0+fract(t*0.16+0.6)*80.0,0.0); vec3 b3=a3+vec3(sin(t*0.8)*1.5,7.0,cos(t*0.5)*-1.5); d=smin(d,sdCapsule(q,a3,b3,1.0),k);
  vec3 a4=vec3(cos(t*0.8)*4.5,-40.0+fract(t*0.18+0.8)*80.0,sin(t*0.9)*-2.5); vec3 b4=a4+vec3(cos(t*1.1)*-2.0,3.5,sin(t*1.2)*2.0); d=smin(d,sdCapsule(q,a4,b4,1.2),k);
  vec3 a6=vec3(cos(t*1.3)*-2.5,-40.0+fract(t*0.19+0.5)*80.0,sin(t*1.2)*1.5); vec3 b6=a6+vec3(0.0,5.0,0.0); d=smin(d,sdCapsule(q,a6,b6,2.0),k);
  vec3 a8=vec3(cos(t*0.7)*3.5,-40.0+fract(t*0.14+0.7)*80.0,sin(t*0.5)*1.5); vec3 b8=a8+vec3(sin(t*1.5)*-2.0,4.0,cos(t*0.9)*2.0); d=smin(d,sdCapsule(q,a8,b8,1.6),k);
  return d*0.6;
}
vec3 calcNormal(vec3 p){vec2 e=vec2(0.01,-0.01);return normalize(e.xyy*map(p+e.xyy)+e.yyx*map(p+e.yyx)+e.yxy*map(p+e.yxy)+e.xxx*map(p+e.xxx));}
void main(){
  vec2 uv=(gl_FragCoord.xy-0.5*u_resolution.xy)/min(u_resolution.y,u_resolution.x);
  vec3 ro=vec3(0.0,0.0,9.0); vec3 rd=normalize(vec3(uv,-1.0));
  float dO=0.0; vec3 p;
  for(int i=0;i<40;i++){p=ro+rd*dO;float dS=map(p);dO+=dS;if(dS<0.02||dO>20.0)break;}
  vec3 col=vec3(0.0);
  if(dO<20.0){
    vec3 n=calcNormal(p);
    vec3 baseColor=mix(u_col1,u_col2,smoothstep(-5.0,5.0,p.y));
    baseColor=mix(baseColor,u_col4,smoothstep(-2.0,4.0,p.x));
    baseColor=mix(baseColor,u_col5,smoothstep(2.0,6.0,p.x+p.y));
    baseColor=mix(baseColor,u_col3,smoothstep(3.0,6.0,-p.x));
    vec3 l1=normalize(vec3(1.0,1.0,1.0)); vec3 l2=normalize(vec3(-1.0,-1.0,-0.5)); vec3 l3=normalize(vec3(0.0,1.0,-1.0));
    float diff=max(dot(n,l1),0.0); float fres=pow(1.0-max(dot(n,-rd),0.0),3.0); float ao=clamp(map(p+n*0.5)/0.5,0.0,1.0);
    col=baseColor*(diff*0.7+0.5)*ao;
    col+=u_col4*max(dot(n,l2),0.0)*fres*1.2;
    col+=u_col3*max(dot(n,l3),0.0)*fres*1.0;
  }
  col=pow(col,vec3(1.0/1.8));
  gl_FragColor=vec4(col,1.0);
}`
const VERT = `attribute vec2 position; void main(){ gl_Position=vec4(position,0.0,1.0); }`

export function LavaBackground() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const host = ref.current
    if (!host) return

    const canvas = document.createElement('canvas')
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.display = 'block'
    host.appendChild(canvas)
    const opts: WebGLContextAttributes = { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' }
    const gl = (canvas.getContext('webgl', opts)
      || canvas.getContext('experimental-webgl', opts)
      || canvas.getContext('webgl')) as WebGLRenderingContext | null
    if (!gl) { host.removeChild(canvas); return }

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog); gl.useProgram(prog)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)
    const posLoc = gl.getAttribLocation(prog, 'position')
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    const U = (n: string) => gl.getUniformLocation(prog, n)
    gl.uniform1f(U('u_speed'), 0.15)
    gl.uniform1f(U('u_blend'), 1.0)
    gl.uniform3f(U('u_col1'), 0.145, 0.388, 1.0)   // azul #2563FF
    gl.uniform3f(U('u_col2'), 0.31, 0.275, 0.898)  // indigo #4f46e5
    gl.uniform3f(U('u_col3'), 0.486, 0.227, 0.929) // violeta #7c3aed
    gl.uniform3f(U('u_col4'), 0.769, 0.71, 0.992)  // lila claro #c4b5fd
    gl.uniform3f(U('u_col5'), 0.133, 0.827, 0.933) // cyan #22d3ee
    const uRes = U('u_resolution'), uTime = U('u_time')

    const isMobile = window.innerWidth < 640
    const MAXPIX = isMobile ? 220000 : 350000
    const resize = () => {
      const w = host.clientWidth || window.innerWidth
      const h = host.clientHeight || window.innerHeight
      const scale = Math.min(1, Math.sqrt(MAXPIX / (w * h)))
      canvas.width = Math.max(2, Math.floor(w * scale))
      canvas.height = Math.max(2, Math.floor(h * scale))
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(uRes, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    let raf = 0
    let start = 0
    let last = 0
    const interval = isMobile ? 42 : 33
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      if (start === 0) start = now
      if (now - last < interval) return
      last = now
      gl.uniform1f(uTime, (now - start) / 1000)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      gl.deleteProgram(prog)
      gl.deleteBuffer(buf)
      const lose = gl.getExtension('WEBGL_lose_context')
      if (lose) lose.loseContext()
      if (canvas.parentNode === host) host.removeChild(canvas)
    }
  }, [])

  return <div ref={ref} aria-hidden style={{ position: 'absolute', inset: 0, filter: 'blur(60px)', opacity: 0.6, transform: 'scale(1.15)' }} />
}
