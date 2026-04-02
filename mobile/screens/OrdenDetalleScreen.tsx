import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'OrdenDetalle'>;

export default function OrdenDetalleScreen({ route, navigation }: Props) {
  const { ordenId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Orden {ordenId}</Text>
      <Text>Estado: en_proceso</Text>
      <Text>Prioridad: alta</Text>
      <Text>Dirección: Av. Principal 100</Text>
      <Text>Descripción: Reparar bache.</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CapturaEvidencia', { ordenId })}>
        <Text style={styles.buttonText}>Subir evidencia</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  button: { marginTop: 16, backgroundColor: '#007bff', borderRadius: 8, padding: 12 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});
