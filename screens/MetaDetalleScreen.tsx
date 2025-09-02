import React, { useEffect, useRef } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions, Animated, ActivityIndicator, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { GoalDetail, getGoalDetail } from '../services/goals';
import AppBackground from '../components/AppBackground';
import { useQuery } from '@tanstack/react-query';
import ObjectiveCard from '../components/ObjetiveCard';
import ExtendsGoalButton from '../components/ExtendsGoalButton';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.65; // item width

const isWeb = Platform.OS === 'web';
const maxContainerWidth = 600;

export default function GoalDetailScreen() {
    const route = useRoute();
    const { goal_id } = route.params as { goal_id: number };
    const insets = useSafeAreaInsets(); // gets safe top, bottom, left, right insets
    const scrollX = useRef(new Animated.Value(0)).current;

    const listRef = useRef<FlatList<any>>(null); // ref para FlatList

    const { data: goal, isLoading, isError } = useQuery<GoalDetail>({
        queryKey: ['goalDetail', goal_id],
        queryFn: () => getGoalDetail(goal_id),
        staleTime: 1000 * 60 * 5,
    });

    // 2️⃣ Hacer scroll al objetivo de hoy cuando ya hay datos
    useEffect(() => {
        if (!goal || goal.objectives.length === 0) return;

        const todayIndex = goal.objectives.findIndex(obj => {
            const objDate = new Date(obj.scheduled_at);
            const today = new Date();
            return objDate.getFullYear() === today.getFullYear() &&
                objDate.getMonth() === today.getMonth() &&
                objDate.getDate() === today.getDate();
        });

        if (todayIndex !== -1 && listRef.current) {
            setTimeout(() => {
                const offset = todayIndex * ITEM_WIDTH;
                listRef.current?.scrollToOffset({ offset, animated: true });
            }, 100); // pequeño delay para asegurar que FlatList ya renderizó
        }
    }, [goal]); // ⚡ se ejecuta solo cuando `goal` cambia

    if (isLoading) {
        return (
            <AppBackground>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#fff" />
                </View>
            </AppBackground>
        );
    }

    if (isError || !goal) {
        return (
            <AppBackground>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#fff' }}>Goal not found</Text>
                </View>
            </AppBackground>
        );
    }

    return (
        <AppBackground>
            <SafeAreaView style={[styles.background, { paddingTop: isWeb ? 50 : insets.top }]}>
                <Text style={styles.title}>{goal.title}</Text>
                <Text style={styles.subtitle}>Availability: {goal.availability}</Text>
                <Text style={styles.subtitle}>Deadline: {goal.deadline}</Text>

                {isWeb ? (
                    <View style={[styles.webScrollContainer]}>
                        <ScrollView
                            horizontal
                            contentContainerStyle={{ paddingHorizontal: 20 }}
                            showsHorizontalScrollIndicator={true}
                            showsVerticalScrollIndicator={false} // aunque no tiene efecto real en RN Web
                        >
                            {goal.objectives.map((item, index) => (
                                <ObjectiveCard
                                    key={item.id}
                                    objective={item}
                                    index={index}
                                    goal_id={goal_id}
                                    scrollX={scrollX}
                                    style={styles.webCard} // ancho fijo
                                />
                            ))}
                            <ExtendsGoalButton goal_id={goal_id} style={styles.webCard} />
                        </ScrollView>
                    </View>
                ) : (
                    <Animated.FlatList
                        horizontal
                        data={goal.objectives}
                        ref={listRef}
                        keyExtractor={(item) => item.id.toString()}
                        showsHorizontalScrollIndicator={false}
                        snapToInterval={ITEM_WIDTH}
                        decelerationRate="fast"
                        bounces={true}
                        contentContainerStyle={{ paddingHorizontal: (width - ITEM_WIDTH) / 2 }}
                        onScroll={Animated.event(
                            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                            { useNativeDriver: true }
                        )}
                        renderItem={({ item, index }) => (
                            <ObjectiveCard
                                objective={item}
                                index={index}
                                scrollX={scrollX}
                                goal_id={goal_id}
                            />
                        )}
                        ListFooterComponent={() => (
                            <ExtendsGoalButton goal_id={goal_id} style={styles.webCard} />
                        )}
                    />
                )}

            </SafeAreaView>
        </AppBackground >
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: '#1E1E1E',
        width: '100%',
    },
    container: {
        width: '100%',
        maxWidth: maxContainerWidth,
        paddingHorizontal: 20,
        alignSelf: 'center',
    },
    title: {
        fontSize: isWeb ? 32 : 26,
        fontWeight: 'bold',
        color: '#fff',
        marginVertical: 16,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: isWeb ? 18 : 16,
        color: '#ccc',
        marginBottom: 12,
        textAlign: 'center',
    },
    itemContainer: {
        width: ITEM_WIDTH,
        borderRadius: 15,
        marginTop: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 16,
        alignSelf: 'flex-start',
        flexShrink: 1,
        minHeight: 300,
        overflow: 'visible', // importante para que la animación de escala no se corte
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    webScrollContainer: {
        overflow: 'hidden',       // permite scroll horizontal
        paddingVertical: 20,
        display: 'flex',
        paddingHorizontal: 20,    // opcional, para que no pegue al borde
    },
    webRow: {
        flexDirection: 'row',
        gap: 20,
        paddingHorizontal: 20,
    },
    webCard: {
        width: isWeb ? 350 : 300,              // ancho fijo de cada card
        flexShrink: 0,           // evita que se reduzca al caber
        marginRight: isWeb ? 20 : 0,
    },
});