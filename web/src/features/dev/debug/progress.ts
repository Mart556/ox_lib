import { debugData } from '../../../utils/debugData';
import { ProgressbarProps } from '../../../typings';

export const debugProgressbar = () => {
  debugData<ProgressbarProps>([
    {
      action: 'progress',
      data: {
        label: 'Drinking Water',
        duration: 30000,
        canCancel: true,
      },
    },
  ]);
};

export const debugCircleProgressbar = () => {
  debugData([
    {
      action: 'circleProgress',
      data: {
        label: 'Using Lockpick',
        duration: 30000,
      },
    },
  ]);
};
