import { View, Pressable, Text } from 'react-native';
import { Check } from 'phosphor-react-native';
import { useTheme } from '@/theme/useTheme';
import { fontVariant } from '@/theme/fonts';
import { Stepper } from '@/ui/primitives/Stepper';
import { mixRgb } from '@/lib/color';

export type WorkoutSetView = {
  setIndex: number;
  weight: number | null;
  reps: number;
  completed: boolean;
};

export function SetCard({
  set,
  active,
  onActivate,
  onUpdate,
  onLog,
}: {
  set: WorkoutSetView;
  active: boolean;
  onActivate: () => void;
  onUpdate: (patch: { weight?: number; reps?: number }) => void;
  onLog: () => void;
}) {
  const p = useTheme();
  const isDone = set.completed;
  const bg = isDone
    ? mixRgb(p.accent.primary, p.surface, 12)
    : active
      ? p.surface2
      : 'transparent';
  const border = isDone ? mixRgb(p.accent.primary, p.surface, 40) : p.border;

  return (
    <Pressable
      onPress={onActivate}
      style={{
        borderRadius: 14,
        padding: 10,
        gap: 8,
        backgroundColor: bg,
        borderWidth: 1,
        borderColor: border,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 999,
          backgroundColor: isDone ? p.accent.primary : p.surface2,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isDone ? (
          <Check size={16} color="#fff" weight="bold" />
        ) : (
          <Text
            style={{
              color: p.text2,
              fontFamily: fontVariant('numeric', 700),
              fontSize: 13,
            }}
          >
            {set.setIndex + 1}
          </Text>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Stepper
          label="kg"
          value={set.weight}
          step={0.5}
          onChange={(v) => onUpdate({ weight: v })}
          disabled={isDone}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Stepper
          label="reps"
          value={set.reps}
          step={1}
          onChange={(v) => onUpdate({ reps: v })}
          disabled={isDone}
        />
      </View>
      <Pressable
        onPress={(e) => {
          e.stopPropagation();
          if (!isDone) onLog();
        }}
        style={{
          height: 38,
          width: 64,
          borderRadius: 10,
          backgroundColor: isDone ? p.surface2 : p.accent.primary,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            color: isDone ? p.text3 : '#fff',
            fontFamily: fontVariant('sans', 700),
            fontSize: 13,
          }}
        >
          {isDone ? '✓' : 'Hecho'}
        </Text>
      </Pressable>
    </Pressable>
  );
}
