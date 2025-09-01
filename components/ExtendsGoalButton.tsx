import React, { useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Dimensions, ActivityIndicator, Platform } from 'react-native';
import ExtendGoalWizard from './ExtendsGoalWizard';

interface Props {
    goal_id: number;
    style?: object;
}

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.65;
const isWeb = Platform.OS === 'web';
const webMaxWidth = 400;

const ExtendsGoalButton: React.FC<Props> = ({ goal_id, style }) => {
    const [wizardVisible, setWizardVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    return (
        <View style={[style, { marginHorizontal: isWeb ? 20 : 0 }]}>
            <TouchableOpacity
                style={[styles.itemContainer,
                loading && { opacity: 0.7 },
                isWeb && { width: webMaxWidth, alignSelf: 'center' },
                ]}
                onPress={() => setWizardVisible(true)}
                disabled={loading} // bloquea el botón mientras carga
            >
                {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Text style={styles.itemText}>+ Extend Objectives</Text>
                )}
            </TouchableOpacity>

            <ExtendGoalWizard
                visible={wizardVisible}
                goal_id={goal_id} // reemplaza con el id real
                setParentLoading={setLoading} // prop para controlar el loader desde el wizard
                setWizardVisible={setWizardVisible}
                onClose={() => setWizardVisible(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    itemContainer: {
        width: isWeb ? 200 : ITEM_WIDTH,
        marginHorizontal: 20,
        borderRadius: 15,
        marginTop: isWeb ? '5%' : '20%',
        backgroundColor: 'rgba(37,117,252,0.3)',
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center',
    },
});
export default ExtendsGoalButton;
