import { ReactNode } from 'react';

export const renderElement = (Element: ReactNode) =>
  typeof Element === 'function' ? Element() : Element;
