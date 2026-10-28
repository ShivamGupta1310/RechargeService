import React from 'react';
import { TextInput, TextInputProps } from 'react-native';
import { useCommonTextInputStyles } from './common-text-input.styles';

export function CommonTextInput({ style, ...props }: TextInputProps) {
  const styles = useCommonTextInputStyles();

  return <TextInput {...props} style={[styles.input, style]} />;
}
