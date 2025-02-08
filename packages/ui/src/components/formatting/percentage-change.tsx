import React from 'react';
import { MoveUp, MoveDown } from 'lucide-react';

export interface PercentageChangeProps {
  value: number;
  className?: string;
  style?: React.CSSProperties;
}

export const PercentageChange: React.FC<PercentageChangeProps> = ({ value, className, style }) => {
  const isPositive = value >= 0;
  const formattedValue = Math.abs(value).toFixed(1);

  return (
    <span
      className={`flex items-center ${isPositive ? 'text-green-700' : 'text-red-700'} ${className}`}
      style={style}
    >
      {isPositive ? <MoveUp className="w-4 h-4" /> : <MoveDown className="w-4 h-4" />}
      <span className="ml-1">
        {formattedValue}%
      </span>
    </span>
  );
};

export default PercentageChange;
