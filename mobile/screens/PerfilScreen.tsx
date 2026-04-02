import { View, Text, StyleSheet } from 'react-native';

export default function PerfilScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>
      <Text>Nombre: Operador de cuadrilla</Text>
      <Text>Email: operador@municipio.com</Text>
      <Text>Estado: Activo</Text>
      <Text>Cuadrilla: C-01</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
});
