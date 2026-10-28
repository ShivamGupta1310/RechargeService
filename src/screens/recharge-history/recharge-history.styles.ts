import { StyleSheet } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { scale, verticalScale } from '../../utils/scaling';

export const useRechargeHistoryStyles = () => {
  const { colors, spacing } = useAppTheme();
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    scroll: { padding: scale(spacing.lg), gap: verticalScale(spacing.md) },
    title: { color: colors.text, fontSize: scale(28), fontWeight: '800' },
    subtitle: { color: colors.mutedText, fontSize: scale(14) },
    card: { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: scale(16), borderWidth: 1, padding: scale(spacing.md) },
    historyItem: { borderBottomColor: colors.border, borderBottomWidth: 1, paddingVertical: verticalScale(spacing.sm) },
    historyRow: { flexDirection: 'row', justifyContent: 'space-between' },
    historyText: { color: colors.text, fontSize: scale(15) },
    historyMeta: { color: colors.mutedText, fontSize: scale(12), marginTop: verticalScale(4) },
    statusSuccess: { color: colors.success, fontWeight: '700' },
    statusWarning: { color: colors.warning, fontWeight: '700' },
    statusDanger: { color: colors.danger, fontWeight: '700' },
    error: { color: colors.danger, fontSize: scale(13) },
  });
};
