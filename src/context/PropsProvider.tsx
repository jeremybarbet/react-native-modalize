import React, { createContext, ReactNode, useContext } from 'react';

import { ModalizeProps } from '../options';

const PropsContext = createContext<ModalizeProps>({});

type PropsProviderProps<T> = { children: ReactNode } & ModalizeProps<T>;

export const PropsProvider = <T,>({ children, ...props }: PropsProviderProps<T>) => (
  <PropsContext.Provider value={props}>{children}</PropsContext.Provider>
);

export const useProps = () => useContext(PropsContext);
