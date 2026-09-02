import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const theme = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.mtnYellow,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: {
    color: colors.mtnBlueDark,
    fontSize: 20,
    fontWeight: '700',
  },
});

export { colors };
