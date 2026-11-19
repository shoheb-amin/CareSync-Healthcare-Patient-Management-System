import React, { useState, useEffect, useMemo } from 'react';
import { billingService } from '../../../services/billingService';
import { patientService } from '../../../services/patientService';
import { formatCurrency, formatDateTime } from '../../../utils/formatters';
import { useToast } from '../../../context/NotificationContext';
import {
  RotateCw,
  Plus,
  AlertCircle,
  Search,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Modal from '../../../components/common/Modal';

export default function BillingPage() {
  const [payments, setPayments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    patientId: '',
    amount: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const { addToast } = useToast();

  const loadData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

      const [payList, ptList] = await Promise.allSettled([
        billingService.getAllPayments(),
        patientService.getPatients(),
      ]);

      if (payList.status === 'fulfilled' && Array.isArray(payList.value)) {
        setPayments(payList.value);
      }
      if (ptList.status === 'fulfilled' && Array.isArray(ptList.value)) {
        setPatients(ptList.value);
      }
      if (isManualRefresh) {
        addToast('Billing records refreshed', 'success');
      }
    } catch {
      addToast('Failed to load billing records', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Map patientId -> patient object for name resolution
  const patientMap = useMemo(() => {
    const map = {};
    patients.forEach((pt) => {
      if (pt.id) map[pt.id] = pt;
    });
    return map;
  }, [patients]);

  // Aggregate KPI metrics
  const { collectedTotal, pendingCount, pendingTotal, failedCount, totalRecords } = useMemo(() => {
    let collected = 0;
    let pendingC = 0;
    let pendingAmt = 0;
    let failedC = 0;

    payments.forEach((p) => {
      const status = (p.status || p.paymentStatus || '').toUpperCase();
      const amt = Number(p.amount) || 0;
      if (status === 'SUCCESS') {
        collected += amt;
      } else if (status === 'PENDING') {
        pendingC += 1;
        pendingAmt += amt;
      } else if (status === 'FAILED') {
        failedC += 1;
      }
    });

    return {
      collectedTotal: collected,
      pendingCount: pendingC,
      pendingTotal: pendingAmt,
      failedCount: failedC,
      totalRecords: payments.length,
    };
  }, [payments]);

  // Filter payments
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const currentStatus = (p.status || p.paymentStatus || '').toUpperCase();
      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'SUCCESS' && currentStatus === 'SUCCESS') ||
        (statusFilter === 'PENDING' && currentStatus === 'PENDING') ||
        (statusFilter === 'FAILED' && currentStatus === 'FAILED');

      const q = search.trim().toLowerCase();
      if (!q) return matchStatus;

      const pName = patientMap[p.patientId]?.name?.toLowerCase() || '';
      const pId = (p.id || '').toLowerCase();
      const patientId = (p.patientId || '').toLowerCase();
      const bAccountId = (p.billingAccountId || '').toLowerCase();

      const matchSearch =
        pName.includes(q) ||
        pId.includes(q) ||
        patientId.includes(q) ||
        bAccountId.includes(q);

      return matchStatus && matchSearch;
    });
  }, [payments, search, statusFilter, patientMap]);

  // Pagination calculation
  const totalItems = filteredPayments.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPayments.slice(start, start + pageSize);
  }, [filteredPayments, currentPage, pageSize]);

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    if (!createForm.patientId || !createForm.amount) {
      addToast('Please select a patient and enter an amount', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await billingService.createPayment({
        patientId: createForm.patientId,
        amount: parseFloat(createForm.amount),
      });
      addToast('Payment record created in Billing Service', 'success');
      setIsCreateOpen(false);
      setCreateForm({ patientId: '', amount: '' });
      loadData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create payment invoice', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (paymentId, status) => {
    try {
      await billingService.updatePaymentStatus(paymentId, status);
      addToast(`Payment marked as ${status}`, 'success');
      loadData();
    } catch {
      addToast('Failed to update payment status', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header with Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--primary-navy)', letterSpacing: '-0.02em', margin: 0 }}>
            Billing &amp; payments
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', marginTop: '6px', marginBottom: 0 }}>
            Payment records held by the billing service, with status changes reported only after the API confirms them.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--slate-700)',
              cursor: refreshing ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <RotateCw size={14} className={refreshing ? 'spin-anim' : ''} />
            Refresh
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 18px',
              backgroundColor: 'var(--teal-600)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
          >
            <Plus size={16} />
            Create payment
          </button>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        {/* COLLECTED */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #10b981',
            borderRadius: '8px',
            padding: '18px 22px',
          }}
        >
          <div style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--slate-500)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            COLLECTED
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '4px', letterSpacing: '-0.02em' }}>
            {formatCurrency(collectedTotal, false)}
          </div>
          <div style={{ fontSize: '0.785rem', color: 'var(--slate-500)', marginTop: '4px' }}>
            Sum of payments with status SUCCESS
          </div>
        </div>

        {/* PENDING */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #f59e0b',
            borderRadius: '8px',
            padding: '18px 22px',
          }}
        >
          <div style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--slate-500)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            PENDING
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '4px', letterSpacing: '-0.02em' }}>
            {pendingCount}
          </div>
          <div style={{ fontSize: '0.785rem', color: 'var(--slate-500)', marginTop: '4px' }}>
            {formatCurrency(pendingTotal, false)} awaiting confirmation
          </div>
        </div>

        {/* FAILED */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #ef4444',
            borderRadius: '8px',
            padding: '18px 22px',
          }}
        >
          <div style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--slate-500)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            FAILED
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '4px', letterSpacing: '-0.02em' }}>
            {failedCount}
          </div>
          <div style={{ fontSize: '0.785rem', color: 'var(--slate-500)', marginTop: '4px' }}>
            Payments recorded as failed
          </div>
        </div>

        {/* PAYMENT RECORDS */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderLeft: '4px solid #1e3a8a',
            borderRadius: '8px',
            padding: '18px 22px',
          }}
        >
          <div style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--slate-500)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            PAYMENT RECORDS
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-navy)', marginTop: '4px', letterSpacing: '-0.02em' }}>
            {totalRecords}
          </div>
          <div style={{ fontSize: '0.785rem', color: 'var(--slate-500)', marginTop: '4px' }}>
            All statuses, from the billing service
          </div>
        </div>
      </div>

      {/* Amber Status Notice Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          padding: '14px 18px',
          backgroundColor: '#fffbeb',
          border: '1px solid #fef08a',
          borderRadius: '8px',
        }}
      >
        <AlertCircle size={18} style={{ color: '#b45309', marginTop: '2px', flexShrink: 0 }} />
        <div style={{ fontSize: '0.84rem', color: '#92400e', lineHeight: 1.5 }}>
          <strong style={{ fontWeight: 600, color: '#78350f', marginRight: '6px' }}>
            Status records, not payment processing
          </strong>
          The billing service stores payment status; it does not contact a payment gateway. Marking a payment successful records SUCCESS and sets paidAt on the server — nothing is charged.
        </div>
      </div>

      {/* Table Container Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        {/* Table Header Row: Title & Status Selector */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-navy)', margin: 0 }}>
              Payment records
            </h2>
            <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', marginTop: '2px' }}>
              {totalItems} total
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                appearance: 'none',
                WebkitAppearance: 'none',
                padding: '7px 32px 7px 12px',
                fontSize: '0.875rem',
                color: 'var(--slate-700)',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="ALL">All statuses</option>
              <option value="SUCCESS">Success</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
            <ChevronDown
              size={14}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                color: 'var(--slate-500)',
              }}
            />
          </div>
        </div>

        {/* Search Input Bar */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--slate-400)',
            }}
          />
          <input
            type="text"
            placeholder="Search by patient, payment or billing account ID"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              fontSize: '0.875rem',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              outline: 'none',
              backgroundColor: '#ffffff',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Data Table */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
            <LoadingSpinner size="32px" />
          </div>
        ) : (
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <th style={{ padding: '12px 14px', fontSize: '0.725rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    PATIENT
                  </th>
                  <th style={{ padding: '12px 14px', fontSize: '0.725rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    AMOUNT
                  </th>
                  <th style={{ padding: '12px 14px', fontSize: '0.725rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    STATUS
                  </th>
                  <th style={{ padding: '12px 14px', fontSize: '0.725rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    CREATED
                  </th>
                  <th style={{ padding: '12px 14px', fontSize: '0.725rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    PAID AT
                  </th>
                  <th style={{ padding: '12px 14px', width: '90px' }}></th>
                </tr>
              </thead>
              <tbody>
                {paginatedPayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: 'var(--slate-400)', fontSize: '0.875rem' }}>
                      No payment records found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedPayments.map((p) => {
                    const status = (p.status || p.paymentStatus || 'PENDING').toUpperCase();
                    const patientName = patientMap[p.patientId]?.name || p.patientName || p.patientId || 'Patient';
                    const createdStr = p.createdAt || p.paymentDate;
                    const paidStr = p.paidAt;

                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                        <td style={{ padding: '16px 14px', fontWeight: 600, color: 'var(--primary-navy)' }}>
                          {patientName}
                        </td>
                        <td style={{ padding: '16px 14px', fontWeight: 700, color: 'var(--primary-navy)' }}>
                          {formatCurrency(p.amount, false)}
                        </td>
                        <td style={{ padding: '16px 14px' }}>
                          {status === 'SUCCESS' && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '3px 10px',
                                borderRadius: '9999px',
                                backgroundColor: '#ecfdf5',
                                color: '#059669',
                                fontSize: '0.8125rem',
                                fontWeight: 500,
                              }}
                            >
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#059669' }}></span>
                              Success
                            </span>
                          )}
                          {status === 'PENDING' && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '3px 10px',
                                borderRadius: '9999px',
                                backgroundColor: '#fffbeb',
                                color: '#d97706',
                                fontSize: '0.8125rem',
                                fontWeight: 500,
                              }}
                            >
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#d97706' }}></span>
                              Pending
                            </span>
                          )}
                          {status === 'FAILED' && (
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '3px 10px',
                                borderRadius: '9999px',
                                backgroundColor: '#fef2f2',
                                color: '#dc2626',
                                fontSize: '0.8125rem',
                                fontWeight: 500,
                              }}
                            >
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#dc2626' }}></span>
                              Failed
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '16px 14px', color: 'var(--slate-600)', fontSize: '0.85rem' }}>
                          {formatDateTime(createdStr)}
                        </td>
                        <td style={{ padding: '16px 14px', color: 'var(--slate-600)', fontSize: '0.85rem' }}>
                          {paidStr ? formatDateTime(paidStr) : '-'}
                        </td>
                        <td style={{ padding: '16px 14px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            {status === 'PENDING' ? (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(p.id, 'SUCCESS')}
                                  title="Mark as SUCCESS"
                                  style={{
                                    border: 'none',
                                    background: 'transparent',
                                    color: '#10b981',
                                    cursor: 'pointer',
                                    padding: '2px',
                                    display: 'flex',
                                  }}
                                >
                                  <CheckCircle2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(p.id, 'FAILED')}
                                  title="Mark as FAILED"
                                  style={{
                                    border: 'none',
                                    background: 'transparent',
                                    color: '#ef4444',
                                    cursor: 'pointer',
                                    padding: '2px',
                                    display: 'flex',
                                  }}
                                >
                                  <XCircle size={16} />
                                </button>
                              </>
                            ) : (
                              <>
                                <span title="Payment already settled" style={{ color: '#cbd5e1', display: 'flex' }}>
                                  <CheckCircle2 size={16} />
                                </span>
                                <span title="Payment already settled" style={{ color: '#cbd5e1', display: 'flex' }}>
                                  <XCircle size={16} />
                                </span>
                              </>
                            )}
                            <button
                              onClick={() => loadData(true)}
                              title="Refresh status"
                              style={{
                                border: 'none',
                                background: 'transparent',
                                color: '#94a3b8',
                                cursor: 'pointer',
                                padding: '2px',
                                display: 'flex',
                              }}
                            >
                              <RotateCcw size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer with Pagination & Page Size */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '12px',
            borderTop: '1px solid #f1f5f9',
            fontSize: '0.8125rem',
            color: 'var(--slate-500)',
          }}
        >
          <div>
            Showing {startItem}–{endItem} of {totalItems}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ position: 'relative' }}>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  padding: '4px 24px 4px 10px',
                  fontSize: '0.8125rem',
                  color: 'var(--slate-700)',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value={10}>10 / page</option>
                <option value={25}>25 / page</option>
                <option value={50}>50 / page</option>
              </select>
              <ChevronDown
                size={12}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: 'var(--slate-500)',
                }}
              />
            </div>

            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              style={{
                width: '28px',
                height: '28px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                color: currentPage <= 1 ? '#cbd5e1' : 'var(--slate-700)',
              }}
            >
              <ChevronLeft size={14} />
            </button>

            <span
              style={{
                minWidth: '28px',
                height: '28px',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '0.8125rem',
                padding: '0 8px',
              }}
            >
              {currentPage}
            </span>

            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              style={{
                width: '28px',
                height: '28px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                backgroundColor: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                color: currentPage >= totalPages ? '#cbd5e1' : 'var(--slate-700)',
              }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Create Payment Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Patient Payment Invoice"
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsCreateOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="createPaymentForm"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? <LoadingSpinner size="16px" color="#ffffff" /> : 'Generate Invoice'}
            </button>
          </>
        }
      >
        <form id="createPaymentForm" onSubmit={handleCreatePayment}>
          <div className="form-group">
            <label className="form-label">Patient</label>
            <select
              required
              className="form-select"
              value={createForm.patientId}
              onChange={(e) => setCreateForm({ ...createForm, patientId: e.target.value })}
            >
              <option value="">-- Select Patient --</option>
              {patients.map((pt) => (
                <option key={pt.id} value={pt.id}>
                  {pt.name} ({pt.email})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Amount (₹ INR)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              className="form-input"
              placeholder="1500.00"
              value={createForm.amount}
              onChange={(e) => setCreateForm({ ...createForm, amount: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
