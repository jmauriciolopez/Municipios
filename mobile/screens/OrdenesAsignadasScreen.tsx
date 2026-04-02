import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';
import OrderCard from '../components/OrderCard';

type Props = NativeStackScreenProps<RootStackParamList, 'OrdenesAsignadas'>;

type Orden = {
  id: string;
  codigo: string;
  estado: string;
  direccion: string;
  prioridad: string;
};

const ordenesMock: Orden[] = [
  { id: '1', codigo: 'OT-001', estado: 'en_proceso', direccion: 'Av. Principal 100', prioridad: 'alta' },
  { id: '2', codigo: 'OT-002', estado: 'asignado', direccion: 'Calle Falsa 200', prioridad: 'media' },
];

export default function OrdenesAsignadasScreen({ navigation }: Props) {
  const [ordenes] = useState(ordenesMock);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Órdenes asignadas</Text>
      <FlatList
        data={ordenes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OrderCard
            orden={item}
            onPress={() => navigation.navigate('OrdenDetalle', { ordenId: item.id })}
          />
        )}
      />
      <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Perfil')}>
        <Text style={styles.profileText}>Perfil</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  profileButton: { marginTop: 12, padding: 10, backgroundColor: '#e9ecef', borderRadius: 8, alignItems: 'center' },
  profileText: { fontWeight: 'bold' },
});
