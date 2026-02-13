import React from 'react';
import { Ionicons } from '@expo/vector-icons';

const AppIcon = ({ name, size = 24, color = '#1A1A2E', style }) => {
  return <Ionicons name={name} size={size} color={color} style={style} />;
};

export default AppIcon;