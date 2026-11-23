import React, { useState } from 'react';

interface DataPoint {
  label: string;
  orders: number;
  revenue: number;
}

interface BarTrendChartProps {
  data: DataPoint[];
  metric?: 'orders' | 'revenue';
  currency?: string;
  height?: number;
}

export const BarTrendChart: React.FC<BarTrendChartProps> = ({
  data,
  metric = 'orders',
  currency = '$',
  height = 200,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const values = data.map((d) => (metric === 'orders' ? d.orders : d.revenue));
  const maxVal = Math.max(...values, 1) * 1.15; // 15% head room

  return (
    <div className="w-full select-none" style={{ height: `${height}px` }}>
      <div className="h-[80%] flex items-end gap-2 sm:gap-3 px-2 pt-4 relative">
        {/* Horizontal grid guide */}
        <div className="absolute inset-x-0 top-4 border-b border-dashed border-slate-100 pointer-events-none" />
        <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-slate-100 pointer-events-none" />

        {data.map((item, idx) => {
          const val = metric === 'orders' ? item.orders : item.revenue;
          const heightPercent = Math.max((val / maxVal) * 100, 6);
          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Tooltip */}
              {isHovered && (
                <div className="absolute -top-12 z-20 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-medium rounded shadow-lg whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-100">
                  <div className="font-semibold text-slate-200">{item.label}</div>
                  <div>
                    {metric === 'orders'
                      ? `${item.orders} orders ($${item.revenue.toFixed(0)})`
                      : `${currency}${item.revenue.toFixed(2)} (${item.orders} orders)`}
                  </div>
                </div>
              )}

              {/* Bar */}
              <div
                style={{ height: `${heightPercent}%` }}
                className={`w-full max-w-[38px] rounded-t-md transition-all duration-200 ${
                  isHovered
                    ? 'bg-brand-600'
                    : 'bg-brand-100 hover:bg-brand-200 group-hover:bg-brand-500'
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* X Axis Labels */}
      <div className="h-[20%] flex items-center gap-2 sm:gap-3 px-2 border-t border-slate-100">
        {data.map((item, idx) => (
          <div
            key={idx}
            className={`flex-1 text-center text-[11px] truncate ${
              hoveredIdx === idx ? 'text-brand-600 font-semibold' : 'text-slate-400 font-medium'
            }`}
          >
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
};
