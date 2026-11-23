import React, { useState } from 'react';
import {
  Users,
  Search,
  Phone,
  Mail,
  ShoppingBag,
  DollarSign,
  MessageSquare,
  Sparkles,
  Calendar,
  AlertTriangle,
  ChevronRight,
  Heart,
  Tag,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Drawer } from '../components/common/Drawer';
import { SearchFilterBar } from '../components/common/SearchFilterBar';
import { Customer, Order } from '../types';

interface CustomersPageProps {
  customers: Customer[];
  orders: Order[];
  onOpenChat: (phone: string) => void;
}

export const CustomersPage: React.FC<CustomersPageProps> = ({
  customers,
  orders,
  onOpenChat,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filtered = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      (c.email && c.email.toLowerCase().includes(q))
    );
  });

  const customerOrders = selectedCustomer
    ? orders.filter((o) => o.customerPhone === selectedCustomer.phone)
    : [];

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search customers by name, phone number, email..."
        totalResults={filtered.length}
      />

      {/* Customers Table / Grid */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Total Orders & Spent</th>
                <th className="py-3 px-4">Preferences & Dietary</th>
                <th className="py-3 px-4">Last Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => setSelectedCustomer(c)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  {/* Name & Avatar */}
                  <td className="py-3.5 px-4 align-top">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={c.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'}
                        alt={c.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-brand-700 transition-colors">
                          {c.name}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          {c.tags.slice(0, 2).map((t) => (
                            <span
                              key={t}
                              className="text-[9px] font-medium bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="py-3.5 px-4 align-top">
                    <div className="font-medium text-slate-700">{c.phone}</div>
                    {c.email && <div className="text-[11px] text-slate-400 mt-0.5">{c.email}</div>}
                  </td>

                  {/* Orders & Spend */}
                  <td className="py-3.5 px-4 align-top">
                    <div className="font-semibold text-slate-900">{c.totalOrders} orders</div>
                    <div className="text-[11px] font-bold text-emerald-700 mt-0.5">
                      ${c.totalSpent.toFixed(2)} total spent
                    </div>
                  </td>

                  {/* Preferences */}
                  <td className="py-3.5 px-4 align-top max-w-xs">
                    <div className="flex flex-wrap gap-1">
                      {c.dietaryRestrictions.map((d) => (
                        <span
                          key={d}
                          className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.2 rounded-full"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 truncate">
                      Flavors: {c.preferredFlavors.join(', ')}
                    </div>
                  </td>

                  {/* Last Active */}
                  <td className="py-3.5 px-4 align-top text-slate-500">
                    <div>{c.lastInteraction}</div>
                    <div className="text-[10px] text-slate-400">Since {c.firstOrderDate}</div>
                  </td>

                  {/* Action */}
                  <td
                    className="py-3.5 px-4 align-top text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onOpenChat(c.phone)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors border border-brand-200"
                    >
                      <MessageSquare className="w-3 h-3" />
                      Chat
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Customer Detail Drawer */}
      <Drawer
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title={selectedCustomer ? selectedCustomer.name : ''}
        subtitle={selectedCustomer ? `Customer since ${selectedCustomer.firstOrderDate}` : ''}
        width="lg"
      >
        {selectedCustomer && (
          <div className="space-y-6 text-xs">
            {/* Profile Summary */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-4">
              <img
                src={selectedCustomer.avatar}
                alt={selectedCustomer.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-brand-200"
              />
              <div className="flex-1">
                <h4 className="text-base font-bold text-slate-900">{selectedCustomer.name}</h4>
                <div className="flex items-center gap-3 text-slate-600 mt-1">
                  <span>{selectedCustomer.phone}</span>
                  {selectedCustomer.email && <span>• {selectedCustomer.email}</span>}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {selectedCustomer.tags.map((t) => (
                    <Badge key={t} size="sm">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Spending & Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  Total Completed Orders
                </span>
                <div className="text-xl font-bold text-slate-900 mt-1">
                  {selectedCustomer.totalOrders}
                </div>
              </div>
              <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-center">
                <span className="text-[10px] font-bold uppercase text-slate-400">
                  Cumulative Lifetime Spend
                </span>
                <div className="text-xl font-bold text-emerald-700 mt-1">
                  ${selectedCustomer.totalSpent.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="p-4 rounded-xl border border-slate-200 space-y-2">
              <h5 className="font-semibold text-slate-900 text-xs">Taste & Dietary Profile</h5>
              <div>
                <span className="text-slate-400 text-[11px] block">Favorite Flavors:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedCustomer.preferredFlavors.map((f) => (
                    <span
                      key={f}
                      className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-[11px]"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              <div className="pt-2">
                <span className="text-slate-400 text-[11px] block">Dietary Restrictions:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {selectedCustomer.dietaryRestrictions.map((d) => (
                    <span
                      key={d}
                      className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11px]"
                    >
                      🌱 {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Past Orders History */}
            <div className="p-4 rounded-xl border border-slate-200">
              <h5 className="font-semibold text-slate-900 text-xs mb-3">Order History</h5>
              {customerOrders.length === 0 ? (
                <p className="text-slate-400 text-center py-4">No past orders on record</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {customerOrders.map((o) => (
                    <div key={o.id} className="py-2.5 flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-brand-700">Order #{o.id}</div>
                        <p className="text-slate-600 mt-0.5">
                          {o.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          {new Date(o.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900">${o.totalAmount.toFixed(2)}</span>
                        <div className="mt-1">
                          <Badge variant={o.status} size="sm">
                            {o.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Action */}
            <div className="pt-2">
              <button
                onClick={() => {
                  onOpenChat(selectedCustomer.phone);
                  setSelectedCustomer(null);
                }}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-semibold shadow-xs flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Launch WhatsApp Conversation
              </button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
