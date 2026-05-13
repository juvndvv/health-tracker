import { View, ViewProps, ViewStyle, Pressable, StyleProp } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { radius, space } from '@/theme/tokens';

type Props = Omit<ViewProps, 'style'> & {
  onPress?: () => void;
  dense?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Card({ onPress, dense, style, children, ...rest }: Props) {
  const p = useTheme();
  const base: ViewStyle = {
    backgroundColor: p.surface,
    borderColor: p.border,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: dense ? space[3] : space[5],
  };
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={[base, style]} {...rest}>
        {children}
      </Pressable>
    );
  }
  return (
    <View style={[base, style]} {...rest}>
      {children}
    </View>
  );
}
