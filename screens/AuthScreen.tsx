import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Button, ActivityIndicator, Dimensions, Platform } from "react-native";
import { NativeStackNavigationProp, NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import * as WebBrowser from "expo-web-browser";
import { emailAuth, googleAuth } from "../services/auth";
import { makeRedirectUri } from "expo-auth-session";
import { useNavigation } from "@react-navigation/native";
import AppBackground from "../components/AppBackground";
import { useToast } from "../hooks/useToast";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";
import * as Google from "expo-auth-session/providers/google";
import Boton from "../components/Boton";
import { LinearGradient } from "expo-linear-gradient";

WebBrowser.maybeCompleteAuthSession(); // Necesario para Expo Go

type Props = NativeStackScreenProps<RootStackParamList, "Auth">;
type AuthScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Auth'>;

const { width: screenWidth } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const maxContainerWidth = 600; // ancho máximo para web

export default function AuthScreen({ route }: Props) {
    const { mode } = route.params;
    const [name, setName] = useState(""); // solo para registro
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState(""); // nuevo para registro
    const [loadingGoogle, setLoadingGoogle] = useState(false);

    const { setUser, setIsLoggedIn } = useAuth();
    const [loading, setLoading] = useState(false); // <- nuevo estado
    const navigation = useNavigation<AuthScreenNavigationProp>();
    const insets = useSafeAreaInsets(); // gets safe top, bottom, left, right insets

    const { showSuccess, showError } = useToast();

    const [request, response, promptAsync] = Google.useAuthRequest({
        iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
        androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
        webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
        redirectUri: makeRedirectUri({ scheme: 'com.goalplanning.ia' }),
    });

    useEffect(() => {
        if (response?.type === "success") {
            const { access_token } = response.params;
            googleAuth(access_token)
                .then(async (data) => {
                    setUser({ name: data.name, email: data.email });
                    setIsLoggedIn(true);
                    showSuccess("Login successful", "You are logged in via Google");
                    navigation.navigate("Home");
                })
                .catch(err => showError("Error", err.message));
        } else if (response?.type === "error") {
            showError("Login cancelled", "Google login was cancelled or failed");
        }
        setLoadingGoogle(false);
    }, [response]);

    const handleEmailAuth = async () => {
        if (!email || !password || (mode === "register" && !name)) {
            return showError("Error", "Por favor completa todos los campos");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return showError("Error", "Email inválido");
        if (mode === "register" && password !== confirmPassword)
            return showError("Error", "Las contraseñas no coinciden");

        setLoading(true);
        try {
            const payload = mode === "register"
                ? { name, email, password }
                : { email, password };

            const data = await emailAuth(payload, mode);

            // ✅ Actualizamos el contexto en vez de AsyncStorage directamente
            setUser({ name: data.name, email: data.email });
            setIsLoggedIn(true);

            showSuccess(
                mode === "login" ? "Login successful" : "Registration successful",
                mode === "login" ? "You have logged in" : "User registered successfully"
            );

            navigation.goBack();
        } catch (err: any) {
            showError("Error", err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppBackground>
            <SafeAreaView style={[{ paddingTop: insets.top, flex: 1 }]}>
                <View style={styles.container}>
                    <Text style={styles.title}>{mode === "login" ? "Login" : "Registro"}</Text>

                    {mode === "register" && (
                        <TextInput
                            placeholder="Name"
                            style={styles.input}
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                            placeholderTextColor={'#fff'}
                        />
                    )}

                    <TextInput
                        placeholder="Email"
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholderTextColor={'#fff'}
                    />
                    <TextInput
                        placeholder="Password"
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholderTextColor={'#fff'}
                    />

                    {mode === "register" && (
                        <TextInput
                            placeholder="Repeat Password"
                            style={styles.input}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            placeholderTextColor={'#fff'}
                        />
                    )}

                    <Boton
                        title={mode === "login" ? "Login" : "Register"}
                        onPress={handleEmailAuth}
                        disabled={loading} // evita múltiples clicks
                        loading={loading} // muestra indicador de carga
                        style={{ marginTop: 20 }}
                    />

                    <TouchableOpacity
                        onPress={async () => {
                            setLoadingGoogle(true);
                            await promptAsync();
                        }}
                        disabled={!request || loadingGoogle}
                        activeOpacity={0.9}
                        style={styles.googleButton}
                    >
                        <LinearGradient
                            colors={['#FF4B2B', '#FF416C']} // gradiente rojo Google
                            start={[0, 0]}
                            end={[1, 1]}
                            style={{
                                borderRadius: 12,
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'row',
                                marginTop: 10,
                                paddingVertical: 16,
                            }}
                        >
                            {loadingGoogle ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                                    {mode === 'register' ? 'Register' : 'Login'} with Google
                                </Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() =>
                            navigation.navigate('Auth', { mode: mode === 'login' ? 'register' : 'login' })
                        }
                        style={{ marginTop: 15 }}
                    >
                        <Text style={{ color: '#fff', textAlign: 'center' }}>
                            {mode === 'login'
                                ? "Don't have an account? Register"
                                : "Already have an account? Login"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </AppBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: isWeb ? Math.min(screenWidth, maxContainerWidth) : '100%',
        alignSelf: 'center'
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 20,
        alignSelf: "center"
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        color: "#fff",
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
        width: '100%',
        maxWidth: isWeb ? 600 : undefined, // limita ancho en web
        alignSelf: isWeb ? 'center' : 'stretch',
    },
    button: {
        backgroundColor: "#2575fc",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
        width: '100%',
        maxWidth: isWeb ? 600 : undefined,
        alignSelf: isWeb ? 'center' : 'stretch',
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold"
    },
    googleButton: {
        width: '100%',
        maxWidth: isWeb ? 600 : undefined,
        alignSelf: isWeb ? 'center' : 'stretch',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8
    },
    googleButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        textAlign: 'center'
    },
});
