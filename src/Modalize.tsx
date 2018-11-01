import * as React from 'react';
import { View } from 'react-native';

import s from './Modalize.style';

interface IProps {
  children: React.ReactNode;
}

export default class Modalize extends React.PureComponent<IProps> {

  render() {
    const { children } = this.props;

    return (
      <View style={s.modal}>
        {children}
      </View>
    );
  }
}
