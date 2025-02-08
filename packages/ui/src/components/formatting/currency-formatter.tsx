import React from 'react';
import { formatUnits } from 'ethers';

type CurrencyFormatterProps = {
  value: string | number | bigint;
  decimals?: number;
  currency?: string;
  locale?: string;
  className?: string;
  style?: React.CSSProperties;
};

const formatValue = (val: string) => {
  const [integerPart, decimalPart] = val.split('.');
  const integerValue = BigInt(integerPart);
  const decimalValue = decimalPart ? BigInt(decimalPart) : BigInt(0);

  let formattedValue = integerPart;
  let collapsedZeros = false;
  let leadingZeros = 0;

  if (decimalPart && decimalPart.length > 0) {
    leadingZeros = decimalPart.split('').findIndex((char) => char !== '0');
    if (leadingZeros > 4) {
      collapsedZeros = true;
      formattedValue += integerPart + `.` + decimalPart.slice(leadingZeros);
    } else {
      formattedValue += `.` + decimalPart;
    }
  }

  return {
    integerValue,
    decimalValue,
    formattedValue,
    collapsedZeros,
    leadingZeros,
  };
};

const formatNumber = (val: string | number | bigint, decimals?: number) => {
  let strValue: string;

  if (typeof val === 'number') {
    strValue = val.toFixed(decimals ?? 20);
  } else if (typeof val === 'bigint') {
    if (decimals === undefined) {
      throw new Error('decimals is required when passing a bigint');
    }
    strValue = formatUnits(val, decimals);
  } else {
    // if the string contains a dot, assume it's a string representation of a float
    // otherwise, assume it's a string representation of a bigint
    const isFloatString = val.includes('.');
    if (isFloatString) {
      strValue = val;
    } else {
      if (decimals === undefined) {
        throw new Error('decimals is required when passing a string');
      }
      strValue = formatUnits(BigInt(val), decimals);
    }
  }

  return formatValue(strValue);
};

export const CurrencyFormatter: React.FC<CurrencyFormatterProps> = ({
  value,
  decimals,
  currency = 'USD',
  locale = 'en',
  className,
  style,
}) => {

  const {
    formattedValue,
    collapsedZeros,
    leadingZeros,
    integerValue,
    decimalValue,
  } = formatNumber(value, decimals);

  // skip decimals if we are dealing with a whole number
  let minimumFractionDigits = 0;

  if (formattedValue.includes('.')) {
    // default to 4 decimal places for small numbers, otherwise 2
    minimumFractionDigits = integerValue < BigInt(1) ? 4 : 2;

    if (collapsedZeros) {
      // if we have leading zeros, we need to adjust the minimum fraction digits
      // to avoid a mix of collapsed zeros and trailing zeros
      minimumFractionDigits = Math.max(minimumFractionDigits - leadingZeros, 0);
    } else if (leadingZeros > minimumFractionDigits - 2) {
      // ensure we have at least 2 decimal places displayed
      minimumFractionDigits = Math.max(leadingZeros + 2, 2);
    } else if (decimalValue === BigInt(0)) {
      // if we have no decimal value, we don't want to show trailing zeros
      minimumFractionDigits = 0;
    }
  }


  const intlOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
    minimumFractionDigits,
  };

  let displayValue = new Intl.NumberFormat(locale, intlOptions).format(
    parseFloat(formattedValue)
  );

  // split at 2 past the decimal point
  const [integerPart, decimalPart] = displayValue.split('.');


  return (
    <span className={`currency-formatter ${className}`} style={style}>
      {integerPart}
      {decimalPart && '.'}
      {collapsedZeros && <>0<sub>{leadingZeros}</sub></>}
      {decimalPart && decimalPart}
    </span>
  );
};

export type { CurrencyFormatterProps };
