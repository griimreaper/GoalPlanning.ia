import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, ImageBackground, Image, Platform } from 'react-native';
import Boton from '../components/Boton';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import AppBackground from '../components/AppBackground';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceEventEmitter } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const isWeb = Platform.OS === 'web';
const screenWidth = Dimensions.get('window').width;
const buttonWidth = isWeb ? 300 : 250;

export default function HomeScreen({ navigation }: Props) {
  const { isLoggedIn } = useAuth();

  const handleGetStarted = () => {
    if (isLoggedIn) navigation.navigate('CrearMeta');
    else navigation.navigate('Auth', { mode: 'login' });
  };

  return (
    <AppBackground>
      <View style={styles.container}>
        <Image
          source={require('../assets/goalicon.png')}
          style={{ width: 100, height: 100 }}
          resizeMode="contain" />
        <Text style={styles.title}>GoalPlanning.IA</Text>

        <View style={styles.slogansContainer}>
          <Text style={styles.slogan}>Do you have a goal?</Text>
          <Text style={styles.slogan}>We have a plan!</Text>
        </View>

        <Text style={styles.description}>
          Organize your goals and achieve your objectives with ease. Start planning your future today!
        </Text>

        <View style={styles.buttonsContainer}>
          <Boton title="Get Started" onPress={handleGetStarted} style={{ width: 250, marginBottom: 20, alignSelf: 'center' }} />

          {isLoggedIn && (
            <Boton title="My Goals" onPress={() => navigation.navigate('Metas')} style={{ width: 250, marginBottom: 20, alignSelf: 'center' }} />
          )}
        </View>
      </View>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 42, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginTop: 0, marginBottom: 40},
  slogansContainer: { alignItems: 'center', marginVertical: 10 },
  slogan: { fontSize: 26, fontWeight: '600', color: '#fff', textAlign: 'center', marginVertical: 2},
  description: { fontSize: 20, color: '#fff', textAlign: 'center', marginVertical: 20 },
  buttonsContainer: { width: '100%', alignItems: 'center', marginBottom: 30 },
});