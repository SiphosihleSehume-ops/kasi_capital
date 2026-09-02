import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

function Logo() {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.kasi}>KASI</Text>
        <Text style={styles.capital}>CAPITAL</Text>
      </View>
      <Text style={styles.tagline}>Grow your money, kasi style.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  kasi: {
    fontSize: 40,
    fontWeight: '900',
    color: colors.white,
    letterSpacing: 2,
  },
  capital: {
    fontSize: 40,
    fontWeight: '900',
    color: colors.mtnYellow,
    letterSpacing: 2,
    marginLeft: 6,
  },
  tagline: {
    fontSize: 13,
    color: colors.gray,
    marginTop: 4,
  },
});

export default Logo;
