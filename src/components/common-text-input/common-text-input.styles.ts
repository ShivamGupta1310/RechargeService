import { StyleSheet } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { scale } from '../../utils/scaling';

export const useCommonTextInputStyles = () => {
  const { colors, spacing } = useAppTheme();

  return StyleSheet.create({
    input: {
      borderColor: colors.border,
      borderRadius: scale(10),
      borderWidth: 1,
      color: colors.text,
      fontSize: scale(16),
      padding: scale(spacing.sm),
    },
  });
};
