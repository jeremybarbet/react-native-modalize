import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

interface ButtonProps {
  name: string;
  onPress(...args: unknown[]): void;
}

export const Button = ({ name, onPress }: ButtonProps) => (
  <TouchableOpacity style={s.button} onPress={onPress} activeOpacity={0.75}>
    <Text style={s.button__text}>{name}</Text>
  </TouchableOpacity>
);

const s = StyleSheet.create({
  button: {
    paddingVertical: 12,
    marginBottom: 10,

    width: 220,

    backgroundColor: '#333',
    borderRadius: 6,
  },

  button__text: {
    color: '#fff',
    textAlign: 'center',
  },
});
