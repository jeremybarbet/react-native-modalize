import { ReactNode } from "react";

export const renderElement = (Element: ReactNode): JSX.Element => typeof Element === 'function' ? Element() : Element;
