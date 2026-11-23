import React from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  MessageSquare,
  Sparkles,
  Receipt,
  ShieldAlert,
  Bot,
  BarChart3,
  Users,
  Settings,
  X,
  Store,
  ChevronRight,
  Sparkle,
} from 'lucide-react';

export type PageId =
  | 'overview'
  | 'orders'
  | 'inbox'
  | 'customizations'
  | 'payments'
  | 'approvals'
  | 'analytics'
  | 'customers'
  | 'settings';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  badges?: {
    orders?: number;
    inbox?: number;
    customizations?: number;
    payments?: number;
    approvals?: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isOpenMobile,
  onCloseMobile,
  badges = {},
}) => {
  const navSections = [
    {
      title: 'Core Workspace',
      items: [
        { id: 'overview' as PageId, label: 'Overview', icon: LayoutDashboard },
        { id: 'orders' as PageId, label: 'Orders', icon: ShoppingBag, badge: badges.orders },
        {
          id: 'inbox' as PageId,
          label: 'WhatsApp Inbox',
          icon: MessageSquare,
          badge: badges.inbox,
          badgeColor: 'bg-emerald-600 text-white',
        },
      ],
    },
    {
      title: 'Decisions & Review',
      items: [
        {
          id: 'customizations' as PageId,
          label: 'Customizations',
          icon: Sparkles,
          badge: badges.customizations,
        },
        {
          id: 'payments' as PageId,
          label: 'Payment Audit',
          icon: Receipt,
          badge: badges.payments,
          badgeColor: 'bg-amber-600 text-white',
        },
        {
          id: 'approvals' as PageId,
          label: 'Approval Center',
          icon: ShieldAlert,
          badge: badges.approvals,
          badgeColor: 'bg-rose-600 text-white',
        },
      ],
    },
    {
      title: 'Performance',
      items: [
        { id: 'analytics' as PageId, label: 'Sales Analytics', icon: BarChart3 },
      ],
    },
    {
      title: 'Management',
      items: [
        { id: 'customers' as PageId, label: 'Customers', icon: Users },
        { id: 'settings' as PageId, label: 'Bakery Settings', icon: Settings },
      ],
    },
  ];

  const handleItemClick = (page: PageId) => {
    onNavigate(page);
    onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-glow">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <path d="M8 10h.01" />
              <path d="M12 10h.01" />
              <path d="M16 10h.01" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-white font-sans">
                MIRA
              </span>
              <span className="text-[9px] font-bold tracking-wider text-brand-300 uppercase bg-brand-950 px-1.5 py-0.5 rounded border border-brand-800">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-tight truncate max-w-[150px]">
              Merchant Retail Assistant
            </p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          aria-label="Close navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navSections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-3 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {sec.title}
            </div>
            {sec.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group relative ${
                    isActive
                      ? 'bg-brand-600 text-white font-semibold shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        item.badgeColor || (isActive ? 'bg-white/20 text-white' : 'bg-brand-900/60 text-brand-300 border border-brand-800/80')
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bakery Business Profile Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <div
          onClick={() => handleItemClick('settings')}
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/80 transition-colors cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-brand-900 text-brand-300 flex items-center justify-center font-bold text-xs flex-shrink-0 border border-brand-700/50">
            <Store className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-white truncate group-hover:text-brand-300">
              Sweet Haven Bakery
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[10px] text-slate-400 truncate">Live Orders • Bengaluru</p>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (w-64) */}
      <aside className="hidden lg:block w-64 h-screen fixed inset-y-0 left-0 z-30 select-none">
        {content}
      </aside>

      {/* Mobile Collapsible Drawer */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
