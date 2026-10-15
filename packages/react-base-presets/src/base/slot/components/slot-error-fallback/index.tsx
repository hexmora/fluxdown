import type { FallbackProps as ErrorBoundaryFallbackProps } from 'react-error-boundary';

import { useContext } from 'react';

import { SlotFallbackContext } from '../../context';
import { MissingSlotError } from '../../error';

export const SlotErrorFallback = ({ error, resetErrorBoundary }: ErrorBoundaryFallbackProps) => {
  const value = useContext(SlotFallbackContext);

  if (error instanceof MissingSlotError) {
    throw error;
  }

  if (!value?.Component) {
    return null;
  }

  const { Component, props, type } = value;

  return <Component error={error} onReset={resetErrorBoundary} props={props} type={type} />;
};
