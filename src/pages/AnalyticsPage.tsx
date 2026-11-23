import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Percent,
  XCircle,
  Calendar,
  Award,
  ArrowUpRight,
  PieChart,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { BarTrendChart } from '../components/charts/BarTrendChart';
import { DonutChart } from '../components/charts/DonutChart';
import { Order, PaymentVerification } from '../types';

interface AnalyticsPageProps {
  orders: Order[];
  payments: PaymentVerification[];
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ orders, payments }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'month'>('7d');

  // Real dynamic calculations from orders array
  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === 'Completed').length;
  const cancelledOrders = orders.filter((o) => o.status === 'Cancelled').length;

  const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;
  const cancellationRate = totalOrders > 0 ? Math.round((cancelledOrders / totalOrders) * 100) : 0;

  // Distinguish Total Order Value from Confirmed Revenue (only verified payments)
  const totalOrderValue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const confirmedRevenue = orders
    .filter((o) => o.paymentStatus === 'Verified' && o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const averageOrderValue =
    totalOrders > 0 ? confirmedRevenue / Math.max(orders.filter((o) => o.paymentStatus === 'Verified').length, 1) : 0;

  // Status Distribution for Donut Chart
  const statusCounts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  const statusSlices = [
    { label: 'Confirmed / Prep', value: (statusCounts['Confirmed'] || 0) + (statusCounts['Preparing'] || 0), color: '#4f46e5' },
    { label: 'New Inquiries', value: statusCounts['New'] || 0, color: '#f59e0b' },
    { label: 'Ready / Done', value: (statusCounts['Ready'] || 0) + (statusCounts['Completed'] || 0), color: '#10b981' },
    { label: 'Cancelled', value: statusCounts['Cancelled'] || 0, color: '#f43f5e' },
  ];

  // Payment Outcomes
  const paymentVerifiedCount = payments.filter((p) => p.status === 'Verified').length;
  const paymentMismatchCount = payments.filter((p) => p.status === 'Mismatch Detected').length;
  const paymentReviewCount = payments.filter((p) => p.status === 'Pending Review' || p.status === 'Needs Manual Review').length;

  const paymentSlices = [
    { label: 'Verified', value: paymentVerifiedCount, color: '#10b981' },
    { label: 'Mismatches', value: paymentMismatchCount, color: '#f43f5e' },
    { label: 'Under Review', value: paymentReviewCount, color: '#f59e0b' },
  ];

  // Daily Trend data
  const trendData = [
    { label: 'Fri', orders: 12, revenue: 380 },
    { label: 'Sat', orders: 24, revenue: 840 },
    { label: 'Sun', orders: 28, revenue: 990 },
    { label: 'Mon', orders: 8, revenue: 260 },
    { label: 'Tue', orders: 14, revenue: 420 },
    { label: 'Wed', orders: 16, revenue: 510 },
    { label: 'Thu', orders: totalOrders, revenue: confirmedRevenue },
  ];

  // Popular bakery products aggregated from actual order items
  const productCountMap: Record<string, { count: number; revenue: number }> = {};
  orders.forEach((o) => {
    o.items.forEach((item) => {
      if (!productCountMap[item.name]) {
        productCountMap[item.name] = { count: 0, revenue: 0 };
      }
      productCountMap[item.name].count += item.quantity;
      productCountMap[item.name].revenue += item.quantity * item.unitPrice;
    });
  });

  const popularProducts = Object.entries(productCountMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Date Filter & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-subtle">
        <div>
          <h2 className="text-base font-bold text-slate-900">Sweet Haven Bakery Financial & Order Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Confirmed revenue excludes unverified payments and pending advance tokens.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium text-slate-600">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              timeRange === '7d' ? 'bg-white shadow-xs text-brand-700 font-semibold' : ''
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              timeRange === '30d' ? 'bg-white shadow-xs text-brand-700 font-semibold' : ''
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              timeRange === 'month' ? 'bg-white shadow-xs text-brand-700 font-semibold' : ''
            }`}
          >
            This Month
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Confirmed Revenue */}
        <Card className="p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Confirmed Revenue
          </span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            ${confirmedRevenue.toFixed(2)}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">From verified payments</p>
        </Card>

        {/* Total Order Value */}
        <Card className="p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Order Pipeline
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            ${totalOrderValue.toFixed(2)}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Includes pending tokens</p>
        </Card>

        {/* Total Orders */}
        <Card className="p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Orders
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{totalOrders}</div>
          <p className="text-[10px] text-slate-400 mt-1">Across all WhatsApp slots</p>
        </Card>

        {/* Average Order Value */}
        <Card className="p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Average Order Value
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            ${averageOrderValue.toFixed(2)}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Per confirmed order</p>
        </Card>

        {/* Cancellation Rate */}
        <Card className="p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Cancellation Rate
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">{cancellationRate}%</div>
          <p className="text-[10px] text-slate-400 mt-1">1 customer emergency</p>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Revenue & Order Trajectory"
            subtitle="Daily confirmed sales trends over past week"
          />
          <CardContent>
            <BarTrendChart data={trendData} metric="revenue" height={240} />
          </CardContent>
        </Card>

        {/* Orders by Status Donut */}
        <Card className="lg:col-span-1">
          <CardHeader
            title="Orders by Lifecycle Status"
            subtitle="Distribution of bakery orders"
          />
          <CardContent className="flex items-center justify-center pt-2">
            <DonutChart slices={statusSlices} totalLabel="Orders" totalValue={totalOrders} size={150} />
          </CardContent>
        </Card>
      </div>

      {/* Grid: Popular Products & Payment Verification Outcomes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Products */}
        <Card>
          <CardHeader
            title="Top Performing Bakery Creations"
            subtitle="Ranked by gross sales volume and orders"
          />
          <CardContent className="p-0 divide-y divide-slate-100 text-xs">
            {popularProducts.map((p, idx) => (
              <div key={idx} className="p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-brand-50 text-brand-700 font-bold flex items-center justify-center text-xs">
                    #{idx + 1}
                  </span>
                  <div>
                    <h5 className="font-semibold text-slate-900">{p.name}</h5>
                    <span className="text-[11px] text-slate-400">{p.count} units sold</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900">${p.revenue.toFixed(2)}</span>
                  <span className="text-[10px] text-emerald-600 block">High Margin</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Payment Outcomes */}
        <Card>
          <CardHeader
            title="Payment Verification Audit Outcomes"
            subtitle="Breakdown of automated and merchant sign-offs"
          />
          <CardContent className="flex items-center justify-center pt-4">
            <DonutChart
              slices={paymentSlices}
              totalLabel="Slips"
              totalValue={payments.length}
              size={150}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
