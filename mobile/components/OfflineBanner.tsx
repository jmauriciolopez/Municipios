import { View, Text, StyleSheet } from 'react-native';

type Props = { online: boolean };

export default function OfflineBanner({ online }: Props) {
  if (online) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>Offline: los cambios se sincronizarán al reconectar</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { backgroundColor: '#dc3545', padding: 8, alignItems: 'center' },
  text: { color: '#fff' },
});
