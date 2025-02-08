import type { Meta, StoryObj } from '@storybook/react';

import { CompactBigNumber } from './compact-big-number';

const meta = {
  component: CompactBigNumber,
} satisfies Meta<typeof CompactBigNumber>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Tens: Story = {
  args: {
    value: "12"
  }
};


export const Hundreds: Story = {
  args: {
    value: "123"
  }
};

export const Thousands: Story = {
  args: {
    value: "1234"
  }
};

export const TenThousands: Story = {
  args: {
    value: "12345"
  }
};

export const HundredThousands: Story = {
  args: {
    value: "123456"
  }
};

export const Millions: Story = {
  args: {
    value: "1234567"
  }
};

export const TenMillions: Story = {
  args: {
    value: "12345678"
  }
};

export const HundredMillions: Story = {
  args: {
    value: "123456789"
  }
};

export const Billions: Story = {
  args: {
    value: "1234567890"
  }
};

export const MAX_SAFE_INTEGER: Story = {
  args: {
    value: Number.MAX_SAFE_INTEGER.toString()
  }
};

export const MIN_SAFE_INTEGER: Story = {
  args: {
    value: Number.MIN_SAFE_INTEGER.toString()
  }
};