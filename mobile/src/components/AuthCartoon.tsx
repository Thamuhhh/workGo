import React from 'react';
import Svg, { Circle, Rect, Path, G } from 'react-native-svg';

function Star({ x, y, size, color }: { x: number; y: number; size: number; color: string }) {
  return (
    <Path
      d={`M0 ${-size} L ${size * 0.32} ${-size * 0.32} L ${size} 0 L ${size * 0.32} ${size * 0.32} L 0 ${size} L ${-size * 0.32} ${size * 0.32} L ${-size} 0 L ${-size * 0.32} ${-size * 0.32} Z`}
      fill={color}
      transform={`translate(${x} ${y})`}
    />
  );
}

function Dot({ cx, cy, color }: { cx: number; cy: number; color: string }) {
  return <Circle cx={cx} cy={cy} r={3} fill={color} />;
}

export function LoginCartoon() {
  return (
    <Svg width="200" height="168" viewBox="0 0 200 168">
      {/* Backdrop */}
      <Circle cx={100} cy={84} r={80} fill="#E7F3FF" />
      <Circle cx={100} cy={84} r={58} fill="#D8EBFF" opacity={0.85} />

      {/* Phone */}
      <G rotation="-8 100 84">
        <Rect x={72} y={30} width={56} height={108} rx={16} fill="#FFFFFF" stroke="#CBD5E1" strokeWidth={2} />
        <Rect x={79} y={40} width={42} height={86} rx={10} fill="#EAF4FF" />
        {/* lock on screen */}
        <Rect x={94} y={72} width={12} height={10} rx={3} fill="#0277F4" />
        <Path d="M97 72v-3a3 3 0 0 1 6 0v3" stroke="#0277F4" strokeWidth={2} fill="none" />
        <Path d="M96.5 77.5l2.5 2.5 5-5" stroke="#FFFFFF" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* OTP chips */}
        <Rect x={84} y={96} width={8} height={8} rx={2} fill="#B7D6FF" />
        <Rect x={96} y={96} width={8} height={8} rx={2} fill="#B7D6FF" />
        <Rect x={108} y={96} width={8} height={8} rx={2} fill="#0277F4" />
        <Circle cx={100} cy={115} r={3} fill="#B7D6FF" />
      </G>

      {/* Message bubbles */}
      <Rect x={134} y={40} width={36} height={20} rx={10} fill="#FFFFFF" stroke="#E2E8F0" strokeWidth={1.5} />
      <Dot cx={146} cy={50} color="#8FB8FF" />
      <Dot cx={154} cy={50} color="#0277F4" />
      <Dot cx={162} cy={50} color="#8FB8FF" />

      <Rect x={22} y={84} width={40} height={22} rx={11} fill="#FFFFFF" stroke="#E2E8F0" strokeWidth={1.5} />
      <Path d="M31 94l3 3 6-6" stroke="#10B981" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />

      <Circle cx={40} cy={36} r={5} fill="#FFD166" opacity={0.9} />
      <Circle cx={176} cy={92} r={4} fill="#F9A8D4" opacity={0.9} />

      {/* Sparkles */}
      <Star x={170} y={26} size={8} color="#FFC53D" />
      <Star x={26} y={128} size={9} color="#7EB8FF" />
      <Star x={58} y={22} size={5} color="#34D399" />
      <Star x={152} y={140} size={6} color="#F9A8D4" />
    </Svg>
  );
}

export function OtpCartoon() {
  return (
    <Svg width="200" height="168" viewBox="0 0 200 168">
      {/* Backdrop */}
      <Circle cx={100} cy={84} r={80} fill="#E9FDF1" />
      <Circle cx={100} cy={84} r={58} fill="#D9F9E6" opacity={0.85} />

      {/* Lock badge */}
      <Circle cx={100} cy={44} r={17} fill="#FFFFFF" stroke="#F59E0B" strokeWidth={2} />
      <Path d="M94 48v-4a6 6 0 0 1 12 0v4" stroke="#F59E0B" strokeWidth={2} fill="none" />
      <Rect x={92} y={47} width={16} height={12} rx={3.5} fill="#F59E0B" />
      <Path d="M95 55l3.5 3.5 7-7" stroke="#FFFFFF" strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />

      {/* Envelope */}
      <G>
        <Rect x={48} y={62} width={104} height={72} rx={14} fill="#FFFFFF" stroke="#E2E8F0" strokeWidth={2} />
        <Path d="M48 76 L100 108 L152 76" stroke="#E2E8F0" strokeWidth={2} fill="none" strokeLinejoin="round" />
        <Path d="M62 118 L82 98 M84 118 L78 100 Q100 118 122 100 L138 118" stroke="#E2E8F0" strokeWidth={2} fill="none" strokeLinecap="round" />
        <Circle cx={100} cy={90} r={6} fill="#0277F4" />
      </G>

      {/* Clock / timing */}
      <Circle cx={160} cy={112} r={5} fill="#FFC53D" />
      <Circle cx={36} cy={60} r={4.5} fill="#7EB8FF" />

      {/* Sparkles */}
      <Star x={166} y={34} size={9} color="#F9A8D4" />
      <Star x={26} y={104} size={8} color="#34D399" />
      <Star x={64} y={24} size={5} color="#FFC53D" />
      <Star x={146} y={146} size={6} color="#7EB8FF" />
    </Svg>
  );
}

export function RegisterCartoon() {
  return (
    <Svg width="200" height="168" viewBox="0 0 200 168">
      {/* Backdrop */}
      <Circle cx={100} cy={84} r={80} fill="#E7F3FF" />
      <Circle cx={100} cy={84} r={58} fill="#D8EBFF" opacity={0.85} />

      {/* Shoulders */}
      <Path
        d="M62 116 Q66 88 92 90 L108 90 Q134 88 138 116 L138 132 L62 132 Z"
        fill="#0277F4"
      />
      {/* Collar */}
      <Path d="M88 92 L100 104 L112 92 L108 90 L100 96 L92 90 Z" fill="#FFFFFF" opacity={0.9} />

      {/* Head */}
      <Circle cx={100} cy={68} r={22} fill="#F6B98A" />
      {/* Hair */}
      <Path d="M78 64 A22 22 0 0 1 122 64 Q122 50 100 49 Q78 50 78 64 Z" fill="#1F2937" />
      {/* Eyes + smile */}
      <Circle cx={92} cy={70} r={2.4} fill="#1F2937" />
      <Circle cx={108} cy={70} r={2.4} fill="#1F2937" />
      <Path d="M94 76 Q100 81 106 76" stroke="#1F2937" strokeWidth={2} fill="none" strokeLinecap="round" />

      {/* ID card badge */}
      <Rect x={136} y={26} width={40} height={50} rx={10} fill="#FFFFFF" stroke="#E2E8F0" strokeWidth={1.5} />
      <Circle cx={156} cy={40} r={11} fill="#F59E0B" opacity={0.15} />
      <Path d="M152 40l3 3 6-6" stroke="#F59E0B" strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Rect x={142} y={54} width={28} height={5} rx={2.5} fill="#B7D6FF" />
      <Rect x={142} y={63} width={22} height={5} rx={2.5} fill="#E2E8F0" />

      {/* Add (+) chip */}
      <Circle cx={40} cy={40} r={13} fill="#10B981" />
      <Path d="M40 35v10 M35 40h10" stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round" />

      <Circle cx={176} cy={120} r={5} fill="#FFC53D" opacity={0.9} />
      <Circle cx={40} cy={120} r={4} fill="#7EB8FF" opacity={0.9} />

      {/* Sparkles */}
      <Star x={166} y={26} size={8} color="#FFC53D" />
      <Star x={26} y={104} size={9} color="#7EB8FF" />
      <Star x={146} y={146} size={6} color="#34D399" />
      <Star x={62} y={24} size={5} color="#F9A8D4" />
    </Svg>
  );
}