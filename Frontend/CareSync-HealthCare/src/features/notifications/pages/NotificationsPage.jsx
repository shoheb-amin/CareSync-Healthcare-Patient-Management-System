import React, { useState, useEffect, useMemo } from 'react';
import { notificationService } from '../../../services/notificationService';
import { patientService } from '../../../services/patientService';
import { doctorService } from '../../../services/doctorService';
import { sessionLogger } from '../../../services/sessionLogger';
import { useToast } from '../../../context/NotificationContext';
import { Send, Bell, CheckCircle, Download, FileSpreadsheet, Activity } from 'lucide-react';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

export default function NotificationsPage() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Notification form state
  const [recipientType, setRecipientType] = useState('PATIENT');
  const [recipientId, setRecipientId] = useState('');
  const [notificationType, setNotificationType] = useState('General');
  const [notificationChannel, setNotificationChannel] = useState('EMAIL');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  // Active session logs from sessionLogger
  const [sessionLogs, setSessionLogs] = useState(() => sessionLogger.getLogs());
  const [logFilter, setLogFilter] = useState('ALL'); // 'ALL' or 'NOTIFICATIONS'

  const { addToast } = useToast();

  useEffect(() => {
    async function loadRecipients() {
      try {
        setLoading(true);
        const [pts, docs] = await Promise.allSettled([
          patientService.getPatients(),
          doctorService.getDoctors(),
        ]);
        if (pts.status === 'fulfilled' && Array.isArray(pts.value)) setPatients(pts.value);
        if (docs.status === 'fulfilled' && Array.isArray(docs.value)) setDoctors(docs.value);
      } catch {
        addToast('Failed to load recipient directory', 'error');
      } finally {
        setLoading(false);
      }
    }

    loadRecipients();
  }, [addToast]);

  // Subscribe to real-time session log updates
  useEffect(() => {
    const handleLogUpdate = () => {
      setSessionLogs(sessionLogger.getLogs());
    };

    window.addEventListener('caresync:session-log-updated', handleLogUpdate);
    return () => {
      window.removeEventListener('caresync:session-log-updated', handleLogUpdate);
    };
  }, []);

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!recipientId) {
      addToast('Please select a recipient', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        recipientId,
        recipientType,
        notificationType,
        notificationChannel,
        subject,
        message,
      };

      const result = await notificationService.createNotification(payload);
      addToast(`Notification dispatched via ${notificationChannel}`, 'success');

      // Record audit entry with end-client information protected
      const recipientLabel = recipientType === 'PATIENT' ? 'Patient [Protected Client]' : 'Medical Specialist [Staff]';
      const cleanRef = result?.id ? String(result.id).slice(0, 8).toUpperCase() : 'SECURE';

      sessionLogger.logEvent({
        module: 'NOTIFICATIONS',
        action: 'DISPATCH_NOTIFICATION',
        status: 'SENT',
        recipient: recipientLabel,
        channel: notificationChannel,
        type: notificationType,
        subject: subject || 'General Notice',
        details: `Outbound ${notificationType.replace(/_/g, ' ')} alert transmitted via secure ${notificationChannel} gateway`,
        metadata: `Dispatch Ref: #${cleanRef}`,
      });

      // Reset form fields
      setSubject('');
      setMessage('');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to dispatch notification';
      addToast(errMsg, 'error');

      const recipientLabel = recipientType === 'PATIENT' ? 'Patient [Protected Client]' : 'Medical Specialist [Staff]';

      sessionLogger.logEvent({
        module: 'NOTIFICATIONS',
        action: 'DISPATCH_FAILED',
        status: 'FAILED',
        recipient: recipientLabel,
        channel: notificationChannel,
        type: notificationType,
        subject: subject || 'General Notice',
        details: `Dispatch attempt failed: ${errMsg}`,
        metadata: 'Gateway Dispatch Rejected',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveCsv = async () => {
    try {
      setExporting(true);
      const res = await sessionLogger.saveCsvSilently();
      if (res.serverSaved) {
        addToast(`Session log automatically saved to frontend directory (${res.filename})`, 'success');
      } else {
        addToast('Session log synchronized to frontend directory', 'success');
      }
    } catch {
      addToast('Failed to save session log', 'error');
    } finally {
      setExporting(false);
    }
  };

  const filteredLogs = useMemo(() => {
    if (logFilter === 'NOTIFICATIONS') {
      return sessionLogs.filter((l) => l.module === 'NOTIFICATIONS');
    }
    return sessionLogs;
  }, [sessionLogs, logFilter]);

  const notificationLogsCount = useMemo(() => {
    return sessionLogs.filter((l) => l.module === 'NOTIFICATIONS').length;
  }, [sessionLogs]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
          Hospital Notification Dispatch
        </h1>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>
          Broadcast clinical alerts, appointment reminders, and invoices via Email, SMS, or WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Dispatch Form Card */}
        <div className="card">
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Send size={18} color="var(--teal-600)" />
            Send Custom Notification
          </h2>
          <p className="card-subtitle">Direct dispatch through Notification Service</p>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '32px' }}>
              <LoadingSpinner size="28px" />
            </div>
          ) : (
            <form onSubmit={handleSendNotification} style={{ marginTop: '20px' }}>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Recipient Category</label>
                  <select
                    className="form-select"
                    value={recipientType}
                    onChange={(e) => {
                      setRecipientType(e.target.value);
                      setRecipientId('');
                    }}
                  >
                    <option value="PATIENT">Patient</option>
                    <option value="DOCTOR">Doctor</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Delivery Channel</label>
                  <select
                    className="form-select"
                    value={notificationChannel}
                    onChange={(e) => setNotificationChannel(e.target.value)}
                  >
                    <option value="EMAIL">Email</option>
                    <option value="SMS">SMS</option>
                    <option value="WHATSAPP">WhatsApp</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Select Recipient</label>
                <select
                  required
                  className="form-select"
                  value={recipientId}
                  onChange={(e) => setRecipientId(e.target.value)}
                >
                  <option value="">-- Choose {recipientType === 'PATIENT' ? 'Patient' : 'Doctor'} --</option>
                  {recipientType === 'PATIENT'
                    ? patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.email})
                        </option>
                      ))
                    : doctors.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.doctorName} ({d.doctorEmail})
                        </option>
                      ))}
                </select>
                {recipientType === 'DOCTOR' && (
                  <p style={{ fontSize: '0.75rem', color: '#b45309', marginTop: '6px' }}>
                    Note: Backend contact lookup for doctors is not yet implemented. Manual dispatch is recommended for patients.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Notification Type</label>
                  <select
                    className="form-select"
                    value={notificationType}
                    onChange={(e) => setNotificationType(e.target.value)}
                  >
                    <option value="General">General Notice</option>
                    <option value="APPOINTMENT_REMINDER">Appointment Reminder</option>
                    <option value="APPOINTMENT_CONFIRMATION">Appointment Confirmation</option>
                    <option value="REGISTRATION_CONFIRMATION">Registration Confirmation</option>
                    <option value="PAYMENT_CONFIRMATION">Payment Confirmation</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Subject line..."
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Message Content</label>
                <textarea
                  required
                  rows={4}
                  className="form-input"
                  placeholder="Type clinical or administrative notification message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={submitting}
                style={{ marginTop: '12px' }}
              >
                {submitting ? <LoadingSpinner size="18px" color="#ffffff" /> : 'Dispatch Notification'}
              </button>
            </form>
          )}
        </div>

        {/* Live Session Dispatch & Audit Log Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
              <div>
                <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Bell size={18} color="var(--slate-600)" />
                  Active Session Dispatch Log
                </h2>
                <p className="card-subtitle" style={{ marginTop: '4px' }}>
                  Logs and actions processed by the website throughout this session
                </p>
              </div>

              <button
                onClick={handleSaveCsv}
                disabled={exporting}
                className="btn btn-secondary btn-sm"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#ffffff',
                  whiteSpace: 'nowrap',
                }}
                title="Automatically save CSV file containing all session logs to frontend folder"
              >
                <FileSpreadsheet size={14} />
                <span>{exporting ? 'Saving...' : 'Sync Log to File'}</span>
              </button>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              <button
                type="button"
                onClick={() => setLogFilter('ALL')}
                style={{
                  border: 'none',
                  background: logFilter === 'ALL' ? 'var(--teal-50)' : 'transparent',
                  color: logFilter === 'ALL' ? 'var(--teal-600)' : 'var(--slate-600)',
                  fontWeight: logFilter === 'ALL' ? 600 : 500,
                  fontSize: '0.8125rem',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                All Website Activity ({sessionLogs.length})
              </button>
              <button
                type="button"
                onClick={() => setLogFilter('NOTIFICATIONS')}
                style={{
                  border: 'none',
                  background: logFilter === 'NOTIFICATIONS' ? 'var(--teal-50)' : 'transparent',
                  color: logFilter === 'NOTIFICATIONS' ? 'var(--teal-600)' : 'var(--slate-600)',
                  fontWeight: logFilter === 'NOTIFICATIONS' ? 600 : 500,
                  fontSize: '0.8125rem',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Dispatched Alerts ({notificationLogsCount})
              </button>
            </div>

            {/* Scrollable Log Entries */}
            <div
              style={{
                marginTop: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                maxHeight: '380px',
                overflowY: 'auto',
                paddingRight: '4px',
              }}
            >
              {filteredLogs.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '48px 16px',
                    color: 'var(--slate-400)',
                    fontSize: '0.875rem',
                  }}
                >
                  No logs recorded in this session yet.
                </div>
              ) : (
                filteredLogs.map((log) => {
                  let badgeClass = 'badge-neutral';
                  if (log.module === 'NOTIFICATIONS') badgeClass = 'badge-info';
                  if (log.module === 'BILLING') badgeClass = 'badge-success';
                  if (log.module === 'APPOINTMENTS') badgeClass = 'badge-warning';
                  if (log.module === 'AUTH') badgeClass = 'badge-info';

                  let displayRecipient = log.recipient;
                  if (displayRecipient && displayRecipient.toLowerCase().includes('patient')) {
                    displayRecipient = 'Patient [Protected Client]';
                  } else if (displayRecipient && displayRecipient.toLowerCase().includes('doctor')) {
                    displayRecipient = 'Medical Specialist [Staff]';
                  }

                  let displayDetails = log.details;
                  if (displayDetails && (displayDetails.trim().startsWith('{') || displayDetails.includes('recipientId'))) {
                    displayDetails = 'System notification dispatch record processed securely';
                  }

                  return (
                    <div
                      key={log.id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        background: 'var(--slate-50)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className={`badge ${badgeClass}`}>{log.module}</span>
                          {log.channel !== '-' && (
                            <span style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--slate-600)', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>
                              {log.channel}
                            </span>
                          )}
                          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary-navy)' }}>
                            {log.subject !== '-' ? log.subject : log.action}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', whiteSpace: 'nowrap' }}>
                          {log.timeStr}
                        </span>
                      </div>

                      <p style={{ fontSize: '0.8125rem', color: 'var(--slate-600)', margin: 0, wordBreak: 'break-word' }}>
                        {displayDetails}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: log.status === 'FAILED' ? 'var(--danger)' : 'var(--success)' }}>
                          {log.status === 'FAILED' ? <Activity size={12} /> : <CheckCircle size={12} />}
                          <span>{displayRecipient !== '-' ? displayRecipient : log.action}</span>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--slate-400)' }}>
                          {log.metadata}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Automatic Logout CSV Banner */}
          <div
            style={{
              marginTop: '18px',
              padding: '12px 14px',
              backgroundColor: '#f0fdfa',
              border: '1px solid #ccfbf1',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.8rem',
              color: 'var(--teal-700)',
            }}
          >
            <FileSpreadsheet size={18} style={{ color: 'var(--teal-600)', flexShrink: 0 }} />
            <div>
              <strong>Auto-Saved to Frontend Folder:</strong> Session logs are automatically saved to CSV files in your frontend project directory upon every action and when you click <strong>Logout</strong> — without any browser download popups.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
