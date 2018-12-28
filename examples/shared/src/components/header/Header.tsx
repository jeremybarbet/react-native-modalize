import * as React from 'react';
import { View, StyleSheet, Text } from 'react-native';

interface IProps {
  subheading: string;
  copy: string;
}

const Header = ({ subheading, copy }: IProps) => (
  <View style={s.header}>
    <Text style={s.header__heading}>Modalize</Text>
    <Text style={s.header__subheading}>{subheading}</Text>
    <Text style={s.header__copy}>{copy}</Text>
  </View>
);

Header.defaultProps = {
  copy: true,
};

const s = StyleSheet.create({
  header: {
    paddingBottom: 40,
  },

  header__heading: {
    marginBottom: 5,

    fontSize: 28,
    color: '#404040',
    textAlign: 'center',
  },

  header__subheading: {
    fontSize: 16,
    color: '#b5b5b5',
    textAlign: 'center',
  },

  header__copy: {
    marginTop: 20,
    marginHorizontal: 40,

    fontSize: 16,
    color: '#b5b5b5',
    textAlign: 'center',
  },
});

export default Header;
