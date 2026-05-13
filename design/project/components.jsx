// Reusable UI primitives, icons, charts.
// All colors come from CSS variables — the theme layer (App) controls light/dark + accent.

// ─────────────────────────────────────────────────────────────
// Icons — Phosphor-style outline glyphs, hand-drawn so we don't depend on a CDN.
// ─────────────────────────────────────────────────────────────
const Icon = ({ name, size = 24, color = 'currentColor', weight = 1.5 }) => {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: weight, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'house':       return <svg {...props}><path d="M3 11l9-8 9 8v9a2 2 0 01-2 2h-3v-7h-8v7H5a2 2 0 01-2-2v-9z"/></svg>;
    case 'dumbbell':    return <svg {...props}><path d="M6 8v8M4 9v6M9 6v12M18 6v12M20 9v6M15 8v8M9 12h6"/></svg>;
    case 'list':        return <svg {...props}><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1.2"/><circle cx="4" cy="12" r="1.2"/><circle cx="4" cy="18" r="1.2"/></svg>;
    case 'barbell':     return <svg {...props}><path d="M3 9v6M5 7v10M19 7v10M21 9v6M7 11h10v2H7z"/></svg>;
    case 'chart':       return <svg {...props}><path d="M4 20V8M10 20V4M16 20V12M22 20H2"/></svg>;
    case 'plus':        return <svg {...props}><path d="M12 5v14M5 12h14"/></svg>;
    case 'scale':       return <svg {...props}><path d="M5 6h14l1 14H4L5 6z"/><path d="M9 10s1-1 3-1 3 1 3 1"/></svg>;
    case 'tape':        return <svg {...props}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2"/></svg>;
    case 'check':       return <svg {...props}><path d="M5 12l5 5L20 7"/></svg>;
    case 'check-circle':return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg>;
    case 'chevron-right':return <svg {...props}><path d="M9 6l6 6-6 6"/></svg>;
    case 'chevron-left':return <svg {...props}><path d="M15 6l-6 6 6 6"/></svg>;
    case 'chevron-down':return <svg {...props}><path d="M6 9l6 6 6-6"/></svg>;
    case 'x':           return <svg {...props}><path d="M6 6l12 12M18 6L6 18"/></svg>;
    case 'flame':       return <svg {...props}><path d="M12 3s-1 3 0 5 4 3 4 7a6 6 0 11-12 0c0-3 2-4 2-7 2 2 3 3 6-5z"/></svg>;
    case 'trophy':      return <svg {...props}><path d="M7 4h10v4a5 5 0 01-10 0V4z"/><path d="M7 6H4v2a3 3 0 003 3M17 6h3v2a3 3 0 01-3 3M10 17h4l1 4H9l1-4z"/></svg>;
    case 'medal':       return <svg {...props}><circle cx="12" cy="15" r="6"/><path d="M9 9L7 3h10l-2 6"/></svg>;
    case 'clock':       return <svg {...props}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case 'fire':        return <svg {...props}><path d="M12 3c1 2-1 4 0 6s3 2 3 5a5 5 0 11-10 0c0-2 1-3 1-5 1 1 2 2 4-2 1-1 2-2 2-4z"/></svg>;
    case 'arrow-up':    return <svg {...props}><path d="M12 19V5M5 12l7-7 7 7"/></svg>;
    case 'arrow-down':  return <svg {...props}><path d="M12 5v14M5 12l7 7 7-7"/></svg>;
    case 'edit':        return <svg {...props}><path d="M4 20h4L20 8l-4-4L4 16v4z"/><path d="M14 6l4 4"/></svg>;
    case 'trash':       return <svg {...props}><path d="M5 7h14M10 11v6M14 11v6M6 7l1 13a2 2 0 002 2h6a2 2 0 002-2l1-13M9 7V4h6v3"/></svg>;
    case 'play':        return <svg {...props}><path d="M7 5v14l11-7-11-7z"/></svg>;
    case 'pause':       return <svg {...props}><rect x="7" y="5" width="3" height="14" rx="1"/><rect x="14" y="5" width="3" height="14" rx="1"/></svg>;
    case 'drag':        return <svg {...props}><circle cx="9" cy="6" r="1.2" fill={color}/><circle cx="9" cy="12" r="1.2" fill={color}/><circle cx="9" cy="18" r="1.2" fill={color}/><circle cx="15" cy="6" r="1.2" fill={color}/><circle cx="15" cy="12" r="1.2" fill={color}/><circle cx="15" cy="18" r="1.2" fill={color}/></svg>;
    case 'search':      return <svg {...props}><circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/></svg>;
    case 'arrow-left':  return <svg {...props}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>;
    case 'sparkle':     return <svg {...props}><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/></svg>;
    case 'archive':     return <svg {...props}><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a2 2 0 002 2h10a2 2 0 002-2V8M10 13h4"/></svg>;
    case 'settings':    return <svg {...props}><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 00-.1-1.2l2-1.5-2-3.4-2.4.9a7 7 0 00-2-1.2L14 3h-4l-.5 2.6a7 7 0 00-2 1.2l-2.4-.9-2 3.4 2 1.5A7 7 0 005 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.4-.9a7 7 0 002 1.2L10 21h4l.5-2.6a7 7 0 002-1.2l2.4.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z"/></svg>;
    case 'calendar':    return <svg {...props}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>;
    case 'ruler':       return <svg {...props}><path d="M2 16L16 2l6 6L8 22l-6-6z"/><path d="M7 11l3 3M10 8l3 3M13 5l3 3M4 14l3 3"/></svg>;
    case 'target':      return <svg {...props}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill={color}/></svg>;
    case 'crown':       return <svg {...props}><path d="M3 8l4 4 5-8 5 8 4-4-2 12H5L3 8z"/></svg>;
    case 'pencil':      return <svg {...props}><path d="M3 21l4-1 12-12-3-3L4 17l-1 4z"/></svg>;
    default:            return <svg {...props}><circle cx="12" cy="12" r="9"/></svg>;
  }
};

// ─────────────────────────────────────────────────────────────
// Activity Ring (Apple Fitness vibe)
// ─────────────────────────────────────────────────────────────
const Ring = ({ size = 120, stroke = 14, value, goal, color, trackColor, label, sublabel, dark }) => {
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const pct = Math.min(1.5, value / goal);
  const offset = C * (1 - Math.min(1, pct));
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} stroke={trackColor || (dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')} strokeWidth={stroke} fill="none"/>
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={offset} style={{ transition: 'stroke-dashoffset 600ms cubic-bezier(0.16, 1, 0.3, 1)' }}/>
      </svg>
      {label !== undefined && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 2 }}>
          <div style={{ fontFamily: 'var(--font-numeric)', fontSize: size * 0.26, fontWeight: 600, letterSpacing: '-0.04em', lineHeight: 1, color: dark ? '#fff' : 'var(--element-high)' }}>{label}</div>
          {sublabel && <div style={{ fontSize: size < 100 ? 9 : 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: dark ? 'rgba(255,255,255,0.55)' : 'var(--element-low)' }}>{sublabel}</div>}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Sparkline (mini line)
// ─────────────────────────────────────────────────────────────
const Sparkline = ({ values, width = 80, height = 28, color, fill }) => {
  if (!values || values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = (max - min) || 1;
  const pts = values.map((v, i) => [(i / (values.length - 1)) * width, height - ((v - min) / range) * (height - 4) - 2]);
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const areaD = d + ` L${width} ${height} L0 ${height} Z`;
  return (
    <svg width={width} height={height}>
      {fill && <path d={areaD} fill={fill}/>}
      <path d={d} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────
// Line chart with X axis, fill, optional PR markers
// ─────────────────────────────────────────────────────────────
const LineChart = ({ points, width, height, color, fillTop, fillBottom, dark, prIdxs, yFormat, xFormat }) => {
  const pad = { l: 8, r: 12, t: 14, b: 24 };
  const W = width - pad.l - pad.r;
  const H = height - pad.t - pad.b;
  if (!points || points.length < 2) return <div style={{ height, color: 'var(--element-low)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>—</div>;
  const ys = points.map(p => p.y);
  let yMin = Math.min(...ys);
  let yMax = Math.max(...ys);
  if (yMin === yMax) { yMin -= 1; yMax += 1; }
  const pad_ = (yMax - yMin) * 0.15;
  yMin -= pad_; yMax += pad_;
  const xScale = (i) => (i / (points.length - 1)) * W + pad.l;
  const yScale = (v) => pad.t + (1 - (v - yMin) / (yMax - yMin)) * H;
  const linePath = points.map((p, i) => `${i ? 'L' : 'M'}${xScale(i).toFixed(1)} ${yScale(p.y).toFixed(1)}`).join(' ');
  const areaPath = linePath + ` L${xScale(points.length-1).toFixed(1)} ${pad.t + H} L${xScale(0).toFixed(1)} ${pad.t + H} Z`;

  const gridY = [yMin, (yMin+yMax)/2, yMax];
  const xTicks = [0, Math.floor(points.length / 2), points.length - 1];

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="lg-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fillTop || color} stopOpacity="0.32"/>
          <stop offset="100%" stopColor={fillBottom || color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {gridY.map((g, i) => (
        <line key={i} x1={pad.l} x2={width - pad.r} y1={yScale(g)} y2={yScale(g)} stroke={dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'} strokeWidth="1"/>
      ))}
      <path d={areaPath} fill="url(#lg-fill)"/>
      <path d={linePath} fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
      {(prIdxs || []).map((idx) => {
        const cx = xScale(idx);
        const cy = yScale(points[idx].y);
        return (
          <g key={idx}>
            <circle cx={cx} cy={cy} r="6" fill={dark ? '#000' : '#fff'} stroke={color} strokeWidth="2"/>
            <circle cx={cx} cy={cy} r="2.2" fill={color}/>
          </g>
        );
      })}
      <circle cx={xScale(points.length-1)} cy={yScale(points[points.length-1].y)} r="3.5" fill={color} stroke={dark ? '#000' : '#fff'} strokeWidth="2"/>
      {xTicks.map((t, i) => (
        <text key={i} x={xScale(t)} y={height - 6} textAnchor={i === 0 ? 'start' : i === xTicks.length - 1 ? 'end' : 'middle'}
          fontSize="10" fill={dark ? 'rgba(255,255,255,0.5)' : 'var(--element-low)'} fontFamily="var(--font-numeric)">
          {xFormat ? xFormat(points[t]) : points[t].x}
        </text>
      ))}
      <text x={pad.l} y={pad.t + 8} fontSize="10" fill={dark ? 'rgba(255,255,255,0.4)' : 'var(--element-low)'} fontFamily="var(--font-numeric)">
        {yFormat ? yFormat(yMax) : yMax.toFixed(1)}
      </text>
    </svg>
  );
};

// ─────────────────────────────────────────────────────────────
// Card primitive
// ─────────────────────────────────────────────────────────────
const Card = ({ children, style, dark, onClick, dense, ...rest }) => (
  <div onClick={onClick} style={{
    background: dark ? 'rgba(255,255,255,0.06)' : '#fff',
    border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid var(--border-subtle)',
    borderRadius: 22,
    padding: dense ? 14 : 18,
    color: dark ? '#fff' : 'var(--element-high)',
    cursor: onClick ? 'pointer' : 'default',
    transition: 'background var(--dur) var(--ease-out), border-color var(--dur) var(--ease-out)',
    ...style,
  }} {...rest}>{children}</div>
);

// ─────────────────────────────────────────────────────────────
// Tag — colored pill
// ─────────────────────────────────────────────────────────────
const Tag = ({ children, color = 'var(--primary)', bg = 'var(--primary-lighter-ext)', dark }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
    color: dark ? color : color,
    background: dark ? 'color-mix(in oklab, ' + color + ' 18%, transparent)' : bg,
    letterSpacing: 0.1,
  }}>{children}</span>
);

// ─────────────────────────────────────────────────────────────
// Button
// ─────────────────────────────────────────────────────────────
const Button = ({ children, variant = 'primary', size = 'md', icon, onClick, full, style, dark, disabled }) => {
  const h = size === 'lg' ? 52 : size === 'sm' ? 36 : 44;
  const padX = size === 'lg' ? 24 : size === 'sm' ? 14 : 18;
  const radius = size === 'lg' ? 16 : 12;
  let bg, color, border;
  if (variant === 'primary') {
    bg = disabled ? 'var(--surface-strong)' : 'var(--primary)';
    color = disabled ? 'var(--element-disabled)' : '#fff';
    border = 'transparent';
  } else if (variant === 'ghost') {
    bg = dark ? 'rgba(255,255,255,0.08)' : 'var(--surface-muted)';
    color = dark ? '#fff' : 'var(--element-high)';
    border = 'transparent';
  } else if (variant === 'outline') {
    bg = 'transparent';
    color = dark ? '#fff' : 'var(--element-high)';
    border = dark ? '1px solid rgba(255,255,255,0.18)' : '1px solid var(--border-default)';
  } else if (variant === 'dark') {
    bg = '#1F1F1F'; color = '#fff'; border = 'transparent';
  }
  return (
    <button onClick={onClick} disabled={disabled} style={{
      height: h, padding: `0 ${padX}px`, borderRadius: radius, border,
      background: bg, color, fontWeight: 600, fontSize: size === 'lg' ? 17 : 15,
      fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      width: full ? '100%' : undefined, cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'background var(--dur) var(--ease-out)', ...style,
    }}>
      {icon && <Icon name={icon} size={size === 'lg' ? 20 : 18}/>}
      {children}
    </button>
  );
};

// ─────────────────────────────────────────────────────────────
// Segment control
// ─────────────────────────────────────────────────────────────
const Segment = ({ options, value, onChange, dark, size = 'md' }) => (
  <div style={{
    display: 'inline-flex', padding: 3, borderRadius: 12,
    background: dark ? 'rgba(255,255,255,0.07)' : 'var(--surface-muted)',
    width: '100%', boxSizing: 'border-box',
  }}>
    {options.map(o => {
      const active = o.value === value;
      return (
        <button key={o.value} onClick={() => onChange(o.value)} style={{
          flex: 1, height: size === 'sm' ? 28 : 34, borderRadius: 9, border: 'none',
          background: active ? (dark ? '#fff' : '#fff') : 'transparent',
          color: active ? (dark ? '#000' : 'var(--element-high)') : (dark ? 'rgba(255,255,255,0.65)' : 'var(--element-medium)'),
          fontWeight: 600, fontSize: size === 'sm' ? 12 : 13, fontFamily: 'inherit', cursor: 'pointer',
          boxShadow: active ? (dark ? '0 1px 2px rgba(0,0,0,0.5)' : '0 1px 2px rgba(0,0,0,0.06)') : 'none',
          transition: 'background var(--dur) var(--ease-out), color var(--dur) var(--ease-out)',
        }}>{o.label}</button>
      );
    })}
  </div>
);

// ─────────────────────────────────────────────────────────────
// Commentary callout — appears when the commentary tweak is on.
// ─────────────────────────────────────────────────────────────
const Note = ({ children, on }) => {
  if (!on) return null;
  return (
    <div style={{
      margin: '8px 0', padding: '10px 12px', borderRadius: 12,
      background: 'color-mix(in oklab, var(--primary) 12%, transparent)',
      border: '1px dashed color-mix(in oklab, var(--primary) 55%, transparent)',
      fontSize: 12, lineHeight: 1.45,
      color: 'color-mix(in oklab, var(--primary) 70%, #1F1F1F 30%)',
      display: 'flex', gap: 8, alignItems: 'flex-start',
    }}>
      <Icon name="sparkle" size={14} color="currentColor"/>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
};

Object.assign(window, { Icon, Ring, Sparkline, LineChart, Card, Tag, Button, Segment, Note });
