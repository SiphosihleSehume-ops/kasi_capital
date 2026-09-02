import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

type DemoCardProps = {
  icon: string;
  title: string;
  subtitle: string;
  variant?: 'blue' | 'yellow';
};

function DemoCard({ icon, title, subtitle, variant = 'blue' }: DemoCardProps) {
  const isBlue = variant === 'blue';

  return (
    <View style={[styles.card, isBlue ? styles.cardBlue : styles.cardYellow]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.title, isBlue ? styles.titleOnBlue : styles.titleOnYellow]}>
        {title}
      </Text>
      <Text style={[styles.subtitle, isBlue ? styles.subtitleOnBlue : styles.subtitleOnYellow]}>
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    margin: 6,
  },
  cardBlue: {
    backgroundColor: colors.mtnBlue,
  },
  cardYellow: {
    backgroundColor: colors.mtnYellow,
  },
  icon: {
    fontSize: 30,
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  titleOnBlue: {
    color: colors.white,
  },
  titleOnYellow: {
    color: colors.mtnBlueDark,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  subtitleOnBlue: {
    color: 'rgba(255,255,255,0.8)',
  },
  subtitleOnYellow: {
    color: colors.mtnBlueDark,
    opacity: 0.7,
  },
});

export default DemoCard;
