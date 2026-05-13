// Progress — 4 sub-tabs: Body weight, Exercise progression, Calendar, Measurements

function ProgressScreen({ theme, nav }) {
  const { dark, commentary, populated } = theme;
  const [sub, setSub] = React.useState('weight');

  if (!populated) {
    return (
      <div>
        <PageTitle dark={dark} title="Progreso"/>
        <Empty dark={dark} icon="chart" title="Aún no hay datos" body="Registra peso o entrena para ver gráficos."/>
      </div>
    );
  }

  return (
    <div>
      <PageTitle dark={dark} title="Progreso"/>
      <Note on={commentary}>Cuatro vistas paralelas con selector de rango común. Cada gráfico tiene KPI en cabecera + chart + lista de detalle bajo, manteniendo consistencia visual.</Note>
      <div style={{ padding: '0 16px 8px' }}>
        <Segment dark={dark} value={sub} onChange={setSub} options={[
          { value: 'weight', label: 'Peso' },
          { value: 'exercises', label: 'Ejerc.' },
          { value: 'calendar', label: 'Cadencia' },
          { value: 'measures', label: 'Medidas' },
        ]}/>
      </div>
      <div style={{ padding: '8px 16px 24px' }}>
        {sub === 'weight' && <BodyWeightTab theme={theme}/>}
        {sub === 'exercises' && <ExercisesTab theme={theme} nav={nav}/>}
        {sub === 'calendar' && <CalendarTab theme={theme}/>}
        {sub === 'measures' && <MeasuresTab theme={theme}/>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
function BodyWeightTab({ theme }) {
  const { dark } = theme;
  const [range, setRange] = React.useState('3M');
  const days = { '1M': 30, '3M': 90, '6M': 168, '1A': 365, 'Todo': 365 }[range] || 168;
  const data = WEIGHTS.filter(w => {
    const d = parseYmd(w.date);
    return (TODAY - d) / (1000 * 60 * 60 * 24) <= days;
  });
  const points = data.map((w, i) => ({ x: i, y: w.kg, date: w.date }));
  const last = data[data.length - 1];
  const first = data[0];
  const diff = last.kg - first.kg;

  return (
    <div>
      <div style={{ padding: '12px 4px 6px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <div style={{ fontFamily: 'var(--font-numeric)', fontSize: 44, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1 }}>{last.kg.toFixed(1)}</div>
          <div style={{ fontSize: 14, color: dark ? 'rgba(255,255,255,0.55)' : 'var(--element-medium)', fontWeight: 600 }}>kg</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: 12 }}>
          <Icon name={diff < 0 ? 'arrow-down' : 'arrow-up'} size={12} color={diff < 0 ? '#10B981' : '#F59E0B'}/>
          <span style={{ color: diff < 0 ? '#10B981' : '#F59E0B', fontWeight: 700 }}>{diff > 0 ? '+' : ''}{diff.toFixed(1)} kg</span>
          <span style={{ color: dark ? 'rgba(255,255,255,0.5)' : 'var(--element-low)' }}>· {range === 'Todo' ? '12 meses' : range}</span>
        </div>
      </div>

      <div style={{ marginTop: 10, padding: '12px 6px', borderRadius: 18,
        background: dark ? 'rgba(255,255,255,0.03)' : '#fff',
        border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid var(--border-subtle)',
      }}>
        <LineChart width={336} height={180} points={points} color="var(--primary)" dark={dark}
          yFormat={(v) => `${v.toFixed(1)}`}
          xFormat={(p) => {
            const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
            const d = new Date(p.date);
            return `${d.getDate()} ${months[d.getMonth()]}`;
          }}
        />
      </div>

      <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
        {['1M','3M','6M','1A','Todo'].map(r => (
          <button key={r} onClick={() => setRange(r)} style={{
            flex: 1, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            background: range === r ? 'var(--primary)' : (dark ? 'rgba(255,255,255,0.06)' : '#F0F0F0'),
            color: range === r ? '#fff' : (dark ? '#fff' : '#1F1F1F'),
            fontSize: 12, fontWeight: 600,
          }}>{r}</button>
        ))}
      </div>

      <SectionTitle dark={dark} title="Últimos registros"/>
      <div style={{
        borderRadius: 16, overflow: 'hidden',
        background: dark ? 'rgba(255,255,255,0.03)' : '#fff',
        border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid var(--border-subtle)',
      }}>
        {[...data].reverse().slice(0, 6).map((w, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', borderTop: i ? `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'var(--border-subtle)'}` : 'none' }}>
            <div style={{ fontSize: 13 }}>{fmtDayShort(parseYmd(w.date))}</div>
            <div style={{ fontFamily: 'var(--font-numeric)', fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap' }}>{w.kg.toFixed(1)} <span style={{ fontSize: 11, color: dark ? 'rgba(255,255,255,0.5)' : 'var(--element-low)' }}>kg</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
function ExercisesTab({ theme, nav }) {
  const { dark } = theme;
  const [exId, setExId] = React.useState(1);
  const ex = EXERCISES.find(e => e.id === exId);
  const hist = exerciseHistory(exId);

  const points = hist.map((h, i) => ({ x: i, y: h.topSet.weightKg || 0, raw: h }));
  const prIdxs = [];
  let best = -Infinity;
  points.forEach((p, i) => { if (p.y > best) { prIdxs.push(i); best = p.y; } });

  const max = Math.max(...points.map(p => p.y));
  const lastVal = points[points.length - 1]?.y || 0;

  return (
    <div>
      {/* Exercise picker */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '8px 0 6px', margin: '0 -16px', paddingLeft: 16, paddingRight: 16 }}>
        {EXERCISES.slice(0, 8).map(e => (
          <button key={e.id} onClick={() => setExId(e.id)} style={{
            padding: '7px 12px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            background: exId === e.id ? 'var(--primary)' : (dark ? 'rgba(255,255,255,0.06)' : '#F0F0F0'),
            color: exId === e.id ? '#fff' : (dark ? '#fff' : '#1F1F1F'),
            fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
          }}>{e.name}</button>
        ))}
      </div>

      <div style={{ padding: '10px 4px 6px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <div style={{ fontFamily: 'var(--font-numeric)', fontSize: 44, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1 }}>{lastVal}</div>
          <div style={{ fontSize: 14, color: dark ? 'rgba(255,255,255,0.55)' : 'var(--element-medium)', fontWeight: 600 }}>kg actual</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, fontSize: 12, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--primary)', fontWeight: 700 }}>
            <Icon name="trophy" size={14}/> PR · {max} kg
          </span>
          <span style={{ color: dark ? 'rgba(255,255,255,0.5)' : 'var(--element-low)' }}>· {hist.length} sesiones</span>
        </div>
      </div>

      <div style={{ marginTop: 4, padding: '12px 6px', borderRadius: 18,
        background: dark ? 'rgba(255,255,255,0.03)' : '#fff',
        border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid var(--border-subtle)',
      }}>
        <LineChart width={336} height={170} points={points} color="var(--primary)" dark={dark} prIdxs={prIdxs}
          yFormat={(v) => `${v.toFixed(0)} kg`}
          xFormat={(p) => {
            const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
            const d = new Date(p.raw.date);
            return `${d.getDate()} ${months[d.getMonth()]}`;
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, padding: '4px 10px', fontSize: 11, color: dark ? 'rgba(255,255,255,0.5)' : 'var(--element-medium)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: '#fff', border: '2px solid var(--primary)', display: 'inline-block' }}/> PR
          </span>
        </div>
      </div>

      <SectionTitle dark={dark} title="Últimas sesiones"/>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[...hist].reverse().slice(0, 5).map((h, i) => (
          <div key={i} style={{
            padding: 12, borderRadius: 14,
            background: dark ? 'rgba(255,255,255,0.03)' : '#fff',
            border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{fmtDayShort(new Date(h.date))}</div>
              <div style={{ fontSize: 11, color: dark ? 'rgba(255,255,255,0.5)' : 'var(--element-medium)', marginTop: 2 }}>{h.sets} series · vol {(h.volume/1000).toFixed(1)} t</div>
            </div>
            <div style={{ fontFamily: 'var(--font-numeric)', fontSize: 16, fontWeight: 600 }}>{h.topSet.weightKg ?? '—'}<span style={{ fontSize: 11, color: dark ? 'rgba(255,255,255,0.5)' : 'var(--element-low)', marginLeft: 3 }}>kg</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
function CalendarTab({ theme }) {
  const { dark } = theme;
  const weeks = heatmapWeeks();
  const totalSessions = SESSIONS.length;
  const totalMinutes = SESSIONS.reduce((a, s) => a + s.durationMin, 0);
  const avgPerWeek = (totalSessions / 26).toFixed(1);
  const [selected, setSelected] = React.useState(null);
  const muscleDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  return (
    <div>
      <div style={{ padding: '12px 4px 6px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <BigStat dark={dark} value={totalSessions} label="Sesiones"/>
        <BigStat dark={dark} value={avgPerWeek} label="Por semana"/>
        <BigStat dark={dark} value={`${Math.round(totalMinutes / 60)}h`} label="Total"/>
      </div>

      <div style={{ marginTop: 12, padding: 14, borderRadius: 18,
        background: dark ? 'rgba(255,255,255,0.03)' : '#fff',
        border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, paddingTop: 0 }}>
            {muscleDays.map((d, i) => (
              <div key={i} style={{ height: 12, fontSize: 9, color: dark ? 'rgba(255,255,255,0.4)' : 'var(--element-low)', lineHeight: '12px', textAlign: 'right', minWidth: 10 }}>{i % 2 === 1 ? d : ''}</div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 3, flex: 1, overflowX: 'auto' }}>
            {weeks.map((week, wi) => (
              <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minWidth: 0 }}>
                {week.map((day, di) => {
                  const future = day.future;
                  const intensity = day.intensity || 0;
                  const bg = future ? 'transparent'
                    : intensity === 0 ? (dark ? 'rgba(255,255,255,0.06)' : '#F0F0F0')
                    : `color-mix(in oklab, var(--primary) ${22 + intensity * 18}%, ${dark ? '#000' : '#fff'})`;
                  const isSel = selected && day.date && ymd(day.date) === ymd(selected.date);
                  return (
                    <button key={di} onClick={() => !future && day.sessions?.length && setSelected(day)} style={{
                      height: 12, borderRadius: 3, background: bg, border: isSel ? '1.5px solid var(--primary)' : (future ? `1px dashed ${dark ? 'rgba(255,255,255,0.08)' : '#E5E5E5'}` : 'none'),
                      cursor: day.sessions?.length ? 'pointer' : 'default', padding: 0,
                    }}/>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6, marginTop: 10, fontSize: 10, color: dark ? 'rgba(255,255,255,0.5)' : 'var(--element-medium)' }}>
          <span>Menos</span>
          {[1,2,3,4].map(i => (
            <span key={i} style={{ width: 10, height: 10, borderRadius: 2, background: `color-mix(in oklab, var(--primary) ${22 + i * 18}%, ${dark ? '#000' : '#fff'})` }}/>
          ))}
          <span>Más</span>
        </div>
      </div>

      {selected ? (
        <div style={{ marginTop: 12, padding: 14, borderRadius: 16,
          background: 'color-mix(in oklab, var(--primary) 10%, transparent)',
          border: `1px solid color-mix(in oklab, var(--primary) 30%, transparent)`,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{fmtDayShort(selected.date)}</div>
          {(selected.sessions || []).map((s, i) => (
            <div key={i} style={{ marginTop: 8, fontSize: 12, color: dark ? 'rgba(255,255,255,0.85)' : '#1F1F1F' }}>
              <span style={{ fontWeight: 600 }}>{s.routineName}</span>
              <span style={{ color: dark ? 'rgba(255,255,255,0.55)' : 'var(--element-medium)' }}> · {s.sets.length} series · {s.durationMin} min</span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ marginTop: 12, padding: '11px 14px', borderRadius: 12, fontSize: 11, color: dark ? 'rgba(255,255,255,0.55)' : 'var(--element-low)', textAlign: 'center' }}>
          Toca un día para ver detalles
        </div>
      )}

      <SectionTitle dark={dark} title="Por grupo muscular (12 sem)"/>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {muscleVolumeStats().map((m, i) => (
          <div key={i} style={{
            padding: '10px 14px', borderRadius: 12,
            background: dark ? 'rgba(255,255,255,0.03)' : '#fff',
            border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <div style={{ width: 90, fontSize: 12, fontWeight: 600 }}>{m.name}</div>
            <div style={{ flex: 1, height: 6, borderRadius: 999, background: dark ? 'rgba(255,255,255,0.06)' : '#F0F0F0', overflow: 'hidden' }}>
              <div style={{ width: `${m.pct}%`, height: '100%', background: 'var(--primary)' }}/>
            </div>
            <div style={{ width: 56, textAlign: 'right', fontSize: 11, fontFamily: 'var(--font-numeric)', color: dark ? 'rgba(255,255,255,0.7)' : 'var(--element-medium)' }}>{m.sessions} ses.</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function muscleVolumeStats() {
  const recent = SESSIONS.filter(s => (TODAY - s.startedAt) / (1000 * 60 * 60 * 24) < 84);
  const tally = {};
  recent.forEach(s => {
    const muscles = new Set();
    s.sets.forEach(st => {
      const ex = EXERCISES.find(e => e.id === st.exerciseId);
      muscles.add(ex.muscle);
    });
    muscles.forEach(m => { tally[m] = (tally[m] || 0) + 1; });
  });
  const max = Math.max(...Object.values(tally), 1);
  return Object.entries(tally).map(([name, sessions]) => ({ name, sessions, pct: (sessions / max) * 100 }))
    .sort((a, b) => b.sessions - a.sessions);
}

// ─────────────────────────────────────────────────────────────
function MeasuresTab({ theme }) {
  const { dark } = theme;
  const [typeId, setTypeId] = React.useState(1);
  const type = MEASUREMENT_TYPES.find(t => t.id === typeId);
  const data = MEASUREMENTS.filter(m => m.typeId === typeId);
  const points = data.map((m, i) => ({ x: i, y: m.value, date: m.date }));
  const last = data[data.length - 1];
  const first = data[0];
  const diff = last.value - first.value;

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', padding: '8px 0 6px', margin: '0 -16px', paddingLeft: 16, paddingRight: 16 }}>
        {MEASUREMENT_TYPES.map(t => (
          <button key={t.id} onClick={() => setTypeId(t.id)} style={{
            padding: '7px 12px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            background: typeId === t.id ? 'var(--primary)' : (dark ? 'rgba(255,255,255,0.06)' : '#F0F0F0'),
            color: typeId === t.id ? '#fff' : (dark ? '#fff' : '#1F1F1F'),
            fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
          }}>{t.name}</button>
        ))}
      </div>

      <div style={{ padding: '10px 4px 6px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <div style={{ fontFamily: 'var(--font-numeric)', fontSize: 44, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1 }}>{last.value.toFixed(1)}</div>
          <div style={{ fontSize: 14, color: dark ? 'rgba(255,255,255,0.55)' : 'var(--element-medium)', fontWeight: 600 }}>{type.unit}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: 12 }}>
          <Icon name={diff < 0 ? 'arrow-down' : 'arrow-up'} size={12} color={diff < 0 ? '#10B981' : '#F59E0B'}/>
          <span style={{ color: diff < 0 ? '#10B981' : '#F59E0B', fontWeight: 700 }}>{diff > 0 ? '+' : ''}{diff.toFixed(1)} {type.unit}</span>
          <span style={{ color: dark ? 'rgba(255,255,255,0.5)' : 'var(--element-low)' }}>· 6 meses</span>
        </div>
      </div>

      <div style={{ marginTop: 4, padding: '12px 6px', borderRadius: 18,
        background: dark ? 'rgba(255,255,255,0.03)' : '#fff',
        border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid var(--border-subtle)',
      }}>
        <LineChart width={336} height={170} points={points} color="var(--primary)" dark={dark}
          yFormat={(v) => v.toFixed(1)}
          xFormat={(p) => {
            const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
            const d = new Date(p.date);
            return `${d.getDate()} ${months[d.getMonth()]}`;
          }}
        />
      </div>

      <SectionTitle dark={dark} title="Historial"/>
      <div style={{
        borderRadius: 16, overflow: 'hidden',
        background: dark ? 'rgba(255,255,255,0.03)' : '#fff',
        border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid var(--border-subtle)',
      }}>
        {[...data].reverse().slice(0, 6).map((m, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', borderTop: i ? `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'var(--border-subtle)'}` : 'none' }}>
            <div style={{ fontSize: 13 }}>{fmtDayShort(parseYmd(m.date))}</div>
            <div style={{ fontFamily: 'var(--font-numeric)', fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap' }}>{m.value.toFixed(1)} <span style={{ fontSize: 11, color: dark ? 'rgba(255,255,255,0.5)' : 'var(--element-low)' }}>{type.unit}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BigStat({ value, label, dark }) {
  return (
    <div style={{
      padding: 12, borderRadius: 14, textAlign: 'left',
      background: dark ? 'rgba(255,255,255,0.04)' : '#fff',
      border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid var(--border-subtle)',
    }}>
      <div style={{ fontFamily: 'var(--font-numeric)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, color: dark ? 'rgba(255,255,255,0.5)' : 'var(--element-low)', marginTop: 4, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
}

Object.assign(window, {
  ProgressScreen, BodyWeightTab, ExercisesTab, CalendarTab, MeasuresTab, BigStat,
});
