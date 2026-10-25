import type { IDriver } from '../../../../../../modules';
import type { SmoothDriverClass } from '../../../../../../type';

export interface DriverFramesInputs {
  Driver: SmoothDriverClass;
}

export interface SmoothTick {
  driver: IDriver;

  timestamp: number;
}
