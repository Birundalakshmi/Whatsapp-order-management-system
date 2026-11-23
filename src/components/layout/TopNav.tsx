import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  Store,
  Sparkles,
  Plus,
  Check,
  Info,
  ExternalLink,
  MessageSquare,
  User,
} from 'lucide-react';
import { PageId } from './Sidebar';
import { NotificationPanel } from './NotificationPanel';

interface TopNavProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  onOpenMobileMenu: () => void;
  onOpenSearch: () => void;
  isBackendLive?: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentPage,
  onNavigate,
  onOpenMobileMenu,
  onOpenSearch,
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBranchOpen, setIsBranchOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('Sweet Haven - Indiranagar (Main)');
  const [showSandboxModal, setShowSandboxModal] = useState(false);

  const branches = [
    'Sweet Haven - Indiranagar (Main)',
    'Sweet Haven - Koramangala Kitchen',
    'Sweet Haven - Whitefield Studio',
  ];

  const getPageInfo = (page: PageId): { title: string; breadcrumb: string } => {
    switch (page) {
      case 'overview':
        return { title: 'Overview Dashboard', breadcrumb: 'Bakery Live Monitor' };
      case 'orders':
        return { title: 'Orders & Production Queue', breadcrumb: 'Order Fulfillment' };
      case 'inbox':
        return { title: 'WhatsApp Live Inbox', breadcrumb: 'Customer Support' };
      case 'customizations':
        return { title: 'Custom Cake Requests', breadcrumb: 'Artisanal Bakes' };
      case 'payments':
        return { title: 'Payment Verification & OCR', breadcrumb: 'Financial Audit' };
      case 'approvals':
        return { title: 'Approval Center', breadcrumb: 'Merchant Interventions' };
      case 'analytics':
        return { title: 'Sales & Revenue Analytics', breadcrumb: 'Performance' };
      case 'customers':
        return { title: 'Customer Directory', breadcrumb: 'Clients' };
      case 'settings':
        return { title: 'Bakery Configuration', breadcrumb: 'Kitchen Settings' };
    }
  };

  const pageInfo = getPageInfo(currentPage);

  return (
    <>
      <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between">
        {/* Left side: Mobile Menu + Breadcrumb & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="Open sidebar navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <span>Sweet Haven Bakery</span>
              <span className="text-slate-300">/</span>
              <span className="text-brand-600 font-semibold">{pageInfo.breadcrumb}</span>
            </div>
            <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight leading-tight">
              {pageInfo.title}
            </h1>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Search Spotlight Button */}
          <button
            onClick={onOpenSearch}
            className="hidden md:flex items-center gap-2.5 text-xs text-slate-400 bg-slate-50 hover:bg-slate-100/80 hover:text-slate-600 border border-slate-200/90 px-3 py-1.5 rounded-xl transition-all shadow-subtle group cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 transition-colors" />
            <span className="text-slate-500 font-medium">Search orders, chats, clients...</span>
            <kbd className="text-[10px] font-mono bg-white text-slate-500 border border-slate-200 shadow-2xs rounded px-1.5 py-0.5">
              ⌘K
            </kbd>
          </button>

          <button
            onClick={onOpenSearch}
            className="md:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* WhatsApp Status Pill */}
          <button
            onClick={() => onNavigate('inbox')}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="truncate">WhatsApp Live</span>
          </button>

          {/* Quick Action Button: New WhatsApp Inquiry */}
          <button
            onClick={() => onNavigate('inbox')}
            className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 rounded-xl shadow-xs transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Open WhatsApp</span>
          </button>

          {/* Branch Switcher */}
          <div className="relative hidden xl:block">
            <button
              onClick={() => setIsBranchOpen(!isBranchOpen)}
              className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 transition-colors shadow-subtle"
            >
              <Store className="w-3.5 h-3.5 text-brand-600" />
              <span className="truncate max-w-[140px]">{selectedBranch.replace('Sweet Haven - ', '')}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isBranchOpen && (
              <div className="absolute right-0 top-11 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-slate-400">
                  Switch Bakery Kitchen
                </div>
                {branches.map((b) => (
                  <button
                    key={b}
                    onClick={() => {
                      setSelectedBranch(b);
                      setIsBranchOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center justify-between"
                  >
                    <span className="font-medium">{b}</span>
                    {selectedBranch === b && <Check className="w-3.5 h-3.5 text-brand-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notification Button */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              aria-label="View notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </button>

            <NotificationPanel
              isOpen={isNotifOpen}
              onClose={() => setIsNotifOpen(false)}
              onNavigate={onNavigate}
            />
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1.5 px-2 hover:bg-slate-100 rounded-xl transition-colors border border-transparent hover:border-slate-200"
            >
              <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200">
                <User className="w-4 h-4 text-slate-600" />
              </div>
              <span className="hidden md:inline text-xs font-semibold text-slate-800">
                Alex Morgan
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 top-11 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                <div className="p-2.5 border-b border-slate-100 mb-1">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200 flex-shrink-0">
                      <User className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 truncate">Alex Morgan</p>
                      <p className="text-[11px] text-slate-400 truncate">admin@sweethavenbakery.in</p>
                    </div>
                  </div>
                  <span className="inline-block mt-1 text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                    Master Baker & Owner
                  </span>
                </div>
                <button
                  onClick={() => {
                    onNavigate('settings');
                    setIsProfileOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 rounded-lg font-medium"
                >
                  Bakery Settings & Catalog
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};
