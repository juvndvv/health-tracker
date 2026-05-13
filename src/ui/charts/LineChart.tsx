import Svg, { Path, Line, Defs, LinearGradient, Stop, Text as SvgText, Circle, G } from 'react-native-svg';
import { View, Text } from 'react-native';
import { useTheme } from '@/theme/useTheme';

export type Point = { x: number; y: number; raw?: unknown };

export function LineChart({
  points, width, height, color, dark, prIdxs, yFormat, xFormat,
}: {
  points: Point[];
  width: number;
  height: number;
  color: string;
  dark?: boolean;
  prIdxs?: number[];
  yFormat?: (v: number) => string;
  xFormat?: (p: Point) => string;
}) {
  const p = useTheme();
  const isDark = dark ?? false;
  const pad = { l: 8, r: 12, t: 14, b: 24 };
  const W = width - pad.l - pad.r;
  const H = height - pad.t - pad.b;

  if (!points || points.length < 2) {
    return (
      <View style={{ height, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: p.text3 }}>—</Text>
      </View>
    );
  }

  const ys = points.map(pt => pt.y);
  let yMin = Math.min(...ys);
  let yMax = Math.max(...ys);
  if (yMin === yMax) { yMin -= 1; yMax += 1; }
  const padY = (yMax - yMin) * 0.15;
  yMin -= padY; yMax += padY;

  const xScale = (i: number) => (i / (points.length - 1)) * W + pad.l;
  const yScale = (v: number) => pad.t + (1 - (v - yMin) / (yMax - yMin)) * H;

  const linePath = points
    .map((pt, i) => `${i ? 'L' : 'M'}${xScale(i).toFixed(1)} ${yScale(pt.y).toFixed(1)}`)
    .join(' ');
  const areaPath = `${linePath} L${xScale(points.length - 1).toFixed(1)} ${(pad.t + H).toFixed(1)} L${xScale(0).toFixed(1)} ${(pad.t + H).toFixed(1)} Z`;

  const gridY = [yMin, (yMin + yMax) / 2, yMax];
  const xTicks = [0, Math.floor(points.length / 2), points.length - 1];

  const gridColor = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
  const labelColor = isDark ? 'rgba(255,255,255,0.5)' : '#8F8F8F';
  const dotBg = isDark ? '#000' : '#fff';
  const last = points[points.length - 1]!;

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="lc-fill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={color} stopOpacity={0.32} />
          <Stop offset="100%" stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>

      {gridY.map((g, i) => (
        <Line key={i} x1={pad.l} x2={width - pad.r} y1={yScale(g)} y2={yScale(g)} stroke={gridColor} strokeWidth={1} />
      ))}

      <Path d={areaPath} fill="url(#lc-fill)" />
      <Path d={linePath} fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />

      {(prIdxs ?? []).map((idx) => {
        const cx = xScale(idx);
        const cy = yScale(points[idx]!.y);
        return (
          <G key={idx}>
            <Circle cx={cx} cy={cy} r={6} fill={dotBg} stroke={color} strokeWidth={2} />
            <Circle cx={cx} cy={cy} r={2.2} fill={color} />
          </G>
        );
      })}

      <Circle cx={xScale(points.length - 1)} cy={yScale(last.y)} r={3.5} fill={color} stroke={dotBg} strokeWidth={2} />

      {xTicks.map((t, i) => (
        <SvgText
          key={i}
          x={xScale(t)}
          y={height - 6}
          textAnchor={i === 0 ? 'start' : i === xTicks.length - 1 ? 'end' : 'middle'}
          fontSize={10}
          fill={labelColor}
          fontFamily="Geist-Regular"
        >
          {xFormat ? xFormat(points[t]!) : String(points[t]!.x)}
        </SvgText>
      ))}

      <SvgText x={pad.l} y={pad.t + 8} fontSize={10} fill={labelColor} fontFamily="Geist-Regular">
        {yFormat ? yFormat(yMax) : yMax.toFixed(1)}
      </SvgText>
    </Svg>
  );
}
