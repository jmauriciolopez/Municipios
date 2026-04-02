import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type Props = {
  orden: { id: string; codigo: string; estado: string; direccion: string; prioridad: string };
  onPress: () => void;
};

export default function OrderCard({ orden, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.code}>{orden.codigo}</Text>
      <Text>{orden.direccion}</Text>
      <Text>Estado: {orden.estado}</Text>
      <Text>Prioridad: {orden.prioridad}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 8, padding: 12, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.1, elevation: 2 },
  code: { fontWeight: 'bold', marginBottom: 4 },
});
