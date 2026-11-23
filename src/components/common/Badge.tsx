import React from 'react';

export type BadgeVariant =
  // Order statuses
  | 'New'
  | 'Confirmed'
  | 'Preparing'
  | 'Ready'
  | 'Completed'
  | 'Cancelled'
  // Payment statuses
  | 'Verified'
  | 'Pending Review'
  | 'Mismatch Detected'
  | 'Rejected'
  | 'Needs Manual Review'
  // Urgency
  | 'High'
  | 'Medium'
  | 'Low'
  // Generic
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'active'
  | 'idle';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant | string;
  size?: 'sm' | 'md';
  showDot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  showDot = false,
  className = '',
}) => {
  const getStyles = (v: string): { bg: string; text: string; border: string; dot: string } => {
    switch (v) {
      // Success states
      case 'Confirmed':
      case 'Ready':
      case 'Completed':
      case 'Verified':
      case 'Approved':
      case 'success':
      case 'active':
        return {
          bg: 'bg-emerald-50',
          text: 'text-emerald-700',
          border: 'border-emerald-200',
          dot: 'bg-emerald-500',
        };

      // Amber / Warning / Pending states
      case 'New':
      case 'Preparing':
      case 'Pending Review':
      case 'Pending':
      case 'warning':
      case 'Medium':
      case 'idle':
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          border: 'border-amber-200',
          dot: 'bg-amber-500',
        };

      // Critical / Error / Danger / Mismatch states
      case 'Cancelled':
      case 'Mismatch Detected':
      case 'Rejected':
      case 'danger':
      case 'High':
      case 'Warning':
        return {
          bg: 'bg-rose-50',
          text: 'text-rose-700',
          border: 'border-rose-200',
          dot: 'bg-rose-500',
        };

      // Info / Blue / Indigo states
      case 'Needs Manual Review':
      case 'More Info Needed':
      case 'Escalated':
      case 'info':
        return {
          bg: 'bg-indigo-50',
          text: 'text-indigo-700',
          border: 'border-indigo-200',
          dot: 'bg-indigo-500',
        };

      // Neutral / Low states
      case 'Low':
      case 'neutral':
      default:
        return {
          bg: 'bg-slate-100',
          text: 'text-slate-700',
          border: 'border-slate-200',
          dot: 'bg-slate-400',
        };
    }
  };

  const style = getStyles(variant);
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${style.bg} ${style.text} ${style.border} ${sizeClass} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />}
      {children}
    </span>
  );
};
