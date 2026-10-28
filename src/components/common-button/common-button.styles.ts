import { StyleSheet } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { scale } from '../../utils/scaling';

export const useCommonButtonStyles = () => {
  const { colors, spacing } = useAppTheme();

  return StyleSheet.create({
    button: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: scale(10),
      padding: scale(spacing.md),
    },
    buttonPressed: { backgroundColor: colors.primaryPressed },
    buttonDisabled: { backgroundColor: colors.mutedText },
    text: { color: colors.surface, fontSize: scale(16), fontWeight: '700' },
  });
};
