import { useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, TextInput, Platform, Dimensions } from 'react-native';
import { extendGoal, GoalDetail } from '../services/goals';

interface Props {
    visible: boolean;
    goal_id: number;
    onClose: () => void;
    setParentLoading: (value: boolean) => void;
    setWizardVisible: (value: boolean) => void;
}

const isWeb = Platform.OS === 'web';
const { width: screenWidth } = Dimensions.get('window');
const maxModalWidth = 500;

const ExtendGoalWizard: React.FC<Props> = ({ visible, onClose, goal_id, setParentLoading, setWizardVisible }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [stepData, setStepData] = useState<{ [key: string]: string }>({});
    const [comment, setComment] = useState('');
    const queryClient = useQueryClient();

    const handleOptionSelect = (key: string, value: string) => {
        setStepData(prev => ({ ...prev, [key]: value }));
    };

    const handleNextStep = async () => {
        if (currentStep < 4) setCurrentStep(prev => prev + 1);
        else {
            setParentLoading(true);
            setWizardVisible(false);
            try {
                const updated = await extendGoal(goal_id, {
                    extension: stepData.extension as '1 week' | '1 month',
                    level: stepData.level as 'easier' | 'harder' | 'same',
                    priority: stepData.priority,
                    comment: comment || '',
                });

                queryClient.setQueryData<GoalDetail>(['goalDetail', goal_id], (oldData) => {
                    if (!oldData) return oldData;
                    return {
                        ...oldData,
                        objectives: [...oldData.objectives, ...updated.new_objectives],
                        deadline: updated.new_deadline || oldData.deadline,
                    };
                });

                setCurrentStep(1);
                setStepData({});
                setComment('');
                onClose();
            } catch (err) {
                console.error('Error extending objectives:', err);
            } finally {
                setParentLoading(false);
            }
        }
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <>
                        <Text style={styles.modalTitle}>Step 1: Extend your goal</Text>
                        <Text style={styles.modalDescription}>How long do you want to extend your goal?</Text>
                        {['1 week', '1 month'].map(opt => (
                            <TouchableOpacity
                                key={opt}
                                style={[styles.optionButton, stepData.extension === opt && styles.selectedOption]}
                                onPress={() => handleOptionSelect('extension', opt)}
                            >
                                <Text style={styles.optionText}>{opt}</Text>
                            </TouchableOpacity>
                        ))}
                    </>
                );
            case 2:
                return (
                    <>
                        <Text style={styles.modalTitle}>Step 2: Goal difficulty</Text>
                        <Text style={styles.modalDescription}>Do you want your next objectives to be easier or harder?</Text>
                        {['easier', 'harder', 'same'].map(opt => (
                            <TouchableOpacity
                                key={opt}
                                style={[styles.optionButton, stepData.level === opt && styles.selectedOption]}
                                onPress={() => handleOptionSelect('level', opt)}
                            >
                                <Text style={styles.optionText}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</Text>
                            </TouchableOpacity>
                        ))}
                    </>
                );
            case 3:
                return (
                    <>
                        <Text style={styles.modalTitle}>Step 3: Prioritize objectives</Text>
                        <Text style={styles.modalDescription}>How do you want your next objectives organized?</Text>
                        {[
                            'Focus on the most important objectives first',
                            'Balance easy and hard objectives',
                            'Try more challenging objectives for faster progress',
                            'Follow the same order as previous plan'
                        ].map(opt => (
                            <TouchableOpacity
                                key={opt}
                                style={[styles.optionButton, stepData.priority === opt && styles.selectedOption]}
                                onPress={() => handleOptionSelect('priority', opt)}
                            >
                                <Text style={styles.optionText}>{opt}</Text>
                            </TouchableOpacity>
                        ))}
                    </>
                );
            case 4:
                return (
                    <>
                        <Text style={styles.modalTitle}>Step 4: Additional comments</Text>
                        <Text style={styles.modalDescription}>Optional: add any comment or note for your goal</Text>
                        <ScrollView style={styles.commentBox}>
                            <TextInput
                                style={styles.textInput}
                                placeholder="Write your comment..."
                                placeholderTextColor="#888"
                                multiline
                                value={comment}
                                onChangeText={setComment}
                            />
                        </ScrollView>
                    </>
                );
        }
    };

    const isNextDisabled = () => {
        if (currentStep === 4) return false;
        if (currentStep === 1 && !stepData.extension) return true;
        if (currentStep === 2 && !stepData.level) return true;
        if (currentStep === 3 && !stepData.priority) return true;
        return false;
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, isWeb && { maxWidth: maxModalWidth, width: '90%' }]}>
                    {renderStep()}
                    <View style={styles.buttonRow}>
                        {currentStep > 1 && (
                            <TouchableOpacity style={[styles.navButton, styles.backButton]} onPress={handleBack}>
                                <Text style={styles.modalButtonText}>Back</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[styles.navButton, isNextDisabled() ? styles.disabledButton : styles.activeButton]}
                            onPress={handleNextStep}
                            disabled={isNextDisabled()}
                        >
                            <Text style={styles.modalButtonText}>{currentStep < 4 ? 'Next' : 'Extend Goal'}</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={[styles.navButton, styles.cancelButton]} onPress={onClose}>
                        <Text style={styles.modalButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#222', padding: 20, borderRadius: 12, width: '80%', alignItems: 'center' },
    modalTitle: { fontSize: 20, color: '#fff', fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
    modalDescription: { fontSize: 14, color: '#ccc', marginBottom: 12, textAlign: 'center' },
    optionButton: { backgroundColor: '#555', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8, marginBottom: 10, width: '100%', alignItems: 'center' },
    selectedOption: { backgroundColor: '#28a745' },
    optionText: { color: '#fff', fontWeight: 'bold' },
    buttonRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 10, width: '100%' },
    navButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, alignItems: 'center', minWidth: 80 },
    backButton: { backgroundColor: '#777', marginRight: 10 },
    activeButton: { backgroundColor: '#28a745' },
    disabledButton: { backgroundColor: '#444' },
    cancelButton: { backgroundColor: '#FF0000', marginTop: 10 },
    modalButtonText: { color: '#fff', fontWeight: 'bold' },
    commentBox: { width: '100%', maxHeight: 120 },
    textInput: { backgroundColor: '#333', color: '#fff', borderRadius: 8, padding: 10, minHeight: 60 },
});

export default ExtendGoalWizard;
