import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

function SplashScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kasi_Capital</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 1,
  },
});

export default SplashScreen;
