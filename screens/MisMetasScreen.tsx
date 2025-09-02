import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Vibration, Platform, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { deleteGoal, getGoals } from '../services/goals';
import AppBackground from '../components/AppBackground';
import { useToast } from '../hooks/useToast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Boton from '../components/Boton';

interface GoalItem {
    id: number;
    title: string;
    deadline_days: number;
    availability: string;
    state: string;
}

const { width: screenWidth } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const maxContainerWidth = 600; // ancho máximo para web

export default function MyGoalsScreen() {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets(); // gets safe top, bottom, left, right insets
    const [selectedGoal, setSelectedGoal] = useState<GoalItem | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const { showError } = useToast();
    const queryClient = useQueryClient();
    // Carga metas con cache + persistencia
    const { data: goals = [], isLoading } = useQuery({
        queryKey: ['metas'],
        queryFn: getGoals,
    });

    // Mutación para eliminar
    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteGoal(id),
        onSuccess: (_, id) => {
            // actualiza la cache después de eliminar
            queryClient.setQueryData(['metas'], (old: any) =>
                old.filter((g: any) => g.id !== id)
            );
            setModalVisible(false);
            setSelectedGoal(null);
        },
        onError: () => {
            showError('Error', 'No se pudo eliminar la meta');
        },
    });

    const handleDelete = () => {
        if (!selectedGoal) return;
        deleteMutation.mutate(selectedGoal.id);
    };

    return (
        <AppBackground>
            <SafeAreaView style={[styles.container, { paddingTop: isWeb ? 50 : insets.top + 20 }]}>

                <View style={[styles.container]}>
                    <Text style={styles.title}>My Goals</Text>
                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <Text style={styles.loadingText}>Loading goals...</Text>
                        </View>
                    ) : goals.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No goals yet. Create your first one!</Text>
                        </View>
                    ) : (
                        <View style={styles.scrollContainer}>
                            <FlatList
                                data={goals}
                                keyExtractor={(item) => item.id.toString()}
                                contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 10 }} // espacio para que no choque con el botón
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.goalCard}
                                        onPress={() => {
                                            if (!modalVisible) {
                                                navigation.navigate('MetaDetalle', { goal_id: item.id });
                                            }
                                        }}
                                        onLongPress={() => {
                                            Vibration.vibrate(50);
                                            setSelectedGoal(item);
                                            setModalVisible(true);
                                        }}
                                        delayLongPress={200} // más natural que 50ms
                                    >
                                        <Text style={styles.goalTitle}>{item.title}</Text>
                                        <Text style={styles.hint}>Hold to delete</Text>
                                        <View style={styles.progressBarBackground}>
                                            <View style={[styles.progressBarForeground, { width: `${item.progress_percentage}%` }]} />
                                        </View>
                                        <Text style={styles.progressText}>{item.progress_percentage}% completed</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    )}
                    <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
                        <Boton title="+ Create Goal" onPress={() => navigation.navigate('CrearMeta')} />
                        {/* Overlay transparente para “ocultar” metas detrás del botón */}
                        <View style={styles.buttonOverlay} />
                    </View>

                    {/* Modal de opciones */}
                    <Modal
                        visible={modalVisible}
                        transparent
                        animationType="fade"
                        onRequestClose={() => setModalVisible(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Are You Sure?</Text>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.deleteButton]}
                                    onPress={handleDelete}
                                >
                                    <Text style={styles.modalButtonText}>Delete</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                                    <Text style={styles.modalButtonText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                </View>
            </SafeAreaView>
        </AppBackground>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
        height: '100%',
        justifyContent: isWeb ? 'center' : 'flex-start',
        alignSelf: 'center',
        width: isWeb ? Math.min(screenWidth, maxContainerWidth) : '100%',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
        textAlign: 'center'
    },
    goalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333'
    },
    hint: {
        fontSize: 12,
        color: '#999',
        marginTop: 4
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '100%'
    },
    emptyText: {
        fontSize: 16,
        color: '#ccc',
        textAlign: 'center'
    },
    scrollContainer: {
        flex: 1,
        maxHeight: isWeb ? null : 500, // altura máxima que quieras para la lista
        overflow: 'hidden', // recorta los elementos que sobrepasen
        width: '100%',
    },
    goalCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        width: '100%',
    },
    progressBarBackground: {
        height: 6,
        backgroundColor: '#eee',
        borderRadius: 3,
        marginTop: 8,
        overflow: 'hidden',
    },
    progressBarForeground: {
        height: '100%',
        backgroundColor: '#28a745',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        padding: 20,
        alignItems: 'center',
    },

    buttonOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 70, // igual al tamaño del botón + margen
        backgroundColor: 'transparent',
        zIndex: 1, // para que quede sobre las metas
    },
    addButton: {
        backgroundColor: '#2575fc',
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        width: isWeb ? 200 : '100%'
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContent: {
        backgroundColor: '#222',
        padding: 20,
        borderRadius: 12,
        width: isWeb ? 400 : '80%',
        maxWidth: isWeb ? 400 : '80%',
        alignItems: 'center'
    },
    modalTitle: {
        fontSize: 20,
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center'
    },
    modalButton: {
        backgroundColor: '#2575fc',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
        marginBottom: 10
    },
    deleteButton: { backgroundColor: '#FF0000' },
    cancelButton: { backgroundColor: '#555' },
    modalButtonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
    loadingContainer: { flex: 1, justifyContent: 'flex-start', alignItems: 'center' },
    loadingText: { color: '#fff', fontSize: 16 },
    progressText: {
        fontSize: 12,
        color: '#666',
        marginTop: 4
    }
});