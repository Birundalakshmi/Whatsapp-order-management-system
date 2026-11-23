import React, { useState } from 'react';
import {
  Receipt,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Search,
  Filter,
  DollarSign,
  FileText,
  Clock,
  ShieldCheck,
  Camera,
  ExternalLink,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { SearchFilterBar, FilterGroup } from '../components/common/SearchFilterBar';
import { useToast } from '../components/common/ToastContext';
import { PaymentVerification, PaymentStatus } from '../types';

interface PaymentVerificationPageProps {
  payments: PaymentVerification[];
  onVerifyPayment: (id: string, status: PaymentStatus, note?: string) => Promise<void>;
}

export const PaymentVerificationPage: React.FC<PaymentVerificationPageProps> = ({
  payments,
  onVerifyPayment,
}) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<PaymentVerification | null>(null);
  const [viewScreenshotUrl, setViewScreenshotUrl] = useState<string | null>(null);

  // Confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    id: string;
    newStatus: PaymentStatus;
    title: string;
    message: React.ReactNode;
    variant: 'danger' | 'warning' | 'primary' | 'success';
    requireReason?: boolean;
  }>({
    isOpen: false,
    id: '',
    newStatus: 'Verified',
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
        { label: 'All Payments', value: 'all' },
        { label: 'Pending Review', value: 'Pending Review' },
        { label: 'Verified', value: 'Verified' },
        { label: 'Mismatch Detected', value: 'Mismatch Detected' },
        { label: 'Needs Manual Review', value: 'Needs Manual Review' },
        { label: 'Rejected', value: 'Rejected' },
      ],
    },
  ];

  const filtered = payments.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      p.id.toLowerCase().includes(q) ||
      p.orderId.toLowerCase().includes(q) ||
      p.customerName.toLowerCase().includes(q) ||
      p.transactionReference.toLowerCase().includes(q);

    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const initiatePaymentDecision = (id: string, status: PaymentStatus) => {
    const item = payments.find((p) => p.id === id);
    if (!item) return;

    if (status === 'Verified') {
      setConfirmDialog({
        isOpen: true,
        id,
        newStatus: 'Verified',
        title: `Mark Payment #${id} as Verified?`,
        message: (
          <div className="space-y-2 text-xs">
            <p>
              You are verifying that <strong>${item.claimedAmount.toFixed(2)}</strong> has been
              received via <strong>{item.paymentMethod}</strong> (Ref #{item.transactionReference}) for
              Order #{item.orderId}.
            </p>
            <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-900">
              ⚠️ <strong>Merchant Responsibility:</strong> Automated OCR found {item.aiAssessment.verdict}.
              Please ensure your bakery bank account reflects these funds before confirming.
            </div>
          </div>
        ),
        variant: 'success',
      });
    } else if (status === 'Mismatch Detected') {
      setConfirmDialog({
        isOpen: true,
        id,
        newStatus: 'Mismatch Detected',
        title: `Flag Mismatch for Payment #${id}?`,
        message: 'This will alert the customer and route this order to the Approval Center.',
        variant: 'warning',
        requireReason: true,
      });
    } else if (status === 'Rejected') {
      setConfirmDialog({
        isOpen: true,
        id,
        newStatus: 'Rejected',
        title: `Reject Payment Slip #${id}?`,
        message: 'Specify reason (e.g. invalid transaction ID, forged screenshot, or expired slip).',
        variant: 'danger',
        requireReason: true,
      });
    } else {
      setConfirmDialog({
        isOpen: true,
        id,
        newStatus: 'Needs Manual Review',
        title: `Escalate Payment #${id} for Manual Review?`,
        message: 'Request senior accountant or bank statement verification.',
        variant: 'primary',
        requireReason: true,
      });
    }
  };

  const handleConfirmDecision = async (note?: string) => {
    await onVerifyPayment(confirmDialog.id, confirmDialog.newStatus, note);
    showToast(`Payment #${confirmDialog.id} marked as ${confirmDialog.newStatus}`, 'success');
    if (selectedPayment && selectedPayment.id === confirmDialog.id) {
      setSelectedPayment(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by UTR reference, customer, order ID..."
        filterGroups={filterGroups}
        onFilterChange={(_, val) => setStatusFilter(val)}
        onResetFilters={() => {
          setSearchQuery('');
          setStatusFilter('all');
        }}
        totalResults={filtered.length}
      />

      {/* Safety Policy Notice */}
      <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-700">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-brand-600 flex-shrink-0" />
          <span>
            <strong>Verification Protocol:</strong> MIRA extracts OCR tokens and flags discrepancies, but never automatically approves payments without merchant confirmation.
          </span>
        </div>
      </div>

      {/* Payments Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Order & Customer</th>
                <th className="py-3 px-4">Expected vs Claimed</th>
                <th className="py-3 px-4">Method & UTR Reference</th>
                <th className="py-3 px-4">AI Assessment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Proof</th>
                <th className="py-3 px-4 text-right">Merchant Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => {
                const hasDiscrepancy = p.expectedAmount !== p.claimedAmount;
                return (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedPayment(p)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    {/* Order & Customer */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-bold text-brand-700">Order #{p.orderId}</div>
                      <div className="font-medium text-slate-800 mt-0.5">{p.customerName}</div>
                      <div className="text-[11px] text-slate-400">{p.customerPhone}</div>
                    </td>

                    {/* Amounts */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="flex items-baseline gap-2">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Expected:</span>
                          <span className="font-bold text-slate-900">${p.expectedAmount.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Claimed:</span>
                          <span
                            className={`font-bold ${
                              hasDiscrepancy ? 'text-rose-600' : 'text-emerald-700'
                            }`}
                          >
                            ${p.claimedAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      {hasDiscrepancy && (
                        <span className="inline-block mt-1 text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                          -${(p.expectedAmount - p.claimedAmount).toFixed(2)} Difference
                        </span>
                      )}
                    </td>

                    {/* Method & Ref */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-semibold text-slate-800">{p.paymentMethod}</div>
                      <div className="text-[11px] font-mono text-slate-500 mt-0.5 truncate max-w-[150px]">
                        Ref: {p.transactionReference}
                      </div>
                    </td>

                    {/* AI Assessment */}
                    <td className="py-3.5 px-4 align-top max-w-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-800">
                          {p.aiAssessment.verdict}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ({(p.aiAssessment.confidence * 100).toFixed(0)}%)
                        </span>
                      </div>
                      {p.aiAssessment.discrepancyNote && (
                        <p className="text-[11px] text-rose-600 mt-0.5 leading-snug">
                          {p.aiAssessment.discrepancyNote}
                        </p>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 align-top">
                      <Badge variant={p.status} showDot>
                        {p.status}
                      </Badge>
                    </td>

                    {/* Screenshot Preview thumbnail */}
                    <td className="py-3.5 px-4 align-top" onClick={(e) => e.stopPropagation()}>
                      {p.receiptImageUrl ? (
                        <button
                          onClick={() => setViewScreenshotUrl(p.receiptImageUrl || null)}
                          className="flex items-center gap-1 text-[11px] text-brand-700 hover:text-brand-900 bg-brand-50 hover:bg-brand-100 px-2 py-1 rounded-lg border border-brand-200 transition-colors"
                        >
                          <Camera className="w-3 h-3" />
                          View Slip
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">No image</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td
                      className="py-3.5 px-4 align-top text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => initiatePaymentDecision(p.id, 'Verified')}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                        >
                          Verify
                        </button>
                        <button
                          onClick={() => initiatePaymentDecision(p.id, 'Mismatch Detected')}
                          className="px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 rounded-lg transition-colors"
                        >
                          Flag
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail Review Modal */}
      {selectedPayment && (
        <Modal
          isOpen={!!selectedPayment}
          onClose={() => setSelectedPayment(null)}
          title={`Payment Verification Review #${selectedPayment.id}`}
          subtitle={`Order #${selectedPayment.orderId} • Customer: ${selectedPayment.customerName}`}
          maxWidth="xl"
          footer={
            <div className="w-full flex items-center justify-between">
              <button
                onClick={() => initiatePaymentDecision(selectedPayment.id, 'Rejected')}
                className="px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg"
              >
                Reject Payment
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => initiatePaymentDecision(selectedPayment.id, 'Needs Manual Review')}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg"
                >
                  Request Bank Audit
                </button>
                <button
                  onClick={() => initiatePaymentDecision(selectedPayment.id, 'Verified')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
                >
                  Verify & Confirm Funds
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            {/* Screenshot preview */}
            {selectedPayment.receiptImageUrl && (
              <div className="rounded-xl overflow-hidden border border-slate-200 max-h-56">
                <img
                  src={selectedPayment.receiptImageUrl}
                  alt="Receipt slip"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Evidence Breakdown */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 block text-[11px]">Payment Method:</span>
                  <span className="font-semibold text-slate-900">{selectedPayment.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Bank / UTR Reference:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {selectedPayment.transactionReference}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Expected Amount:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    ${selectedPayment.expectedAmount.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Claimed Amount:</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    ${selectedPayment.claimedAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {selectedPayment.aiAssessment && (
                <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-brand-800">
                      OCR Match Confidence: {(selectedPayment.aiAssessment.confidence * 100).toFixed(0)}%
                    </span>
                    <Badge variant={selectedPayment.status} size="sm">
                      {selectedPayment.aiAssessment.verdict}
                    </Badge>
                  </div>
                  {selectedPayment.aiAssessment.discrepancyNote && (
                    <p className="text-rose-600 text-[11px] leading-relaxed">
                      {selectedPayment.aiAssessment.discrepancyNote}
                    </p>
                  )}
                </div>
              )}
            </div>

            {selectedPayment.reviewedBy && (
              <div className="text-[11px] text-slate-400 italic">
                Reviewed by {selectedPayment.reviewedBy} at{' '}
                {new Date(selectedPayment.reviewedAt || '').toLocaleString()}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Full Screenshot Modal */}
      {viewScreenshotUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs"
          onClick={() => setViewScreenshotUrl(null)}
        >
          <div className="relative max-w-lg w-full bg-white rounded-2xl overflow-hidden p-2">
            <img
              src={viewScreenshotUrl}
              alt="Receipt preview"
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />
            <div className="p-3 flex justify-between items-center text-xs">
              <span className="text-slate-600">Customer Payment Screenshot</span>
              <button
                onClick={() => setViewScreenshotUrl(null)}
                className="px-3 py-1 bg-slate-900 text-white rounded-lg font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
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
