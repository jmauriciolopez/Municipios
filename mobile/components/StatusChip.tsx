import { View, Text, StyleSheet } from 'react-native';

type Props = { status: string };

export default function StatusChip({ status }: Props) {
  const style = status === 'resuelto' ? styles.resolved : status === 'en_proceso' ? styles.inProgress : styles.default;

  return (
    <View style={[styles.chip, style]}>
      <Text style={styles.chipText}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 16 },
  chipText: { color: '#fff' },
  resolved: { backgroundColor: '#28a745' },
  inProgress: { backgroundColor: '#ffc107' },
  default: { backgroundColor: '#6c757d' },
});
