/**
 * esModuleInterop: true looks to work everywhere except
 * on snack.expo for some reason. Will revisit this later.
 */
import * as React from 'react';
import { IProps, IHandles } from './options';
export declare type ModalizeProps = IProps;
export declare type Modalize = IHandles;
export declare const Modalize: React.ForwardRefExoticComponent<IProps<any> & React.RefAttributes<string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, any> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | undefined>>;
