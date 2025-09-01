import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, Animated, ActivityIndicator, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface BotonProps {
    title: string;
    onPress: () => void;
    style?: ViewStyle;
    textStyle?: TextStyle;
    disabled?: boolean;
    loading?: boolean;
}

export default function Boton({ title, onPress, style, textStyle, disabled, loading }: BotonProps) {
    const scale = React.useRef(new Animated.Value(1)).current;
    const isWeb = Platform.OS === 'web';

    const handlePressIn = () => {
        Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
    };

    return (
        <Animated.View style={{ transform: [{ scale }], alignSelf: 'stretch' }}>
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled || loading}
                activeOpacity={0.9}
            >
                <LinearGradient
                    colors={['#6a11cb', '#2575fc']}
                    start={[0, 0]}
                    end={[1, 1]}
                    style={[styles.boton, style, (disabled || loading) && styles.disabled]}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text style={[styles.texto, textStyle]}>{title}</Text>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    boton: {
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    texto: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    disabled: { opacity: 0.5 },
});
