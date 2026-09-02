import React from 'react';
import { StyleSheet, View } from 'react-native';

function HomeScreen() {
  return <View style={styles.container} testID="home-screen" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});

export default HomeScreen;
