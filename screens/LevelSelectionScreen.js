// screens/LevelSelectionScreen.js

import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const LevelSelectionScreen = ({ navigation }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Select Level</Text>
    <Button title="Start Level 1" onPress={() => navigation.navigate('Game')} />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
});

export default LevelSelectionScreen;
