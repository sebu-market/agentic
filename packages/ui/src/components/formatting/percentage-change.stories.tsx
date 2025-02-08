import type { Meta, StoryObj } from '@storybook/react';

import {PercentageChange, PercentageChangeProps} from './percentage-change';

export default {
  component: PercentageChange,
} as Meta;

export const PositiveChange: StoryObj<PercentageChangeProps> = {
  args: {
    value: 12.345,
  },
};

export const NegativeChange: StoryObj<PercentageChangeProps> = {
  args: {
    value: -7.891,
  },
};

export const SmallPositiveChange: StoryObj<PercentageChangeProps> = {
  args: {
    value: 0.123,
  },
};

export const SmallNegativeChange: StoryObj<PercentageChangeProps> = {
  args: {
    value: -0.456,
  },
};

export const ZeroChange: StoryObj<PercentageChangeProps> = {
  args: {
    value: 0,
  },
};