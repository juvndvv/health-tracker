import { Pressable } from 'react-native';
import { Plus } from 'phosphor-react-native';
import { useTheme } from '@/theme/useTheme';

export function HeaderActionPlus({ onPress }: { onPress: () => void }) {
  const p = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: 36,
        height: 36,
        borderRadius: 999,
        backgroundColor: p.accent.primary,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Plus size={20} color="#fff" weight="bold" />
    </Pressable>
  );
}
