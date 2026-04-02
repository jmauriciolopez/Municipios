import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type Props = { onPhotoAdded: (uri: string) => void };

export default function PhotoUploader({ onPhotoAdded }: Props) {
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    onPhotoAdded('https://example.com/fake-photo.jpg');
    setAdded(true);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleAdd}>
        <Text style={styles.buttonText}>{added ? 'Foto agregada' : 'Subir foto'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  button: { backgroundColor: '#17a2b8', padding: 10, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff' },
});
