import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Colors from '../constants/Colors';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export default function StyledButton({ title, onPress, loading = false, variant = 'primary', disabled = false }: Props) {
  const buttonStyle = variant === 'primary' ? styles.primaryButton : styles.secondaryButton;
  const textStyle = variant === 'primary' ? styles.primaryText : styles.secondaryText;

  return (
    <TouchableOpacity
      style={[styles.button, buttonStyle, (loading || disabled) && styles.disabled]}
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.8}
    >
      {loading ? 
        <ActivityIndicator color="white" size="small" /> : 
        <Text style={textStyle}>{title}</Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    width: '100%',
  },
  primaryButton: {
    backgroundColor: Colors.light.tint,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  primaryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryText: {
    color: Colors.light.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabled: {
    opacity: 0.7,
  },
});
