// Vector SVG Icons for Medication Reminder System
// Precise match to high-end medical UI design mockup

import React from 'react';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

// Tablet / Pill: Circle with diagonal center score line
export const TabletIcon: React.FC<IconProps> = ({ size = 20, color = '#2563EB' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2.2" />
    <Path d="M6 18L18 6" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

// Capsule: Oblong capsule shape with division line
export const CapsuleIcon: React.FC<IconProps> = ({ size = 20, color = '#16A34A' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7.5 16.5L16.5 7.5C18.2678 5.73223 18.2678 2.86777 16.5 1.1C14.7322 -0.667767 11.8678 -0.667767 10.1 1.1L1.1 10.1C-0.667767 11.8678 -0.667767 14.7322 1.1 16.5C2.86777 18.2678 5.73223 18.2678 7.5 16.5Z"
      transform="translate(3.5, 3.5)"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7 11L13 17"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  </Svg>
);

// Liquid Droplet: Tear droplet shape
export const DropletIcon: React.FC<IconProps> = ({ size = 20, color = '#EA580C' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Injection / Syringe: Medical needle
export const InjectionIcon: React.FC<IconProps> = ({ size = 20, color = '#8B5CF6' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M18 2L22 6" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    <Path d="M17 7L19 9" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    <Path d="M19 5L15 9L11 5L15 1L19 5Z" stroke={color} strokeWidth="2.2" strokeLinejoin="round" />
    <Path d="M13 11L5 19L2 22L5 19L7 21" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M8 12L12 16" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

// Document / Prescription notes icon
export const DocumentIcon: React.FC<IconProps> = ({ size = 20, color = '#FFFFFF' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M14 2v6h6" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M16 13H8" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path d="M16 17H8" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

// Checkmark in Circle
export const CheckCircleIcon: React.FC<{ size?: number; checked: boolean; color?: string }> = ({
  size = 22,
  checked,
  color = '#10B981',
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {checked ? (
      <>
        <Circle cx="12" cy="12" r="10" fill={color} />
        <Path d="M8 12.5L10.5 15L16 9.5" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ) : (
      <Circle cx="12" cy="12" r="10" stroke="#CBD5E1" strokeWidth="2" fill="none" />
    )}
  </Svg>
);

// Clock / Alarm Icon
export const ClockIcon: React.FC<IconProps> = ({ size = 18, color = '#64748B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2.2" />
    <Path d="M12 6v6l4 2" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Circular Adherence Gauge / Ring (e.g. 40% complete)
export const CircularAdherenceGauge: React.FC<{
  size?: number;
  strokeWidth?: number;
  percentage: number;
  color?: string;
  bgColor?: string;
}> = ({
  size = 90,
  strokeWidth = 7,
  percentage,
  color = '#10B981',
  bgColor = '#E2E8F0',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * Math.min(100, Math.max(0, percentage))) / 100;

  return (
    <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={bgColor}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
};
