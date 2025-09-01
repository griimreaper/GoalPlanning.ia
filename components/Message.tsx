// components/Message.tsx
import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface Props {
  message: string;
  type?: 'success' | 'error';
}

export default function Message({ message, type = 'success' }: Props) {
  return (
    <View style={[styles.container, type === 'error' && styles.error]}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#2575fc',
    zIndex: 1000,
    alignItems: 'center',
  },
  error: {
    backgroundColor: '#ff4d4f',
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
