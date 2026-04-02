import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'CapturaEvidencia'>;

export default function CapturaEvidenciaScreen({ route, navigation }: Props) {
  const { ordenId } = route.params;
  const [observaciones, setObservaciones] = useState('');

  const guardar = () => {
    Alert.alert('Éxito', 'Evidencia guardada en cola offline (mock)');
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Captura de evidencia - {ordenId}</Text>
      <TextInput
        style={styles.input}
        value={observaciones}
        onChangeText={setObservaciones}
        placeholder="Observaciones"
        multiline
      />
      <TouchableOpacity style={styles.button} onPress={guardar}>
        <Text style={styles.buttonText}>Guardar evidencia</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, minHeight: 120 },
  button: { marginTop: 14, backgroundColor: '#28a745', borderRadius: 8, padding: 12 },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});
