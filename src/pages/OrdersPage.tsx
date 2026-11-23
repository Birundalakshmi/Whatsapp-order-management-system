import React, { useState } from 'react';
import {
  Search,
  Filter,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Truck,
  Eye,
  Check,
  RotateCcw,
  MessageSquare,
  FileText,
  DollarSign,
  ChevronRight,
  LayoutGrid,
  List,
  ArrowRight,
  Phone,
  MapPin,
  Calendar,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Drawer } from '../components/common/Drawer';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { SearchFilterBar, FilterGroup } from '../components/common/SearchFilterBar';
import { useToast } from '../components/common/ToastContext';
import { Order, OrderStatus } from '../types';

interface OrdersPageProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: OrderStatus, note?: string) => Promise<void>;
  selectedOrder?: Order | null;
  onSelectOrder: (order: Order | null) => void;
  onOpenChatWithCustomer?: (phone: string) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({
  orders,
  onUpdateStatus,
  selectedOrder,
  onSelectOrder,
  onOpenChatWithCustomer,
}) => {
  const { showToast } = useToast();
  const [viewMode, setViewMode] = useState<'table' | 'board'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'value_desc' | 'value_asc'>('date_desc');

  // Confirmation dialog state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    orderId: string;
    newStatus: OrderStatus;
    title: string;
    message: string;
    variant: 'danger' | 'warning' | 'primary' | 'success';
    requireReason?: boolean;
  }>({
    isOpen: false,
    orderId: '',
    newStatus: 'Confirmed',
    title: '',
    message: '',
    variant: 'primary',
  });

  const filterGroups: FilterGroup[] = [
    {
      id: 'status',
      label: 'Status',
      selectedValue: statusFilter,
      options: [
        { label: 'All Statuses', value: 'all' },
        { label: 'New', value: 'New' },
        { label: 'Confirmed', value: 'Confirmed' },
        { label: 'Preparing', value: 'Preparing' },
        { label: 'Ready', value: 'Ready' },
        { label: 'Completed', value: 'Completed' },
        { label: 'Cancelled', value: 'Cancelled' },
      ],
    },
    {
      id: 'payment',
      label: 'Payment',
      selectedValue: paymentFilter,
      options: [
        { label: 'All Payments', value: 'all' },
        { label: 'Verified', value: 'Verified' },
        { label: 'Pending Review', value: 'Pending Review' },
        { label: 'Mismatch Detected', value: 'Mismatch Detected' },
        { label: 'Rejected', value: 'Rejected' },
      ],
    },
    {
      id: 'sort',
      label: 'Sort',
      selectedValue: sortBy,
      options: [
        { label: 'Newest First', value: 'date_desc' },
        { label: 'Oldest First', value: 'date_asc' },
        { label: 'Highest Amount', value: 'value_desc' },
        { label: 'Lowest Amount', value: 'value_asc' },
      ],
    },
  ];

  const handleFilterChange = (groupId: string, val: string) => {
    if (groupId === 'status') setStatusFilter(val);
    if (groupId === 'payment') setPaymentFilter(val);
    if (groupId === 'sort') setSortBy(val as any);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPaymentFilter('all');
    setSortBy('date_desc');
  };

  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      o.id.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.includes(q) ||
      o.items.some((item) => item.name.toLowerCase().includes(q));

    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchPayment = paymentFilter === 'all' || o.paymentStatus === paymentFilter;

    return matchSearch && matchStatus && matchPayment;
  });

  filteredOrders.sort((a, b) => {
    if (sortBy === 'date_desc') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'date_asc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortBy === 'value_desc') return b.totalAmount - a.totalAmount;
    if (sortBy === 'value_asc') return a.totalAmount - b.totalAmount;
    return 0;
  });

  const initiateStatusChange = (orderId: string, newStatus: OrderStatus) => {
    if (newStatus === 'Cancelled') {
      setConfirmModal({
        isOpen: true,
        orderId,
        newStatus: 'Cancelled',
        title: `Cancel Order #${orderId}?`,
        message:
          'Cancelling will notify the customer via WhatsApp and halt all baking prep. Please provide a mandatory reason.',
        variant: 'danger',
        requireReason: true,
      });
    } else if (newStatus === 'Completed') {
      setConfirmModal({
        isOpen: true,
        orderId,
        newStatus: 'Completed',
        title: `Mark Order #${orderId} as Completed?`,
        message: 'Confirm that this order has been successfully picked up or delivered to the customer.',
        variant: 'success',
      });
    } else {
      handleConfirmStatus(orderId, newStatus);
    }
  };

  const handleConfirmStatus = async (orderId: string, newStatus: OrderStatus, note?: string) => {
    await onUpdateStatus(orderId, newStatus, note);
    showToast(`Order #${orderId} moved to ${newStatus}`, 'success');
  };

  const kanbanColumns: { status: OrderStatus; label: string; color: string }[] = [
    { status: 'New', label: 'New Inquiries', color: 'bg-amber-500' },
    { status: 'Confirmed', label: 'Confirmed by Baker', color: 'bg-brand-600' },
    { status: 'Preparing', label: 'In Kitchen Prep', color: 'bg-indigo-600' },
    { status: 'Ready', label: 'Ready for Handover', color: 'bg-emerald-600' },
    { status: 'Completed', label: 'Delivered / Completed', color: 'bg-slate-600' },
  ];

  return (
    <div className="space-y-4">
      {/* Search and Filters Header */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by order ID, customer name, phone, item..."
        filterGroups={filterGroups}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        totalResults={filteredOrders.length}
        rightAction={
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'table' ? 'bg-white shadow-xs text-brand-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'board' ? 'bg-white shadow-xs text-brand-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Kitchen Kanban Board"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Board</span>
            </button>
          </div>
        }
      />

      {/* KANBAN BOARD VIEW */}
      {viewMode === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {kanbanColumns.map((col) => {
            const colOrders = filteredOrders.filter((o) => o.status === col.status);
            return (
              <div key={col.status} className="bg-slate-100/70 rounded-2xl p-3 flex flex-col min-h-[450px]">
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 px-1 border-b border-slate-200/80 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                    <h4 className="text-xs font-extrabold text-slate-800 tracking-tight">
                      {col.label}
                    </h4>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 bg-white text-slate-700 rounded-full shadow-2xs border border-slate-200">
                    {colOrders.length}
                  </span>
                </div>

                {/* Cards in column */}
                <div className="flex-1 space-y-2.5 overflow-y-auto">
                  {colOrders.length === 0 ? (
                    <div className="h-32 flex items-center justify-center text-center text-xs text-slate-400 font-medium italic border border-dashed border-slate-200 rounded-xl">
                      Empty stage
                    </div>
                  ) : (
                    colOrders.map((order) => (
                      <div
                        key={order.id}
                        onClick={() => onSelectOrder(order)}
                        className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-subtle hover:border-brand-400 hover:shadow-card transition-all cursor-pointer group space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-brand-700 text-xs">
                            #{order.id}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(order.requestedDateTime).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div>
                          <h5 className="font-bold text-slate-900 text-xs truncate">
                            {order.customerName}
                          </h5>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
                            {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <span className="font-extrabold text-slate-900 text-xs">
                            ${order.totalAmount.toFixed(2)}
                          </span>
                          <Badge variant={order.paymentStatus} size="sm">
                            {order.paymentStatus}
                          </Badge>
                        </div>

                        {/* Quick progression button */}
                        <div className="pt-1 flex justify-end" onClick={(e) => e.stopPropagation()}>
                          {order.status === 'New' && (
                            <button
                              onClick={() => initiateStatusChange(order.id, 'Confirmed')}
                              className="w-full py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg text-[11px] font-bold border border-brand-200 transition-colors"
                            >
                              Confirm ➔
                            </button>
                          )}
                          {order.status === 'Confirmed' && (
                            <button
                              onClick={() => initiateStatusChange(order.id, 'Preparing')}
                              className="w-full py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-[11px] font-bold border border-amber-200 transition-colors"
                            >
                              Start Bake ➔
                            </button>
                          )}
                          {order.status === 'Preparing' && (
                            <button
                              onClick={() => initiateStatusChange(order.id, 'Ready')}
                              className="w-full py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-bold border border-emerald-200 transition-colors"
                            >
                              Mark Ready ➔
                            </button>
                          )}
                          {order.status === 'Ready' && (
                            <button
                              onClick={() => initiateStatusChange(order.id, 'Completed')}
                              className="w-full py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold transition-colors"
                            >
                              Handover / Done ✓
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        filteredOrders.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No orders found"
            description="Try adjusting your search criteria or clear active filters."
            actionLabel="Clear all filters"
            onAction={handleResetFilters}
          />
        ) : (
          <Card className="overflow-hidden shadow-subtle border-slate-200/80">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Order ID & Origin</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Items & Customization</th>
                    <th className="py-3.5 px-4">Delivery Window</th>
                    <th className="py-3.5 px-4">Total & Payment</th>
                    <th className="py-3.5 px-4">Lifecycle Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => onSelectOrder(order)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Order ID */}
                      <td className="py-4 px-4 align-top">
                        <div className="font-extrabold text-brand-700">#{order.id}</div>
                        <div className="flex items-center gap-1 mt-1 text-[11px]">
                          {order.source === 'WhatsApp' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              <MessageSquare className="w-3 h-3" />
                              WhatsApp
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium">{order.source}</span>
                          )}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-4 px-4 align-top">
                        <div className="font-bold text-slate-900">{order.customerName}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{order.customerPhone}</div>
                        {order.deliveryAddress && (
                          <div className="text-[11px] text-slate-500 truncate max-w-[180px] mt-1 font-medium flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{order.deliveryAddress}</span>
                          </div>
                        )}
                      </td>

                      {/* Items */}
                      <td className="py-4 px-4 align-top max-w-xs">
                        <div className="space-y-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="text-slate-800">
                              <span className="font-bold text-brand-700">{item.quantity}x</span>{' '}
                              <span className="font-medium">{item.name}</span>
                              {item.customization && (
                                <div className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md mt-0.5 border border-purple-200 font-medium">
                                  ✨ {item.customization}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Delivery */}
                      <td className="py-4 px-4 align-top">
                        <div className="flex items-center gap-1 text-slate-800 font-bold">
                          <Truck className="w-3.5 h-3.5 text-slate-400" />
                          <span>{order.deliveryType}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 font-medium">
                          {new Date(order.requestedDateTime).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          •{' '}
                          {new Date(order.requestedDateTime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* Price & Payment */}
                      <td className="py-4 px-4 align-top">
                        <div className="font-extrabold text-slate-900 text-sm">
                          ${order.totalAmount.toFixed(2)}
                        </div>
                        <div className="mt-1">
                          <Badge variant={order.paymentStatus} size="sm">
                            {order.paymentStatus}
                          </Badge>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 align-top">
                        <Badge variant={order.status} showDot>
                          {order.status}
                        </Badge>
                      </td>

                      {/* Action buttons */}
                      <td className="py-4 px-4 align-top text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectOrder(order)}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                          >
                            Details
                          </button>
                          {order.status === 'New' && (
                            <button
                              onClick={() => initiateStatusChange(order.id, 'Confirmed')}
                              className="px-3 py-1 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-xs transition-colors"
                            >
                              Confirm
                            </button>
                          )}
                          {order.status === 'Confirmed' && (
                            <button
                              onClick={() => initiateStatusChange(order.id, 'Preparing')}
                              className="px-3 py-1 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
                            >
                              Bake
                            </button>
                          )}
                          {order.status === 'Preparing' && (
                            <button
                              onClick={() => initiateStatusChange(order.id, 'Ready')}
                              className="px-3 py-1 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors"
                            >
                              Ready
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )
      )}

      {/* Slide-Over Order Detail Drawer */}
      <Drawer
        isOpen={!!selectedOrder}
        onClose={() => onSelectOrder(null)}
        title={selectedOrder ? `Order #${selectedOrder.id}` : ''}
        subtitle={
          selectedOrder ? `Placed on ${new Date(selectedOrder.createdAt).toLocaleString()}` : ''
        }
        width="xl"
        footer={
          selectedOrder && (
            <div className="w-full flex items-center justify-between">
              {selectedOrder.status !== 'Cancelled' && selectedOrder.status !== 'Completed' && (
                <button
                  onClick={() => initiateStatusChange(selectedOrder.id, 'Cancelled')}
                  className="px-3.5 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200"
                >
                  Cancel Order
                </button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                {selectedOrder.status === 'New' && (
                  <button
                    onClick={() => initiateStatusChange(selectedOrder.id, 'Confirmed')}
                    className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm"
                  >
                    Confirm & Accept Order
                  </button>
                )}
                {selectedOrder.status === 'Confirmed' && (
                  <button
                    onClick={() => initiateStatusChange(selectedOrder.id, 'Preparing')}
                    className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm"
                  >
                    Send to Kitchen Prep
                  </button>
                )}
                {selectedOrder.status === 'Preparing' && (
                  <button
                    onClick={() => initiateStatusChange(selectedOrder.id, 'Ready')}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
                  >
                    Mark as Ready for Handover
                  </button>
                )}
                {selectedOrder.status === 'Ready' && (
                  <button
                    onClick={() => initiateStatusChange(selectedOrder.id, 'Completed')}
                    className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm"
                  >
                    Mark as Delivered / Completed
                  </button>
                )}
              </div>
            </div>
          )
        }
      >
        {selectedOrder && (
          <div className="space-y-6 text-xs">
            {/* Top Status Bar */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Order Status
                </span>
                <Badge variant={selectedOrder.status} showDot>
                  {selectedOrder.status}
                </Badge>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Payment Status
                </span>
                <Badge variant={selectedOrder.paymentStatus}>
                  {selectedOrder.paymentStatus}
                </Badge>
              </div>
            </div>

            {/* Customer Details & WhatsApp button */}
            <div className="p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm">Customer Details</h4>
                {onOpenChatWithCustomer && (
                  <button
                    onClick={() => {
                      onOpenChatWithCustomer(selectedOrder.customerPhone);
                      onSelectOrder(null);
                    }}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Open WhatsApp Chat
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-slate-600 pt-1">
                <div>
                  <span className="text-slate-400 block text-[11px]">Name:</span>
                  <span className="font-bold text-slate-900">{selectedOrder.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Phone:</span>
                  <span className="font-bold text-slate-900">{selectedOrder.customerPhone}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[11px]">Delivery Location:</span>
                  <div className="flex items-start gap-1.5 mt-0.5">
                    <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                    <span className="font-medium text-slate-800">
                      {selectedOrder.deliveryAddress || 'Bakery Counter Pickup (Indiranagar)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="p-4 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm mb-3">Order Items</h4>
              <div className="divide-y divide-slate-100">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="py-2.5 flex items-start justify-between">
                    <div>
                      <p className="font-bold text-slate-800">
                        {item.quantity}x {item.name}
                      </p>
                      {item.customization && (
                        <p className="text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded mt-1 inline-block font-medium">
                          {item.customization}
                        </p>
                      )}
                    </div>
                    <span className="font-extrabold text-slate-900">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 mt-3 pt-3 space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-medium">${selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span className="font-medium">${selectedOrder.deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t border-slate-100 pt-2">
                  <span>Total Amount:</span>
                  <span className="text-brand-700">${selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Customization & Notes */}
            {selectedOrder.customizationNotes && (
              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200">
                <h4 className="font-bold text-purple-900 mb-1">Customization Instructions</h4>
                <p className="text-slate-700 leading-relaxed font-medium">{selectedOrder.customizationNotes}</p>
              </div>
            )}

            {/* Order Timeline */}
            <div className="p-4 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm mb-3">Order Activity Timeline</h4>
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {selectedOrder.timeline.map((event) => (
                  <div key={event.id} className="relative">
                    <span
                      className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${
                        event.status === 'done'
                          ? 'bg-emerald-500'
                          : event.status === 'current'
                          ? 'bg-brand-600 animate-pulse'
                          : 'bg-slate-300'
                      }`}
                    />
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{event.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(event.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{event.description}</p>
                    <span className="text-[10px] text-brand-600 font-bold">By {event.actor}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={(reason) =>
          handleConfirmStatus(confirmModal.orderId, confirmModal.newStatus, reason)
        }
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        requireReason={confirmModal.requireReason}
        reasonPlaceholder="Specify reason for cancelling..."
        confirmLabel={confirmModal.newStatus === 'Cancelled' ? 'Confirm Cancellation' : 'Confirm'}
      />
    </div>
  );
};
