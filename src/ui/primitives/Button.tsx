import { Pressable, Text, ViewStyle } from 'react-native';
import { ReactNode } from 'react';
import { useTheme } from '@/theme/useTheme';
import { radius } from '@/theme/tokens';
import { fontVariant } from '@/theme/fonts';

type Variant = 'primary' | 'outline' | 'ghost' | 'dark';
type Size = 'sm' | 'md' | 'lg';

export function Button({
  children, variant = 'primary', size = 'md', icon, onPress, full, disabled,
}: {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  onPress?: () => void;
  full?: boolean;
  disabled?: boolean;
}) {
  const p = useTheme();
  const h = size === 'lg' ? 52 : size === 'sm' ? 36 : 44;
  const padX = size === 'lg' ? 24 : size === 'sm' ? 14 : 18;
  const rad = size === 'lg' ? radius.xl - 2 : radius.lg;

  const styleByVariant: Record<Variant, { bg: string; color: string; border?: string }> = {
    primary: { bg: disabled ? '#F0F0F0' : p.accent.primary, color: disabled ? p.text3 : '#fff' },
    outline: { bg: 'transparent', color: p.text, border: p.border },
    ghost:   { bg: p.surface2,   color: p.text },
    dark:    { bg: '#1F1F1F',    color: '#fff' },
  };
  const v = styleByVariant[variant];

  const style: ViewStyle = {
    height: h, paddingHorizontal: padX, borderRadius: rad,
    backgroundColor: v.bg, borderWidth: v.border ? 1 : 0,
    ...(v.border ? { borderColor: v.border } : {}),
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, alignSelf: full ? 'stretch' : 'flex-start',
    opacity: disabled ? 0.6 : 1,
  };

  return (
    <Pressable onPress={disabled ? undefined : onPress} style={style}>
      {icon}
      <Text style={{ color: v.color, fontFamily: fontVariant('sans', 600), fontSize: size === 'lg' ? 17 : 15 }}>
        {children}
      </Text>
    </Pressable>
  );
}
