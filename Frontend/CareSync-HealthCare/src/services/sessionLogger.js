import { decodeJwt } from '../utils/jwt';

const STORAGE_KEY = 'caresync_session_logs';

function sanitizeClientText(str, isRecipient = false) {
  if (!str || str === '-') return '-';
  let s = String(str);

  // If raw JSON payload or contains client payload keys, replace with sanitized audit summary
  if (
    s.trim().startsWith('{') ||
    s.includes('recipientId') ||
    s.includes('notificationChannel') ||
    s.includes('patientId')
  ) {
    return 'Clinical record transaction processed securely';
  }

  // Mask any email addresses
  s = s.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[Protected Email]');

  // Mask any phone numbers
  s = s.replace(/(\+?[0-9]{1,3}[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g, '[Protected Contact]');

  // Mask any UUIDs / database IDs
  s = s.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '[Protected ID]');

  if (isRecipient) {
    const lower = s.toLowerCase();
    if (lower.includes('patient')) {
      return 'Patient [Protected Client]';
    }
    if (lower.includes('doctor')) {
      return 'Medical Specialist [Staff]';
    }
    if (s.startsWith('/api/')) {
      return 'Hospital Clinical Gateway';
    }
  }

  return s;
}

function sanitizeLogEntry(entry) {
  if (!entry) return entry;

  let recipient = sanitizeClientText(entry.recipient, true);
  if (entry.module === 'NOTIFICATIONS' && (recipient.includes('Patient') || recipient.toLowerCase().includes('patient'))) {
    recipient = 'Patient [Protected Client]';
  }

  let details = sanitizeClientText(entry.details, false);
  // For notifications, mask raw test or client message contents with sanitized audit description
  if (
    entry.module === 'NOTIFICATIONS' &&
    !details.startsWith('Outbound ') &&
    !details.startsWith('Dispatch attempt') &&
    !details.startsWith('Clinical')
  ) {
    const channel = entry.channel && entry.channel !== '-' ? entry.channel : 'secure';
    const nType = entry.type && entry.type !== '-' ? entry.type.replace(/_/g, ' ') : 'General Notice';
    details = `Outbound ${nType} alert transmitted via ${channel} gateway`;
  }

  let metadata = sanitizeClientText(entry.metadata, false);
  if (metadata.includes('Dispatch ID:')) {
    metadata = metadata.replace(/Dispatch ID:\s*[0-9a-f-]+/gi, 'Dispatch Ref: #SECURE');
  }

  return {
    ...entry,
    recipient,
    details,
    metadata,
  };
}

function getStoredLogs() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    
    // Filter out duplicate raw HTTP notification records that logged raw JSON payloads
    const cleanLogs = parsed.filter((log) => {
      if (!log) return false;
      if (log.module === 'NOTIFICATIONS' && log.action === 'CREATE_RECORD') return false;
      if (typeof log.details === 'string' && log.details.includes('recipientId')) return false;
      return true;
    });

    // Sanitize any existing logs on retrieval to protect end client PII
    return cleanLogs.map(sanitizeLogEntry);
  } catch {
    return [];
  }
}

function setStoredLogs(logs) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch {
    // Ignore storage quota errors
  }
}

function getCurrentUserEmail() {
  try {
    const token = sessionStorage.getItem('caresync_token');
    if (token) {
      const decoded = decodeJwt(token);
      return decoded?.sub || decoded?.email || 'authenticated-user';
    }
  } catch {
    // Fallback
  }
  return 'testuser@test.com';
}

function escapeCsvField(val) {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  return `"${str.replace(/"/g, '""')}"`;
}

let autoSaveTimer = null;
function scheduleAutoSave() {
  if (typeof window === 'undefined') return;
  if (autoSaveTimer) clearTimeout(autoSaveTimer);
  autoSaveTimer = setTimeout(() => {
    sessionLogger.saveCsvSilently().catch(() => {});
  }, 1000);
}

export const sessionLogger = {
  getLogs: () => {
    return getStoredLogs();
  },

  logEvent: ({
    module = 'GENERAL',
    action = 'ACTION',
    status = 'SUCCESS',
    recipient = '-',
    channel = '-',
    type = '-',
    subject = '-',
    details = '-',
    metadata = '-',
  }) => {
    const now = new Date();
    const rawEntry = {
      id: `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      timestampIso: now.toISOString(),
      dateStr: now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      timeStr: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
      user: getCurrentUserEmail(),
      module: String(module).toUpperCase(),
      action: String(action).toUpperCase(),
      status: String(status).toUpperCase(),
      recipient: String(recipient),
      channel: String(channel).toUpperCase(),
      type: String(type),
      subject: String(subject),
      details: String(details),
      metadata: String(metadata),
    };

    // Ensure all logged events are sanitized of client PII before saving
    const entry = sanitizeLogEntry(rawEntry);

    const currentLogs = getStoredLogs();
    const updated = [entry, ...currentLogs];
    setStoredLogs(updated);

    // Automatically synchronize updated session logs to host frontend directory without showing downloading
    scheduleAutoSave();

    // Notify active listeners (e.g., Notifications Page log panel)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('caresync:session-log-updated', { detail: entry }));
    }

    return entry;
  },

  generateCsvContent: (logsToExport) => {
    const logs = Array.isArray(logsToExport) && logsToExport.length > 0 ? logsToExport : getStoredLogs();
    const headers = [
      'Log_ID',
      'Timestamp_ISO',
      'Date',
      'Time',
      'User',
      'Module',
      'Action',
      'Status',
      'Recipient_Category',
      'Delivery_Channel',
      'Notification_Type',
      'Subject',
      'Audit_Summary',
      'Metadata_Response',
    ];

    const rows = logs.map((log) => [
      escapeCsvField(log.id),
      escapeCsvField(log.timestampIso),
      escapeCsvField(log.dateStr),
      escapeCsvField(log.timeStr),
      escapeCsvField(log.user),
      escapeCsvField(log.module),
      escapeCsvField(log.action),
      escapeCsvField(log.status),
      escapeCsvField(log.recipient),
      escapeCsvField(log.channel),
      escapeCsvField(log.type),
      escapeCsvField(log.subject),
      escapeCsvField(log.details),
      escapeCsvField(log.metadata),
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  },

  saveCsvSilently: async (customFilename = null) => {
    const logs = getStoredLogs();
    if (!logs || logs.length === 0) {
      return { success: true, totalEntries: 0 };
    }

    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const dateFormatted = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
    const filename = customFilename || `CareSync_Session_Log_${dateFormatted}.csv`;

    const csvContent = sessionLogger.generateCsvContent(logs);

    let serverSaved = false;
    let savedPaths = [];

    // Attempt 1: Direct host logger daemon on port 3002 (bypasses container directly to host filesystem)
    try {
      const response = await fetch('http://localhost:3002/api/session-logs/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename,
          csvContent,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        serverSaved = true;
        savedPaths = result.savedPaths || [result.savedPath];
      }
    } catch {
      // Direct host port 3002 not reachable, fallback to relative path
    }

    // Attempt 2: Relative endpoint /api/session-logs/save (via Nginx reverse proxy or Vite dev server)
    if (!serverSaved) {
      try {
        const response = await fetch('/api/session-logs/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filename,
            csvContent,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          serverSaved = true;
          savedPaths = result.savedPaths || [result.savedPath];
        }
      } catch {
        // Background write failed
      }
    }

    // NOTE: Zero browser download prompts (never trigger link.click() or show download shelf)
    return {
      success: serverSaved,
      filename,
      serverSaved,
      savedPaths,
      totalEntries: logs.length,
    };
  },

  // Backwards-compatible aliases
  saveCsvToRootAndDownload: async (customFilename = null) => {
    return sessionLogger.saveCsvSilently(customFilename);
  },

  saveCsvToRoot: async (customFilename = null) => {
    return sessionLogger.saveCsvSilently(customFilename);
  },

  clearLogs: () => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('caresync:session-log-updated', { detail: null }));
      }
    } catch {
      // Ignore
    }
  },
};

export default sessionLogger;
