import React, { useState } from 'react';
import {
  Search,
  Send,
  Paperclip,
  CheckCheck,
  Check,
  Clock,
  User,
  ShoppingBag,
  Sparkles,
  Receipt,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Phone,
  Tag,
  Smile,
  Image as ImageIcon,
  Bot,
  ExternalLink,
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { useToast } from '../components/common/ToastContext';
import { Conversation, Message, Order } from '../types';

interface InboxPageProps {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  orders: Order[];
  onSendMessage: (conversationId: string, text: string) => Promise<void>;
  onToggleResolve: (conversationId: string) => Promise<void>;
  onUpdateNotes: (conversationId: string, notes: string) => Promise<void>;
}

export const InboxPage: React.FC<InboxPageProps> = ({
  conversations,
  messages,
  orders,
  onSendMessage,
  onToggleResolve,
  onUpdateNotes,
}) => {
  const { showToast } = useToast();
  const [selectedConvId, setSelectedConvId] = useState<string>(
    conversations[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'unread' | 'active' | 'resolved'>('all');
  const [inputText, setInputText] = useState('');
  const [internalNoteText, setInternalNoteText] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const selectedConv = conversations.find((c) => c.id === selectedConvId) || conversations[0];
  const currentMessages = selectedConv ? messages[selectedConv.id] || [] : [];

  const filteredConversations = conversations.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q || c.customerName.toLowerCase().includes(q) || c.lastMessage.toLowerCase().includes(q);

    if (filterTab === 'unread') return matchSearch && c.unreadCount > 0;
    if (filterTab === 'active') return matchSearch && c.status === 'active';
    if (filterTab === 'resolved') return matchSearch && c.status === 'resolved';
    return matchSearch;
  });

  const customerOrders = orders.filter((o) => o.customerPhone === selectedConv?.customerPhone);
  const latestOrder = customerOrders[0];

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedConv) return;
    const text = inputText.trim();
    setInputText('');
    await onSendMessage(selectedConv.id, text);
    showToast('WhatsApp message sent to customer', 'success');
  };

  const handleQuickReply = (text: string) => {
    setInputText(text);
  };

  const handleSaveNotes = async () => {
    if (!selectedConv) return;
    await onUpdateNotes(selectedConv.id, internalNoteText);
    setIsEditingNotes(false);
    showToast('Customer internal note saved', 'success');
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] min-h-[550px] flex flex-col shadow-card rounded-2xl overflow-hidden border border-slate-200">
      {/* WhatsApp Official Style Header Banner */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#075e54] text-white text-xs font-semibold">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>MIRA WhatsApp Order Management Assistant</span>
          <span className="text-[10px] font-normal text-emerald-200 bg-white/10 px-2 py-0.5 rounded-full">
            Meta Cloud API Webhook Live
          </span>
        </div>
        <span className="hidden sm:inline text-[11px] text-emerald-100 font-mono">
          Sweet Haven Bakery (+91 98450 12099)
        </span>
      </div>

      {/* 3-Panel Workspace Container */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 bg-white overflow-hidden">
        {/* -------------------------------------------------------- */}
        {/* LEFT PANEL: Conversation List (3.5 cols on lg)           */}
        {/* -------------------------------------------------------- */}
        <div className="md:col-span-4 lg:col-span-3 border-r border-slate-200 flex flex-col h-full bg-slate-50/50">
          {/* Search & Filter Tabs */}
          <div className="p-3 border-b border-slate-200 space-y-2 bg-white">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search WhatsApp chats..."
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 text-[11px]">
              {(['all', 'unread', 'active', 'resolved'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`px-2.5 py-1 rounded-lg capitalize font-bold transition-colors ${
                    filterTab === tab
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation Cards List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">No conversations found</div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = selectedConv?.id === conv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setSelectedConvId(conv.id);
                      setInternalNoteText(conv.internalNotes || '');
                    }}
                    className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors relative ${
                      isSelected ? 'bg-brand-50/70 border-l-4 border-l-brand-600' : 'hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <img
                        src={conv.customerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'}
                        alt={conv.customerName}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                      {conv.status === 'resolved' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 bg-white rounded-full absolute -bottom-0.5 -right-0.5" />
                      ) : (
                        <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {conv.customerName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium flex-shrink-0">
                          {conv.lastMessageTimestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 truncate mt-0.5 font-medium leading-snug">
                        {conv.lastMessage}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {conv.tags.slice(0, 2).map((t) => (
                          <span
                            key={t}
                            className="text-[9px] font-bold bg-slate-200/60 text-slate-700 px-1.5 py-0.2 rounded"
                          >
                            {t}
                          </span>
                        ))}
                        {conv.unreadCount > 0 && (
                          <span className="ml-auto text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-600 text-white">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* -------------------------------------------------------- */}
        {/* CENTER PANEL: WhatsApp Conversation Thread (5.5 cols)    */}
        {/* -------------------------------------------------------- */}
        <div className="md:col-span-8 lg:col-span-6 flex flex-col h-full bg-[#efeae2] relative border-r border-slate-200">
          {selectedConv ? (
            <>
              {/* WhatsApp Thread Header */}
              <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedConv.customerAvatar}
                    alt={selectedConv.customerName}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      {selectedConv.customerName}
                      <span className="text-[10px] font-normal text-slate-400">
                        {selectedConv.customerPhone}
                      </span>
                    </h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Online • Sweet Haven WhatsApp Bot Active</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleResolve(selectedConv.id)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors flex items-center gap-1.5 ${
                      selectedConv.status === 'resolved'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {selectedConv.status === 'resolved' ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reopen Chat
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Resolve Case
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Chat Messages Body with authentic WhatsApp wallpaper */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 whatsapp-bg">
                {/* Security Encryption / AI Notice */}
                <div className="text-center">
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-amber-50 text-amber-900 border border-amber-200/80 px-3 py-1 rounded-xl shadow-2xs">
                    🔒 Messages are processed in real-time by MIRA Multi-Agent Orchestrator for Sweet Haven Bakery.
                  </span>
                </div>

                {currentMessages.map((msg) => {
                  const isMerchant = msg.sender === 'business';
                  const isAI = msg.sender === 'ai_agent';
                  const isOutgoing = isMerchant || isAI;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isOutgoing ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3 shadow-subtle text-xs relative ${
                          isOutgoing
                            ? isAI
                              ? 'bg-[#eff6ff] border border-indigo-200 text-slate-900 rounded-tr-xs'
                              : 'bg-[#dcf8c6] border border-emerald-200 text-slate-900 rounded-tr-xs'
                            : 'bg-white border border-slate-200 text-slate-900 rounded-tl-xs'
                        }`}
                      >
                        {/* Header with Sender and Time */}
                        <div className="flex items-center justify-between gap-3 text-[10px] font-bold mb-1">
                          <span
                            className={
                              isAI
                                ? 'text-brand-700 flex items-center gap-1'
                                : isMerchant
                                ? 'text-emerald-800'
                                : 'text-slate-600'
                            }
                          >
                            {isAI && <Bot className="w-3 h-3 text-brand-600" />}
                            {msg.senderName}
                          </span>
                          <span className="text-slate-400 font-mono text-[10px]">{msg.timestamp}</span>
                        </div>

                        {/* Content text */}
                        <p className="whitespace-pre-wrap leading-relaxed font-medium">{msg.text}</p>

                        {/* Attachment Preview */}
                        {msg.hasAttachment && msg.attachmentUrl && (
                          <div
                            onClick={() => setPreviewImage(msg.attachmentUrl || null)}
                            className="mt-2.5 rounded-xl overflow-hidden border border-slate-300 cursor-pointer hover:opacity-90 transition-opacity shadow-2xs"
                          >
                            <img
                              src={msg.attachmentUrl}
                              alt="WhatsApp receipt proof"
                              className="w-full max-h-48 object-cover"
                            />
                            <div className="p-1.5 bg-slate-900/70 text-white text-[10px] font-medium flex items-center justify-between">
                              <span>Click to enlarge receipt</span>
                              <ImageIcon className="w-3 h-3" />
                            </div>
                          </div>
                        )}

                        {/* Order Card inside chat */}
                        {msg.isOrderCard && msg.orderData && (
                          <div className="mt-2.5 p-2.5 bg-white rounded-xl border border-indigo-200 shadow-2xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-brand-700">
                                Order #{msg.orderData.id}
                              </span>
                              <Badge variant="Preparing" size="sm">
                                {msg.orderData.status || 'Active'}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-700 pt-1">
                              <span>Total Quote:</span>
                              <span className="font-extrabold text-slate-900">
                                ${msg.orderData.totalAmount?.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Double Blue Ticks */}
                        {isOutgoing && (
                          <div className="flex justify-end mt-1">
                            <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Reply Suggestions Bar */}
              <div className="px-3 py-2 bg-white border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px]">
                <span className="text-slate-400 text-[10px] font-bold flex-shrink-0 uppercase">
                  Quick Replies:
                </span>
                <button
                  onClick={() =>
                    handleQuickReply(
                      'Hello! Yes, your custom order is safely booked in our baking schedule. Looking forward to handcrafting it for you!'
                    )
                  }
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg whitespace-nowrap transition-colors"
                >
                  Confirm Slot
                </button>
                <button
                  onClick={() =>
                    handleQuickReply(
                      'Kindly share your UPI reference number or payment confirmation screenshot so our accounts can verify it.'
                    )
                  }
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg whitespace-nowrap transition-colors"
                >
                  Request Slip
                </button>
                <button
                  onClick={() =>
                    handleQuickReply(
                      'Your order is freshly baked and packaged! It is ready for pickup at our Bloom Arcade counter.'
                    )
                  }
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg whitespace-nowrap transition-colors"
                >
                  Ready for Pickup
                </button>
              </div>

              {/* Message Composer Bar */}
              <form
                onSubmit={handleSend}
                className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={() =>
                    alert('Attachment uploader simulation: in production opens secure camera / slip uploader.')
                  }
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                  title="Attach screenshot or receipt"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a WhatsApp message to customer..."
                  className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-colors font-medium"
                />

                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
                  aria-label="Send WhatsApp message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-xs text-slate-400">
              Select a conversation to open WhatsApp thread
            </div>
          )}
        </div>

        {/* -------------------------------------------------------- */}
        {/* RIGHT PANEL: Customer Dossier & Context (3 cols on lg)   */}
        {/* -------------------------------------------------------- */}
        <div className="hidden lg:flex lg:col-span-3 flex-col h-full bg-slate-50/70 p-4 space-y-4 overflow-y-auto text-xs">
          {selectedConv ? (
            <>
              {/* Profile Card */}
              <div className="text-center p-4 bg-white rounded-2xl border border-slate-200 shadow-subtle">
                <img
                  src={selectedConv.customerAvatar}
                  alt={selectedConv.customerName}
                  className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-brand-400 shadow-xs"
                />
                <h4 className="font-extrabold text-slate-900 mt-2 text-sm">
                  {selectedConv.customerName}
                </h4>
                <p className="text-slate-500 text-[11px] font-medium">{selectedConv.customerPhone}</p>
                <div className="mt-2.5 flex flex-wrap justify-center gap-1">
                  {selectedConv.tags.map((t) => (
                    <Badge key={t} size="sm">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Order Stats */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-center shadow-subtle">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Total Orders
                  </span>
                  <div className="text-lg font-extrabold text-slate-900 mt-0.5">
                    {selectedConv.totalOrders}
                  </div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-center shadow-subtle">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Total Spent
                  </span>
                  <div className="text-lg font-extrabold text-emerald-700 mt-0.5">
                    ${selectedConv.totalSpent.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Active Order Snapshot */}
              {latestOrder ? (
                <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-subtle space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Current Order</span>
                    <Badge variant={latestOrder.status} size="sm">
                      {latestOrder.status}
                    </Badge>
                  </div>
                  <div className="text-slate-800 font-bold">
                    Order #{latestOrder.id} • ${latestOrder.totalAmount.toFixed(2)}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {latestOrder.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                  </div>
                  <div className="pt-1.5 flex items-center justify-between text-[11px] border-t border-slate-100">
                    <span className="text-slate-400 font-medium">Payment State:</span>
                    <Badge variant={latestOrder.paymentStatus} size="sm">
                      {latestOrder.paymentStatus}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-white rounded-xl border border-dashed border-slate-200 text-slate-400 text-center font-medium">
                  No active orders right now
                </div>
              )}

              {/* Dietary Preferences Banner */}
              {selectedConv.dietaryNotes && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                  <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                    Customer Dietary Preference
                  </span>
                  <p className="text-amber-900 leading-snug font-medium text-[11px]">{selectedConv.dietaryNotes}</p>
                </div>
              )}

              {/* Internal Merchant Notes */}
              <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-subtle space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Internal Bakery Notes</span>
                  {!isEditingNotes ? (
                    <button
                      onClick={() => setIsEditingNotes(true)}
                      className="text-brand-600 hover:text-brand-800 text-[11px] font-bold"
                    >
                      Edit
                    </button>
                  ) : (
                    <button
                      onClick={handleSaveNotes}
                      className="text-emerald-700 hover:text-emerald-900 text-[11px] font-bold"
                    >
                      Save
                    </button>
                  )}
                </div>
                {isEditingNotes ? (
                  <textarea
                    value={internalNoteText}
                    onChange={(e) => setInternalNoteText(e.target.value)}
                    rows={3}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
                    placeholder="Add internal kitchen notes about this customer..."
                  />
                ) : (
                  <p className="text-slate-600 text-[11px] italic leading-relaxed font-medium">
                    {selectedConv.internalNotes || 'No internal notes added yet.'}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="text-center text-slate-400 py-10 font-medium">No contact selected</div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden p-2 shadow-2xl">
            <img src={previewImage} alt="WhatsApp attachment full view" className="w-full max-h-[80vh] object-contain rounded-xl" />
            <div className="p-3 flex justify-between items-center text-xs">
              <span className="text-slate-600 font-medium">WhatsApp Customer Payment Slip / Reference</span>
              <button
                onClick={() => setPreviewImage(null)}
                className="px-3 py-1 bg-slate-900 text-white rounded-lg font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
