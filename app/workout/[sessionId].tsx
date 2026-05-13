import { useEffect, useMemo, useState } from 'react';
import { ScrollView, View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X } from 'phosphor-react-native';
import { useTheme } from '@/theme/useTheme';
import { fontVariant } from '@/theme/fonts';
import {
  ExerciseBlock,
  type ExerciseBlockView,
  type LastTimeRecall,
} from '@/ui/workout/ExerciseBlock';
import { type WorkoutSetView } from '@/ui/workout/SetCard';
import { Confirm } from '@/ui/primitives/Confirm';
import { Button } from '@/ui/primitives/Button';
import { useWorkoutDraft, type DraftSet } from '@/features/sessions/state';
import { sessionQueries } from '@/features/sessions';
import { fmtRelative } from '@/lib/date';

type Block = { exerciseId: number; indices: number[] };

function buildBlocks(sets: DraftSet[]): Block[] {
  const blocks: Block[] = [];
  sets.forEach((s, i) => {
    const last = blocks[blocks.length - 1];
    if (!last || last.exerciseId !== s.exerciseId) {
      blocks.push({ exerciseId: s.exerciseId, indices: [i] });
    } else {
      last.indices.push(i);
    }
  });
  return blocks;
}

export default function WorkoutScreen() {
  const p = useTheme();
  const router = useRouter();
  const { sessionId: sessionIdParam } = useLocalSearchParams<{ sessionId?: string }>();
  const sessionId = Number(sessionIdParam);

  const draft = useWorkoutDraft();
  const sets = draft.sets;
  const startedAt = draft.startedAt ?? Date.now();

  const exerciseIds = useMemo(
    () => Array.from(new Set(sets.map((s) => s.exerciseId))),
    [sets],
  );

  const [recall, setRecall] = useState<Record<number, LastTimeRecall | undefined>>({});
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const map: Record<number, LastTimeRecall | undefined> = {};
      for (const eid of exerciseIds) {
        const last = await sessionQueries.lastSessionForExercise(eid, sessionId);
        if (!last) {
          map[eid] = undefined;
          continue;
        }
        map[eid] = {
          when: fmtRelative(new Date(last.session.startedAt)),
          sets: last.sets
            .filter((s) => s.exerciseId === eid)
            .map((s) => ({ weightKg: s.weightKg, reps: s.reps })),
        };
      }
      if (!cancelled) setRecall(map);
    })();
    return () => {
      cancelled = true;
    };
  }, [exerciseIds, sessionId]);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const elapsed = Math.max(0, Math.floor((now - startedAt) / 1000));
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const ss = String(elapsed % 60).padStart(2, '0');

  const completedSets = sets.filter((s) => s.completed).length;
  const totalSets = sets.length;
  const totalVolumeKg = sets
    .filter((s) => s.completed)
    .reduce((a, s) => a + (s.weight ?? 0) * s.reps, 0);
  const progress = totalSets > 0 ? completedSets / totalSets : 0;

  const blocks = useMemo(() => buildBlocks(sets), [sets]);

  const [showAbandon, setShowAbandon] = useState(false);
  const [showFinish, setShowFinish] = useState(false);

  if (!sessionId || isNaN(sessionId)) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: p.bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator color={p.accent.primary} />
      </View>
    );
  }

  async function onLog(globalIdx: number) {
    const s = sets[globalIdx];
    if (!s) return;
    const positionForExercise = sets
      .slice(0, globalIdx)
      .filter((x) => x.exerciseId === s.exerciseId && x.completed).length;
    await sessionQueries.appendSet({
      sessionId,
      exerciseId: s.exerciseId,
      exerciseName: s.exerciseName,
      position: positionForExercise,
      weightKg: s.weight,
      reps: s.reps,
    });
    useWorkoutDraft.getState().complete(globalIdx);
  }

  function onUpdate(globalIdx: number, patch: { weight?: number; reps?: number }) {
    useWorkoutDraft.getState().update(globalIdx, patch);
  }

  function onSkipBlock(blockIdx: number) {
    const block = blocks[blockIdx];
    if (!block) return;
    for (const i of block.indices) {
      if (!sets[i]?.completed) {
        useWorkoutDraft.getState().update(i, { completed: true });
      }
    }
  }

  function onAdd(blockIdx: number) {
    const block = blocks[blockIdx];
    if (!block) return;
    const lastIdx = block.indices[block.indices.length - 1];
    if (lastIdx == null) return;
    useWorkoutDraft.getState().appendSetAt(lastIdx);
  }

  async function onAbandon() {
    await sessionQueries.abandonSession(sessionId);
    useWorkoutDraft.getState().clear();
    setShowAbandon(false);
    router.replace('/(tabs)/train');
  }

  async function onFinish() {
    await sessionQueries.finishSession(sessionId);
    useWorkoutDraft.getState().clear();
    setShowFinish(false);
    router.replace(`/workout-summary/${sessionId}`);
  }

  return (
    <View style={{ flex: 1, backgroundColor: p.bg }}>
      <View
        style={{
          paddingTop: 52,
          paddingHorizontal: 12,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: p.border,
          backgroundColor: p.bg,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Pressable onPress={() => setShowAbandon(true)} hitSlop={8}>
            <X size={20} color={p.text2} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: p.text3,
                fontFamily: fontVariant('sans', 700),
                fontSize: 11,
                letterSpacing: 1,
                textTransform: 'uppercase',
              }}
            >
              En curso
            </Text>
            <Text
              style={{
                color: p.text,
                fontFamily: fontVariant('sans', 700),
                fontSize: 17,
                marginTop: 2,
              }}
            >
              {draft.routineName ?? ''}
            </Text>
          </View>
          <View>
            <Text
              style={{
                color: p.text,
                fontFamily: fontVariant('numeric', 600),
                fontSize: 20,
                textAlign: 'right',
              }}
            >
              {mm}:{ss}
            </Text>
            <Text style={{ color: p.text3, fontSize: 10, textAlign: 'right' }}>tiempo</Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            marginTop: 10,
          }}
        >
          <View
            style={{
              flex: 1,
              height: 5,
              backgroundColor: p.surface2,
              borderRadius: 999,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                width: `${progress * 100}%`,
                height: 5,
                backgroundColor: p.accent.primary,
              }}
            />
          </View>
          <Text
            style={{
              color: p.text,
              fontFamily: fontVariant('numeric', 600),
              fontSize: 12,
              minWidth: 36,
              textAlign: 'right',
            }}
          >
            {completedSets}/{totalSets}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 14, gap: 18, paddingBottom: 120 }}>
        {blocks.map((blk, bi) => {
          const firstIdx = blk.indices[0];
          if (firstIdx == null) return null;
          const first = sets[firstIdx];
          if (!first) return null;
          const blockSets: WorkoutSetView[] = blk.indices.map((i, j) => {
            const ds = sets[i]!;
            return {
              setIndex: j,
              weight: ds.weight,
              reps: ds.reps,
              completed: ds.completed,
            };
          });
          const block: ExerciseBlockView = {
            exerciseName: first.exerciseName,
            muscleGroup: first.muscleGroup,
            targetSets: blk.indices.length,
            targetReps: first.targetReps,
            targetWeight: first.targetWeight,
            sets: blockSets,
            last: recall[first.exerciseId],
            blockCompleted: blockSets.every((s) => s.completed),
          };
          return (
            <ExerciseBlock
              key={bi}
              block={block}
              activeIdx={draft.activeIdx - firstIdx}
              onActivateIdx={(i) =>
                useWorkoutDraft.getState().setActive(blk.indices[i]!)
              }
              onUpdate={(i, patch) => onUpdate(blk.indices[i]!, patch)}
              onLog={(i) => onLog(blk.indices[i]!)}
              onSkip={() => onSkipBlock(bi)}
              onAdd={() => onAdd(bi)}
            />
          );
        })}

        <Button
          onPress={() => setShowFinish(true)}
          disabled={completedSets === 0}
          full
          size="lg"
        >
          Terminar entrenamiento
        </Button>
      </ScrollView>

      <Confirm
        visible={showAbandon}
        title="¿Abandonar entrenamiento?"
        body="Se descartarán las series registradas."
        confirmLabel="Abandonar"
        destructive
        onConfirm={onAbandon}
        onCancel={() => setShowAbandon(false)}
      />
      <Confirm
        visible={showFinish}
        title="¿Terminar?"
        body={`${completedSets} series · ${(totalVolumeKg / 1000).toFixed(1)} t · ${mm}:${ss}`}
        confirmLabel="Terminar"
        onConfirm={onFinish}
        onCancel={() => setShowFinish(false)}
      />
    </View>
  );
}
