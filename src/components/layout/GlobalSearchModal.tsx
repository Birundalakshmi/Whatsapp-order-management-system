import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, MessageSquare, Users, Sparkles, X, ArrowRight } from 'lucide-react';
import { PageId } from './Sidebar';
import { initialOrders, initialCustomers, initialConversations } from '../../data/mockData';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: PageId) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchedOrders = q
    ? initialOrders.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.items.some((i) => i.name.toLowerCase().includes(q))
      )
    : [];

  const matchedCustomers = q
    ? initialCustomers.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          (c.email && c.email.toLowerCase().includes(q))
      )
    : [];

  const matchedConversations = q
    ? initialConversations.filter(
        (c) =>
          c.customerName.toLowerCase().includes(q) ||
          c.lastMessage.toLowerCase().includes(q)
      )
    : [];

  const totalMatches =
    matchedOrders.length + matchedCustomers.length + matchedConversations.length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-start justify-center pt-16 px-4">
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
          {/* Search bar */}
          <div className="flex items-center px-4 py-3.5 border-b border-slate-100">
            <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search orders, customers, WhatsApp messages..."
              className="w-full text-sm placeholder:text-slate-400 text-slate-800 bg-transparent focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-slate-400 hover:text-slate-600 p-1 mr-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-block text-[10px] uppercase font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
              ESC
            </kbd>
          </div>

          {/* Results container */}
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {!query ? (
              <div className="p-6 text-center text-xs text-slate-400">
                <p className="font-medium text-slate-600 mb-1">Quick Navigation</p>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                  <button
                    onClick={() => {
                      onNavigate('orders');
                      onClose();
                    }}
                    className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs flex items-center gap-1.5 border border-slate-200"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-brand-600" />
                    Orders
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('inbox');
                      onClose();
                    }}
                    className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs flex items-center gap-1.5 border border-slate-200"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    WhatsApp Inbox
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('customizations');
                      onClose();
                    }}
                    className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs flex items-center gap-1.5 border border-slate-200"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    Customizations
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('customers');
                      onClose();
                    }}
                    className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs flex items-center gap-1.5 border border-slate-200"
                  >
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    Customers
                  </button>
                </div>
              </div>
            ) : totalMatches === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No matching orders, customers or conversations found for "{query}".
              </div>
            ) : (
              <div className="space-y-4 p-2">
                {matchedOrders.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Orders ({matchedOrders.length})
                    </div>
                    {matchedOrders.map((o) => (
                      <div
                        key={o.id}
                        onClick={() => {
                          onNavigate('orders');
                          onClose();
                        }}
                        className="p-2.5 rounded-lg hover:bg-slate-50 flex items-center justify-between cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <ShoppingBag className="w-4 h-4 text-brand-600" />
                          <div>
                            <div className="text-xs font-semibold text-slate-800">
                              Order #{o.id} • {o.customerName}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-sm">
                              {o.items.map((i) => i.name).join(', ')} • ${o.totalAmount.toFixed(2)}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600" />
                      </div>
                    ))}
                  </div>
                )}

                {matchedCustomers.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Customers ({matchedCustomers.length})
                    </div>
                    {matchedCustomers.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          onNavigate('customers');
                          onClose();
                        }}
                        className="p-2.5 rounded-lg hover:bg-slate-50 flex items-center justify-between cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <Users className="w-4 h-4 text-indigo-600" />
                          <div>
                            <div className="text-xs font-semibold text-slate-800">{c.name}</div>
                            <div className="text-[11px] text-slate-400">
                              {c.phone} • {c.totalOrders} orders (${c.totalSpent.toFixed(2)})
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600" />
                      </div>
                    ))}
                  </div>
                )}

                {matchedConversations.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      WhatsApp Chats ({matchedConversations.length})
                    </div>
                    {matchedConversations.map((conv) => (
                      <div
                        key={conv.id}
                        onClick={() => {
                          onNavigate('inbox');
                          onClose();
                        }}
                        className="p-2.5 rounded-lg hover:bg-slate-50 flex items-center justify-between cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <MessageSquare className="w-4 h-4 text-emerald-600" />
                          <div>
                            <div className="text-xs font-semibold text-slate-800">
                              {conv.customerName}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-sm">
                              "{conv.lastMessage}"
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-600" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
