import Svg, { Path } from 'react-native-svg';

export function Sparkline({
  values, width = 80, height = 28, color, fill,
}: {
  values: number[];
  width?: number;
  height?: number;
  color: string;
  fill?: string;
}) {
  if (!values || values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = (max - min) || 1;

  const pts = values.map((v, i): [number, number] => [
    (i / (values.length - 1)) * width,
    height - ((v - min) / range) * (height - 4) - 2,
  ]);

  const lineD = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const areaD = `${lineD} L${width.toFixed(1)} ${height} L0 ${height} Z`;

  return (
    <Svg width={width} height={height}>
      {fill ? <Path d={areaD} fill={fill} /> : null}
      <Path d={lineD} fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
