/**
 * Input Component - ANDROID FIXED
 * ✅ Keyboard дээр input харагдах
 * ✅ Android-д зориулсан тохиргоо
 */

import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';

const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  maxLength,
  suffix,
  prefix,
  error,
  style,
  editable = true,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => editable && inputRef.current?.focus()}
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
          !editable && styles.inputContainerDisabled,
        ]}
      >
        {prefix && <Text style={styles.prefix}>{prefix}</Text>}
        <TextInput
          ref={inputRef}
          style={[styles.input, multiline && styles.inputMultiline]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textTertiary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          multiline={multiline}
          maxLength={maxLength}
          editable={editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCorrect={false}
          autoCapitalize="none"
          underlineColorAndroid="transparent"
          textAlignVertical={multiline ? 'top' : 'center'}
          importantForAutofill="no"
          {...props}
        />
        {suffix && <Text style={styles.suffix}>{suffix}</Text>}
      </TouchableOpacity>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glass,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    minHeight: 52,
  },
  inputContainerFocused: {
    borderColor: COLORS.primary,
    backgroundColor: '#FAFAFE',
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  inputContainerError: {
    borderColor: COLORS.danger,
  },
  inputContainerDisabled: {
    opacity: 0.5,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    paddingVertical: 12,
    paddingHorizontal: 0,
    margin: 0,
    minHeight: 48,
  },
  inputMultiline: {
    minHeight: 100,
    paddingTop: 12,
  },
  prefix: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginRight: 8,
    fontWeight: '500',
  },
  suffix: {
    fontSize: 16,
    color: COLORS.primary,
    marginLeft: 8,
    fontWeight: '700',
  },
  error: {
    marginTop: 6,
    fontSize: 12,
    color: COLORS.danger,
    marginLeft: 2,
  },
});

export default Input;