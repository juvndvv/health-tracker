// Train screen: pick a routine. WorkoutScreen: in-progress logging.
// Three log patterns supported by tweak: 'cards' (default), 'list', 'focus'.

function TrainScreen({ theme, nav }) {
  const { dark, dense, commentary, populated } = theme;

  if (!populated) {
    return (
      <div>
        <PageTitle dark={dark} title="Entrenar"/>
        <Note on={commentary}>Sin rutinas creadas el Train redirige a Rutinas con un CTA único.</Note>
        <div style={{ margin: '24px 16px', padding: 28, textAlign: 'center', borderRadius: 22, background: dark ? 'rgba(255,255,255,0.04)' : '#fff', border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid var(--border-subtle)' }}>
          <Icon name="list" size={32} color={dark ? 'rgba(255,255,255,0.4)' : 'var(--element-low)'}/>
          <div style={{ fontSize: 17, fontWeight: 700, marginTop: 10 }}>No tienes rutinas</div>
          <div style={{ fontSize: 13, color: dark ? 'rgba(255,255,255,0.55)' : 'var(--element-medium)', marginTop: 4 }}>Crea una rutina para empezar a entrenar.</div>
          <div style={{ marginTop: 18 }}>
            <Button size="lg" icon="plus" onClick={() => nav.setTab('routines')} dark={dark}>Crear rutina</Button>
          </div>
        </div>
      </div>
    );
  }

  // Last session per routine
  const lastByRoutine = {};
  ROUTINES.forEach(r => {
    lastByRoutine[r.id] = SESSIONS.find(s => s.routineId === r.id);
  });

  return (
    <div>
      <PageTitle dark={dark} title="Entrenar" subtitle="Elige una rutina para empezar"/>
      <Note on={commentary}>La lista prioriza la rutina sugerida según rotación + última fecha. Una sola acción primaria por tarjeta: "Empezar".</Note>

      {/* Suggested next */}
      <div style={{ padding: '0 16px 12px' }}>
        <SuggestedRoutine routine={ROUTINES[1]} last={lastByRoutine[2]} theme={theme} nav={nav}/>
      </div>

      <SectionTitle dark={dark} title="Todas las rutinas" action="Editar" onAction={() => nav.setTab('routines')}/>
      <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {ROUTINES.map(r => (
          <RoutineRow key={r.id} routine={r} last={lastByRoutine[r.id]} theme={theme} onStart={() => nav.go('workout', { routine: r })}/>
        ))}
      </div>
    </div>
  );
}

function SuggestedRoutine({ routine, last, theme, nav }) {
  const { dark } = theme;
  return (
    <div style={{
      position: 'relative', borderRadius: 24, overflow: 'hidden',
      background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
      color: '#fff', padding: 20,
    }}>
      <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: 999, background: 'rgba(255,255,255,0.08)' }}/>
      <div style={{ position: 'absolute', bottom: -50, left: -30, width: 120, height: 120, borderRadius: 999, background: 'rgba(255,255,255,0.05)' }}/>
      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.85 }}>Recomendado hoy</div>
        <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', marginTop: 6, lineHeight: 1 }}>{routine.name}</div>
        <div style={{ fontSize: 13, opacity: 0.85, marginTop: 6 }}>
          {routine.items.length} ejercicios · {last ? `Última vez ${fmtRelative(last.startedAt)}` : 'Sin historial'}
        </div>
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => nav.go('workout', { routine })} style={{
            background: '#fff', color: 'var(--primary)', border: 'none', borderRadius: 14,
            padding: '12px 20px', fontWeight: 700, fontSize: 15, fontFamily: 'inherit', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            <Icon name="play" size={18}/> Empezar
          </button>
          <div style={{ fontSize: 12, opacity: 0.8 }}>
            {last ? `${(last.totalVolume/1000).toFixed(1)}t · ${last.durationMin} min` : '—'}
          </div>
        </div>
      </div>
    </div>
  );
}

function RoutineRow({ routine, last, theme, onStart }) {
  const { dark, dense } = theme;
  return (
    <div onClick={onStart} style={{
      borderRadius: 18, padding: dense ? 12 : 14,
      background: dark ? 'rgba(255,255,255,0.05)' : '#fff',
      border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid var(--border-subtle)',
      display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
    }}>
      <RoutineBadge name={routine.name} dark={dark} size={44}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>{routine.name}</div>
        <div style={{ fontSize: 12, color: dark ? 'rgba(255,255,255,0.5)' : 'var(--element-medium)', marginTop: 2 }}>
          {routine.items.length} ejercicios · {last ? fmtRelative(last.startedAt) : 'nueva'}
        </div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onStart(); }} style={{
        background: 'transparent', border: dark ? '1px solid rgba(255,255,255,0.18)' : '1px solid var(--border-default)',
        color: dark ? '#fff' : '#1F1F1F', borderRadius: 999, width: 36, height: 36,
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
      }}>
        <Icon name="play" size={16}/>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Workout in progress — the centerpiece
// ─────────────────────────────────────────────────────────────
function WorkoutScreen({ sessionLike, theme, nav }) {
  const { dark, commentary, logPattern } = theme;
  const routine = sessionLike.routine;

  // Initialize logged sets state, one row per template-prescribed set.
  const initialLog = React.useMemo(() => {
    const out = [];
    routine.items.forEach(item => {
      const ex = EXERCISES.find(e => e.id === item.exerciseId);
      const last = lastSessionForExercise(ex.id);
      const lastSets = last ? last.sets.filter(s => s.exerciseId === ex.id) : [];
      const lastTopWeight = lastSets[0]?.weightKg ?? item.weight;
      const lastTopReps   = lastSets[0]?.reps ?? item.reps;
      for (let i = 0; i < item.sets; i++) {
        out.push({
          exerciseId: ex.id,
          exerciseName: ex.name,
          muscle: ex.muscle,
          targetReps: item.reps,
          targetWeight: item.weight,
          weight: lastTopWeight,
          reps: lastTopReps,
          completed: false,
          last: { sets: lastSets, when: last ? fmtRelative(last.startedAt) : null },
        });
      }
    });
    return out;
  }, [routine]);

  const [log, setLog] = React.useState(initialLog);
  const [activeIdx, setActiveIdx] = React.useState(0);
  const [showFinish, setShowFinish] = React.useState(false);
  const [showAbandon, setShowAbandon] = React.useState(false);

  // Group sets by exercise into "blocks"
  const blocks = React.useMemo(() => {
    const out = [];
    log.forEach((s, i) => {
      const cur = out[out.length - 1];
      if (!cur || cur.exerciseId !== s.exerciseId) out.push({ exerciseId: s.exerciseId, exerciseName: s.exerciseName, muscle: s.muscle, indices: [i], last: s.last, targetWeight: s.targetWeight, targetReps: s.targetReps });
      else cur.indices.push(i);
    });
    return out;
  }, [log]);

  const completedSets = log.filter(s => s.completed).length;
  const totalSets = log.length;
  const totalVolume = log.filter(s => s.completed).reduce((a, s) => a + (s.weight || 0) * s.reps, 0);
  const progress = completedSets / totalSets;

  const [elapsed, setElapsed] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);
  const elapsedMin = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const elapsedSec = String(elapsed % 60).padStart(2, '0');

  const updateSet = (idx, patch) => {
    setLog(prev => prev.map((s, i) => i === idx ? { ...s, ...patch } : s));
  };
  const logSet = (idx) => {
    updateSet(idx, { completed: true });
    // advance: next incomplete set; prefill with same values for adjacent same-exercise
    const next = log.findIndex((s, i) => i > idx && !s.completed);
    if (next !== -1) {
      // prefill from prior (this idx)
      setLog(prev => {
        const cur = prev[idx];
        return prev.map((s, i) => {
          if (i === next && s.exerciseId === cur.exerciseId && !s.completed) {
            return { ...s, weight: cur.weight, reps: cur.reps };
          }
          return s;
        });
      });
      setActiveIdx(next);
    }
  };
  const skipBlock = (blockIdx) => {
    const indices = blocks[blockIdx].indices;
    setLog(prev => prev.map((s, i) => indices.includes(i) && !s.completed ? { ...s, completed: false, skipped: true } : s));
    // advance to first incomplete after this block
    const lastIdx = indices[indices.length - 1];
    const next = log.findIndex((s, i) => i > lastIdx && !s.completed);
    if (next !== -1) setActiveIdx(next);
  };
  const addSet = (blockIdx) => {
    const blk = blocks[blockIdx];
    const last = log[blk.indices[blk.indices.length - 1]];
    const insertAt = blk.indices[blk.indices.length - 1] + 1;
    const newSet = { ...last, completed: false };
    setLog(prev => [...prev.slice(0, insertAt), newSet, ...prev.slice(insertAt)]);
  };

  const finishWorkout = () => {
    const synthSession = {
      id: 'new',
      routineId: routine.id,
      routineName: routine.name,
      startedAt: new Date(TODAY.getTime() - elapsed * 1000),
      finishedAt: new Date(TODAY),
      durationMin: Math.round(elapsed / 60) || 1,
      sets: log.filter(s => s.completed),
      totalVolume,
    };
    nav.setView({ kind: 'workout-summary', payload: synthSession });
  };

  return (
    <div style={{ paddingBottom: 120 }}>
      {/* Header with progress + controls */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 5,
        background: dark ? 'rgba(0,0,0,0.92)' : 'rgba(245,245,247,0.92)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        paddingTop: 52, paddingBottom: 12, paddingLeft: 12, paddingRight: 12,
        borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'var(--border-subtle)'}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => setShowAbandon(true)} style={{
            background: 'transparent', border: 'none', color: dark ? 'rgba(255,255,255,0.7)' : 'var(--element-medium)',
            fontFamily: 'inherit', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', gap: 2, fontSize: 14,
          }}>
            <Icon name="x" size={20}/>
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: dark ? 'rgba(255,255,255,0.5)' : 'var(--element-low)' }}>En curso</div>
            <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em' }}>{routine.name}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-numeric)', fontSize: 20, fontWeight: 600, letterSpacing: '-0.03em' }}>{elapsedMin}:{elapsedSec}</div>
            <div style={{ fontSize: 10, color: dark ? 'rgba(255,255,255,0.4)' : 'var(--element-low)' }}>tiempo</div>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, height: 5, background: dark ? 'rgba(255,255,255,0.08)' : '#E5E5E5', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ width: `${progress * 100}%`, height: '100%', background: 'var(--primary)', transition: 'width 320ms var(--ease-out)' }}/>
          </div>
          <div style={{ fontSize: 12, fontFamily: 'var(--font-numeric)', fontWeight: 600, minWidth: 36, textAlign: 'right' }}>{completedSets}/{totalSets}</div>
        </div>
      </div>

      <Note on={commentary}>Cada set es una tarjeta. Toque grande "Registrar serie" (44pt mín). Auto-rellena peso/reps desde la sesión anterior; el usuario puede ajustar con ±. Patrón cambiable via Tweaks (cards · list · focus).</Note>

      {/* Blocks */}
      <div style={{ padding: '14px 14px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
        {blocks.map((blk, bi) => (
          <ExerciseBlock
            key={bi}
            block={blk} log={log} blockIdx={bi}
            activeIdx={activeIdx} setActiveIdx={setActiveIdx}
            updateSet={updateSet} logSet={logSet}
            skipBlock={() => skipBlock(bi)} addSet={() => addSet(bi)}
            theme={theme}
          />
        ))}

        <button onClick={() => setShowFinish(true)} style={{
          marginTop: 8, height: 56, borderRadius: 16, border: 'none',
          background: completedSets > 0 ? 'var(--primary)' : (dark ? 'rgba(255,255,255,0.06)' : '#F0F0F0'),
          color: completedSets > 0 ? '#fff' : (dark ? 'rgba(255,255,255,0.4)' : 'var(--element-low)'),
          fontSize: 17, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <Icon name="check" size={20}/> Terminar entrenamiento
        </button>
      </div>

      {showFinish && <Confirm
        title="¿Terminar?"
        body={`${completedSets} series · ${(totalVolume/1000).toFixed(1)}t · ${elapsedMin}:${elapsedSec}`}
        confirmLabel="Terminar"
        onConfirm={finishWorkout}
        onCancel={() => setShowFinish(false)}
        dark={dark}
      />}
      {showAbandon && <Confirm
        title="¿Abandonar entrenamiento?"
        body="Se descartarán las series registradas."
        confirmLabel="Abandonar"
        destructive
        onConfirm={() => nav.back()}
        onCancel={() => setShowAbandon(false)}
        dark={dark}
      />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// One exercise block with set rows. Layout depends on logPattern.
// ─────────────────────────────────────────────────────────────
function ExerciseBlock({ block, log, blockIdx, activeIdx, setActiveIdx, updateSet, logSet, skipBlock, addSet, theme }) {
  const { dark, logPattern } = theme;
  const setIndices = block.indices;
  const blockSets = setIndices.map(i => ({ ...log[i], _idx: i }));
  const blockCompleted = blockSets.every(s => s.completed);

  return (
    <div style={{
      borderRadius: 20, overflow: 'hidden',
      background: dark ? 'rgba(255,255,255,0.04)' : '#fff',
      border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid var(--border-subtle)',
    }}>
      {/* Block header */}
      <div style={{ padding: '14px 16px 10px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: dark ? 'rgba(255,255,255,0.5)' : 'var(--element-low)' }}>{block.muscle}</div>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em', marginTop: 2 }}>{block.exerciseName}</div>
          <div style={{ fontSize: 12, color: dark ? 'rgba(255,255,255,0.5)' : 'var(--element-medium)', marginTop: 4 }}>
            Objetivo: {setIndices.length} × {block.targetReps}{block.targetWeight != null ? ` @ ${block.targetWeight} kg` : ''}
          </div>
        </div>
        {blockCompleted ? <div style={{
            width: 28, height: 28, borderRadius: 999, background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
          }}><Icon name="check" size={18} weight={2.4}/></div>
          : <button onClick={skipBlock} style={{ background: 'transparent', border: 'none', color: dark ? 'rgba(255,255,255,0.55)' : 'var(--element-medium)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Saltar</button>
        }
      </div>

      {/* Last-time recall */}
      {block.last.when && (
        <div style={{
          margin: '0 16px 12px', padding: '10px 12px', borderRadius: 12,
          background: dark ? 'rgba(255,255,255,0.04)' : 'var(--surface-muted)',
          fontSize: 12, color: dark ? 'rgba(255,255,255,0.7)' : 'var(--element-medium)',
          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
        }}>
          <Icon name="clock" size={14}/>
          <span style={{ fontWeight: 600 }}>Última vez · {block.last.when}</span>
          <span>· {block.last.sets.slice(0, 4).map(s => `${s.weightKg ?? '—'}×${s.reps}`).join(' · ')}</span>
        </div>
      )}

      {/* Set rows */}
      <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {logPattern === 'cards' && blockSets.map((s, si) => (
          <SetCard key={s._idx} s={s} si={si} active={activeIdx === s._idx} onActivate={() => setActiveIdx(s._idx)} onUpdate={(p) => updateSet(s._idx, p)} onLog={() => logSet(s._idx)} dark={dark}/>
        ))}
        {logPattern === 'list' && blockSets.map((s, si) => (
          <SetListRow key={s._idx} s={s} si={si} active={activeIdx === s._idx} onActivate={() => setActiveIdx(s._idx)} onUpdate={(p) => updateSet(s._idx, p)} onLog={() => logSet(s._idx)} dark={dark}/>
        ))}
        {logPattern === 'focus' && (
          <SetFocus block={block} blockSets={blockSets} activeIdx={activeIdx} setActiveIdx={setActiveIdx} updateSet={updateSet} logSet={logSet} dark={dark}/>
        )}

        <button onClick={addSet} style={{
          marginTop: 2, height: 36, borderRadius: 10, fontFamily: 'inherit',
          border: `1px dashed ${dark ? 'rgba(255,255,255,0.18)' : 'var(--border-default)'}`,
          background: 'transparent', color: dark ? 'rgba(255,255,255,0.65)' : 'var(--element-medium)',
          fontSize: 12, fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <Icon name="plus" size={14}/> Añadir serie
        </button>
      </div>
    </div>
  );
}

// Pattern 1 — Cards: large tap target with [weight] [reps] [Done] in a row.
function SetCard({ s, si, active, onActivate, onUpdate, onLog, dark }) {
  const isDone = s.completed;
  return (
    <div onClick={onActivate} style={{
      position: 'relative', borderRadius: 14, padding: 10,
      background: isDone ? 'color-mix(in oklab, var(--primary) 12%, transparent)'
                : (active ? (dark ? 'rgba(255,255,255,0.08)' : 'var(--surface-muted)') : 'transparent'),
      border: `1px solid ${isDone ? 'color-mix(in oklab, var(--primary) 40%, transparent)' : (active ? (dark ? 'rgba(255,255,255,0.16)' : 'var(--border-default)') : (dark ? 'rgba(255,255,255,0.08)' : 'var(--border-subtle)'))}`,
      display: 'grid', gridTemplateColumns: '36px 1fr 1fr 64px', alignItems: 'center', gap: 8,
      cursor: 'pointer',
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 999,
        background: isDone ? 'var(--primary)' : (dark ? 'rgba(255,255,255,0.08)' : 'var(--surface-muted)'),
        color: isDone ? '#fff' : (dark ? 'rgba(255,255,255,0.7)' : 'var(--element-medium)'),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-numeric)',
      }}>{isDone ? <Icon name="check" size={16} weight={2.4}/> : si + 1}</div>
      <Stepper label="kg" value={s.weight} step={0.5} onChange={(v) => onUpdate({ weight: v })} dark={dark} disabled={isDone}/>
      <Stepper label="reps" value={s.reps} step={1} onChange={(v) => onUpdate({ reps: v })} dark={dark} disabled={isDone}/>
      <button onClick={(e) => { e.stopPropagation(); if (!isDone) onLog(); }} style={{
        height: 38, borderRadius: 10, border: 'none', fontFamily: 'inherit', cursor: isDone ? 'default' : 'pointer',
        background: isDone ? (dark ? 'rgba(255,255,255,0.06)' : '#F0F0F0') : 'var(--primary)',
        color: isDone ? (dark ? 'rgba(255,255,255,0.4)' : 'var(--element-low)') : '#fff',
        fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {isDone ? '✓' : 'Hecho'}
      </button>
    </div>
  );
}

function Stepper({ label, value, step, onChange, dark, disabled }) {
  const dec = (e) => { e.stopPropagation(); if (!disabled && value > 0) onChange(Math.round((value - step) * 10) / 10); };
  const inc = (e) => { e.stopPropagation(); if (!disabled) onChange(Math.round((value + step) * 10) / 10); };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'space-between' }}>
      <button onClick={dec} style={{
        width: 24, height: 24, borderRadius: 999, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        background: dark ? 'rgba(255,255,255,0.1)' : '#F0F0F0', color: dark ? '#fff' : '#1F1F1F',
        fontSize: 16, fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: disabled ? 0.4 : 1,
      }}>−</button>
      <div style={{ textAlign: 'center', flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: 'var(--font-numeric)', fontSize: 17, fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1 }}>
          {value == null ? '—' : (step < 1 ? value.toFixed(1) : value)}
        </div>
        <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: dark ? 'rgba(255,255,255,0.4)' : 'var(--element-low)', marginTop: 1 }}>{label}</div>
      </div>
      <button onClick={inc} style={{
        width: 24, height: 24, borderRadius: 999, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        background: dark ? 'rgba(255,255,255,0.1)' : '#F0F0F0', color: dark ? '#fff' : '#1F1F1F',
        fontSize: 16, fontWeight: 600, fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: disabled ? 0.4 : 1,
      }}>+</button>
    </div>
  );
}

// Pattern 2 — list: minimal row, big tap on right
function SetListRow({ s, si, active, onActivate, onUpdate, onLog, dark }) {
  const isDone = s.completed;
  return (
    <div onClick={onActivate} style={{
      height: 44, borderRadius: 10, paddingLeft: 12, paddingRight: 6,
      display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
      border: `1px solid ${isDone ? 'color-mix(in oklab, var(--primary) 35%, transparent)' : (active ? (dark ? 'rgba(255,255,255,0.16)' : 'var(--border-default)') : 'transparent')}`,
      background: isDone ? 'color-mix(in oklab, var(--primary) 10%, transparent)' : (active ? (dark ? 'rgba(255,255,255,0.05)' : 'var(--surface-muted)') : 'transparent'),
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: dark ? 'rgba(255,255,255,0.5)' : 'var(--element-low)', width: 18 }}>{si + 1}</div>
      <div style={{ flex: 1, fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-numeric)' }}>
        <span style={{ color: isDone ? (dark ? '#fff' : '#1F1F1F') : (dark ? 'rgba(255,255,255,0.85)' : '#1F1F1F') }}>{s.weight ?? '—'}</span>
        <span style={{ color: dark ? 'rgba(255,255,255,0.4)' : 'var(--element-low)', margin: '0 6px' }}>·</span>
        <span>{s.reps}</span>
        <span style={{ color: dark ? 'rgba(255,255,255,0.4)' : 'var(--element-low)', fontSize: 11, marginLeft: 4 }}>reps</span>
      </div>
      <button onClick={(e) => { e.stopPropagation(); if (!isDone) onLog(); }} style={{
        height: 32, padding: '0 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
        background: isDone ? 'transparent' : 'var(--primary)',
        color: isDone ? 'var(--primary)' : '#fff', fontWeight: 700, fontSize: 12,
        display: 'flex', alignItems: 'center', gap: 4,
      }}>{isDone ? <Icon name="check" size={14}/> : 'Hecho'}</button>
    </div>
  );
}

// Pattern 3 — focus: big numeric pad UI for the active set, dots for others.
function SetFocus({ block, blockSets, activeIdx, setActiveIdx, updateSet, logSet, dark }) {
  const active = blockSets.find(s => s._idx === activeIdx) || blockSets.find(s => !s.completed) || blockSets[0];
  return (
    <div style={{ padding: '6px 4px 4px' }}>
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 10 }}>
        {blockSets.map((s, si) => (
          <button key={s._idx} onClick={() => setActiveIdx(s._idx)} style={{
            height: 28, minWidth: 28, padding: '0 8px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: s.completed ? 'var(--primary)' : (s._idx === active._idx ? (dark ? 'rgba(255,255,255,0.15)' : '#fff') : (dark ? 'rgba(255,255,255,0.06)' : '#F0F0F0')),
            color: s.completed ? '#fff' : (dark ? '#fff' : '#1F1F1F'),
            border: s._idx === active._idx && !s.completed ? `1px solid ${dark ? 'rgba(255,255,255,0.3)' : 'var(--border-default)'}` : 'none',
            fontSize: 11, fontWeight: 700, fontFamily: 'inherit',
          }}>{s.completed ? <Icon name="check" size={12} weight={2.4}/> : `S${si + 1}`}</button>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, borderRadius: 14, background: dark ? 'rgba(255,255,255,0.05)' : 'var(--surface-muted)' }}>
        <BigDial label="kg" value={active.weight} onChange={(v) => updateSet(active._idx, { weight: v })} step={0.5} dark={dark} disabled={active.completed}/>
        <BigDial label="reps" value={active.reps} onChange={(v) => updateSet(active._idx, { reps: v })} step={1} dark={dark} disabled={active.completed}/>
        <button onClick={() => !active.completed && logSet(active._idx)} disabled={active.completed} style={{
          width: 56, height: 56, borderRadius: 999, border: 'none', cursor: active.completed ? 'default' : 'pointer',
          background: active.completed ? (dark ? 'rgba(255,255,255,0.08)' : '#E5E5E5') : 'var(--primary)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}><Icon name="check" size={26} weight={2.4}/></button>
      </div>
    </div>
  );
}

function BigDial({ label, value, onChange, step, dark, disabled }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
      <button onClick={() => !disabled && onChange(Math.round((value - step) * 10) / 10)} style={{
        width: 32, height: 32, borderRadius: 999, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        background: dark ? 'rgba(255,255,255,0.1)' : '#fff', color: dark ? '#fff' : '#1F1F1F',
        fontSize: 18, fontWeight: 600, fontFamily: 'inherit', opacity: disabled ? 0.4 : 1,
      }}>−</button>
      <div style={{ flex: 1, textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-numeric)', fontSize: 26, fontWeight: 600, letterSpacing: '-0.04em', lineHeight: 1 }}>
          {value == null ? '—' : (step < 1 ? value.toFixed(1) : value)}
        </div>
        <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: dark ? 'rgba(255,255,255,0.45)' : 'var(--element-low)', marginTop: 2 }}>{label}</div>
      </div>
      <button onClick={() => !disabled && onChange(Math.round((value + step) * 10) / 10)} style={{
        width: 32, height: 32, borderRadius: 999, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        background: dark ? 'rgba(255,255,255,0.1)' : '#fff', color: dark ? '#fff' : '#1F1F1F',
        fontSize: 18, fontWeight: 600, fontFamily: 'inherit', opacity: disabled ? 0.4 : 1,
      }}>+</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Confirm dialog (iOS-style action sheet)
// ─────────────────────────────────────────────────────────────
function Confirm({ title, body, confirmLabel, onConfirm, onCancel, dark, destructive }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end', padding: 8 }}>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ background: dark ? 'rgba(40,40,40,0.95)' : 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '16px 16px 12px', textAlign: 'center', borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: dark ? '#fff' : '#1F1F1F' }}>{title}</div>
            <div style={{ fontSize: 12, color: dark ? 'rgba(255,255,255,0.55)' : 'var(--element-medium)', marginTop: 4 }}>{body}</div>
          </div>
          <button onClick={onConfirm} style={{
            width: '100%', height: 50, border: 'none', background: 'transparent',
            color: destructive ? '#FF453A' : 'var(--primary)',
            fontSize: 17, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}>{confirmLabel}</button>
        </div>
        <button onClick={onCancel} style={{
          height: 50, border: 'none', borderRadius: 14, fontFamily: 'inherit',
          background: dark ? 'rgba(40,40,40,0.95)' : 'rgba(255,255,255,0.95)',
          color: 'var(--primary)', fontSize: 17, fontWeight: 700, cursor: 'pointer',
          marginBottom: 16,
        }}>Cancelar</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Post-workout summary
// ─────────────────────────────────────────────────────────────
function WorkoutSummary({ session, theme, nav }) {
  const { dark } = theme;
  const min = Math.floor(session.durationMin || 0);
  return (
    <div>
      <ScreenHeader title="Resumen" dark={dark} onBack={() => nav.back()}/>
      <div style={{ padding: '12px 20px 20px' }}>
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <div style={{ width: 88, height: 88, borderRadius: 999, background: 'color-mix(in oklab, var(--primary) 18%, transparent)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <Icon name="check" size={44} weight={2.4}/>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 14 }}>¡Sesión completa!</div>
          <div style={{ fontSize: 14, color: dark ? 'rgba(255,255,255,0.55)' : 'var(--element-medium)', marginTop: 2 }}>{session.routineName} · {fmtDayShort(new Date(session.startedAt))}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <SummaryStat dark={dark} value={session.sets.length} label="Series"/>
          <SummaryStat dark={dark} value={`${(session.totalVolume / 1000).toFixed(1)}t`} label="Volumen"/>
          <SummaryStat dark={dark} value={`${min}'`} label="Duración"/>
        </div>
        <SectionTitle dark={dark} title="Por ejercicio"/>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Object.values(session.sets.reduce((acc, s) => {
            acc[s.exerciseId] = acc[s.exerciseId] || { name: s.exerciseName, sets: [] };
            acc[s.exerciseId].sets.push(s);
            return acc;
          }, {})).map((g, i) => (
            <div key={i} style={{
              padding: 12, borderRadius: 14,
              background: dark ? 'rgba(255,255,255,0.04)' : '#fff',
              border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid var(--border-subtle)',
            }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{g.name}</div>
              <div style={{ fontSize: 12, color: dark ? 'rgba(255,255,255,0.55)' : 'var(--element-medium)', marginTop: 4, fontFamily: 'var(--font-numeric)' }}>
                {g.sets.map(s => `${s.weightKg ?? '—'}×${s.reps}`).join(' · ')}
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 18 }}>
          <Button full size="lg" onClick={() => { nav.back(); nav.setTab('home'); }} dark={dark}>Volver al inicio</Button>
        </div>
      </div>
    </div>
  );
}

function SummaryStat({ value, label, dark }) {
  return (
    <div style={{
      padding: 14, borderRadius: 14, textAlign: 'center',
      background: dark ? 'rgba(255,255,255,0.04)' : '#fff',
      border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid var(--border-subtle)',
    }}>
      <div style={{ fontFamily: 'var(--font-numeric)', fontSize: 26, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: dark ? 'rgba(255,255,255,0.5)' : 'var(--element-low)', marginTop: 4 }}>{label}</div>
    </div>
  );
}

Object.assign(window, {
  TrainScreen, WorkoutScreen, WorkoutSummary, Confirm,
});
