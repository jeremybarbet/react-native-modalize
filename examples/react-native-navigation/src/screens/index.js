import { Navigation } from 'react-native-navigation';

import { App } from './App';
import { AbsoluteHeader } from './AbsoluteHeader';
import { CustomStyle } from './CustomStyle';
import { FixedContent } from './FixedContent';
import { FlatList } from './FlatList';
import { SectionList } from './SectionList';
import { SimpleContent } from './SimpleContent';
import { SnappingList } from './SnappingList';

export const Screens = new Map();

export const APP = 'example.App';
export const ABSOLUTE_HEADER = 'example.AbsoluteHeader';
export const CUSTOM_STYLE = 'example.CustomStyle';
export const FIXED_CONTENT = 'example.FixedContent';
export const FLAT_LIST = 'example.FlatList';
export const SECTION_LIST = 'example.SectionList';
export const SIMPLE_CONTENT = 'example.SimpleContent';
export const SNAPPING_LIST = 'example.SnappingList';

Screens.set(APP, App);
Screens.set(ABSOLUTE_HEADER, AbsoluteHeader);
Screens.set(CUSTOM_STYLE, CustomStyle);
Screens.set(FIXED_CONTENT, FixedContent);
Screens.set(FLAT_LIST, FlatList);
Screens.set(SECTION_LIST, SectionList);
Screens.set(SIMPLE_CONTENT, SimpleContent);
Screens.set(SNAPPING_LIST, SnappingList);

export const startApp = () => {
  Navigation.setRoot({ root: { component: { name: APP } } });
};
