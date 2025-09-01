// components/UserMenu.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet, Platform } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { useToast } from "../hooks/useToast";
import { useAuth } from "../contexts/AuthContext";
import Boton from "./Boton";

const isWeb = Platform.OS === 'web';
const maxContainerWidth = 400;

export default function UserMenu() {
    const { user, setUser, setIsLoggedIn } = useAuth();
    const [modalVisible, setModalVisible] = useState(false);
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { showSuccess, showError } = useToast();

    const handleLogin = () => {
        setModalVisible(false);
        navigation.navigate("Auth", { mode: "login" });
    };

    const handleRegister = () => {
        setModalVisible(false);
        navigation.navigate("Auth", { mode: "register" });
    };

    const handleLogout = async () => {
        try {
            setUser(null);
            setIsLoggedIn(false);
            setModalVisible(false);
            showSuccess("Logged out", "You have successfully logged out");
            navigation.navigate("Home");
        } catch (err: any) {
            showError("Error", err.message);
        }
    };

    return (
        <View>
            <TouchableOpacity onPressIn={() => setModalVisible(true)}>
                {user ? (
                    <Text style={styles.userName}>{user.name}</Text>
                ) : (
                    <Ionicons name="person-circle-outline" size={42} color="white" />
                )}
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, isWeb && { maxWidth: maxContainerWidth }]}>
                        <Text style={styles.title}>{user ? "Cuenta" : "Acceso"}</Text>

                        {!user ? (
                            <>
                                <Boton title='Login' style={styles.button} onPress={handleLogin} />
                                <Boton title='Register' style={styles.button} onPress={handleRegister} />
                            </>
                        ) : (
                            <Boton title='Logout' style={styles.button} onPress={handleLogout} />
                        )}

                        <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.buttonText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal >
        </View >
    );
}

const styles = StyleSheet.create({
    modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.37)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: "#222", borderRadius: 12, padding: 20, width: "80%", alignItems: "center" },
    title: { fontSize: 20, marginBottom: 20, fontWeight: "bold", color: "#fff" },
    button: { alignSelf: 'stretch', minWidth: "100%", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, marginTop: 10, alignItems: "center" },
    cancelButton: { backgroundColor: "#555" },
    buttonText: { color: "#fff", fontWeight: "bold" },
    userName: { color: "#fff", fontSize: 18, marginRight: 12, fontWeight: "bold" },
});
