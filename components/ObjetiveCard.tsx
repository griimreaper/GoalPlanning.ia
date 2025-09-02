import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Linking, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { GoalDetail, Objective, reviewObjective, updateObjectiveStatus } from '../services/goals';
import ObjectiveUpdateWizard from './ObjetiveUpdateWizard';
import { useQueryClient } from '@tanstack/react-query';
import { Platform } from 'react-native';

const { width, height } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.65;

const isWeb = Platform.OS === 'web';
const ITEM_WIDTH_WEB = 400; // ancho fijo para web
const ITEM_WIDTH_MOBILE = width * 0.65;
const DESCRIPTION_MAX_HEIGHT = height * 0.3; // hasta 40% de la pantalla
const ITEM_WIDTH_FINAL = isWeb ? ITEM_WIDTH_WEB : ITEM_WIDTH_MOBILE;

const MAX_CARD_HEIGHT = height * 0.7; // 90% de la altura de la pantalla
interface Props {
    objective: Objective;
    scrollX: Animated.Value;
    index: number;
    goal_id: number;
    style?: object;
}

const ObjectiveCard: React.FC<Props> = ({ objective, scrollX, index, goal_id, style }) => {
    const [wizardVisible, setWizardVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const queryClient = useQueryClient();

    const handleUpdate = async (data: any) => {
        if (!objective) return;

        setLoading(true);
        setWizardVisible(false);

        try {
            const updatedObjective = await reviewObjective(goal_id, objective.id, data);

            queryClient.setQueryData<GoalDetail>(['goalDetail', goal_id], (oldData) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    objectives: oldData.objectives.map(obj =>
                        obj.id === updatedObjective.id ? updatedObjective : obj
                    ),
                };
            });

        } catch (err) {
            console.error("❌ Error updating objective:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleChangeStatus = async (objective: Objective, newStatus: string) => {
        try {
            setLoading(true);
            await updateObjectiveStatus(goal_id, objective.id, { status: newStatus });

            // Actualizar cache de React Query
            queryClient.setQueryData<GoalDetail>(['goalDetail', goal_id], (oldData) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    objectives: oldData.objectives.map(obj =>
                        obj.id === objective.id ? { ...obj, status: newStatus } : obj
                    ),
                };
            });
        } catch (error) {
            console.error("Failed to update status", error);
        } finally {
            setLoading(false);
        }
    };

    const getItemStyle = (objective: Objective) => {
        const now = new Date();
        const scheduledDate = objective.scheduled_at ? new Date(objective.scheduled_at) : null;

        // Pending + fecha no pasó → default
        if (objective.status === 'pending' && scheduledDate && scheduledDate > now) {
            return { backgroundColor: 'rgba(255,255,255,0.1)', borderColor: '#ccc', borderWidth: 2 };
        }

        switch (objective.status) {
            case 'completed':
                return { backgroundColor: 'rgba(40,167,69,0.2)', borderColor: '#28a745', borderWidth: 2 };
            case 'pending':
                return { backgroundColor: 'rgba(255,193,7,0.2)', borderColor: '#ffc107', borderWidth: 2 };
            case 'cancelled':
                return { backgroundColor: 'rgba(220,53,69,0.2)', borderColor: '#dc3545', borderWidth: 2 };
            default:
                return { backgroundColor: 'rgba(255,255,255,0.1)' };
        }
    };

    const statusShortLabel: Record<string, string> = {
        pending: 'P',
        completed: '✔',   // check mark
        cancelled: '✖',   // cross mark
    };

    const inputRange = [
        (index - 1) * ITEM_WIDTH,
        index * ITEM_WIDTH,
        (index + 1) * ITEM_WIDTH
    ];

    const scale = scrollX.interpolate({
        inputRange,
        outputRange: [0.8, 1, 0.8],
        extrapolate: 'clamp'
    });

    return (
        <Animated.View style={[styles.itemContainer, style, getItemStyle(objective), { transform: !isWeb ? [{ scale }] : [] }]}>
            {loading && (
                <View style={styles.loaderOverlay}>
                    <ActivityIndicator size="large" color="#fff" />
                </View>
            )}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
            >
                {/* Contenido principal */}
                <View style={{ flex: 1 }}>
                    {objective.scheduled_at && (
                        <View style={styles.itemDeadlineContainer}>
                            <Text style={styles.itemDeadlineDate}>
                                {new Date(objective.scheduled_at).toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
                            </Text>
                            <Text style={styles.itemDeadlineTime}>
                                {new Date(objective.scheduled_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>
                    )}

                    <View style={{ height: DESCRIPTION_MAX_HEIGHT, marginBottom: 10 }}>
                        <ScrollView showsVerticalScrollIndicator={true}>
                            <Text style={styles.title}>{objective.title}</Text>
                            <Text style={styles.itemDescription}>{objective.description}</Text>
                        </ScrollView>
                    </View>

                </View>

                {/* Botones al final */}
                <View style={{ marginTop: 10, gap: 10, alignItems: 'center', height: 200, justifyContent: 'flex-end' }}>
                    {objective.youtube_links && (
                        <TouchableOpacity
                            style={styles.youtubeButton}
                            onPress={() => Linking.openURL(objective.youtube_links)}
                            activeOpacity={0.8}
                        >
                            <MaterialIcons name="play-circle-fill" size={20} color="#FF0000" style={{ marginRight: 8 }} />
                            <Text style={styles.youtubeButtonText}>Watch on YouTube</Text>
                        </TouchableOpacity>
                    )}
                    {/* Badge */}
                    <View style={[styles.statusBadge, getItemStyle(objective), { marginTop: objective.youtube_links ? 0 : 50 }]}>
                        <Text style={styles.statusBadgeText}>{objective.status.toUpperCase()}</Text>
                    </View>

                    {/* Botones de estado */}
                    <View style={styles.statusButtons}>
                        {['pending', 'completed', 'cancelled'].map((statusOption) => (
                            <TouchableOpacity
                                key={statusOption}
                                style={[
                                    styles.statusButton,
                                    objective.status === statusOption && { borderWidth: 2, borderColor: '#fff' },
                                    { backgroundColor: getItemStyle(objective).backgroundColor }
                                ]}
                                onPress={() => handleChangeStatus(objective, statusOption)}
                            >
                                <Text style={styles.statusButtonText}>
                                    {statusShortLabel[statusOption]}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Sección de actualización */}
                    <View style={{ marginTop: 'auto', alignItems: 'center', gap: 6 }}>
                        <Text style={{ color: '#fff', fontSize: 13, textAlign: 'center' }}>
                            Have a problem with this objective?
                        </Text>

                        <TouchableOpacity
                            style={[styles.updateButton, { paddingVertical: 8, paddingHorizontal: 16 }]}
                            onPress={() => setWizardVisible(true)}
                            disabled={loading} // desactiva si está cargando
                        >
                            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>
                                Update Objective
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            <ObjectiveUpdateWizard
                visible={wizardVisible}
                onClose={() => setWizardVisible(false)}
                objectiveDescription={objective.description}
                onSubmit={handleUpdate}
            />

        </Animated.View>
    );
};

const styles = StyleSheet.create({
    itemContainer: { width: ITEM_WIDTH, marginHorizontal: 0, borderRadius: 15, marginTop: 20, backgroundColor: 'rgba(255,255,255,0.1)', padding: 16, alignSelf: 'flex-start', flexShrink: 1, minHeight: isWeb ? 450 : 300, maxHeight: MAX_CARD_HEIGHT },
    itemDeadlineContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 6 },
    itemDeadlineDate: { fontWeight: 'bold', textTransform: 'capitalize', fontSize: 14, color: '#FFD700' },
    itemDeadlineTime: { fontWeight: 'bold', fontSize: 14, color: '#FFD700' },
    title: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 4, textAlign: 'center' },
    itemDescription: { fontSize: 14, color: '#fff', lineHeight: 18, marginBottom: 8 },
    youtubeButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#222', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 6, marginBottom: 8, alignSelf: 'center' },
    youtubeButtonText: { color: '#FF0000', fontWeight: 'bold', fontSize: 13 },
    statusBadge: { paddingVertical: 3, paddingHorizontal: 8, borderRadius: 10, marginBottom: 6, minWidth: 70, alignItems: 'center' },
    statusBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 11, textAlign: 'center' },
    statusButtons: { flexDirection: 'row', justifyContent: 'center', gap: 6, flexWrap: 'wrap' },
    statusButton: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, minWidth: 32, alignItems: 'center', marginBottom: 4 },
    statusButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
    updateButton: { backgroundColor: '#2575fc', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, alignSelf: 'center', marginVertical: 8 },
    updateButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
    loaderOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 10, borderRadius: 15 },
});


export default ObjectiveCard;