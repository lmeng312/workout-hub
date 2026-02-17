import React from 'react';
import { Image, StyleSheet } from 'react-native';

const logoSource = require('../assets/logo.png');

export default function Logo({ size = 'small', style }) {
  const imageStyle = size === 'large' ? styles.large : styles.small;

  return (
    <Image
      source={logoSource}
      style={[imageStyle, style]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  small: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  large: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
});
