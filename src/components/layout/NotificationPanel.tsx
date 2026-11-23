import React, { useState } from 'react';
import { Bell, CheckCheck, X, AlertTriangle, MessageSquare, Receipt, Sparkles } from 'lucide-react';
import { PageId } from './Sidebar';

export interface AppNotification {
  id: string;
  type: 'payment' | 'customization' | 'order' | 'inbox';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  targetPage: PageId;
}

const initialNotifications: AppNotification[] = [
  {
    id: 'n-1',
    type: 'payment',
    title: 'Payment Discrepancy Flagged',
    description: 'Order #SH-1084 (Rahul Varma) received $120.00 vs expected $225.00.',
    timestamp: '15m ago',
    read: false,
    targetPage: 'payments',
  },
  {
    id: 'n-2',
    type: 'customization',
    title: 'Custom Cake Feasibility Scored',
    description: 'Ananya Sharma requested 2-tier eggless floral cake. AI feasibility 96%.',
    timestamp: '45m ago',
    read: false,
    targetPage: 'customizations',
  },
  {
    id: 'n-3',
    type: 'inbox',
    title: 'New WhatsApp Message',
    description: 'Priya Menon uploaded UPI screenshot for Order #SH-1082.',
    timestamp: '1h ago',
    read: false,
    targetPage: 'inbox',
  },
  {
    id: 'n-4',
    type: 'order',
    title: 'Weekly Subscription Generated',
    description: 'Regular customer Karthik Nair confirmed Friday morning sourdough delivery.',
    timestamp: '3h ago',
    read: true,
    targetPage: 'orders',
  },
];

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: PageId) => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClick = (item: AppNotification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    onNavigate(item.targetPage);
    onClose();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <Receipt className="w-4 h-4 text-amber-600" />;
      case 'customization':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      case 'inbox':
        return <MessageSquare className="w-4 h-4 text-emerald-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-brand-600" />;
    }
  };

  return (
    <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-slate-700" />
          <span className="text-xs font-semibold text-slate-900">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-brand-600 text-white">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[11px] text-brand-600 hover:text-brand-800 font-medium flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No notifications</div>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleClick(item)}
              className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                !item.read ? 'bg-brand-50/30' : ''
              }`}
            >
              <div className="p-2 rounded-lg bg-slate-100 flex-shrink-0 mt-0.5">
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={`text-xs font-semibold truncate ${!item.read ? 'text-slate-900' : 'text-slate-600'}`}>
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 flex-shrink-0">{item.timestamp}</span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                  {item.description}
                </p>
              </div>
              {!item.read && <span className="w-2 h-2 rounded-full bg-brand-600 flex-shrink-0 mt-1.5" />}
            </div>
          ))
        )}
      </div>

      <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
        <button
          onClick={() => {
            onNavigate('approvals');
            onClose();
          }}
          className="text-xs font-medium text-brand-600 hover:text-brand-800"
        >
          View Approval Center queue →
        </button>
      </div>
    </div>
  );
};
