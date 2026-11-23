import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  User,
  ArrowRight,
  Filter,
  Search,
  Check,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { SearchFilterBar, FilterGroup } from '../components/common/SearchFilterBar';
import { useToast } from '../components/common/ToastContext';
import { ApprovalItem } from '../types';

interface ApprovalCenterPageProps {
  approvals: ApprovalItem[];
  onHandleDecision: (
    id: string,
    decision: 'Approved' | 'Rejected' | 'More Info Requested' | 'Escalated',
    note?: string
  ) => Promise<void>;
}

export const ApprovalCenterPage: React.FC<ApprovalCenterPageProps> = ({
  approvals,
  onHandleDecision,
}) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);

  // Confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    id: string;
    decision: 'Approved' | 'Rejected' | 'More Info Requested' | 'Escalated';
    title: string;
    message: string;
    variant: 'danger' | 'warning' | 'primary' | 'success';
    requireReason?: boolean;
  }>({
    isOpen: false,
    id: '',
    decision: 'Approved',
    title: '',
    message: '',
    variant: 'primary',
  });

  const filterGroups: FilterGroup[] = [
    {
      id: 'status',
      label: 'Queue Status',
      selectedValue: statusFilter,
      options: [
        { label: 'Pending Only', value: 'Pending' },
        { label: 'All Decisions', value: 'all' },
        { label: 'Approved', value: 'Approved' },
        { label: 'Rejected', value: 'Rejected' },
      ],
    },
    {
      id: 'urgency',
      label: 'Urgency',
      selectedValue: urgencyFilter,
      options: [
        { label: 'All Urgencies', value: 'all' },
        { label: 'High Urgency', value: 'High' },
        { label: 'Medium Urgency', value: 'Medium' },
        { label: 'Low Urgency', value: 'Low' },
      ],
    },
  ];

  const filtered = approvals.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      item.id.toLowerCase().includes(q) ||
      item.orderId.toLowerCase().includes(q) ||
      item.customerName.toLowerCase().includes(q) ||
      item.issueType.toLowerCase().includes(q);

    const matchUrgency = urgencyFilter === 'all' || item.urgency === urgencyFilter;
    const matchStatus = statusFilter === 'all' || item.status === statusFilter;

    return matchSearch && matchUrgency && matchStatus;
  });

  const initiateDecision = (
    id: string,
    decision: 'Approved' | 'Rejected' | 'More Info Requested' | 'Escalated'
  ) => {
    const item = approvals.find((a) => a.id === id);
    if (!item) return;

    if (decision === 'Approved') {
      setConfirmDialog({
        isOpen: true,
        id,
        decision: 'Approved',
        title: `Authorize Approval for ${item.issueType}?`,
        message: `Confirm your approval for Order #${item.orderId} (${item.customerName}). This overrides automated safety holds.`,
        variant: 'success',
      });
    } else if (decision === 'Rejected') {
      setConfirmDialog({
        isOpen: true,
        id,
        decision: 'Rejected',
        title: `Reject Request #${item.id}?`,
        message: 'Provide reason for rejection so the customer and bakery staff are notified accurately.',
        variant: 'danger',
        requireReason: true,
      });
    } else if (decision === 'More Info Requested') {
      setConfirmDialog({
        isOpen: true,
        id,
        decision: 'More Info Requested',
        title: 'Request Additional Information',
        message: 'Specify what documentation or clarification is needed before a decision can be made.',
        variant: 'primary',
        requireReason: true,
      });
    } else {
      setConfirmDialog({
        isOpen: true,
        id,
        decision: 'Escalated',
        title: 'Escalate to Bakery Owner / Head Baker',
        message: 'Document why this case requires executive human escalation.',
        variant: 'warning',
        requireReason: true,
      });
    }
  };

  const handleConfirmDecision = async (note?: string) => {
    await onHandleDecision(confirmDialog.id, confirmDialog.decision, note);
    showToast(`Approval #${confirmDialog.id} marked as ${confirmDialog.decision}`, 'success');
    if (selectedItem && selectedItem.id === confirmDialog.id) {
      setSelectedItem(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search approval cards by customer, issue type..."
        filterGroups={filterGroups}
        onFilterChange={(id, val) => {
          if (id === 'urgency') setUrgencyFilter(val);
          if (id === 'status') setStatusFilter(val);
        }}
        onResetFilters={() => {
          setSearchQuery('');
          setUrgencyFilter('all');
          setStatusFilter('Pending');
        }}
        totalResults={filtered.length}
      />

      {/* Cards List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">Approval Queue Clear</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No pending cases currently require merchant intervention. All active orders are within automated thresholds.
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <Card
              key={item.id}
              className={`p-4 sm:p-5 hover:border-slate-300 transition-all ${
                item.urgency === 'High' ? 'border-l-4 border-l-rose-500' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2 rounded-xl flex-shrink-0 ${
                      item.urgency === 'High'
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{item.issueType}</span>
                      <span className="text-[10px] text-slate-400">• Order #{item.orderId}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Customer: <strong>{item.customerName}</strong> ({item.customerPhone})
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3" /> Waiting {item.timeWaiting}
                  </span>
                  <Badge variant={item.urgency} size="sm">
                    {item.urgency} Urgency
                  </Badge>
                  <Badge variant={item.status} size="sm">
                    {item.status}
                  </Badge>
                </div>
              </div>

              {/* Details & Reason */}
              <div className="py-3 text-xs space-y-2">
                <div>
                  <span className="text-slate-400 font-medium block text-[11px]">Reason for Escalation:</span>
                  <p className="font-semibold text-slate-800 mt-0.5 leading-snug">
                    {item.reasonForEscalation}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-medium block text-[11px]">Relevant Evidence:</span>
                  <p className="text-slate-700 mt-0.5 leading-relaxed">{item.relevantEvidence}</p>
                </div>

                {item.aiRecommendation && (
                  <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-start gap-2">
                    <span className="text-brand-700 font-bold flex-shrink-0">
                      💡 Recommended Action:
                    </span>
                    <span className="text-slate-700">{item.aiRecommendation}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedItem(item)}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-800"
                >
                  Inspect Audit Trail & Details →
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => initiateDecision(item.id, 'More Info Requested')}
                    className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    Request Info
                  </button>
                  <button
                    onClick={() => initiateDecision(item.id, 'Rejected')}
                    className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => initiateDecision(item.id, 'Approved')}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                  >
                    Approve Request
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Detailed Modal with Full Audit History */}
      {selectedItem && (
        <Modal
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          title={`Approval Case #${selectedItem.id}`}
          subtitle={`${selectedItem.issueType} for Order #${selectedItem.orderId}`}
          maxWidth="lg"
          footer={
            <div className="w-full flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => initiateDecision(selectedItem.id, 'Approved')}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
              >
                Approve Now
              </button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <div className="font-semibold text-slate-900">{selectedItem.reasonForEscalation}</div>
              <p className="text-slate-600 leading-relaxed">{selectedItem.relevantEvidence}</p>
            </div>

            <div>
              <h5 className="font-semibold text-slate-900 mb-2">Audit Decision Trail</h5>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {selectedItem.auditTrail.map((trail, idx) => (
                  <div key={idx} className="p-3 flex items-start justify-between">
                    <div>
                      <span className="font-medium text-slate-800">{trail.action}</span>
                      {trail.note && <p className="text-[11px] text-slate-500 mt-0.5">{trail.note}</p>}
                    </div>
                    <div className="text-right text-[10px] text-slate-400">
                      <span>{trail.actor}</span>
                      <span className="block">{new Date(trail.timestamp).toLocaleTimeString()}</span>
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
