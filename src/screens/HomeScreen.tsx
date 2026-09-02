import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from '../components/Logo';
import DemoCard from '../components/DemoCard';
import { colors } from '../theme';

const CARDS = [
  { icon: '\uD83D\uDCB0', title: 'Wallet', subtitle: 'View your balance', variant: 'blue' as const },
  { icon: '\uD83D\uDCE4', title: 'Send Money', subtitle: 'Transfer funds instantly', variant: 'yellow' as const },
  { icon: '\uD83D\uDCF1', title: 'Buy Airtime', subtitle: 'Recharge your phone', variant: 'yellow' as const },
  { icon: '\uD83C\uDFE6', title: 'Savings', subtitle: 'Grow your savings', variant: 'blue' as const },
];

function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Logo />
      </View>

      <View style={styles.body}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.grid}>
          {CARDS.map((card) => (
            <View key={card.title} style={styles.gridItem}>
              <DemoCard
                icon={card.icon}
                title={card.title}
                subtitle={card.subtitle}
                variant={card.variant}
              />
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.mtnBlue,
  },
  header: {
    backgroundColor: colors.mtnBlue,
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  body: {
    flex: 1,
    backgroundColor: colors.lightGray,
    paddingTop: 24,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.mtnBlueDark,
    marginBottom: 12,
    marginLeft: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '50%',
  },
});

export default HomeScreen;
