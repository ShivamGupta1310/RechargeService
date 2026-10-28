import { StyleSheet } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { scale, verticalScale } from '../../utils/scaling';

export const useWalletStyles = () => {
  const { colors, spacing } = useAppTheme();
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background }, scroll: { padding: scale(spacing.lg), gap: verticalScale(spacing.md) },
    title: { color: colors.text, fontSize: scale(28), fontWeight: '800' }, subtitle: { color: colors.mutedText, fontSize: scale(14), marginTop: verticalScale(spacing.xs) },
    card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: scale(16), borderWidth: 1, padding: scale(spacing.md) },
    balanceLabel: { color: colors.mutedText, fontSize: scale(13) }, balance: { color: colors.text, fontSize: scale(32), fontWeight: '800', marginTop: verticalScale(spacing.xs) },
    inputLabel: { color: colors.text, fontSize: scale(13), fontWeight: '600', marginBottom: verticalScale(spacing.xs), marginTop: verticalScale(spacing.sm) },
    input: { borderColor: colors.border, borderRadius: scale(10), borderWidth: 1, color: colors.text, fontSize: scale(16), padding: scale(spacing.sm) },
    rechargeButton: { marginTop: verticalScale(spacing.md) },
    sectionTitle: { color: colors.text, fontSize: scale(20), fontWeight: '700' }, historyItem: { borderBottomColor: colors.border, borderBottomWidth: 1, paddingVertical: verticalScale(spacing.sm) }, historyRow: { flexDirection: 'row', justifyContent: 'space-between' }, historyText: { color: colors.text, fontSize: scale(15) }, historyMeta: { color: colors.mutedText, fontSize: scale(12), marginTop: verticalScale(4) }, historyLink: { alignSelf: 'flex-end', paddingVertical: verticalScale(spacing.xs) }, historyLinkText: { color: colors.primary, fontSize: scale(15), fontWeight: '700' },
    statusSuccess: { color: colors.success, fontWeight: '700' }, statusWarning: { color: colors.warning, fontWeight: '700' }, statusDanger: { color: colors.danger, fontWeight: '700' }, error: { color: colors.danger, fontSize: scale(13), marginTop: verticalScale(spacing.sm) },
  });
};
