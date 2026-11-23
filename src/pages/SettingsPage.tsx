import React, { useState } from 'react';
import {
  Store,
  Clock,
  BookOpen,
  Truck,
  MessageSquare,
  Bot,
  Shield,
  Check,
  Save,
  AlertTriangle,
  Plus,
  Trash2,
  User,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { useToast } from '../components/common/ToastContext';
import { BusinessSettings } from '../types';

interface SettingsPageProps {
  settings: BusinessSettings;
  onSaveSettings: (settings: Partial<BusinessSettings>) => Promise<void>;
  isBackendLive?: boolean;
}

type TabType =
  | 'profile'
  | 'hours'
  | 'catalog'
  | 'delivery'
  | 'whatsapp'
  | 'ai'
  | 'security';

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onSaveSettings,
  isBackendLive = false,
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [formData, setFormData] = useState<BusinessSettings>({ ...settings });

  // Catalog items mock for bakery
  const [catalogItems, setCatalogItems] = useState([
    { id: 'cat-1', name: '2-Tier Butterscotch Floral Cake', price: 125.0, category: 'Cakes', eggless: true, inStock: true },
    { id: 'cat-2', name: 'Red Velvet Cream Cheese Bento Cake', price: 28.0, category: 'Bento Cakes', eggless: false, inStock: true },
    { id: 'cat-3', name: 'Artisanal Country Sourdough Loaf', price: 12.0, category: 'Breads', eggless: true, inStock: true },
    { id: 'cat-4', name: 'Belgian Truffle Dark Ganache Cake', price: 65.0, category: 'Cakes', eggless: true, inStock: true },
    { id: 'cat-5', name: 'Assorted French Macarons (Box of 24)', price: 48.0, category: 'Confectionery', eggless: false, inStock: true },
  ]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await onSaveSettings(formData);
    showToast('Bakery configuration saved successfully', 'success');
  };

  const toggleCatalogStock = (id: string) => {
    setCatalogItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, inStock: !item.inStock } : item))
    );
    showToast('Catalog stock status updated', 'info');
  };

  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'profile', label: 'Business Profile', icon: Store },
    { id: 'hours', label: 'Kitchen Hours', icon: Clock },
    { id: 'catalog', label: 'Product Catalog', icon: BookOpen },
    { id: 'delivery', label: 'Delivery & Pickup', icon: Truck },
    { id: 'whatsapp', label: 'WhatsApp API', icon: MessageSquare },
    { id: 'ai', label: 'AI Agent Rules', icon: Bot },
    { id: 'security', label: 'Account & Security', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Tabs Navigation */}
        <div className="md:col-span-1 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-medium rounded-xl transition-colors text-left ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Tab Content */}
        <div className="md:col-span-3">
          {/* TAB: Business Profile */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader
                title="Bakery Profile & Commercial Details"
                subtitle="Public bakery branding shown to customers on WhatsApp receipts"
              />
              <CardContent>
                <form onSubmit={handleSave} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Bakery Name
                      </label>
                      <input
                        type="text"
                        value={formData.businessName}
                        onChange={(e) =>
                          setFormData({ ...formData, businessName: e.target.value })
                        }
                        className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Tagline / Specialty
                      </label>
                      <input
                        type="text"
                        value={formData.tagline}
                        onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Owner / Master Baker
                      </label>
                      <input
                        type="text"
                        value={formData.ownerName}
                        onChange={(e) =>
                          setFormData({ ...formData, ownerName: e.target.value })
                        }
                        className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Official Contact Phone
                      </label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="font-semibold text-slate-700 block mb-1">
                        Kitchen & Studio Address
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Base Currency
                      </label>
                      <select
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="INR">INR (₹)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Minimum Custom Order Lead Time
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={formData.leadTimeHours}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              leadTimeHours: parseInt(e.target.value) || 24,
                            })
                          }
                          className="w-24 p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        />
                        <span className="text-slate-500">hours notice</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save Changes
                    </button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* TAB: Kitchen Hours */}
          {activeTab === 'hours' && (
            <Card>
              <CardHeader
                title="Kitchen Operating Hours"
                subtitle="Used by Conversation Agent to inform customers about ordering windows"
              />
              <CardContent className="space-y-3 text-xs">
                {formData.businessHours.map((bh, idx) => (
                  <div
                    key={bh.day}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={bh.isOpen}
                        onChange={(e) => {
                          const updated = [...formData.businessHours];
                          updated[idx].isOpen = e.target.checked;
                          setFormData({ ...formData, businessHours: updated });
                        }}
                        className="w-4 h-4 text-brand-600 rounded"
                      />
                      <span className="font-bold text-slate-800 w-24">{bh.day}</span>
                    </div>

                    {bh.isOpen ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={bh.open}
                          onChange={(e) => {
                            const updated = [...formData.businessHours];
                            updated[idx].open = e.target.value;
                            setFormData({ ...formData, businessHours: updated });
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white"
                        />
                        <span className="text-slate-400">to</span>
                        <input
                          type="time"
                          value={bh.close}
                          onChange={(e) => {
                            const updated = [...formData.businessHours];
                            updated[idx].close = e.target.value;
                            setFormData({ ...formData, businessHours: updated });
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                    ) : (
                      <span className="text-slate-400 font-medium italic">Kitchen Closed</span>
                    )}
                  </div>
                ))}

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() => handleSave()}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Hours
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB: Product Catalog */}
          {activeTab === 'catalog' && (
            <Card>
              <CardHeader
                title="Bakery Catalog & Inventory Status"
                subtitle="Items the Order Agent quotes and verifies for customer orders"
              />
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100 text-xs">
                  {catalogItems.map((item) => (
                    <div key={item.id} className="p-4 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-slate-900">{item.name}</h5>
                          {item.eggless && (
                            <span className="text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded">
                              Eggless
                            </span>
                          )}
                        </div>
                        <span className="text-slate-400 text-[11px]">{item.category}</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="font-bold text-slate-900 text-sm">
                          ${item.price.toFixed(2)}
                        </span>
                        <button
                          onClick={() => toggleCatalogStock(item.id)}
                          className={`px-3 py-1 rounded-lg font-semibold text-xs transition-colors ${
                            item.inStock
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                          }`}
                        >
                          {item.inStock ? 'In Stock' : 'Sold Out'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB: WhatsApp Integration */}
          {activeTab === 'whatsapp' && (
            <Card>
              <CardHeader
                title="WhatsApp Cloud Integration Status"
                subtitle="Direct Meta Cloud API webhook connectivity for order automation"
              />
              <CardContent className="space-y-4 text-xs">
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-600 text-white flex-shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-emerald-900">
                        {isBackendLive ? 'Live WhatsApp Connected' : 'Simulated WhatsApp Sandbox'}
                      </h4>
                      <Badge variant="Verified" size="sm">
                        {isBackendLive ? 'Active Webhook' : 'Safe Sandbox'}
                      </Badge>
                    </div>
                    <p className="text-emerald-800 text-[11px] mt-1 leading-relaxed">
                      Webhook registered for incoming customer messages, location pins, and receipt screenshots.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      WhatsApp Business Phone Number
                    </label>
                    <input
                      type="text"
                      disabled
                      value={formData.whatsappPhoneNumber}
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Webhook Endpoint URL
                    </label>
                    <input
                      type="text"
                      disabled
                      value="https://api.sweethavenbakery.in/api/webhooks/whatsapp"
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      API Provider
                    </label>
                    <select
                      value={formData.whatsappProvider}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          whatsappProvider: e.target.value as any,
                        })
                      }
                      className="w-full p-2.5 rounded-lg border border-slate-200"
                    >
                      <option value="Meta Cloud API">Meta Cloud API (Official)</option>
                      <option value="Twilio">Twilio WhatsApp Sandbox</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB: AI Agent Rules */}
          {activeTab === 'ai' && (
            <Card>
              <CardHeader
                title="AI Agent Safeguards & Human Escalation Rules"
                subtitle="Define strict boundaries for when the system must escalate to the merchant"
              />
              <CardContent className="space-y-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-slate-900">
                        Require Merchant Approval on All Custom Cakes
                      </h5>
                      <p className="text-[11px] text-slate-500">
                        Never auto-confirm multi-tier or complex floral piping orders.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.escalationRules.requireCustomCakeApproval}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          escalationRules: {
                            ...formData.escalationRules,
                            requireCustomCakeApproval: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 text-brand-600 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                    <div>
                      <h5 className="font-bold text-slate-900">
                        Flag Payment Discrepancies Instantly
                      </h5>
                      <p className="text-[11px] text-slate-500">
                        Route any amount difference &gt; $0.00 directly to Approval Center.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.escalationRules.flagPaymentDiscrepancy}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          escalationRules: {
                            ...formData.escalationRules,
                            flagPaymentDiscrepancy: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 text-brand-600 rounded"
                    />
                  </div>

                  <div className="border-t border-slate-200 pt-3">
                    <label className="font-semibold text-slate-700 block mb-1">
                      High-Value Order Escalation Threshold ($)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={formData.escalationRules.orderValueThreshold}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            escalationRules: {
                              ...formData.escalationRules,
                              orderValueThreshold: parseFloat(e.target.value) || 150,
                            },
                          })
                        }
                        className="w-28 p-2 rounded-lg border border-slate-200"
                      />
                      <span className="text-slate-500 text-[11px]">
                        Orders above this value require merchant sign-off
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleSave()}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Safeguard Rules
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB: Security */}
          {activeTab === 'security' && (
            <Card>
              <CardHeader
                title="Account & Security"
                subtitle="Owner session, authentication, and privacy safeguards"
              />
              <CardContent className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-900 block">Signed in as:</span>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center border border-slate-300">
                      <User className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{formData.ownerName}</p>
                      <p className="text-slate-500 text-[11px]">{formData.email}</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px]">
                  🔒 <strong>Privacy Assurance:</strong> Supabase service role keys and webhook signing secrets are safely guarded on the backend server and never exposed in browser scripts.
                </div>
              </CardContent>
            </Card>
          )}

          {/* TAB: Delivery */}
          {activeTab === 'delivery' && (
            <Card>
              <CardHeader
                title="Delivery Zones & Counter Pickup Options"
                subtitle="Configure delivery fee calculation rules and customer pickup time slots"
              />
              <CardContent className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">Zone 1: Indiranagar & Koramangala (0 - 5 km)</span>
                    <span className="text-[11px] text-slate-500">Standard Courier: $6.00 • Temperature Controlled: $10.00</span>
                  </div>
                  <Badge variant="Verified" size="sm">Active</Badge>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">Zone 2: Whitefield & Bellandur (5 - 15 km)</span>
                    <span className="text-[11px] text-slate-500">Tier Cake Specialized Transport: $15.00</span>
                  </div>
                  <Badge variant="Verified" size="sm">Active</Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
