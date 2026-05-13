// Routines, Exercises, Record entry modals.

function RoutinesScreen({ theme, nav }) {
  const { dark, commentary, populated } = theme;

  if (!populated) {
    return (
      <div>
        <PageTitle dark={dark} title="Rutinas" action={<HeaderAction icon="plus" dark={dark}/>}/>
        <Empty dark={dark} icon="list" title="Crea tu primera rutina" body="Una rutina es un conjunto de ejercicios con series, repeticiones y peso objetivo." cta="Nueva rutina"/>
      </div>
    );
  }

  return (
    <div>
      <PageTitle dark={dark} title="Rutinas" action={<HeaderAction icon="plus" dark={dark} onClick={() => nav.go('routine-edit', null)}/>}/>
      <Note on={commentary}>Las rutinas tienen un patrón consistente: badge + nombre + meta + chevron. Tocar abre el editor. Botón fijo arriba para "Nueva".</Note>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {ROUTINES.map(r => (
          <div key={r.id} onClick={() => nav.go('routine-edit', r)} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 18,
            background: dark ? 'rgba(255,255,255,0.05)' : '#fff',
            border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid var(--border-subtle)',
            cursor: 'pointer',
          }}>
            <RoutineBadge name={r.name} dark={dark} size={42}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>{r.name}</div>
              <div style={{ fontSize: 12, color: dark ? 'rgba(255,255,255,0.5)' : 'var(--element-medium)', marginTop: 2 }}>
                {r.items.length} ejercicios · {r.items.reduce((a, i) => a + i.sets, 0)} series
              </div>
            </div>
            <Icon name="chevron-right" size={18} color={dark ? 'rgba(255,255,255,0.35)' : 'var(--element-low)'}/>
          </div>
        ))}
      </div>

      <SectionTitle dark={dark} title="Archivadas"/>
      <div style={{ padding: '0 16px 16px' }}>
        <div style={{
          opacity: 0.55, padding: 14, borderRadius: 18,
          background: dark ? 'rgba(255,255,255,0.03)' : '#fff',
          border: dark ? '1px solid rgba(255,255,255,0.04)' : '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ width: 42, height: 42, borderRadius: 16, background: dark ? 'rgba(255,255,255,0.06)' : '#F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: dark ? 'rgba(255,255,255,0.4)' : 'var(--element-low)' }}><Icon name="archive" size={20}/></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Hipertrofia 6 sem.</div>
            <div style={{ fontSize: 11, color: dark ? 'rgba(255,255,255,0.4)' : 'var(--element-low)' }}>Archivada · ene 2026</div>
          </div>
          <button style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Restaurar</button>
        </div>
      </div>
    </div>
  );
}

function HeaderAction({ icon, dark, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: 36, height: 36, borderRadius: 999, border: 'none', cursor: 'pointer',
      background: 'var(--primary)', color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'inherit',
    }}><Icon name={icon} size={20} weight={2.2}/></button>
  );
}

function Empty({ icon, title, body, cta, dark, onCta }) {
  return (
    <div style={{ padding: 24, margin: 16, borderRadius: 24, textAlign: 'center',
      background: dark ? 'rgba(255,255,255,0.04)' : '#fff',
      border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid var(--border-subtle)',
    }}>
      <div style={{ display: 'inline-flex', width: 56, height: 56, borderRadius: 999, background: 'color-mix(in oklab, var(--primary) 14%, transparent)', color: 'var(--primary)', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={28}/>
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, marginTop: 12, letterSpacing: '-0.01em' }}>{title}</div>
      <div style={{ fontSize: 13, color: dark ? 'rgba(255,255,255,0.55)' : 'var(--element-medium)', marginTop: 6 }}>{body}</div>
      {cta && <div style={{ marginTop: 16 }}><Button onClick={onCta} icon="plus" dark={dark}>{cta}</Button></div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Routine editor — simple readable view
// ─────────────────────────────────────────────────────────────
function RoutineEditor({ routine, theme, nav }) {
  const { dark } = theme;
  const isNew = !routine;
  const r = routine || { name: '', items: [] };
  return (
    <div>
      <ScreenHeader dark={dark} title={isNew ? 'Nueva rutina' : r.name} onBack={() => nav.back()}
        right={<button style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => nav.back()}>Guardar</button>}/>
      <div style={{ padding: '12px 16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field dark={dark} label="Nombre">
          <input defaultValue={r.name} placeholder="Empuje, Tirón, Pierna..." style={{
            width: '100%', padding: '12px 14px', boxSizing: 'border-box',
            borderRadius: 12, border: dark ? '1px solid rgba(255,255,255,0.14)' : '1px solid var(--border-default)',
            background: dark ? 'rgba(255,255,255,0.04)' : '#fff', color: dark ? '#fff' : '#1F1F1F',
            fontSize: 15, fontFamily: 'inherit', outline: 'none',
          }}/>
        </Field>

        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: dark ? 'rgba(255,255,255,0.5)' : 'var(--element-low)', margin: '4px 4px 8px' }}>Ejercicios</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {r.items.map((item, i) => {
              const ex = EXERCISES.find(e => e.id === item.exerciseId);
              return (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '24px 1fr auto auto', alignItems: 'center', gap: 10,
                  padding: 12, borderRadius: 14,
                  background: dark ? 'rgba(255,255,255,0.04)' : '#fff',
                  border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid var(--border-subtle)',
                }}>
                  <Icon name="drag" size={18} color={dark ? 'rgba(255,255,255,0.35)' : 'var(--element-low)'}/>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{ex.name}</div>
                    <div style={{ fontSize: 11, color: dark ? 'rgba(255,255,255,0.5)' : 'var(--element-medium)', marginTop: 2 }}>{ex.muscle}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-numeric)', fontSize: 13, fontWeight: 600, color: dark ? 'rgba(255,255,255,0.85)' : '#1F1F1F' }}>
                    {item.sets}×{item.reps}{item.weight != null ? ` · ${item.weight}kg` : ''}
                  </div>
                  <Icon name="chevron-right" size={16} color={dark ? 'rgba(255,255,255,0.3)' : 'var(--element-low)'}/>
                </div>
              );
            })}
            <button style={{
              height: 44, borderRadius: 14, border: `1px dashed ${dark ? 'rgba(255,255,255,0.2)' : 'var(--border-default)'}`,
              background: 'transparent', color: 'var(--primary)', fontFamily: 'inherit',
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              <Icon name="plus" size={16}/> Añadir ejercicio
            </button>
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          <button style={{
            width: '100%', height: 44, borderRadius: 12, border: 'none', fontFamily: 'inherit',
            background: 'transparent', color: '#FF453A', fontSize: 15, fontWeight: 600, cursor: 'pointer',
          }}>Archivar rutina</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, dark }) {
  return (
    <label style={{ display: 'block' }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: dark ? 'rgba(255,255,255,0.5)' : 'var(--element-low)', margin: '0 4px 6px' }}>{label}</div>
      {children}
    </label>
  );
}

// ─────────────────────────────────────────────────────────────
// Exercises catalog
// ─────────────────────────────────────────────────────────────
function ExercisesScreen({ theme, nav }) {
  const { dark, commentary, populated } = theme;
  const [q, setQ] = React.useState('');

  if (!populated) {
    return (
      <div>
        <PageTitle dark={dark} title="Ejercicios" action={<HeaderAction icon="plus" dark={dark}/>}/>
        <Empty dark={dark} icon="dumbbell" title="Catálogo vacío" body="Añade los ejercicios que sueles hacer. Aparecerán al editar rutinas." cta="Nuevo ejercicio"/>
      </div>
    );
  }

  const filtered = EXERCISES.filter(e => e.name.toLowerCase().includes(q.toLowerCase()));
  const grouped = filtered.reduce((acc, e) => {
    acc[e.muscle] = acc[e.muscle] || [];
    acc[e.muscle].push(e);
    return acc;
  }, {});

  return (
    <div>
      <PageTitle dark={dark} title="Ejercicios" action={<HeaderAction icon="plus" dark={dark}/>}/>
      <Note on={commentary}>Búsqueda + agrupado por grupo muscular. Tocando un ejercicio se va al detalle con progresión.</Note>
      <div style={{ padding: '0 16px 8px' }}>
        <div style={{ position: 'relative' }}>
          <Icon name="search" size={16} color={dark ? 'rgba(255,255,255,0.45)' : 'var(--element-low)'}/>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar ejercicio" style={{
            width: '100%', padding: '11px 14px 11px 36px', boxSizing: 'border-box',
            borderRadius: 12, border: dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid var(--border-subtle)',
            background: dark ? 'rgba(255,255,255,0.04)' : '#fff', color: dark ? '#fff' : '#1F1F1F',
            fontSize: 14, fontFamily: 'inherit', outline: 'none',
          }}/>
          <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <Icon name="search" size={16} color={dark ? 'rgba(255,255,255,0.45)' : 'var(--element-low)'}/>
          </div>
        </div>
      </div>
      <div style={{ padding: '4px 16px 16px' }}>
        {Object.entries(grouped).map(([muscle, exs]) => (
          <div key={muscle} style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: dark ? 'rgba(255,255,255,0.5)' : 'var(--element-low)', padding: '0 4px 8px' }}>{muscle}</div>
            <div style={{
              borderRadius: 16, overflow: 'hidden',
              background: dark ? 'rgba(255,255,255,0.04)' : '#fff',
              border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid var(--border-subtle)',
            }}>
              {exs.map((e, i) => {
                const hist = exerciseHistory(e.id);
                const last = hist[hist.length - 1];
                return (
                  <div key={e.id} onClick={() => nav.go('exercise-detail', e.id)} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                    borderTop: i ? `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'var(--border-subtle)'}` : 'none',
                    cursor: 'pointer',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{e.name}</div>
                      {last && <div style={{ fontSize: 11, color: dark ? 'rgba(255,255,255,0.5)' : 'var(--element-medium)', marginTop: 2, fontFamily: 'var(--font-numeric)' }}>
                        Mejor: {Math.max(...hist.map(h => h.topSet.weightKg || 0))} kg
                      </div>}
                    </div>
                    {hist.length > 1 && <Sparkline values={hist.slice(-12).map(h => h.topSet.weightKg || 0)} width={64} height={22} color="var(--primary)" fill="color-mix(in oklab, var(--primary) 14%, transparent)"/>}
                    <Icon name="chevron-right" size={16} color={dark ? 'rgba(255,255,255,0.3)' : 'var(--element-low)'}/>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Exercise detail — opens from catalog or progress tab
// ─────────────────────────────────────────────────────────────
function ExerciseDetail({ exerciseId, theme, nav }) {
  const { dark } = theme;
  const ex = EXERCISES.find(e => e.id === exerciseId);
  const hist = exerciseHistory(exerciseId);
  const [mode, setMode] = React.useState('topset');

  const points = hist.map((h, i) => ({
    x: i,
    y: mode === 'topset' ? (h.topSet.weightKg || 0) : h.volume,
    raw: h,
  }));
  // PR indices: rolling max
  const prIdxs = [];
  let best = -Infinity;
  points.forEach((p, i) => { if (p.y > best) { prIdxs.push(i); best = p.y; } });

  const max = Math.max(...points.map(p => p.y));
  const lastVal = points[points.length - 1]?.y || 0;

  return (
    <div>
      <ScreenHeader dark={dark} title={ex.name} onBack={() => nav.back()}/>
      <div style={{ padding: '12px 16px 20px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: dark ? 'rgba(255,255,255,0.5)' : 'var(--element-low)' }}>{ex.muscle}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
          <div style={{ fontFamily: 'var(--font-numeric)', fontSize: 44, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1 }}>{mode === 'topset' ? lastVal : Math.round(lastVal)}</div>
          <div style={{ fontSize: 14, color: dark ? 'rgba(255,255,255,0.55)' : 'var(--element-medium)', fontWeight: 600 }}>{mode === 'topset' ? 'kg' : 'kg · vol'}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: 12 }}>
          <Icon name="trophy" size={14} color="var(--primary)"/>
          <span style={{ color: 'var(--primary)', fontWeight: 600 }}>PR · {Math.max(...hist.map(h => h.topSet.weightKg || 0))} kg</span>
          <span style={{ color: dark ? 'rgba(255,255,255,0.5)' : 'var(--element-low)' }}>· {hist.length} sesiones</span>
        </div>

        <div style={{ marginTop: 16 }}>
          <Segment dark={dark} value={mode} onChange={setMode} options={[
            { value: 'topset', label: 'Top set' },
            { value: 'volume', label: 'Volumen' },
          ]}/>
        </div>

        <div style={{ marginTop: 12, padding: '12px 6px', borderRadius: 18,
          background: dark ? 'rgba(255,255,255,0.03)' : '#fff',
          border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid var(--border-subtle)',
        }}>
          <LineChart width={336} height={180} points={points} color="var(--primary)" dark={dark} prIdxs={prIdxs}
            yFormat={(v) => mode === 'topset' ? `${v.toFixed(0)} kg` : `${(v/1000).toFixed(1)}t`}
            xFormat={(p) => {
              const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
              const d = new Date(p.raw.date);
              return `${d.getDate()} ${months[d.getMonth()]}`;
            }}
          />
        </div>

        <SectionTitle dark={dark} title="Historial"/>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[...hist].reverse().slice(0, 8).map((h, i) => {
            const isPR = prIdxs.includes(hist.indexOf(h));
            return (
              <div key={i} style={{
                padding: 10, borderRadius: 10,
                background: dark ? 'rgba(255,255,255,0.03)' : '#fff',
                border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid var(--border-subtle)',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{fmtRelative(new Date(h.date))}</div>
                  <div style={{ fontSize: 11, color: dark ? 'rgba(255,255,255,0.5)' : 'var(--element-medium)' }}>{h.sets} series · {Math.round(h.volume / 100) / 10} t</div>
                </div>
                <div style={{ fontFamily: 'var(--font-numeric)', fontSize: 16, fontWeight: 600 }}>{h.topSet.weightKg ?? '—'} <span style={{ fontSize: 11, color: dark ? 'rgba(255,255,255,0.5)' : 'var(--element-low)' }}>kg</span></div>
                {isPR && <Tag color="var(--primary)" dark={dark} bg="var(--primary-lighter-ext)">PR</Tag>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Record entry — body weight
// ─────────────────────────────────────────────────────────────
function RecordWeight({ theme, nav }) {
  const { dark } = theme;
  const last = WEIGHTS[WEIGHTS.length - 1];
  const [w, setW] = React.useState(last.kg);
  return (
    <RecordSheet dark={dark} title="Peso corporal" subtitle={fmtDayShort(TODAY)} onBack={() => nav.back()}
      onSave={() => nav.back()}>
      <NumericPad dark={dark} value={w} onChange={setW} suffix="kg" step={0.1}/>
      <div style={{ fontSize: 13, color: dark ? 'rgba(255,255,255,0.5)' : 'var(--element-medium)', marginTop: 12, textAlign: 'center' }}>
        Hace 7 días: {WEIGHTS[WEIGHTS.length - 8]?.kg.toFixed(1)} kg
      </div>
    </RecordSheet>
  );
}

// ─────────────────────────────────────────────────────────────
// Record entry — measurement
// ─────────────────────────────────────────────────────────────
function RecordMeasurement({ theme, nav }) {
  const { dark } = theme;
  const [typeId, setTypeId] = React.useState(MEASUREMENT_TYPES[0].id);
  const type = MEASUREMENT_TYPES.find(t => t.id === typeId);
  const last = [...MEASUREMENTS].filter(m => m.typeId === typeId).slice(-1)[0];
  const [v, setV] = React.useState(last.value);
  return (
    <RecordSheet dark={dark} title="Medida" subtitle={fmtDayShort(TODAY)} onBack={() => nav.back()}
      onSave={() => nav.back()}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 12 }}>
        {MEASUREMENT_TYPES.map(t => (
          <button key={t.id} onClick={() => { setTypeId(t.id); setV(MEASUREMENTS.filter(m => m.typeId === t.id).slice(-1)[0].value); }} style={{
            padding: '8px 14px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            background: typeId === t.id ? 'var(--primary)' : (dark ? 'rgba(255,255,255,0.08)' : '#F0F0F0'),
            color: typeId === t.id ? '#fff' : (dark ? '#fff' : '#1F1F1F'),
            fontSize: 13, fontWeight: 600,
          }}>{t.name}</button>
        ))}
      </div>
      <NumericPad dark={dark} value={v} onChange={setV} suffix={type.unit} step={0.1}/>
    </RecordSheet>
  );
}

function RecordSheet({ children, title, subtitle, onBack, onSave, dark }) {
  return (
    <div>
      <ScreenHeader dark={dark} title={title} onBack={onBack}
        right={<button onClick={onSave} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}>Guardar</button>}/>
      <div style={{ padding: '20px 20px 24px' }}>
        <div style={{ textAlign: 'center', fontSize: 13, color: dark ? 'rgba(255,255,255,0.5)' : 'var(--element-medium)', marginBottom: 8 }}>{subtitle}</div>
        {children}
      </div>
    </div>
  );
}

function NumericPad({ value, onChange, suffix, step, dark }) {
  const decimal = step < 1;
  const dec = () => onChange(Math.round((value - step) * 10) / 10);
  const inc = () => onChange(Math.round((value + step) * 10) / 10);
  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
        padding: '20px 0',
      }}>
        <button onClick={dec} style={{
          width: 52, height: 52, borderRadius: 999, border: 'none', cursor: 'pointer',
          background: dark ? 'rgba(255,255,255,0.08)' : 'var(--surface-muted)',
          color: dark ? '#fff' : '#1F1F1F', fontSize: 22, fontWeight: 600, fontFamily: 'inherit',
        }}>−</button>
        <div style={{ textAlign: 'center', minWidth: 140 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
            <div style={{ fontFamily: 'var(--font-numeric)', fontSize: 72, fontWeight: 600, letterSpacing: '-0.04em', lineHeight: 1 }}>{decimal ? value.toFixed(1) : value}</div>
            <div style={{ fontSize: 18, color: dark ? 'rgba(255,255,255,0.55)' : 'var(--element-medium)', fontWeight: 500 }}>{suffix}</div>
          </div>
        </div>
        <button onClick={inc} style={{
          width: 52, height: 52, borderRadius: 999, border: 'none', cursor: 'pointer',
          background: dark ? 'rgba(255,255,255,0.08)' : 'var(--surface-muted)',
          color: dark ? '#fff' : '#1F1F1F', fontSize: 22, fontWeight: 600, fontFamily: 'inherit',
        }}>+</button>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        {[-1, -0.5, 0.5, 1].map(d => (
          <button key={d} onClick={() => onChange(Math.round((value + d) * 10) / 10)} style={{
            padding: '6px 12px', borderRadius: 999, border: dark ? '1px solid rgba(255,255,255,0.1)' : '1px solid var(--border-subtle)',
            background: 'transparent', color: dark ? '#fff' : '#1F1F1F',
            fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            fontFamily: 'var(--font-numeric)',
          }}>{d > 0 ? '+' : ''}{d}</button>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, {
  RoutinesScreen, RoutineEditor, ExercisesScreen, ExerciseDetail,
  RecordWeight, RecordMeasurement, NumericPad, Empty, RecordSheet,
});
