import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export const Button = ({ onPress, name }) => (
  <TouchableOpacity style={s.button} onPress={onPress} activeOpacity={0.9}>
    <Text style={s.button__text}>{name}</Text>
  </TouchableOpacity>
);

const s = StyleSheet.create({
  button: {
    paddingVertical: 15,
    marginBottom: 15,

    width: 240,

    backgroundColor: '#333',
    borderRadius: 6,
  },

  button__text: {
    color: '#fff',
    textAlign: 'center',
  },
});
