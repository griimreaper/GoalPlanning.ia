// CreateGoalScreen.tsx (solo el archivo completo actualizado)
import React, { useEffect, useState } from 'react';
import {
    View, Text, TextInput, KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator,
    Dimensions, TouchableOpacity, Switch, Alert, ScrollView
} from 'react-native';
import Boton from '../components/Boton';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AppBackground from '../components/AppBackground';
import { createGoal, NewGoal } from '../services/goals';
import CountrySelector from '../components/CountrySelector';

type CreateGoalScreenNavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    "CrearMeta"
>;

const { width: screenWidth } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const maxContainerWidth = 600;

export default function CreateGoalScreen() {
    const [goal, setGoal] = useState<string>('');
    const [availability, setAvailability] = useState<string>('');
    const [deadlineDays, setDeadlineDays] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const navigation = useNavigation<CreateGoalScreenNavigationProp>();

    // country selector state (nuevo)
    const [locationCountry, setLocationCountry] = useState<{ code: string; name: string } | null>(null);

    // New fields
    const [level, setLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
    const [formats, setFormats] = useState<string[]>(['Video']); // e.g. "Video", "Exercises"
    const [sessionLength, setSessionLength] = useState<string>('30'); // minutes
    const [focus, setFocus] = useState<'Depth' | 'Breadth' | 'Speed'>('Depth');
    const [language, setLanguage] = useState<'es' | 'en'>('es');
    const [checkpointsWeekly, setCheckpointsWeekly] = useState<boolean>(true);

    const toggleFormat = (f: string) => {
        setFormats(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
    };

    const addGoal = async () => {
        // Basic validation
        if (!goal.trim() || !availability.trim() || !deadlineDays.trim()) {
            setError('Please fill in all required fields');
            return;
        }

        const plazo = Number(deadlineDays);
        if (isNaN(plazo) || plazo <= 0) {
            setError('Deadline must be a number greater than 0');
            return;
        }

        const sessionMin = Number(sessionLength);
        if (isNaN(sessionMin) || sessionMin <= 0) {
            setError('Session length must be a number greater than 0');
            return;
        }

        setError('');

        // Build payload matching your JSON example + location.country
        const newGoal: NewGoal = {
            meta: goal,
            plazo_dias: plazo,
            disponibilidad: availability,
            level,
            formats,
            session_length: sessionMin,
            focus,
            language,
            checkpoints: checkpointsWeekly ? "weekly" : "none",
            location: locationCountry ? {
                country: {
                    code: locationCountry.code,
                    name: locationCountry.name
                }
            } : null,
        };

        setLoading(true);
        try {
            const createdGoal = await createGoal(newGoal);
            navigation.navigate("MetaDetalle", { goal_id: createdGoal.goal_id });
        } catch (e: any) {
            console.error(e);
            setError(e?.message || 'Error creating goal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppBackground>
            <ScrollView contentContainerStyle={{ flexGrow: 1, marginTop: 20 }}>
                <View style={styles.background}>
                    <KeyboardAvoidingView
                        style={styles.container}
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    >
                        <Text style={styles.title}>Create Goal</Text>

                        <Text style={styles.label}>Goal</Text>
                        <TextInput
                            style={[styles.input, styles.inputMultiline]}
                            placeholder="Describe your goal with all the details you want"
                            placeholderTextColor="#ccc"
                            value={goal}
                            onChangeText={setGoal}
                            multiline
                        />

                        <Text style={styles.label}>Daily Availability</Text>
                        <TextInput
                            style={[styles.input, styles.inputMultiline]}
                            placeholder="Ex: Mon-Fri 19:00-21:00"
                            placeholderTextColor="#ccc"
                            value={availability}
                            onChangeText={setAvailability}
                            multiline
                        />

                        <Text style={styles.label}>Deadline (days)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Days to achieve your goal"
                            placeholderTextColor="#ccc"
                            value={deadlineDays}
                            onChangeText={setDeadlineDays}
                            keyboardType="numeric"
                        />

                        <Text style={[styles.sectionTitle]}>Level</Text>
                        <View style={styles.row}>
                            {['Beginner', 'Intermediate', 'Advanced'].map(opt => (
                                <TouchableOpacity
                                    key={opt}
                                    style={[styles.segmentButton, level === opt && styles.segmentButtonActive]}
                                    onPress={() => setLevel(opt as any)}
                                >
                                    <Text style={[styles.segmentText, level === opt && styles.segmentTextActive]}>{opt}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={[styles.sectionTitle]}>Formats (select one or more)</Text>
                        <View style={styles.row}>
                            {['Video', 'Exercises'].map(opt => (
                                <TouchableOpacity
                                    key={opt}
                                    style={[styles.chip, formats.includes(opt) && styles.chipActive]}
                                    onPress={() => toggleFormat(opt)}
                                >
                                    <Text style={[styles.chipText, formats.includes(opt) && styles.chipTextActive]}>{opt}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>Session length (minutes)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. 30"
                            placeholderTextColor="#ccc"
                            value={sessionLength}
                            onChangeText={setSessionLength}
                            keyboardType="numeric"
                        />

                        <Text style={[styles.sectionTitle]}>Focus</Text>
                        <View style={styles.row}>
                            {['Depth', 'Breadth', 'Speed'].map(opt => (
                                <TouchableOpacity
                                    key={opt}
                                    style={[styles.radio, focus === opt && styles.radioActive]}
                                    onPress={() => setFocus(opt as any)}
                                >
                                    <Text style={[styles.radioText, focus === opt && styles.radioTextActive]}>{opt}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={[styles.sectionTitle]}>Language</Text>
                        <View style={styles.row}>
                            {['es', 'en'].map(opt => (
                                <TouchableOpacity
                                    key={opt}
                                    style={[styles.segmentButton, language === opt && styles.segmentButtonActive]}
                                    onPress={() => setLanguage(opt as any)}
                                >
                                    <Text style={[styles.segmentText, language === opt && styles.segmentTextActive]}>{opt.toUpperCase()}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={[styles.row, { marginTop: 12, alignItems: 'center' }]}>
                            <Text style={{ color: '#fff', marginRight: 10 }}>Checkpoints (weekly)</Text>
                            <Switch
                                value={checkpointsWeekly}
                                onValueChange={setCheckpointsWeekly}
                            />
                        </View>

                        {/* Country selector integrado */}
                        <CountrySelector
                            value={locationCountry?.code as any}
                            name={locationCountry?.name ?? null}
                            onChange={(c: any) => setLocationCountry(c)}
                        />

                        {error ? <Text style={styles.errorText}>{error}</Text> : null}

                        <Boton
                            title={loading ? 'Saving...' : 'Add Goal'}
                            onPress={addGoal}
                            style={{ marginTop: 24, marginBottom: 50 }}
                            disabled={loading}
                        />
                    </KeyboardAvoidingView>

                    {loading && (
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator size="large" color="#fff" />
                        </View>
                    )}
                </View>
            </ScrollView>
        </AppBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        alignItems: 'center',
        justifyContent: isWeb ? 'flex-start' : 'center',
        paddingTop: isWeb ? 40 : 0,
    },
    container: {
        width: isWeb ? Math.min(screenWidth, maxContainerWidth) : '90%',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: isWeb ? 20 : 50,
        paddingBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 20,
        textAlign: 'center'
    },
    label: {
        width: '100%',
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 5
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#fff',
        backgroundColor: 'rgba(255,255,255,0.08)',
        color: '#fff',
        padding: 12,
        borderRadius: 10,
        marginBottom: 10
    },
    inputMultiline: {
        minHeight: 60,
        textAlignVertical: 'top'
    },
    sectionTitle: {
        width: '100%',
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
        marginTop: 12,
        marginBottom: 8
    },
    row: {
        width: '100%',
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10,
    },
    segmentButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#444'
    },
    segmentButtonActive: {
        backgroundColor: '#28a745'
    },
    segmentText: { color: '#fff', fontWeight: '600' },
    segmentTextActive: { color: '#fff' },
    chip: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: '#333'
    },
    chipActive: {
        backgroundColor: '#1e7a34'
    },
    chipText: { color: '#fff' },
    chipTextActive: { color: '#fff' },
    radio: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#444'
    },
    radioActive: { backgroundColor: '#28a745' },
    radioText: { color: '#fff', fontWeight: '600' },
    radioTextActive: { color: '#fff' },

    errorText: {
        color: 'red',
        marginBottom: 10,
        fontWeight: '600'
    },
    loaderContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center'
    },
});
