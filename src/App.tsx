import React, { useState, useEffect } from 'react';
import { Sidebar, PageId } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { ToastProvider, useToast } from './components/common/ToastContext';

// Pages
import { OverviewPage } from './pages/OverviewPage';
import { OrdersPage } from './pages/OrdersPage';
import { InboxPage } from './pages/InboxPage';
import { CustomizationPage } from './pages/CustomizationPage';
import { PaymentVerificationPage } from './pages/PaymentVerificationPage';
import { ApprovalCenterPage } from './pages/ApprovalCenterPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { CustomersPage } from './pages/CustomersPage';
import { SettingsPage } from './pages/SettingsPage';

// Services
import {
  checkBackendConnection,
  OrderService,
  InboxService,
  CustomizationService,
  PaymentService,
  ApprovalService,
  CustomerService,
  SettingsService,
  store,
} from './services/apiClient';

import {
  Order,
  Conversation,
  Message,
  CustomizationRequest,
  PaymentVerification,
  ApprovalItem,
  AgentExecutionLog,
  Customer,
  BusinessSettings,
  OrderStatus,
  PaymentStatus,
} from './types';

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // App data state
  const [orders, setOrders] = useState<Order[]>(store.orders);
  const [conversations, setConversations] = useState<Conversation[]>(store.conversations);
  const [messages, setMessages] = useState<Record<string, Message[]>>(store.messages);
  const [customizations, setCustomizations] = useState<CustomizationRequest[]>(store.customizations);
  const [payments, setPayments] = useState<PaymentVerification[]>(store.payments);
  const [approvals, setApprovals] = useState<ApprovalItem[]>(store.approvals);
  const [executionLogs, setExecutionLogs] = useState<AgentExecutionLog[]>(store.executionLogs);
  const [customers, setCustomers] = useState<Customer[]>(store.customers);
  const [settings, setSettings] = useState<BusinessSettings>(store.settings);

  // Detail drawer selections
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Sync state helpers
  const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: OrderStatus,
    note?: string
  ) => {
    const res = await OrderService.updateOrderStatus(orderId, newStatus, note);
    if (res.order) {
      setOrders([...store.orders]);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...res.order });
      }
    }
  };

  const handleSendMessage = async (conversationId: string, text: string) => {
    await InboxService.sendMessage(conversationId, text);
    setMessages({ ...store.messages });
    setConversations([...store.conversations]);
  };

  const handleToggleResolve = async (conversationId: string) => {
    await InboxService.toggleResolve(conversationId);
    setConversations([...store.conversations]);
  };

  const handleUpdateNotes = async (conversationId: string, notes: string) => {
    await InboxService.updateInternalNotes(conversationId, notes);
    setConversations([...store.conversations]);
  };

  const handleUpdateCustomization = async (
    id: string,
    status: 'Approved' | 'Rejected' | 'More Info Needed' | 'Escalated',
    note?: string
  ) => {
    await CustomizationService.updateStatus(id, status, note);
    setCustomizations([...store.customizations]);
  };

  const handleVerifyPayment = async (id: string, status: PaymentStatus, note?: string) => {
    await PaymentService.verifyPayment(id, status, note);
    setPayments([...store.payments]);
    setOrders([...store.orders]);
  };

  const handleApprovalDecision = async (
    id: string,
    decision: 'Approved' | 'Rejected' | 'More Info Requested' | 'Escalated',
    note?: string
  ) => {
    await ApprovalService.handleDecision(id, decision, note);
    setApprovals([...store.approvals]);
  };

  const handleSaveSettings = async (updated: Partial<BusinessSettings>) => {
    const res = await SettingsService.updateSettings(updated);
    setSettings({ ...res.data });
  };

  const handleOpenChatWithCustomer = (phone: string) => {
    setCurrentPage('inbox');
  };

  // Badges calculation
  const badges = {
    orders: orders.filter((o) => o.status === 'New' || o.status === 'Preparing').length,
    inbox: conversations.reduce((acc, c) => acc + c.unreadCount, 0),
    customizations: customizations.filter((c) => c.status === 'Pending Review').length,
    payments: payments.filter(
      (p) => p.status === 'Pending Review' || p.status === 'Mismatch Detected'
    ).length,
    approvals: approvals.filter((a) => a.status === 'Pending').length,
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar navigation */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        badges={badges}
      />

      {/* Main Container */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Navbar */}
        <TopNav
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {currentPage === 'overview' && (
            <OverviewPage
              orders={orders}
              approvals={approvals}
              executionLogs={executionLogs}
              onNavigate={setCurrentPage}
              onSelectOrder={(order) => {
                setSelectedOrder(order);
                setCurrentPage('orders');
              }}
            />
          )}

          {currentPage === 'orders' && (
            <OrdersPage
              orders={orders}
              onUpdateStatus={handleUpdateOrderStatus}
              selectedOrder={selectedOrder}
              onSelectOrder={setSelectedOrder}
              onOpenChatWithCustomer={handleOpenChatWithCustomer}
            />
          )}

          {currentPage === 'inbox' && (
            <InboxPage
              conversations={conversations}
              messages={messages}
              orders={orders}
              onSendMessage={handleSendMessage}
              onToggleResolve={handleToggleResolve}
              onUpdateNotes={handleUpdateNotes}
            />
          )}

          {currentPage === 'customizations' && (
            <CustomizationPage
              customizations={customizations}
              onUpdateStatus={handleUpdateCustomization}
            />
          )}

          {currentPage === 'payments' && (
            <PaymentVerificationPage
              payments={payments}
              onVerifyPayment={handleVerifyPayment}
            />
          )}

          {currentPage === 'approvals' && (
            <ApprovalCenterPage
              approvals={approvals}
              onHandleDecision={handleApprovalDecision}
            />
          )}

          {currentPage === 'analytics' && (
            <AnalyticsPage orders={orders} payments={payments} />
          )}

          {currentPage === 'customers' && (
            <CustomersPage
              customers={customers}
              orders={orders}
              onOpenChat={handleOpenChatWithCustomer}
            />
          )}

          {currentPage === 'settings' && (
            <SettingsPage
              settings={settings}
              onSaveSettings={handleSaveSettings}
            />
          )}
        </main>
      </div>

      {/* Global Command/Search Palette (Cmd/Ctrl+K) */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={setCurrentPage}
      />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
