// CountrySelector.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Platform, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import countries from 'world-countries';

type Props = {
    value?: string; // código ISO 3166-1 alpha-2
    name?: string | null;
    onChange: (country: { code: string; name: string } | null) => void;
};

const CountrySelector: React.FC<Props> = ({ value, name, onChange }) => {
    const [selectedCode, setSelectedCode] = useState(value);
    const [selectedName, setSelectedName] = useState(name ?? null);
    const [open, setOpen] = useState(false);
    const [filter, setFilter] = useState('');

    // Filtrado simple
    const filteredCountries = countries.filter(c =>
        c.name.common.toLowerCase().includes(filter.toLowerCase())
    );

    const handleSelect = (c: { cca2: string; name: { common: string } }) => {
        setSelectedCode(c.cca2);
        setSelectedName(c.name.common);
        onChange({ code: c.cca2, name: c.name.common });
        setOpen(false);
    };

    // Web usa <select>
    if (Platform.OS === 'web') {
        return (
            <View style={styles.wrapper}>
                <Text style={styles.label}>País</Text>
                <select
                    value={selectedCode ?? ''}
                    onChange={e => {
                        const c = countries.find(c => c.cca2 === e.target.value);
                        if (c) handleSelect(c);
                    }}
                    style={styles.webSelect}
                >
                    <option value="" disabled>Seleccionar país</option>
                    {filteredCountries.map(c => (
                        <option key={c.cca2} value={c.cca2}>{c.name.common}</option>
                    ))}
                </select>
            </View>
        );
    }

    // Mobile usa Modal/ScrollView
    return (
        <View style={styles.wrapper}>
            <Text style={styles.label}>País</Text>
            <TouchableOpacity style={styles.button} onPress={() => setOpen(!open)}>
                <Text style={styles.buttonText}>{selectedName ?? 'Seleccionar país'}</Text>
            </TouchableOpacity>
            {open && (
                <View style={styles.dropdown}>
                    <TextInput
                        placeholder="Buscar..."
                        value={filter}
                        onChangeText={setFilter}
                        style={styles.input}
                    />
                    <FlatList
                        style={{ maxHeight: 200 }}
                        data={filteredCountries}
                        keyExtractor={(c) => c.cca2}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.option}
                                onPress={() => handleSelect(item)}
                            >
                                <Text style={styles.optionText}>{item.name.common}</Text>
                            </TouchableOpacity>
                        )}
                        nestedScrollEnabled
                        keyboardShouldPersistTaps="handled"
                    />
                </View>

            )}

        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: { width: '100%', marginBottom: 10 },
    label: { color: '#fff', marginBottom: 6, fontWeight: '600' },
    button: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: '#333',
        borderRadius: 8,
    },
    buttonText: { color: '#fff' },
    dropdown: {
        backgroundColor: '#222',
        borderRadius: 8,
        marginTop: 6,
        padding: 6,
    },
    input: {
        backgroundColor: '#333',
        color: '#fff',
        padding: 8,
        borderRadius: 6,
        marginBottom: 6,
    },
    scrollContainer: {
        maxHeight: 200, // altura máxima visible
        borderTopWidth: 1,
        borderTopColor: '#555',
    },

    option: {
        paddingVertical: 8,
        paddingHorizontal: 6,
    },
    optionText: { color: '#fff' },
    webSelect: {
        width: '100%',
        padding: 8,
        borderRadius: 6,
        borderColor: '#fff',
        backgroundColor: '#333',
        color: '#fff',
    },
});

export default CountrySelector;
