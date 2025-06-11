import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Colors from '../constants/Colors';

interface Props extends TextInputProps {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
}

export default function StyledInput({ icon, ...props }: Props) {
  return (
    <View style={styles.container}>
      <FontAwesome 
        name={icon} 
        size={20} 
        color={Colors.light.icon} 
        style={styles.icon} 
      />
      <TextInput
        style={styles.input}
        placeholderTextColor={Colors.light.icon}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
    marginBottom: 15,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
});
