import type { ComponentType, ReactNode } from 'react';

import { setClipboardData } from '@tarojs/taro';
import { isFunction } from 'lodash-es';
import { createElement, Fragment } from 'react';

import type { CodeHeaderAction } from '../../../../../base';

const isComponentType = (target: ComponentType | ReactNode): target is ComponentType =>
  isFunction(target);

export const renderAction = ({ key, target }: CodeHeaderAction) => {
  return <Fragment key={key}>{isComponentType(target) ? createElement(target) : target}</Fragment>;
};

export const copyText = async (data: string) => {
  await setClipboardData({ data });

  return true;
};
