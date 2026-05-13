import { View, Pressable, Text } from 'react-native';
import { Clock, Plus, Check } from 'phosphor-react-native';
import { useTheme } from '@/theme/useTheme';
import { fontVariant } from '@/theme/fonts';
import { SetCard, type WorkoutSetView } from './SetCard';

export type LastTimeRecall = {
  when: string;
  sets: { weightKg: number | null; reps: number }[];
};

export type ExerciseBlockView = {
  exerciseName: string;
  muscleGroup: string;
  targetSets: number;
  targetReps: number;
  targetWeight: number | null;
  sets: WorkoutSetView[];
  last?: LastTimeRecall;
  blockCompleted: boolean;
};

export function ExerciseBlock({
  block,
  activeIdx,
  onActivateIdx,
  onUpdate,
  onLog,
  onSkip,
  onAdd,
}: {
  block: ExerciseBlockView;
  activeIdx: number;
  onActivateIdx: (i: number) => void;
  onUpdate: (i: number, patch: { weight?: number; reps?: number }) => void;
  onLog: (i: number) => void;
  onSkip: () => void;
  onAdd: () => void;
}) {
  const p = useTheme();
  return (
    <View
      style={{
        borderRadius: 20,
        backgroundColor: p.surface,
        borderWidth: 1,
        borderColor: p.border,
        paddingTop: 14,
        paddingBottom: 12,
      }}
    >
      <View
        style={{
          paddingHorizontal: 16,
          paddingBottom: 10,
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 10,
        }}
      >
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
            {block.muscleGroup}
          </Text>
          <Text
            style={{
              color: p.text,
              fontFamily: fontVariant('sans', 700),
              fontSize: 17,
              marginTop: 2,
            }}
          >
            {block.exerciseName}
          </Text>
          <Text style={{ color: p.text2, fontSize: 12, marginTop: 4 }}>
            Objetivo: {block.targetSets} × {block.targetReps}
            {block.targetWeight != null ? ` @ ${block.targetWeight} kg` : ''}
          </Text>
        </View>
        {block.blockCompleted ? (
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 999,
              backgroundColor: p.accent.primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Check size={18} color="#fff" weight="bold" />
          </View>
        ) : (
          <Pressable onPress={onSkip}>
            <Text style={{ color: p.text2, fontSize: 12 }}>Saltar</Text>
          </Pressable>
        )}
      </View>

      {block.last && (
        <View
          style={{
            marginHorizontal: 16,
            marginBottom: 12,
            padding: 10,
            borderRadius: 12,
            backgroundColor: p.surface2,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <Clock size={14} color={p.text2} />
          <Text
            style={{
              color: p.text2,
              fontFamily: fontVariant('sans', 600),
              fontSize: 12,
            }}
          >
            Última vez · {block.last.when}
          </Text>
          <Text style={{ color: p.text2, fontSize: 12 }}>
            ·{' '}
            {block.last.sets
              .slice(0, 4)
              .map((s) => `${s.weightKg ?? '—'}×${s.reps}`)
              .join(' · ')}
          </Text>
        </View>
      )}

      <View style={{ paddingHorizontal: 12, gap: 8 }}>
        {block.sets.map((s, i) => (
          <SetCard
            key={i}
            set={s}
            active={activeIdx === i}
            onActivate={() => onActivateIdx(i)}
            onUpdate={(patch) => onUpdate(i, patch)}
            onLog={() => onLog(i)}
          />
        ))}
        <Pressable
          onPress={onAdd}
          style={{
            height: 36,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: p.border,
            borderStyle: 'dashed',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: 6,
            marginTop: 2,
          }}
        >
          <Plus size={14} color={p.text2} />
          <Text
            style={{
              color: p.text2,
              fontFamily: fontVariant('sans', 600),
              fontSize: 12,
            }}
          >
            Añadir serie
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
