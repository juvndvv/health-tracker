import Svg, { Circle } from 'react-native-svg';

export function ActivityRing({
  size, stroke, value, goal, color, trackColor,
}: {
  size: number;
  stroke: number;
  value: number;
  goal: number;
  color: string;
  trackColor: string;
}) {
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const pct = Math.min(1, value / goal);
  const offset = C * (1 - pct);
  return (
    <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
      <Circle cx={size / 2} cy={size / 2} r={r} stroke={trackColor} strokeWidth={stroke} fill="none" />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={String(C)}
        strokeDashoffset={offset}
      />
    </Svg>
  );
}
