import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Clock,
  Calendar,
  Layers,
  DollarSign,
  ChevronRight,
  ShieldAlert,
  Search,
  Filter,
  Check,
  Eye,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { SearchFilterBar, FilterGroup } from '../components/common/SearchFilterBar';
import { useToast } from '../components/common/ToastContext';
import { CustomizationRequest } from '../types';

interface CustomizationPageProps {
  customizations: CustomizationRequest[];
  onUpdateStatus: (
    id: string,
    status: 'Approved' | 'Rejected' | 'More Info Needed' | 'Escalated',
    note?: string
  ) => Promise<void>;
}

export const CustomizationPage: React.FC<CustomizationPageProps> = ({
  customizations,
  onUpdateStatus,
}) => {
  const { showToast } = useToast();
  const [selectedReq, setSelectedReq] = useState<CustomizationRequest | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    id: string;
    action: 'Approved' | 'Rejected' | 'More Info Needed' | 'Escalated';
    title: string;
    message: React.ReactNode;
    variant: 'danger' | 'warning' | 'primary' | 'success';
    requireReason?: boolean;
  }>({
    isOpen: false,
    id: '',
    action: 'Approved',
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
        { label: 'All Requests', value: 'all' },
        { label: 'Pending Review', value: 'Pending Review' },
        { label: 'Approved', value: 'Approved' },
        { label: 'Rejected', value: 'Rejected' },
        { label: 'More Info Needed', value: 'More Info Needed' },
        { label: 'Escalated', value: 'Escalated' },
      ],
    },
  ];

  const filtered = customizations.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      c.id.toLowerCase().includes(q) ||
      c.customerName.toLowerCase().includes(q) ||
      c.cakeType.toLowerCase().includes(q) ||
      c.flavor.toLowerCase().includes(q);

    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const initiateAction = (
    id: string,
    action: 'Approved' | 'Rejected' | 'More Info Needed' | 'Escalated'
  ) => {
    const req = customizations.find((c) => c.id === id);
    if (!req) return;

    if (action === 'Approved') {
      setConfirmDialog({
        isOpen: true,
        id,
        action: 'Approved',
        title: `Approve Customization #${id}?`,
        message: (
          <div className="space-y-2 text-xs">
            <p>
              Confirming approval commits the kitchen to prepare:{' '}
              <strong className="text-slate-900">{req.cakeType} ({req.sizeOrTiers})</strong> for{' '}
              <strong className="text-slate-900">{req.customerName}</strong>.
            </p>
            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
              ⚠️ Note: AI recommendation scored {(req.aiAssessment.confidence * 100).toFixed(0)}%
              feasibility, but final baker sign-off is required.
            </div>
          </div>
        ),
        variant: 'success',
      });
    } else if (action === 'Rejected') {
      setConfirmDialog({
        isOpen: true,
        id,
        action: 'Rejected',
        title: `Reject Customization #${id}?`,
        message: 'Please provide a polite reason to inform the customer via WhatsApp.',
        variant: 'danger',
        requireReason: true,
      });
    } else if (action === 'More Info Needed') {
      setConfirmDialog({
        isOpen: true,
        id,
        action: 'More Info Needed',
        title: 'Request Missing Details from Customer',
        message: 'Specify what details or photos are missing (e.g. tier dimensions, color reference).',
        variant: 'primary',
        requireReason: true,
      });
    } else {
      setConfirmDialog({
        isOpen: true,
        id,
        action: 'Escalated',
        title: 'Escalate to Head Chef / Master Baker',
        message: 'Explain the technical or allergen complexity requiring senior baker review.',
        variant: 'warning',
        requireReason: true,
      });
    }
  };

  const handleConfirmDecision = async (note?: string) => {
    await onUpdateStatus(confirmDialog.id, confirmDialog.action, note);
    showToast(`Request #${confirmDialog.id} marked as ${confirmDialog.action}`, 'success');
    if (selectedReq && selectedReq.id === confirmDialog.id) {
      setSelectedReq(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search custom designs, flavors, customer..."
        filterGroups={filterGroups}
        onFilterChange={(_, val) => setStatusFilter(val)}
        onResetFilters={() => {
          setSearchQuery('');
          setStatusFilter('all');
        }}
        totalResults={filtered.length}
      />

      {/* Grid of Customization Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => (
          <Card
            key={item.id}
            className="flex flex-col overflow-hidden hover:border-brand-300 hover:shadow-card transition-all"
          >
            {/* Card Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  Request #{item.id}
                </span>
                <h4 className="text-sm font-extrabold text-slate-900">{item.customerName}</h4>
              </div>
              <Badge variant={item.status} size="sm">
                {item.status}
              </Badge>
            </div>

            {/* Reference Image or Design Banner */}
            {item.referenceImageUrl ? (
              <div
                onClick={() => setSelectedReq(item)}
                className="h-44 w-full overflow-hidden relative cursor-pointer group"
              >
                <img
                  src={item.referenceImageUrl}
                  alt={item.cakeType}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3.5">
                  <span className="text-white text-xs font-bold drop-shadow-sm">
                    {item.sizeOrTiers} • {item.flavor}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-purple-50/70 border-b border-purple-100 flex items-center gap-2 text-xs font-bold text-purple-900">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>{item.cakeType}</span>
              </div>
            )}

            {/* Details */}
            <CardContent className="p-4 flex-1 space-y-3.5 text-xs">
              <div>
                <p className="font-extrabold text-slate-900 text-sm">{item.cakeType}</p>
                <p className="text-slate-600 text-[11px] mt-1 font-medium line-clamp-2 leading-relaxed">
                  {item.customerNotes}
                </p>
              </div>

              {/* Dietary Requirements Pills */}
              <div className="flex flex-wrap gap-1.5">
                {item.dietaryRequirements.map((d) => (
                  <span
                    key={d}
                    className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full"
                  >
                    🌱 {d}
                  </span>
                ))}
              </div>

              {/* AI Feasibility Assessment Box */}
              <div className="p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-200 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-extrabold text-brand-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                    Feasibility: {(item.aiAssessment.confidence * 100).toFixed(0)}%
                  </span>
                  <span className="font-bold text-indigo-900 bg-white px-2 py-0.5 rounded-md border border-indigo-200 shadow-2xs">
                    +{item.aiAssessment.prepTimeRequiredHours}h bake time
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-indigo-200/60 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-brand-600 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${item.aiAssessment.confidence * 100}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-700 leading-snug font-medium">
                  {item.aiAssessment.reasoning}
                </p>
              </div>
            </CardContent>

            {/* Action Bar */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedReq(item)}
                className="text-xs font-bold text-slate-700 hover:text-slate-900 px-2 py-1 flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                Spec
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => initiateAction(item.id, 'Approved')}
                  className="px-3 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => initiateAction(item.id, 'More Info Needed')}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Info
                </button>
                <button
                  onClick={() => initiateAction(item.id, 'Escalated')}
                  className="px-2.5 py-1 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
                >
                  Escalate
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Review Modal */}
      {selectedReq && (
        <Modal
          isOpen={!!selectedReq}
          onClose={() => setSelectedReq(null)}
          title={`Customization Specification #${selectedReq.id}`}
          subtitle={`Requested for Order #${selectedReq.orderId} by ${selectedReq.customerName}`}
          maxWidth="2xl"
          footer={
            <div className="w-full flex items-center justify-between">
              <button
                onClick={() => initiateAction(selectedReq.id, 'Rejected')}
                className="px-3.5 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl"
              >
                Reject Request
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => initiateAction(selectedReq.id, 'More Info Needed')}
                  className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl"
                >
                  Request More Info
                </button>
                <button
                  onClick={() => initiateAction(selectedReq.id, 'Escalated')}
                  className="px-3.5 py-2 text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-xl"
                >
                  Escalate to Chef
                </button>
                <button
                  onClick={() => initiateAction(selectedReq.id, 'Approved')}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
                >
                  Confirm Approval
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            {selectedReq.referenceImageUrl && (
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-subtle">
                <img
                  src={selectedReq.referenceImageUrl}
                  alt={selectedReq.cakeType}
                  className="w-full max-h-72 object-cover"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-[10px]">
                  Customer Requirements
                </h5>
                <div>
                  <span className="text-slate-400 block text-[11px]">Design & Dimensions:</span>
                  <span className="font-bold text-slate-900">
                    {selectedReq.cakeType} — {selectedReq.sizeOrTiers}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Sponge Flavor:</span>
                  <span className="font-medium text-slate-800">{selectedReq.flavor}</span>
                </div>
                {selectedReq.customMessage && (
                  <div>
                    <span className="text-slate-400 block text-[11px]">Piped Message:</span>
                    <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded inline-block mt-0.5">
                      "{selectedReq.customMessage}"
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 block text-[11px]">Customer Notes:</span>
                  <p className="text-slate-700 mt-0.5 leading-relaxed font-medium">
                    {selectedReq.customerNotes}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-200 space-y-2.5">
                <h5 className="font-extrabold text-brand-900 text-xs uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  MIRA Customization Agent Assessment
                </h5>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Feasibility:</span>
                    <span className="font-extrabold text-slate-900">
                      {(selectedReq.aiAssessment.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Extra Prep Time:</span>
                    <span className="font-extrabold text-slate-900">
                      {selectedReq.aiAssessment.prepTimeRequiredHours} hours
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Suggested Surcharge:</span>
                    <span className="font-extrabold text-emerald-700">
                      +${selectedReq.aiAssessment.suggestedSurcharge.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Recommendation:</span>
                    <span className="font-bold text-brand-700">
                      {selectedReq.aiAssessment.recommendation}
                    </span>
                  </div>
                </div>
                <div className="pt-2 border-t border-indigo-100">
                  <span className="text-slate-400 block text-[11px]">Agent Feasibility Note:</span>
                  <p className="text-slate-700 text-[11px] mt-0.5 leading-relaxed font-medium">
                    {selectedReq.aiAssessment.reasoning}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200">
              <h5 className="font-bold text-slate-900 text-xs mb-2">Audit Decision Trail</h5>
              <div className="divide-y divide-slate-100">
                {selectedReq.auditLog.map((log, idx) => (
                  <div key={idx} className="py-2 flex items-start justify-between text-[11px]">
                    <div>
                      <span className="font-bold text-slate-800">{log.action}</span>
                      {log.note && <p className="text-slate-500 mt-0.5">{log.note}</p>}
                    </div>
                    <div className="text-right text-slate-400 font-mono text-[10px]">
                      <span>{log.actor}</span>
                      <span className="block">
                        {new Date(log.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmDecision}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
        requireReason={confirmDialog.requireReason}
        confirmLabel="Confirm Decision"
      />
    </div>
  );
};
