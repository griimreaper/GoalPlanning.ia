import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, Platform, Dimensions, ScrollView } from 'react-native';

interface Props {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: { difficulty: string; interest: string; time: string; comment: string | null }) => void;
    objectiveDescription: string;
}

const isWeb = Platform.OS === 'web';
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const maxModalWidth = 500;

const ObjectiveUpdateWizard: React.FC<Props> = ({ visible, onClose, onSubmit, objectiveDescription }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [updateData, setUpdateData] = useState<{ [key: string]: string }>({});
    const [comment, setComment] = useState('');

    const handleOptionSelect = (key: string, value: string) => {
        setUpdateData(prev => ({ ...prev, [key]: value }));
    };

    const handleNextStep = () => {
        if (currentStep < 4) setCurrentStep(prev => prev + 1);
        else {
            const { difficulty, interest, time } = updateData;
            if (!difficulty || !interest || !time) return;
            onSubmit({ difficulty, interest, time, comment });
            setCurrentStep(1);
            setUpdateData({});
            setComment('');
        }
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return ["Very Hard", "Too Easy", "Just Right"].map(opt => (
                    <TouchableOpacity
                        key={opt}
                        style={[styles.optionButton, updateData.difficulty === opt && styles.selectedOption]}
                        onPress={() => handleOptionSelect("difficulty", opt)}
                    >
                        <Text style={styles.optionText}>{opt}</Text>
                    </TouchableOpacity>
                ));
            case 2:
                return ["Liked it", "Bored", "Neutral"].map(opt => (
                    <TouchableOpacity
                        key={opt}
                        style={[styles.optionButton, updateData.interest === opt && styles.selectedOption]}
                        onPress={() => handleOptionSelect("interest", opt)}
                    >
                        <Text style={styles.optionText}>{opt}</Text>
                    </TouchableOpacity>
                ));
            case 3:
                return ["Too short", "Too long", "Perfect"].map(opt => (
                    <TouchableOpacity
                        key={opt}
                        style={[styles.optionButton, updateData.time === opt && styles.selectedOption]}
                        onPress={() => handleOptionSelect("time", opt)}
                    >
                        <Text style={styles.optionText}>{opt}</Text>
                    </TouchableOpacity>
                ));
            case 4:
                const maxChars = 200;
                return (
                    <>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Write your comment..."
                            placeholderTextColor="#888"
                            multiline
                            maxLength={maxChars}
                            value={comment}
                            onChangeText={setComment}
                        />
                        <Text style={styles.charCount}>{comment.length} / {maxChars}</Text>
                    </>
                );
        }
    };

    const isNextDisabled = () => {
        if (currentStep === 4) return false;
        if (currentStep === 1 && !updateData.difficulty) return true;
        if (currentStep === 2 && !updateData.interest) return true;
        if (currentStep === 3 && !updateData.time) return true;
        return false;
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, isWeb && { maxWidth: maxModalWidth, width: '90%' }]}>
                    <ScrollView style={{ maxHeight: screenHeight * 0.8 }} contentContainerStyle={{ alignItems: 'center' }}>

                        <Text style={styles.title}>Update Your Objective</Text>
                        <Text style={styles.description}>
                            Help us adapt your goal by providing your feedback. Select the options that best describe your experience,
                            and optionally add a comment. Your responses will be used to update your objective.
                        </Text>

                        <Text style={styles.objectiveTitle}>Current Objective</Text>
                        <Text style={styles.objectiveDescription}>{objectiveDescription}</Text>

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
                                <Text style={styles.modalButtonText}>{currentStep < 4 ? "Next" : "Update Objective"}</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={[styles.navButton, styles.cancelButton]} onPress={onClose}>
                            <Text style={styles.modalButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#222', padding: 20, borderRadius: 12, width: '80%', alignItems: 'center' },
    title: { fontSize: 22, color: '#fff', fontWeight: 'bold', marginBottom: 5, textAlign: 'center' },
    description: { fontSize: 14, color: '#ccc', marginBottom: 15, textAlign: 'center' },
    modalTitle: { fontSize: 20, color: '#fff', fontWeight: 'bold', marginBottom: 15 },
    objectiveDescription: { fontSize: 14, color: '#ccc', marginBottom: 15, textAlign: 'center' },
    objectiveTitle: { fontSize: 16, color: '#fff', fontWeight: 'bold', marginBottom: 5, textAlign: 'center' },
    optionButton: { backgroundColor: '#555', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8, marginBottom: 10, width: '100%', alignItems: 'center' },
    selectedOption: { backgroundColor: '#28a745' },
    optionText: { color: '#fff', fontWeight: 'bold' },
    navButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, alignItems: 'center', minWidth: 80 },
    backButton: { backgroundColor: '#777', marginRight: 10 },
    activeButton: { backgroundColor: '#28a745' },
    disabledButton: { backgroundColor: '#444' },
    cancelButton: { backgroundColor: '#FF0000', marginTop: 10 },
    modalButtonText: { color: '#fff', fontWeight: 'bold' },
    textInput: { width: '100%', backgroundColor: '#333', color: '#fff', borderRadius: 8, padding: 10, marginBottom: 5, minHeight: 60 },
    charCount: { color: '#ccc', fontSize: 12, alignSelf: 'flex-end', marginBottom: 10 },
    buttonRow: { flexDirection: 'row', marginTop: 10, justifyContent: 'center', width: '100%' },
});

export default ObjectiveUpdateWizard;
