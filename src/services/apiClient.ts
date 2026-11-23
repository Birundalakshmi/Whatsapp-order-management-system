import {
  Order,
  Conversation,
  Message,
  CustomizationRequest,
  PaymentVerification,
  ApprovalItem,
  AIAgent,
  AgentExecutionLog,
  Customer,
  BusinessSettings,
  OrderStatus,
  PaymentStatus,
} from '../types';
import {
  initialOrders,
  initialConversations,
  initialMessages,
  initialCustomizations,
  initialPayments,
  initialApprovals,
  initialAgents,
  initialExecutionLogs,
  initialCustomers,
  initialBusinessSettings,
} from '../data/mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// In-memory / local storage state for interactive demo mode
class StateStore {
  orders: Order[];
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  customizations: CustomizationRequest[];
  payments: PaymentVerification[];
  approvals: ApprovalItem[];
  agents: AIAgent[];
  executionLogs: AgentExecutionLog[];
  customers: Customer[];
  settings: BusinessSettings;
  isBackendConnected: boolean = false;
  backendCheckCompleted: boolean = false;

  constructor() {
    this.orders = [...initialOrders];
    this.conversations = [...initialConversations];
    this.messages = { ...initialMessages };
    this.customizations = [...initialCustomizations];
    this.payments = [...initialPayments];
    this.approvals = [...initialApprovals];
    this.agents = [...initialAgents];
    this.executionLogs = [...initialExecutionLogs];
    this.customers = [...initialCustomers];
    this.settings = { ...initialBusinessSettings };
  }
}

export const store = new StateStore();

// Check if live backend is reachable
export async function checkBackendConnection(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    const res = await fetch(`${API_BASE_URL}/health`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    store.isBackendConnected = res.ok;
  } catch {
    store.isBackendConnected = false;
  }
  store.backendCheckCompleted = true;
  return store.isBackendConnected;
}

// -------------------------------------------------------------
// ORDERS SERVICE
// -------------------------------------------------------------
export const OrderService = {
  async getOrders(): Promise<{ data: Order[]; isLive: boolean }> {
    if (store.isBackendConnected) {
      try {
        const res = await fetch(`${API_BASE_URL}/orders`);
        if (res.ok) {
          const data = await res.json();
          return { data, isLive: true };
        }
      } catch (err) {
        console.warn('Backend /orders failed, falling back to mock:', err);
      }
    }
    // Demo delay
    await new Promise((r) => setTimeout(r, 80));
    return { data: [...store.orders], isLive: false };
  },

  async getOrderById(id: string): Promise<{ data?: Order; isLive: boolean }> {
    if (store.isBackendConnected) {
      try {
        const res = await fetch(`${API_BASE_URL}/orders/${id}`);
        if (res.ok) {
          const data = await res.json();
          return { data, isLive: true };
        }
      } catch (err) {
        console.warn('Backend /orders/:id failed:', err);
      }
    }
    const order = store.orders.find((o) => o.id === id);
    return { data: order ? { ...order } : undefined, isLive: false };
  },

  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    note?: string
  ): Promise<{ success: boolean; order?: Order; isLive: boolean }> {
    if (store.isBackendConnected) {
      try {
        const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus, note }),
        });
        if (res.ok) {
          const order = await res.json();
          return { success: true, order, isLive: true };
        }
      } catch (err) {
        console.warn('Live update failed:', err);
      }
    }

    // Local simulation
    const idx = store.orders.findIndex((o) => o.id === orderId);
    if (idx !== -1) {
      const currentOrder = store.orders[idx];
      const updatedTimeline = [
        ...currentOrder.timeline,
        {
          id: `tl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          title: `Status changed to ${newStatus}`,
          description: note || `Order updated by Merchant`,
          actor: 'Merchant' as const,
          status: 'done' as const,
        },
      ];

      const updated = {
        ...currentOrder,
        status: newStatus,
        timeline: updatedTimeline,
      };
      store.orders[idx] = updated;
      return { success: true, order: updated, isLive: false };
    }
    return { success: false, isLive: false };
  },

  async cancelOrder(
    orderId: string,
    reason: string
  ): Promise<{ success: boolean; isLive: boolean }> {
    return this.updateOrderStatus(orderId, 'Cancelled', `Cancelled: ${reason}`);
  },
};

// -------------------------------------------------------------
// WHATSAPP INBOX SERVICE
// -------------------------------------------------------------
export const InboxService = {
  async getConversations(): Promise<{ data: Conversation[]; isLive: boolean }> {
    if (store.isBackendConnected) {
      try {
        const res = await fetch(`${API_BASE_URL}/conversations`);
        if (res.ok) return { data: await res.json(), isLive: true };
      } catch {
        // fallback
      }
    }
    return { data: [...store.conversations], isLive: false };
  },

  async getMessages(conversationId: string): Promise<{ data: Message[]; isLive: boolean }> {
    if (store.isBackendConnected) {
      try {
        const res = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`);
        if (res.ok) return { data: await res.json(), isLive: true };
      } catch {
        // fallback
      }
    }
    const msgs = store.messages[conversationId] || [];
    return { data: [...msgs], isLive: false };
  },

  async sendMessage(
    conversationId: string,
    text: string
  ): Promise<{ message: Message; isLive: boolean }> {
    if (store.isBackendConnected) {
      try {
        const res = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, sender: 'business' }),
        });
        if (res.ok) {
          const msg = await res.json();
          return { message: msg, isLive: true };
        }
      } catch {
        // fallback
      }
    }

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      sender: 'business',
      senderName: 'Alex (Sweet Haven)',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
    };

    if (!store.messages[conversationId]) {
      store.messages[conversationId] = [];
    }
    store.messages[conversationId].push(newMessage);

    // Update conversation last message
    const conv = store.conversations.find((c) => c.id === conversationId);
    if (conv) {
      conv.lastMessage = text;
      conv.lastMessageTimestamp = 'Just now';
    }

    return { message: newMessage, isLive: false };
  },

  async toggleResolve(conversationId: string): Promise<{ status: string; isLive: boolean }> {
    const conv = store.conversations.find((c) => c.id === conversationId);
    if (conv) {
      conv.status = conv.status === 'resolved' ? 'active' : 'resolved';
      return { status: conv.status, isLive: false };
    }
    return { status: 'active', isLive: false };
  },

  async updateInternalNotes(conversationId: string, notes: string): Promise<void> {
    const conv = store.conversations.find((c) => c.id === conversationId);
    if (conv) {
      conv.internalNotes = notes;
    }
  },
};

// -------------------------------------------------------------
// CUSTOMIZATION REQUESTS SERVICE
// -------------------------------------------------------------
export const CustomizationService = {
  async getCustomizations(): Promise<{ data: CustomizationRequest[]; isLive: boolean }> {
    if (store.isBackendConnected) {
      try {
        const res = await fetch(`${API_BASE_URL}/customizations`);
        if (res.ok) return { data: await res.json(), isLive: true };
      } catch {}
    }
    return { data: [...store.customizations], isLive: false };
  },

  async updateStatus(
    id: string,
    status: 'Approved' | 'Rejected' | 'More Info Needed' | 'Escalated',
    note?: string
  ): Promise<{ success: boolean; item?: CustomizationRequest; isLive: boolean }> {
    const item = store.customizations.find((c) => c.id === id);
    if (item) {
      item.status = status;
      item.auditLog.push({
        timestamp: new Date().toISOString(),
        action: `Marked as ${status}`,
        actor: 'Alex (Merchant)',
        note: note || undefined,
      });
      return { success: true, item: { ...item }, isLive: false };
    }
    return { success: false, isLive: false };
  },
};

// -------------------------------------------------------------
// PAYMENT VERIFICATION SERVICE
// -------------------------------------------------------------
export const PaymentService = {
  async getPayments(): Promise<{ data: PaymentVerification[]; isLive: boolean }> {
    if (store.isBackendConnected) {
      try {
        const res = await fetch(`${API_BASE_URL}/payments`);
        if (res.ok) return { data: await res.json(), isLive: true };
      } catch {}
    }
    return { data: [...store.payments], isLive: false };
  },

  async verifyPayment(
    id: string,
    status: PaymentStatus,
    note?: string
  ): Promise<{ success: boolean; item?: PaymentVerification; isLive: boolean }> {
    const item = store.payments.find((p) => p.id === id);
    if (item) {
      item.status = status;
      item.reviewedBy = 'Alex (Merchant)';
      item.reviewedAt = new Date().toISOString();

      // also sync with the related order
      const relatedOrder = store.orders.find((o) => o.id === item.orderId);
      if (relatedOrder) {
        relatedOrder.paymentStatus = status;
        if (status === 'Verified' && relatedOrder.status === 'New') {
          relatedOrder.status = 'Confirmed';
        }
      }

      return { success: true, item: { ...item }, isLive: false };
    }
    return { success: false, isLive: false };
  },
};

// -------------------------------------------------------------
// APPROVAL CENTER SERVICE
// -------------------------------------------------------------
export const ApprovalService = {
  async getApprovals(): Promise<{ data: ApprovalItem[]; isLive: boolean }> {
    if (store.isBackendConnected) {
      try {
        const res = await fetch(`${API_BASE_URL}/approvals`);
        if (res.ok) return { data: await res.json(), isLive: true };
      } catch {}
    }
    return { data: [...store.approvals], isLive: false };
  },

  async handleDecision(
    id: string,
    decision: 'Approved' | 'Rejected' | 'More Info Requested' | 'Escalated',
    note?: string
  ): Promise<{ success: boolean; item?: ApprovalItem; isLive: boolean }> {
    const item = store.approvals.find((a) => a.id === id);
    if (item) {
      item.status = decision;
      item.auditTrail.push({
        timestamp: new Date().toISOString(),
        action: `Decision: ${decision}`,
        actor: 'Alex (Merchant)',
        note: note || 'Decision confirmed from Approval Center',
      });
      return { success: true, item: { ...item }, isLive: false };
    }
    return { success: false, isLive: false };
  },
};

// -------------------------------------------------------------
// AI AGENTS SERVICE
// -------------------------------------------------------------
export const AgentService = {
  async getAgents(): Promise<{ data: AIAgent[]; isLive: boolean }> {
    return { data: [...store.agents], isLive: false };
  },

  async getExecutionLogs(): Promise<{ data: AgentExecutionLog[]; isLive: boolean }> {
    return { data: [...store.executionLogs], isLive: false };
  },
};

// -------------------------------------------------------------
// CUSTOMERS SERVICE
// -------------------------------------------------------------
export const CustomerService = {
  async getCustomers(): Promise<{ data: Customer[]; isLive: boolean }> {
    return { data: [...store.customers], isLive: false };
  },
};

// -------------------------------------------------------------
// SETTINGS SERVICE
// -------------------------------------------------------------
export const SettingsService = {
  async getSettings(): Promise<{ data: BusinessSettings; isLive: boolean }> {
    return { data: { ...store.settings }, isLive: false };
  },

  async updateSettings(updated: Partial<BusinessSettings>): Promise<{ data: BusinessSettings }> {
    store.settings = { ...store.settings, ...updated };
    return { data: { ...store.settings } };
  },
};
