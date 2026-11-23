import React from 'react';

interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  slices: DonutSlice[];
  totalLabel?: string;
  totalValue?: string | number;
  size?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  slices,
  totalLabel = 'Total',
  totalValue,
  size = 160,
}) => {
  const total = slices.reduce((acc, s) => acc + s.value, 0);
  const displayTotal = totalValue !== undefined ? totalValue : total;

  // Calculate SVG stroke dashes
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;
  const calculatedSlices = slices.map((slice) => {
    const fraction = total > 0 ? slice.value / total : 0;
    const strokeDasharray = `${fraction * circumference} ${circumference}`;
    const strokeDashoffset = -currentOffset;
    currentOffset += fraction * circumference;
    const percentage = total > 0 ? Math.round(fraction * 100) : 0;
    return { ...slice, strokeDasharray, strokeDashoffset, percentage };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
      {/* SVG Donut */}
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {calculatedSlices.map((slice, i) => (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={slice.color}
              strokeWidth={strokeWidth}
              strokeDasharray={slice.strokeDasharray}
              strokeDashoffset={slice.strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          ))}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-xl font-bold text-slate-800">{displayTotal}</span>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
            {totalLabel}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2 flex-1 max-w-xs">
        {calculatedSlices.map((slice, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: slice.color }} />
              <span className="text-slate-600 font-medium">{slice.label}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-900 font-semibold">{slice.value}</span>
              <span className="text-slate-400 w-8 text-right font-medium">{slice.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
