// screens/GameScreen.js

import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const GameScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Game Screen - Play Here!</Text>
    {/* Game implementation goes here */}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold' },
});

export default GameScreen;
