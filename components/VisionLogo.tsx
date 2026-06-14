'use client'

export function VisionLogo({ size = 80, animate = false }: { size?: number; animate?: boolean }) {
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: size * 0.12 }}>
      {/* V symbol SVG */}
      <svg
        width={size}
        height={size * 0.85}
        viewBox="0 0 200 170"
        xmlns="http://www.w3.org/2000/svg"
        style={animate ? { animation: 'logoFloat 4s ease-in-out infinite' } : {}}
      >
        <defs>
          <filter id="glow-edge-v" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="4.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-tip-v" x="-300%" y="-300%" width="700%" height="700%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-pulse" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="lf-v" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2e2e44" />
            <stop offset="60%" stopColor="#14141f" />
            <stop offset="100%" stopColor="#08080f" />
          </linearGradient>
          <linearGradient id="rf-v" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1c1c2e" />
            <stop offset="60%" stopColor="#0e0e1a" />
            <stop offset="100%" stopColor="#060610" />
          </linearGradient>
          {/* Animated glow gradient */}
          <linearGradient id="glowLine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#2563FF" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        {/* Left panel — outer face */}
        <polygon points="12,12 78,12 100,148 55,148" fill="url(#lf-v)" />
        {/* Left panel — inner bright edge */}
        <polygon points="70,12 78,12 100,148 93,148" fill="#1e1e32" opacity="0.95" />

        {/* Right panel — outer face */}
        <polygon points="188,12 122,12 100,148 145,148" fill="url(#rf-v)" />
        {/* Right panel — inner bright edge */}
        <polygon points="130,12 122,12 100,148 107,148" fill="#161626" opacity="0.85" />

        {/* Outer blue glow lines */}
        <line x1="78" y1="12" x2="100" y2="148" stroke="#2563FF" strokeWidth="4" filter="url(#glow-edge-v)" opacity="0.9" />
        <line x1="122" y1="12" x2="100" y2="148" stroke="#2563FF" strokeWidth="4" filter="url(#glow-edge-v)" opacity="0.9" />

        {/* Core bright white-blue lines */}
        <line x1="78" y1="12" x2="100" y2="148" stroke="url(#glowLine)" strokeWidth="1.4" opacity="0.85" />
        <line x1="122" y1="12" x2="100" y2="148" stroke="url(#glowLine)" strokeWidth="1.4" opacity="0.85" />

        {/* Animated glow lines (pulse) */}
        {animate && (
          <>
            <line x1="78" y1="12" x2="100" y2="148" stroke="#60a5fa" strokeWidth="2" opacity="0.5" filter="url(#glow-pulse)">
              <animate attributeName="opacity" values="0.2;0.8;0.2" dur="2.5s" repeatCount="indefinite" />
            </line>
            <line x1="122" y1="12" x2="100" y2="148" stroke="#60a5fa" strokeWidth="2" opacity="0.5" filter="url(#glow-pulse)">
              <animate attributeName="opacity" values="0.2;0.8;0.2" dur="2.5s" begin="0.3s" repeatCount="indefinite" />
            </line>
          </>
        )}

        {/* Tip glow */}
        <circle cx="100" cy="148" r="6" fill="#2563FF" filter="url(#glow-tip-v)" opacity="0.95" />
        <circle cx="100" cy="148" r="2.5" fill="white" opacity="1" />

        {/* Tip bottom scatter */}
        <ellipse cx="100" cy="157" rx="22" ry="5" fill="#2563FF" opacity="0.2" filter="url(#glow-tip-v)">
          {animate && <animate attributeName="opacity" values="0.1;0.35;0.1" dur="2s" repeatCount="indefinite" />}
        </ellipse>
      </svg>

      {/* VISION text — Orbitron font matching the logo */}
      <div style={{
        fontFamily: "'Orbitron', sans-serif",
        fontWeight: 900,
        fontSize: size * 0.22,
        letterSpacing: size * 0.065 + 'px',
        color: '#111827',
        textTransform: 'uppercase',
        userSelect: 'none',
        paddingLeft: size * 0.065,
      }}>
        VISION
      </div>
    </div>
  )
}

export function VisionLogoWhite({ size = 80, animate = false }: { size?: number; animate?: boolean }) {
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: size * 0.12 }}>
      <svg
        width={size}
        height={size * 0.85}
        viewBox="0 0 200 170"
        xmlns="http://www.w3.org/2000/svg"
        style={animate ? { animation: 'logoFloat 4s ease-in-out infinite' } : {}}
      >
        <defs>
          <filter id="glow-edge-w" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="4.5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-tip-w" x="-300%" y="-300%" width="700%" height="700%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-pulse-w" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id="lf-w" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2e2e44" />
            <stop offset="60%" stopColor="#14141f" />
            <stop offset="100%" stopColor="#08080f" />
          </linearGradient>
          <linearGradient id="rf-w" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1c1c2e" />
            <stop offset="60%" stopColor="#0e0e1a" />
            <stop offset="100%" stopColor="#060610" />
          </linearGradient>
          <linearGradient id="glowLineW" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#2563FF" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.95" />
          </linearGradient>
        </defs>

        <polygon points="12,12 78,12 100,148 55,148" fill="url(#lf-w)" />
        <polygon points="70,12 78,12 100,148 93,148" fill="#1e1e32" opacity="0.95" />
        <polygon points="188,12 122,12 100,148 145,148" fill="url(#rf-w)" />
        <polygon points="130,12 122,12 100,148 107,148" fill="#161626" opacity="0.85" />

        <line x1="78" y1="12" x2="100" y2="148" stroke="#2563FF" strokeWidth="4" filter="url(#glow-edge-w)" opacity="0.9" />
        <line x1="122" y1="12" x2="100" y2="148" stroke="#2563FF" strokeWidth="4" filter="url(#glow-edge-w)" opacity="0.9" />
        <line x1="78" y1="12" x2="100" y2="148" stroke="url(#glowLineW)" strokeWidth="1.4" opacity="0.85" />
        <line x1="122" y1="12" x2="100" y2="148" stroke="url(#glowLineW)" strokeWidth="1.4" opacity="0.85" />

        {animate && (
          <>
            <line x1="78" y1="12" x2="100" y2="148" stroke="#60a5fa" strokeWidth="2" filter="url(#glow-pulse-w)">
              <animate attributeName="opacity" values="0.2;0.8;0.2" dur="2.5s" repeatCount="indefinite" />
            </line>
            <line x1="122" y1="12" x2="100" y2="148" stroke="#60a5fa" strokeWidth="2" filter="url(#glow-pulse-w)">
              <animate attributeName="opacity" values="0.2;0.8;0.2" dur="2.5s" begin="0.3s" repeatCount="indefinite" />
            </line>
          </>
        )}

        <circle cx="100" cy="148" r="6" fill="#2563FF" filter="url(#glow-tip-w)" opacity="0.95" />
        <circle cx="100" cy="148" r="2.5" fill="white" opacity="1" />
        <ellipse cx="100" cy="157" rx="22" ry="5" fill="#2563FF" opacity="0.2" filter="url(#glow-tip-w)">
          {animate && <animate attributeName="opacity" values="0.1;0.35;0.1" dur="2s" repeatCount="indefinite" />}
        </ellipse>
      </svg>

      {/* VISION text in white — for dark backgrounds */}
      <div style={{
        fontFamily: "'Orbitron', sans-serif",
        fontWeight: 900,
        fontSize: size * 0.22,
        letterSpacing: size * 0.065 + 'px',
        color: 'white',
        textTransform: 'uppercase',
        userSelect: 'none',
        paddingLeft: size * 0.065,
        background: 'linear-gradient(135deg, #ffffff 30%, #93c5fd 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        VISION
      </div>
    </div>
  )
}
