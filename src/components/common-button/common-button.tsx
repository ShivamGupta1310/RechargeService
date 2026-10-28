import React from 'react';
import { Pressable, PressableProps, Text, StyleProp, TextStyle, ViewStyle } from 'react-native';
import { useCommonButtonStyles } from './common-button.styles';

type CommonButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  title: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function CommonButton({ title, disabled = false, style, textStyle, ...props }: CommonButtonProps) {
  const styles = useCommonButtonStyles();

  return (
    <Pressable
      {...props}
      accessibilityRole={props.accessibilityRole ?? 'button'}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
        style,
      ]}
    >
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </Pressable>
  );
}
