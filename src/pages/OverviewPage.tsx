import React, { useState } from 'react';
import {
  ShoppingBag,
  Clock,
  DollarSign,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  Bot,
  Calendar,
  Truck,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Receipt,
  MessageSquare,
  Sparkle,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { BarTrendChart } from '../components/charts/BarTrendChart';
import { MiniSparkline } from '../components/charts/MiniSparkline';
import { PageId } from '../components/layout/Sidebar';
import { Order, ApprovalItem, AgentExecutionLog } from '../types';

interface OverviewPageProps {
  orders: Order[];
  approvals: ApprovalItem[];
  executionLogs: AgentExecutionLog[];
  onNavigate: (page: PageId) => void;
  onSelectOrder: (order: Order) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  orders,
  approvals,
  executionLogs,
  onNavigate,
  onSelectOrder,
}) => {
  const [trendRange, setTrendRange] = useState<'7d' | '14d' | '30d'>('7d');
  const [trendMetric, setTrendMetric] = useState<'orders' | 'revenue'>('orders');

  const totalOrdersToday = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'New' || o.status === 'Preparing').length;
  const pendingApprovalsCount = approvals.filter((a) => a.status === 'Pending').length;

  // Confirmed revenue only (exclude unverified payments & cancellations)
  const confirmedRevenueToday = orders
    .filter((o) => o.paymentStatus === 'Verified' && o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Realistic bakery trend data
  const trendData7d = [
    { label: 'Fri', orders: 12, revenue: 380 },
    { label: 'Sat', orders: 24, revenue: 840 },
    { label: 'Sun', orders: 28, revenue: 990 },
    { label: 'Mon', orders: 8, revenue: 260 },
    { label: 'Tue', orders: 14, revenue: 420 },
    { label: 'Wed', orders: 16, revenue: 510 },
    { label: 'Today', orders: totalOrdersToday, revenue: confirmedRevenueToday },
  ];

  const trendData14d = [
    { label: 'Oct 2', orders: 10, revenue: 310 },
    { label: 'Oct 4', orders: 15, revenue: 450 },
    { label: 'Oct 6', orders: 22, revenue: 780 },
    { label: 'Oct 8', orders: 11, revenue: 350 },
    { label: 'Oct 10', orders: 18, revenue: 560 },
    { label: 'Oct 12', orders: 25, revenue: 890 },
    { label: 'Oct 15', orders: totalOrdersToday, revenue: confirmedRevenueToday },
  ];

  const currentTrendData = trendRange === '7d' ? trendData7d : trendData14d;

  const upcomingDeliveries = orders
    .filter((o) => o.status === 'Preparing' || o.status === 'Confirmed' || o.status === 'Ready')
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-brand-900 via-indigo-900 to-slate-900 text-white shadow-card relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Subtle background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-brand-500/20 to-transparent pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-300 bg-white/10 px-2 py-0.5 rounded-full border border-white/15">
              Live Bakery Operations
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
            Good afternoon, Alex 👋
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Sweet Haven Bakery has <strong className="text-white">{pendingOrdersCount} orders</strong> in preparation and{' '}
            <strong className="text-rose-300">{pendingApprovalsCount} cases</strong> requiring your personal decision in the Approval Center.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2.5 flex-shrink-0">
          <button
            onClick={() => onNavigate('inbox')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Open WhatsApp Inbox</span>
          </button>
          <button
            onClick={() => onNavigate('approvals')}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-300" />
            <span>Review Queue ({pendingApprovalsCount})</span>
          </button>
        </div>
      </div>

      {/* KPI Cards (4 Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Orders Today */}
        <Card className="p-5 hover:border-brand-200 transition-all hover:shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Orders Today
            </span>
            <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-extrabold text-slate-900">{totalOrdersToday}</div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <ArrowUpRight className="w-3 h-3" />
              <span>+14.2%</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>vs. 16 yesterday</span>
            <MiniSparkline data={[12, 14, 18, 15, 20, 18]} color="#4f46e5" />
          </div>
        </Card>

        {/* In Kitchen / Pending */}
        <Card className="p-5 hover:border-amber-200 transition-all hover:shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              In Kitchen Prep
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-extrabold text-slate-900">{pendingOrdersCount}</div>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              2 need bake prep
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            <span>Next bake deadline: Today 4:30 PM</span>
          </div>
        </Card>

        {/* Confirmed Revenue */}
        <Card className="p-5 hover:border-emerald-200 transition-all hover:shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Confirmed Revenue
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-extrabold text-slate-900">
              ${confirmedRevenueToday.toFixed(2)}
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <TrendingUp className="w-3 h-3" />
              <span>+8.4%</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="truncate">Excludes unverified tokens</span>
            <MiniSparkline data={[240, 310, 420, 380, 510, confirmedRevenueToday]} color="#059669" />
          </div>
        </Card>

        {/* Awaiting Approval */}
        <Card
          onClick={() => onNavigate('approvals')}
          className="p-5 hover:border-rose-300 transition-all hover:shadow-card cursor-pointer group bg-gradient-to-br from-white via-white to-rose-50/30"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Awaiting Approval
            </span>
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-100 transition-colors">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="text-2xl font-extrabold text-rose-600">{pendingApprovalsCount}</div>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 animate-pulse">
              Action Required
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 group-hover:text-rose-600 font-semibold">
            <span>Review human queue</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </Card>
      </div>

      {/* Main Grid: Attention Required & Order Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section A: Attention Required */}
        <Card className="lg:col-span-1 flex flex-col">
          <CardHeader
            title="Attention Required"
            subtitle="Prioritized queue needing merchant sign-off"
            action={
              <button
                onClick={() => onNavigate('approvals')}
                className="text-xs font-bold text-brand-600 hover:text-brand-800"
              >
                View all ({pendingApprovalsCount})
              </button>
            }
          />
          <CardContent className="p-0 flex-1 divide-y divide-slate-100">
            {approvals.slice(0, 4).map((app) => (
              <div
                key={app.id}
                onClick={() => onNavigate('approvals')}
                className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 group"
              >
                <div
                  className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${
                    app.urgency === 'High'
                      ? 'bg-rose-50 text-rose-600'
                      : app.urgency === 'Medium'
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {app.issueType}
                    </span>
                    <Badge variant={app.urgency} size="sm">
                      {app.urgency}
                    </Badge>
                  </div>
                  <p className="text-xs font-medium text-slate-700 mt-0.5 truncate">
                    {app.customerName} • Order #{app.orderId}
                  </p>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-snug">
                    {app.reasonForEscalation}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Section C: Order Trends Chart */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Order Trends & Sales Volume"
            subtitle="Daily completed and ongoing orders for Sweet Haven Bakery"
            action={
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold text-slate-600">
                  <button
                    onClick={() => setTrendMetric('orders')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      trendMetric === 'orders' ? 'bg-white shadow-xs text-brand-700 font-bold' : ''
                    }`}
                  >
                    Orders
                  </button>
                  <button
                    onClick={() => setTrendMetric('revenue')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      trendMetric === 'revenue' ? 'bg-white shadow-xs text-brand-700 font-bold' : ''
                    }`}
                  >
                    Revenue
                  </button>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold text-slate-600">
                  <button
                    onClick={() => setTrendRange('7d')}
                    className={`px-2 py-1 rounded-md transition-colors ${
                      trendRange === '7d' ? 'bg-white shadow-xs text-brand-700 font-bold' : ''
                    }`}
                  >
                    7D
                  </button>
                  <button
                    onClick={() => setTrendRange('14d')}
                    className={`px-2 py-1 rounded-md transition-colors ${
                      trendRange === '14d' ? 'bg-white shadow-xs text-brand-700 font-bold' : ''
                    }`}
                  >
                    14D
                  </button>
                </div>
              </div>
            }
          />
          <CardContent className="pt-2">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
              <span className="font-semibold text-slate-700">
                {trendMetric === 'orders' ? 'Orders per day' : 'Revenue per day ($)'}
              </span>
              <span className="text-slate-400">Hover bar for exact breakdown</span>
            </div>
            <BarTrendChart data={currentTrendData} metric={trendMetric} height={220} />
          </CardContent>
        </Card>
      </div>

      {/* Grid: Recent Orders & Upcoming Deliveries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section B: Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent Orders"
            subtitle="Incoming WhatsApp and direct bakery orders"
            action={
              <button
                onClick={() => onNavigate('orders')}
                className="text-xs font-bold text-brand-600 hover:text-brand-800"
              >
                View all orders →
              </button>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {orders.slice(0, 5).map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => onSelectOrder(order)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-bold text-brand-700">#{order.id}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{order.customerName}</div>
                      <div className="text-[11px] text-slate-400">{order.customerPhone}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="truncate text-slate-700 font-medium">
                        {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={order.status} showDot>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-brand-600 group-hover:text-brand-800 font-bold">
                        View
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Section E: Upcoming Deliveries & Pickups */}
        <Card className="lg:col-span-1">
          <CardHeader
            title="Upcoming Deliveries & Pickups"
            subtitle="Scheduled kitchen handovers"
          />
          <CardContent className="p-0 divide-y divide-slate-100">
            {upcomingDeliveries.map((order) => (
              <div
                key={order.id}
                onClick={() => onSelectOrder(order)}
                className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{order.customerName}</span>
                  <span className="flex items-center gap-1 font-bold text-brand-700">
                    {order.deliveryType === 'Delivery' ? (
                      <Truck className="w-3.5 h-3.5" />
                    ) : (
                      <ShoppingBag className="w-3.5 h-3.5" />
                    )}
                    {order.deliveryType}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 truncate font-medium">
                  {order.items[0]?.name}
                </div>
                <div className="flex items-center justify-between mt-2 text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(order.requestedDateTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  <Badge variant={order.status} size="sm">
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Section D: Automated Assistant Activity Summary */}
      <Card>
        <CardHeader
          title="Recent Automated Assistant Actions"
          subtitle="Real-time automated processing activity across WhatsApp and Payments"
        />
        <div className="divide-y divide-slate-100 text-xs">
          {executionLogs.slice(0, 3).map((log) => (
            <div key={log.id} className="p-4 flex items-start gap-3 hover:bg-slate-50/50">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-brand-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.agentName}</span>
                    <span className="text-[10px] text-slate-400">• {log.latencyMs}ms</span>
                  </div>
                  <Badge
                    variant={log.outcome === 'Success' ? 'success' : log.outcome === 'Escalated' ? 'warning' : 'danger'}
                    size="sm"
                  >
                    {log.outcome}
                  </Badge>
                </div>
                <p className="text-slate-700 mt-1 font-medium">{log.summary}</p>
                {log.evidenceSummary && (
                  <p className="text-[11px] text-slate-400 mt-0.5 italic">
                    Evidence: {log.evidenceSummary}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
