import React, { useEffect, useRef } from 'react';
import { View, Animated, Dimensions, StyleSheet, Image, Easing } from 'react-native';

const { width, height } = Dimensions.get('window');

interface Props {
  children: React.ReactNode;
}

interface CircleConfig {
  color: string;
}

const circlesConfig: CircleConfig[] = [
  { color: 'rgba(255,255,255,0.08)' },
  { color: 'rgba(255,255,255,0.08)' },
  { color: 'rgba(255,255,255,0.08)' },
  { color: 'rgba(255,255,255,0.08)' },
  { color: 'rgba(255,255,255,0.08)' },
];

export default function AppBackground({ children }: Props) {
  const anims = useRef(circlesConfig.map(() => new Animated.ValueXY({ x: 0, y: 0 }))).current;
  const opacities = useRef(circlesConfig.map(() => new Animated.Value(0))).current;
  const sizes = useRef(circlesConfig.map(() => 0)).current;

  const getRandomSize = () => 80 + Math.random() * 100; // 80 a 180
  const getRandomPosition = () => ({
    x: Math.random() * (width + 200) - 100,
    y: Math.random() * (height + 200) - 100,
  });
  const getRandomDuration = () => 12000 + Math.random() * 6000; // 12,000 a 18,000 ms

  useEffect(() => {
    anims.forEach((anim, idx) => {
      const cfg = circlesConfig[idx];

      const loop = () => {
        const start = getRandomPosition();
        const end = getRandomPosition();
        const size = getRandomSize();
        const duration = getRandomDuration();
        sizes[idx] = size;

        anim.setValue(start);
        opacities[idx].setValue(0);

        Animated.parallel([
          Animated.timing(anim, {
            toValue: end,
            duration: duration,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(200),
            Animated.timing(opacities[idx], {
              toValue: 1,
              duration: duration * 0.2,
              useNativeDriver: true,
            }),
            Animated.timing(opacities[idx], {
              toValue: 0,
              duration: duration * 0.2,
              delay: duration * 0.6,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => loop());
      };

      const initialDelay = Math.random() * 6000; // delay inicial aleatorio hasta 6 seg
      setTimeout(loop, initialDelay);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Image source={require('../assets/fondo_dark.png')} style={styles.background} resizeMode="cover" />
      {anims.map((anim, idx) => (
        <Animated.View
          key={idx}
          style={{
            width: sizes[idx] || 120,
            height: sizes[idx] || 120,
            borderRadius: (sizes[idx] || 120) / 2,
            backgroundColor: circlesConfig[idx].color,
            position: 'absolute',
            transform: [{ translateX: anim.x }, { translateY: anim.y }],
            opacity: opacities[idx],
          }}
        />
      ))}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  background: {
    position: 'absolute',
    width: width + 40,
    height,
    top: 0,
    left: -20,
  },
});
