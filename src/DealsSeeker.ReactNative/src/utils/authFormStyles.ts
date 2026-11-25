import { StyleSheet } from 'react-native';

export const authFormStyles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formCard: {
    borderRadius: 28,
    borderWidth: 1,
    gap: 12,
    padding: 20,
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: 28,
    justifyContent: 'center',
    minHeight: 44,
    paddingVertical: 15,
  },
  primaryButtonLabel: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  link: {
    alignItems: 'center',
    fontSize: 14,
    fontWeight: '700',
    justifyContent: 'center',
    minHeight: 44,
    textAlign: 'center',
  },
  status: {
    fontSize: 14,
    fontWeight: '700',
  },
});
