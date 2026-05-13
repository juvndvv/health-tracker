// Home screen — dashboard with rings, last session, quick-adds, weight chart.

function HomeScreen({ theme, nav }) {
  const { dark, dense, commentary, populated } = theme;
  const stats = thisWeekStats();
  const streak = currentStreak();
  const lastWeight = WEIGHTS[WEIGHTS.length - 1];
  const lastSession = SESSIONS[0];
  const weight7d = WEIGHTS.slice(-30);
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();

  if (!populated) return <HomeEmpty theme={theme} nav={nav}/>;

  const ringColors = {
    sessions: accent,
    minutes: '#10B981',
    volume: '#3B82F6',
  };

  // Heatmap: trailing 12 weeks for the home preview
  const weeks = heatmapWeeks().slice(-12);

  return (
    <div>
      <PageTitle dark={dark} title="Hola, Marta" subtitle={fmtDayShort(TODAY)}/>
      <Note on={commentary}>El Home prioriza acción: anillos arriba, atajos a los 4 registros más comunes, y un resumen del último entrenamiento para el contexto.</Note>

      {/* Activity rings */}
      <div style={{ margin: '0 16px 14px', borderRadius: 24, padding: 18,
        background: dark ? 'linear-gradient(135deg, #1A1A1A, #0E0E0E)' : '#fff',
        border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: dark ? 'rgba(255,255,255,0.5)' : 'var(--element-low)' }}>Esta semana</div>
            <div style={{ fontFamily: 'var(--font-numeric)', fontSize: 32, fontWeight: 700, letterSpacing: '-0.03em', color: dark ? '#fff' : '#1F1F1F', marginTop: 2 }}>
              {stats.sessions} <span style={{ color: dark ? 'rgba(255,255,255,0.5)' : 'var(--element-low)', fontWeight: 500, fontSize: 18 }}>/ {stats.sessionsGoal}</span>
            </div>
            <div style={{ fontSize: 12, color: dark ? 'rgba(255,255,255,0.5)' : 'var(--element-medium)' }}>sesiones · meta semanal</div>
          </div>
          <div style={{ position: 'relative', width: 112, height: 112 }}>
            {/* Triple ring stack */}
            <div style={{ position: 'absolute', inset: 0 }}>
              <Ring size={112} stroke={11} value={stats.sessions} goal={stats.sessionsGoal} color={ringColors.sessions} dark={dark}/>
            </div>
            <div style={{ position: 'absolute', inset: 13 }}>
              <Ring size={86} stroke={10} value={stats.minutes} goal={stats.minutesGoal} color={ringColors.minutes} dark={dark}/>
            </div>
            <div style={{ position: 'absolute', inset: 26 }}>
              <Ring size={60} stroke={9} value={stats.volume} goal={stats.volumeGoal} color={ringColors.volume} dark={dark}/>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
          <RingLegend color={ringColors.sessions} label="Sesiones" value={`${stats.sessions} / ${stats.sessionsGoal}`} dark={dark}/>
          <RingLegend color={ringColors.minutes} label="Minutos" value={`${stats.minutes} / ${stats.minutesGoal}`} dark={dark}/>
          <RingLegend color={ringColors.volume} label="Volumen" value={`${(stats.volume/1000).toFixed(1)} / ${(stats.volumeGoal/1000).toFixed(0)}t`} dark={dark}/>
        </div>
      </div>

      {/* Quick adds */}
      <div style={{ margin: '0 16px 14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <QuickTile dark={dark} icon="play" label="Entrenar" sublabel="Elegir rutina" primary onClick={() => nav.setTab('train')}/>
        <QuickTile dark={dark} icon="scale" label="Peso" sublabel={`${lastWeight.kg.toFixed(1)} kg · ${fmtRelative(parseYmd(lastWeight.date))}`} onClick={() => nav.go('record-weight')}/>
        <QuickTile dark={dark} icon="tape" label="Medida" sublabel="Cintura, brazo..." onClick={() => nav.go('record-measure')}/>
        <QuickTile dark={dark} icon="flame" label={`${streak}`} sublabel={`semana${streak !== 1 ? 's' : ''} en racha`} streak/>
      </div>

      {/* Weight + sparkline */}
      <SectionTitle dark={dark} title="Peso corporal" action="Ver" onAction={() => { nav.setTab('progress'); }}/>
      <Card dark={dark} dense={dense} style={{ margin: '0 16px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-numeric)', fontSize: 38, fontWeight: 600, letterSpacing: '-0.04em', lineHeight: 1 }}>
              {lastWeight.kg.toFixed(1)}
              <span style={{ fontSize: 16, color: dark ? 'rgba(255,255,255,0.5)' : 'var(--element-medium)', marginLeft: 4, fontWeight: 500 }}>kg</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: 12 }}>
              <Icon name="arrow-down" size={12} color="#10B981"/>
              <span style={{ color: '#10B981', fontWeight: 600 }}>−{(WEIGHTS[0].kg - lastWeight.kg).toFixed(1)} kg</span>
              <span style={{ color: dark ? 'rgba(255,255,255,0.5)' : 'var(--element-low)' }}>· 6 meses</span>
            </div>
          </div>
          <Sparkline values={weight7d.map(w => w.kg)} width={120} height={44} color="var(--primary)" fill="color-mix(in oklab, var(--primary) 18%, transparent)"/>
        </div>
      </Card>

      {/* Last session */}
      <SectionTitle dark={dark} title="Último entrenamiento" action="Historial" onAction={() => nav.setTab('progress')}/>
      <Card dark={dark} dense={dense} style={{ margin: '0 16px 14px' }} onClick={() => nav.go('workout-summary', lastSession)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <RoutineBadge name={lastSession.routineName} dark={dark} size={48}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>{lastSession.routineName}</div>
            <div style={{ fontSize: 12, color: dark ? 'rgba(255,255,255,0.5)' : 'var(--element-medium)', marginTop: 2 }}>{fmtRelative(lastSession.startedAt)} · {lastSession.durationMin} min</div>
          </div>
          <Icon name="chevron-right" size={18} color={dark ? 'rgba(255,255,255,0.35)' : 'var(--element-low)'}/>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 14 }}>
          <Metric dark={dark} value={lastSession.sets.length} label="Series"/>
          <Metric dark={dark} value={`${(lastSession.totalVolume / 1000).toFixed(1)}t`} label="Volumen"/>
          <Metric dark={dark} value={`${lastSession.durationMin}'`} label="Duración"/>
        </div>
      </Card>

      {/* Cadence preview */}
      <SectionTitle dark={dark} title="Cadencia"/>
      <Card dark={dark} dense={dense} style={{ margin: '0 16px 14px' }}>
        <HeatStrip weeks={weeks} dark={dark}/>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: dark ? 'rgba(255,255,255,0.45)' : 'var(--element-low)' }}>
          <span>Hace 12 sem.</span>
          <span>Hoy</span>
        </div>
      </Card>

      <div style={{ height: 16 }}/>
    </div>
  );
}

function HomeEmpty({ theme, nav }) {
  const { dark } = theme;
  return (
    <div>
      <PageTitle dark={dark} title="¡Hola!" subtitle="Empieza configurando tus rutinas"/>
      <Note on={theme.commentary}>El estado vacío del Home: dos llamadas a la acción claras. La medida y el peso quedan visibles porque no requieren rutina previa.</Note>
      <div style={{ margin: '24px 16px', padding: 24, borderRadius: 24,
        background: dark ? 'linear-gradient(135deg, #1A1A1A, #0E0E0E)' : '#fff',
        border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid var(--border-subtle)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>💪</div>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>Aún no hay datos</div>
        <div style={{ fontSize: 14, color: dark ? 'rgba(255,255,255,0.55)' : 'var(--element-medium)', marginTop: 6 }}>Crea tu primera rutina o registra tu peso para empezar.</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20 }}>
          <Button full size="lg" dark={dark} icon="plus" onClick={() => nav.setTab('routines')}>Crear primera rutina</Button>
          <Button full variant="ghost" dark={dark} icon="scale" onClick={() => nav.go('record-weight')}>Registrar peso</Button>
        </div>
      </div>
    </div>
  );
}

function RingLegend({ color, label, value, dark }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0 }}>
      <div style={{ width: 8, height: 8, borderRadius: 999, background: color, flexShrink: 0 }}/>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: dark ? 'rgba(255,255,255,0.45)' : 'var(--element-low)' }}>{label}</div>
        <div style={{ fontSize: 12, fontWeight: 600, color: dark ? 'rgba(255,255,255,0.85)' : '#1F1F1F', whiteSpace: 'nowrap' }}>{value}</div>
      </div>
    </div>
  );
}

function QuickTile({ dark, icon, label, sublabel, onClick, primary, streak }) {
  return (
    <button onClick={onClick} style={{
      textAlign: 'left', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
      padding: 14, borderRadius: 18,
      background: primary ? 'var(--primary)' : (dark ? 'rgba(255,255,255,0.06)' : '#fff'),
      color: primary ? '#fff' : (dark ? '#fff' : '#1F1F1F'),
      border: primary ? 'none' : (dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid var(--border-subtle)'),
      display: 'flex', flexDirection: 'column', gap: 8, minHeight: 84, position: 'relative', overflow: 'hidden',
    }}>
      <Icon name={icon} size={20} color={streak ? 'var(--primary)' : 'currentColor'} weight={streak ? 2 : 1.6}/>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>{label}</div>
        <div style={{ fontSize: 11, opacity: primary ? 0.85 : 0.6, marginTop: 2 }}>{sublabel}</div>
      </div>
    </button>
  );
}

function SectionTitle({ title, action, onAction, dark }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '10px 20px 8px' }}>
      <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: dark ? 'rgba(255,255,255,0.55)' : 'var(--element-medium)' }}>{title}</div>
      {action && <button onClick={onAction} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: 13, fontWeight: 600, fontFamily: 'inherit' }}>{action}</button>}
    </div>
  );
}

function Metric({ dark, value, label }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-numeric)', fontSize: 22, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: dark ? 'rgba(255,255,255,0.5)' : 'var(--element-low)', marginTop: 3 }}>{label}</div>
    </div>
  );
}

function RoutineBadge({ name, dark, size = 56 }) {
  const initial = name.slice(0, 1).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: 16,
      background: 'color-mix(in oklab, var(--primary) 18%, transparent)',
      color: 'var(--primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.42, fontWeight: 800, letterSpacing: '-0.04em',
      flexShrink: 0,
    }}>{initial}</div>
  );
}

function HeatStrip({ weeks, dark }) {
  const cell = 14;
  return (
    <div style={{ display: 'flex', gap: 4, justifyContent: 'space-between' }}>
      {weeks.map((week, wi) => (
        <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
          {week.map((day, di) => {
            const intensity = day.intensity || 0;
            const future = day.future;
            const bg = future ? 'transparent'
              : intensity === 0 ? (dark ? 'rgba(255,255,255,0.06)' : '#F0F0F0')
              : `color-mix(in oklab, var(--primary) ${20 + intensity * 18}%, ${dark ? '#000' : '#fff'})`;
            return <div key={di} style={{ aspectRatio: '1 / 1', borderRadius: 3, background: bg, border: future ? `1px dashed ${dark ? 'rgba(255,255,255,0.1)' : '#E5E5E5'}` : 'none' }}/>;
          })}
        </div>
      ))}
    </div>
  );
}

Object.assign(window, {
  HomeScreen, RingLegend, QuickTile, SectionTitle, Metric, RoutineBadge, HeatStrip,
});
