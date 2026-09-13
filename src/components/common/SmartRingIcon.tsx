import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

interface SmartRingIconProps {
  size?: number;
  color?: string;
  accentColor?: string;
}

export const SmartRingIcon: React.FC<SmartRingIconProps> = ({
  size = 18,
  color = '#10B981',
  accentColor = '#059669',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Outer Titanium Smart Ring Band */}
      <Circle
        cx="12"
        cy="12"
        r="8.5"
        stroke={color}
        strokeWidth="2.8"
        strokeLinecap="round"
      />
      {/* Precision Sensor Notch (Ultrahuman Ring AIR biometric contour) */}
      <Path
        d="M8.5 4.8C9.5 4.3 10.7 4 12 4c1.3 0 2.5.3 3.5.8"
        stroke={accentColor}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      {/* Optical PPG Sensor LED Dot */}
      <Circle cx="12" cy="5.2" r="1.1" fill="#10B981" />
    </Svg>
  );
};
