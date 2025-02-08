import type { Meta, StoryObj } from '@storybook/react';
import { CurrencyFormatter } from './currency-formatter';

const meta = {
  component: CurrencyFormatter,
} satisfies Meta<typeof CurrencyFormatter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 1,
    style: {},
  },
};

export const LargeNumber: Story = {
  args: {
    value: 60896.96,
    style: {},
  },
};

export const WithDecimals: Story = {
  args: {
    value: 0.1044,
    style: {},
  },
};

export const SmallWithLeadingZeros: Story = {
  args: {
    value: "0.00001411",
    decimals: 18,
    style: {},
  },
};

export const SmallWithCollapsedLeadingZeros: Story = {
  args: {
    value: "0.0000000846",
    decimals: 18,
    style: {},
  },
};

export const SmallWithTrailingZeros: Story = {
  args: {
    value: "0.7500004",
    decimals: 18,
    style: {},
  },
};

export const CustomCurrencyAndLocale: Story = {
  args: {
    value: 516.2,
    currency: 'EUR',
    locale: 'de-DE',
    style: {},
  },
};

export const LargeBigInt: Story = {
  args: {
    value: BigInt(Number.MAX_SAFE_INTEGER.toString() + "0").toString(),
    decimals: 18,
    style: {},
  },
};

export const NumberWithTwoDecimals: Story = {
  args: {
    value: 60.75,
    style: {},
  },
};

export const MAX_SAFE_INTEGER: Story = {
  args: {
    value: Number.MAX_SAFE_INTEGER,
    style: {},
  },
};
