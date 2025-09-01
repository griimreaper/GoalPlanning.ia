import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';

export interface MetaItem {
  id: string;
  meta: string;
  disponibilidad: string;
  plazo: string;
  done: boolean;
}

interface ListaMetasProps {
  metas: MetaItem[];
  toggleCompletada: (id: string) => void;
}

export default function ListaMetas({ metas, toggleCompletada }: ListaMetasProps) {
  return (
    <ScrollView style={styles.lista}>
      {metas.map(item => (
        <Text
          key={item.id}
          style={[styles.meta, item.done && styles.completada]}
          onPress={() => toggleCompletada(item.id)}
        >
          {item.meta} - {item.disponibilidad}h/día - {item.plazo}
        </Text>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  lista: {
    width: '100%',
  },
  meta: {
    fontSize: 18,
    padding: 10,
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 8,
    marginBottom: 10,
  },
  completada: {
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
});
