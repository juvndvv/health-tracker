// App shell — theme, accent, density, navigation, tweaks wiring.
// Renders one iPhone with the active tab inside.

const ACCENT_PALETTES = {
  '#F95A5C': { primary: '#F95A5C', light: '#FFECEC', lighter: '#FFF5F5', dark: '#E94042', name: 'coral' },
  '#FA114F': { primary: '#FA114F', light: '#FFD8E1', lighter: '#FFEBF0', dark: '#D90033', name: 'ember' },
  '#10B981': { primary: '#10B981', light: '#CFF6E5', lighter: '#ECFDF0', dark: '#028E5C', name: 'emerald' },
  '#3B82F6': { primary: '#3B82F6', light: '#D8E6FF', lighter: '#EFF6FF', dark: '#1E66E0', name: 'cobalt' },
  '#7C67F7': { primary: '#7C67F7', light: '#E3DEFD', lighter: '#F4F2FF', dark: '#5E45E0', name: 'violet' },
};

const ACCENT_OPTIONS = ['#F95A5C', '#FA114F', '#10B981', '#3B82F6', '#7C67F7'];

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "dark": true,
  "accent": "#FA114F",
  "density": "comfortable",
  "populated": true,
  "commentary": false,
  "logPattern": "cards"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [tab, setTab] = React.useState('home');
  const [view, setView] = React.useState(null); // {kind, payload} for overlays/inner screens

  const dark = t.dark;
  const accent = ACCENT_PALETTES[t.accent] || ACCENT_PALETTES['#F95A5C'];
  const dense = t.density === 'compact';

  // Apply theme tokens to root frame
  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--primary', accent.primary);
    root.style.setProperty('--primary-light', accent.light);
    root.style.setProperty('--primary-lighter', accent.light);
    root.style.setProperty('--primary-lighter-ext', accent.lighter);
    root.style.setProperty('--primary-dark', accent.dark);
    root.style.setProperty('--app-bg', dark ? '#000' : '#F5F5F7');
    root.style.setProperty('--app-surface', dark ? '#161616' : '#FFFFFF');
    root.style.setProperty('--app-surface-2', dark ? '#1F1F1F' : '#FAFAFA');
    root.style.setProperty('--app-text', dark ? '#FFFFFF' : '#1F1F1F');
    root.style.setProperty('--app-text-2', dark ? 'rgba(255,255,255,0.6)' : '#666');
    root.style.setProperty('--app-text-3', dark ? 'rgba(255,255,255,0.4)' : '#8F8F8F');
    root.style.setProperty('--app-border', dark ? 'rgba(255,255,255,0.08)' : '#EBEBEB');
  }, [dark, t.accent]);

  const theme = { dark, dense, accent, commentary: t.commentary, logPattern: t.logPattern, populated: t.populated };
  const nav = { tab, setTab, view, setView, go: (kind, payload) => setView({ kind, payload }), back: () => setView(null) };

  // Inner screens overlay the tab content (push-like)
  let inner = null;
  if (view) {
    if (view.kind === 'workout')         inner = <WorkoutScreen sessionLike={view.payload} theme={theme} nav={nav}/>;
    if (view.kind === 'workout-summary') inner = <WorkoutSummary session={view.payload} theme={theme} nav={nav}/>;
    if (view.kind === 'record-weight')   inner = <RecordWeight theme={theme} nav={nav}/>;
    if (view.kind === 'record-measure')  inner = <RecordMeasurement theme={theme} nav={nav}/>;
    if (view.kind === 'routine-edit')    inner = <RoutineEditor routine={view.payload} theme={theme} nav={nav}/>;
    if (view.kind === 'exercise-detail') inner = <ExerciseDetail exerciseId={view.payload} theme={theme} nav={nav}/>;
  }

  let body;
  if (tab === 'home')      body = <HomeScreen theme={theme} nav={nav}/>;
  if (tab === 'train')     body = <TrainScreen theme={theme} nav={nav}/>;
  if (tab === 'routines')  body = <RoutinesScreen theme={theme} nav={nav}/>;
  if (tab === 'exercises') body = <ExercisesScreen theme={theme} nav={nav}/>;
  if (tab === 'progress')  body = <ProgressScreen theme={theme} nav={nav}/>;

  return (
    <div style={{
      width: '100vw', minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 32, boxSizing: 'border-box',
      background: dark ? '#0a0a0a' : '#EFEFF3',
      backgroundImage: dark
        ? 'radial-gradient(ellipse at top, rgba(40,40,40,0.6), transparent 60%)'
        : 'radial-gradient(ellipse at top, rgba(255,255,255,0.6), transparent 60%)',
      fontFamily: 'var(--font-sans)',
    }}>
      <IOSDevice width={402} height={874} dark={dark}>
        <div data-screen-label={`${tab}`} style={{
          width: '100%', height: '100%', position: 'relative',
          background: dark ? '#000' : '#F5F5F7',
          color: dark ? '#fff' : '#1F1F1F',
          overflow: 'hidden',
        }}>
          {/* Main tab content */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            opacity: inner ? 0 : 1, transform: inner ? 'scale(0.96)' : 'scale(1)',
            transition: 'opacity 240ms var(--ease-out), transform 240ms var(--ease-out)',
            pointerEvents: inner ? 'none' : 'auto',
          }}>
            <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 88, paddingTop: 56 }}>{body}</div>
            <TabBar tab={tab} setTab={setTab} dark={dark}/>
          </div>

          {/* Inner overlay (workout, modal-style screens) */}
          {inner && (
            <div style={{
              position: 'absolute', inset: 0,
              background: dark ? '#000' : '#F5F5F7',
              animation: 'sheetIn 280ms var(--ease-out)',
              overflowY: 'auto', WebkitOverflowScrolling: 'touch',
            }}>{inner}</div>
          )}
        </div>
      </IOSDevice>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Tab bar
// ─────────────────────────────────────────────────────────────
function TabBar({ tab, setTab, dark }) {
  const items = [
    { id: 'home',      label: 'Inicio',      icon: 'house' },
    { id: 'train',     label: 'Entrenar',    icon: 'play' },
    { id: 'routines',  label: 'Rutinas',     icon: 'list' },
    { id: 'exercises', label: 'Ejercicios',  icon: 'dumbbell' },
    { id: 'progress',  label: 'Progreso',    icon: 'chart' },
  ];
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 0,
      paddingBottom: 28, paddingTop: 8, paddingLeft: 8, paddingRight: 8,
      background: dark
        ? 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0) 100%)'
        : 'linear-gradient(to top, rgba(245,245,247,0.95) 0%, rgba(245,245,247,0.85) 60%, rgba(245,245,247,0) 100%)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      display: 'flex', justifyContent: 'space-around',
    }}>
      {items.map(it => {
        const active = tab === it.id;
        return (
          <button key={it.id} onClick={() => setTab(it.id)} style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            padding: '6px 4px', flex: 1,
            color: active ? 'var(--primary)' : (dark ? 'rgba(255,255,255,0.45)' : '#8F8F8F'),
            transition: 'color var(--dur) var(--ease-out)',
          }}>
            <Icon name={it.icon} size={22} weight={active ? 2 : 1.6}/>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.1 }}>{it.label}</div>
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Reusable: navigation header used by inner screens
// ─────────────────────────────────────────────────────────────
function ScreenHeader({ title, onBack, right, dark, large }) {
  return (
    <div style={{
      padding: '52px 16px 12px', display: 'flex', alignItems: 'center', gap: 8,
      borderBottom: large ? 'none' : `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'var(--border-subtle)'}`,
      background: dark ? '#000' : '#F5F5F7',
      position: 'sticky', top: 0, zIndex: 5,
    }}>
      {onBack && (
        <button onClick={onBack} style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 2,
          padding: '6px 4px', fontSize: 17, fontFamily: 'inherit', fontWeight: 500,
        }}>
          <Icon name="chevron-left" size={24}/>
        </button>
      )}
      <div style={{ flex: 1, fontSize: large ? 28 : 17, fontWeight: large ? 800 : 600, letterSpacing: large ? '-0.02em' : 0, color: dark ? '#fff' : '#1F1F1F' }}>{title}</div>
      {right}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Large page title (Apple-style "huge title")
// ─────────────────────────────────────────────────────────────
function PageTitle({ title, subtitle, action, dark }) {
  return (
    <div style={{ padding: '4px 20px 14px', display: 'flex', alignItems: 'flex-end', gap: 12 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.025em', color: dark ? '#fff' : '#1F1F1F', lineHeight: 1.1 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 14, color: dark ? 'rgba(255,255,255,0.55)' : 'var(--element-medium)', marginTop: 2 }}>{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}

Object.assign(window, { App, ScreenHeader, PageTitle, ACCENT_OPTIONS, TWEAK_DEFAULTS });
