export type OrderStatus =
  | 'New'
  | 'Confirmed'
  | 'Preparing'
  | 'Ready'
  | 'Completed'
  | 'Cancelled';

export type PaymentStatus =
  | 'Pending Review'
  | 'Verified'
  | 'Mismatch Detected'
  | 'Rejected'
  | 'Needs Manual Review';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  customization?: string;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  actor: 'AI Agent' | 'Merchant' | 'Customer' | 'System';
  status: 'done' | 'current' | 'pending';
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  source: 'WhatsApp' | 'Direct' | 'Web Catalog';
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  customizationNotes?: string;
  referenceImages?: string[];
  deliveryType: 'Delivery' | 'Pickup';
  deliveryAddress?: string;
  requestedDateTime: string;
  createdAt: string;
  timeline: TimelineEvent[];
  internalNotes?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: 'customer' | 'business' | 'ai_agent';
  senderName: string;
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
  hasAttachment?: boolean;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'audio' | 'pdf';
  isOrderCard?: boolean;
  orderData?: Partial<Order>;
}

export interface Conversation {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAvatar?: string;
  lastMessage: string;
  lastMessageTimestamp: string;
  unreadCount: number;
  status: 'active' | 'pending_order' | 'customization' | 'resolved';
  tags: string[];
  totalOrders: number;
  totalSpent: number;
  dietaryNotes?: string;
  internalNotes?: string;
}

export interface CustomizationRequest {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  cakeType: string;
  sizeOrTiers: string;
  flavor: string;
  dietaryRequirements: string[];
  customMessage?: string;
  requestedDate: string;
  referenceImageUrl?: string;
  customerNotes: string;
  aiAssessment: {
    feasible: boolean;
    recommendation: 'Recommend Approval' | 'Requires Chef Review' | 'Price Adjustment Needed' | 'Recommend Reject';
    confidence: number;
    prepTimeRequiredHours: number;
    suggestedSurcharge: number;
    reasoning: string;
  };
  status: 'Pending Review' | 'Approved' | 'Rejected' | 'More Info Needed' | 'Escalated';
  auditLog: {
    timestamp: string;
    action: string;
    actor: string;
    note?: string;
  }[];
}

export interface PaymentVerification {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  expectedAmount: number;
  claimedAmount: number;
  paymentMethod: 'UPI' | 'Bank Transfer' | 'Card' | 'Cash on Delivery';
  transactionReference: string;
  receiptImageUrl?: string;
  status: PaymentStatus;
  aiAssessment: {
    confidence: number;
    ocrExtractedAmount?: number;
    ocrExtractedUtr?: string;
    senderUpiId?: string;
    discrepancyNote?: string;
    verdict: 'Exact Match' | 'Amount Mismatch' | 'Duplicate UTR' | 'Unclear Screenshot' | 'Awaiting Manual Verification';
  };
  discrepancy?: {
    type: 'Amount' | 'Reference' | 'Date' | 'Duplicate';
    details: string;
  };
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface ApprovalItem {
  id: string;
  issueType:
    | 'Unusual customization'
    | 'Payment mismatch'
    | 'Cancellation request'
    | 'Refund request'
    | 'Unusually large order'
    | 'Low-confidence AI decision';
  orderId: string;
  customerName: string;
  customerPhone: string;
  urgency: 'High' | 'Medium' | 'Low';
  timeWaiting: string;
  reasonForEscalation: string;
  relevantEvidence: string;
  aiRecommendation: string;
  confidenceScore: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'More Info Requested' | 'Escalated';
  createdAt: string;
  auditTrail: {
    timestamp: string;
    action: string;
    actor: string;
    note?: string;
  }[];
}

export interface AIAgent {
  id: string;
  name: string;
  shortName: string;
  role: string;
  description: string;
  status: 'Active' | 'Idle' | 'Processing' | 'Warning';
  isOrchestrator?: boolean;
  lastExecution: string;
  totalExecutionsToday: number;
  avgLatencyMs: number;
  successRate: number;
  primaryTools: string[];
}

export interface AgentExecutionLog {
  id: string;
  timestamp: string;
  agentId: string;
  agentName: string;
  triggerEvent: string;
  customerPhone?: string;
  outcome: 'Success' | 'Escalated' | 'Needs Review' | 'Error';
  latencyMs: number;
  toolsUsed: string[];
  summary: string;
  evidenceSummary?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  totalOrders: number;
  totalSpent: number;
  firstOrderDate: string;
  lastInteraction: string;
  preferredFlavors: string[];
  dietaryRestrictions: string[];
  tags: string[];
  notes?: string;
}

export interface BusinessSettings {
  businessName: string;
  tagline: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  currency: string;
  taxRatePercent: number;
  leadTimeHours: number;
  businessHours: {
    day: string;
    open: string;
    close: string;
    isOpen: boolean;
  }[];
  whatsappConnected: boolean;
  whatsappPhoneNumber: string;
  whatsappProvider: 'Twilio' | 'Meta Cloud API';
  aiAutonomousApproval: boolean;
  minConfidenceThreshold: number;
  escalationRules: {
    orderValueThreshold: number;
    flagPaymentDiscrepancy: boolean;
    requireCustomCakeApproval: boolean;
  };
}
