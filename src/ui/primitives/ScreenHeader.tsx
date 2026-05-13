import { View, Pressable, Text } from 'react-native';
import { CaretLeft } from 'phosphor-react-native';
import { ReactNode } from 'react';
import { useTheme } from '@/theme/useTheme';

export function ScreenHeader({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  const p = useTheme();
  return (
    <View
      style={{
        paddingTop: 52,
        paddingBottom: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderBottomWidth: 1,
        borderBottomColor: p.border,
        backgroundColor: p.bg,
      }}
    >
      {onBack && (
        <Pressable onPress={onBack}>
          <CaretLeft size={24} color={p.accent.primary} />
        </Pressable>
      )}
      <Text
        style={{
          flex: 1,
          color: p.text,
          fontFamily: 'OpenSauceOne-SemiBold',
          fontSize: 17,
        }}
      >
        {title}
      </Text>
      {right}
    </View>
  );
}
