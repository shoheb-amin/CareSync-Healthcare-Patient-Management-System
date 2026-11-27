import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { appointmentService } from '../../../services/appointmentService';
import { patientService } from '../../../services/patientService';
import { doctorService } from '../../../services/doctorService';
import { formatDate } from '../../../utils/formatters';
import { useToast } from '../../../context/NotificationContext';
import {
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
} from 'lucide-react';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import SearchInput from '../../../components/common/SearchInput';
import Pagination from '../../../components/common/Pagination';
import Modal from '../../../components/common/Modal';
import Badge from '../../../components/common/Badge';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);

  // Book Appointment form
  const [bookForm, setBookForm] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
  });

  // Reschedule form
  const [rescheduleForm, setRescheduleForm] = useState({
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
  });

  // Availability schedule form
  const [availabilityForm, setAvailabilityForm] = useState({
    doctorId: '',
    doctorName: '',
    department: '',
    specialty: '',
    doctorAvailabilityDate: '',
    startTime: '09:00:00',
    endTime: '17:00:00',
  });

  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const docId = searchParams.get('doctorId');
    if (docId) {
      setBookForm((prev) => ({ ...prev, doctorId: docId }));
      setIsBookOpen(true);
    }
  }, [searchParams]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appts, pts, docs] = await Promise.allSettled([
        statusFilter === 'ALL'
          ? appointmentService.getAllAppointments()
          : appointmentService.getAppointmentsByStatus(statusFilter),
        patientService.getPatients(),
        doctorService.getDoctors(),
      ]);

      if (appts.status === 'fulfilled' && Array.isArray(appts.value)) {
        setAppointments(appts.value);
      }
      if (pts.status === 'fulfilled' && Array.isArray(pts.value)) {
        setPatients(pts.value);
      }
      if (docs.status === 'fulfilled' && Array.isArray(docs.value)) {
        setDoctors(docs.value);
      }
    } catch {
      addToast('Failed to load appointments data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const q = search.toLowerCase();
      const pName = (a.patientName || '').toLowerCase();
      const dName = (a.doctorName || '').toLowerCase();
      const reason = (a.reason || '').toLowerCase();
      return pName.includes(q) || dName.includes(q) || reason.includes(q);
    });
  }, [appointments, search]);

  const totalPages = Math.ceil(filteredAppointments.length / pageSize) || 1;
  const paginatedAppointments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAppointments.slice(start, start + pageSize);
  }, [filteredAppointments, currentPage, pageSize]);

  const handleBook = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Ensure time string is HH:mm:ss format
      let formattedTime = bookForm.appointmentTime;
      if (formattedTime.length === 5) formattedTime += ':00';

      await appointmentService.createAppointment({
        ...bookForm,
        appointmentTime: formattedTime,
      });
      addToast('Appointment booked successfully', 'success');
      setIsBookOpen(false);
      setBookForm({
        patientId: '',
        doctorId: '',
        appointmentDate: '',
        appointmentTime: '',
        reason: '',
      });
      loadData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to book appointment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    if (!selectedAppt) return;
    setSubmitting(true);
    try {
      let formattedTime = rescheduleForm.appointmentTime;
      if (formattedTime.length === 5) formattedTime += ':00';

      await appointmentService.updateAppointment(selectedAppt.appointmentId || selectedAppt.id, {
        doctorId: selectedAppt.doctorId,
        appointmentDate: rescheduleForm.appointmentDate,
        appointmentTime: formattedTime,
        reason: rescheduleForm.reason,
      });
      addToast('Appointment rescheduled successfully', 'success');
      setIsRescheduleOpen(false);
      loadData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to reschedule appointment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async (id) => {
    try {
      await appointmentService.confirmAppointment(id);
      addToast('Appointment confirmed', 'success');
      loadData();
    } catch (err) {
      addToast('Failed to confirm appointment', 'error');
    }
  };

  const handleComplete = async (id) => {
    try {
      await appointmentService.completeAppointment(id);
      addToast('Appointment marked as COMPLETED', 'success');
      loadData();
    } catch (err) {
      addToast('Failed to complete appointment', 'error');
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await appointmentService.cancelAppointment(id);
      addToast('Appointment cancelled', 'warning');
      loadData();
    } catch (err) {
      addToast('Failed to cancel appointment', 'error');
    }
  };

  const handleCreateAvailability = async (e) => {
    e.preventDefault();
    if (!availabilityForm.doctorId) return;
    setSubmitting(true);
    try {
      let startTime = availabilityForm.startTime;
      if (startTime && startTime.length === 5) startTime += ':00';
      let endTime = availabilityForm.endTime;
      if (endTime && endTime.length === 5) endTime += ':00';

      await appointmentService.createDoctorAvailability(availabilityForm.doctorId, {
        ...availabilityForm,
        startTime,
        endTime,
      });
      addToast('Doctor schedule slot registered', 'success');
      setIsAvailabilityOpen(false);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to set availability slot', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openRescheduleModal = (appt) => {
    setSelectedAppt(appt);
    setRescheduleForm({
      appointmentDate: appt.appointmentDate || '',
      appointmentTime: appt.appointmentTime ? appt.appointmentTime.substring(0, 5) : '',
      reason: appt.reason || '',
    });
    setIsRescheduleOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
            Appointment Scheduling
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>
            Book, reschedule, confirm, and manage clinical visits.
          </p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-secondary" onClick={() => setIsAvailabilityOpen(true)}>
            <Clock size={16} /> Add Doctor Slot
          </button>
          <button className="btn btn-primary" onClick={() => setIsBookOpen(true)}>
            <Plus size={16} /> Book Appointment
          </button>
        </div>
      </div>

      <div className="card">
        {/* Search & Filter Bar */}
        <div className="filter-bar">
          <SearchInput
            placeholder="Search patient, doctor, or reason..."
            value={search}
            onChange={(val) => {
              setSearch(val);
              setCurrentPage(1);
            }}
          />

          <div className="filter-bar-group">
            <Filter size={16} color="var(--slate-500)" />
            <select
              className="form-select"
              style={{ width: '180px' }}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="RESCHEDULED">Rescheduled</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
            <LoadingSpinner size="32px" />
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--slate-500)' }}>
                        No appointments found.
                      </td>
                    </tr>
                  ) : (
                    paginatedAppointments.map((appt) => {
                      const apptId = appt.appointmentId || appt.id;
                      let variant = 'neutral';
                      if (appt.status === 'CONFIRMED') variant = 'info';
                      if (appt.status === 'COMPLETED') variant = 'success';
                      if (appt.status === 'CANCELLED') variant = 'danger';
                      if (appt.status === 'SCHEDULED') variant = 'warning';
                      if (appt.status === 'RESCHEDULED') variant = 'neutral';

                      return (
                        <tr key={apptId}>
                          <td style={{ fontWeight: 600 }}>{appt.patientName || appt.patientId}</td>
                          <td>{appt.doctorName || appt.doctorId}</td>
                          <td>{formatDate(appt.appointmentDate)}</td>
                          <td>{appt.appointmentTime}</td>
                          <td>{appt.reason}</td>
                          <td>
                            <Badge variant={variant}>{appt.status}</Badge>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
                              {(appt.status === 'SCHEDULED' || appt.status === 'RESCHEDULED') && (
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => handleConfirm(apptId)}
                                  title="Confirm Appointment"
                                  style={{ color: 'var(--info)' }}
                                >
                                  <CheckCircle2 size={14} />
                                </button>
                              )}
                              {appt.status === 'CONFIRMED' && (
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => handleComplete(apptId)}
                                  title="Complete Appointment"
                                  style={{ color: 'var(--success)' }}
                                >
                                  <CheckCircle2 size={14} />
                                </button>
                              )}
                              {appt.status !== 'CANCELLED' && appt.status !== 'COMPLETED' && (
                                <>
                                  <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => openRescheduleModal(appt)}
                                    title="Reschedule Appointment"
                                  >
                                    <Clock size={14} />
                                  </button>
                                  <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleCancel(apptId)}
                                    title="Cancel Appointment"
                                  >
                                    <XCircle size={14} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => setCurrentPage(p)}
            />
          </>
        )}
      </div>

      {/* Book Appointment Modal */}
      <Modal
        isOpen={isBookOpen}
        onClose={() => setIsBookOpen(false)}
        title="Schedule Patient Appointment"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsBookOpen(false)} disabled={submitting}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleBook} disabled={submitting}>
              {submitting ? <LoadingSpinner size="16px" color="#ffffff" /> : 'Confirm Booking'}
            </button>
          </>
        }
      >
        <form onSubmit={handleBook}>
          <div className="form-group">
            <label className="form-label">Select Patient</label>
            <select
              required
              className="form-select"
              value={bookForm.patientId}
              onChange={(e) => setBookForm({ ...bookForm, patientId: e.target.value })}
            >
              <option value="">-- Choose Patient --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.email})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Select Doctor</label>
            <select
              required
              className="form-select"
              value={bookForm.doctorId}
              onChange={(e) => setBookForm({ ...bookForm, doctorId: e.target.value })}
            >
              <option value="">-- Choose Doctor --</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.doctorName} - {d.speciality || d.Speciality} ({d.department})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Appointment Date</label>
              <input
                type="date"
                required
                className="form-input"
                value={bookForm.appointmentDate}
                onChange={(e) => setBookForm({ ...bookForm, appointmentDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Appointment Time</label>
              <input
                type="time"
                step="1"
                required
                className="form-input"
                value={bookForm.appointmentTime}
                onChange={(e) => setBookForm({ ...bookForm, appointmentTime: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reason for Visit</label>
            <textarea
              required
              rows={2}
              className="form-input"
              placeholder="e.g. Regular health checkup, seasonal fever, cardiology consultation..."
              value={bookForm.reason}
              onChange={(e) => setBookForm({ ...bookForm, reason: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        isOpen={isRescheduleOpen}
        onClose={() => setIsRescheduleOpen(false)}
        title="Reschedule Appointment"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsRescheduleOpen(false)} disabled={submitting}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleReschedule} disabled={submitting}>
              {submitting ? <LoadingSpinner size="16px" color="#ffffff" /> : 'Save New Time'}
            </button>
          </>
        }
      >
        <form onSubmit={handleReschedule}>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">New Date</label>
              <input
                type="date"
                required
                className="form-input"
                value={rescheduleForm.appointmentDate}
                onChange={(e) => setRescheduleForm({ ...rescheduleForm, appointmentDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">New Time</label>
              <input
                type="time"
                required
                className="form-input"
                value={rescheduleForm.appointmentTime}
                onChange={(e) => setRescheduleForm({ ...rescheduleForm, appointmentTime: e.target.value })}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Reason / Notes</label>
            <textarea
              required
              rows={2}
              className="form-input"
              value={rescheduleForm.reason}
              onChange={(e) => setRescheduleForm({ ...rescheduleForm, reason: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* Doctor Availability Slot Modal */}
      <Modal
        isOpen={isAvailabilityOpen}
        onClose={() => setIsAvailabilityOpen(false)}
        title="Register Doctor Availability Slot"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsAvailabilityOpen(false)} disabled={submitting}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleCreateAvailability} disabled={submitting}>
              {submitting ? <LoadingSpinner size="16px" color="#ffffff" /> : 'Register Slot'}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateAvailability}>
          <div className="form-group">
            <label className="form-label">Doctor</label>
            <select
              required
              className="form-select"
              value={availabilityForm.doctorId}
              onChange={(e) => {
                const docId = e.target.value;
                const found = doctors.find((d) => d.id === docId);
                setAvailabilityForm({
                  ...availabilityForm,
                  doctorId: docId,
                  doctorName: found ? found.doctorName : '',
                  department: found ? found.department : '',
                  specialty: found ? found.speciality || found.Speciality : '',
                });
              }}
            >
              <option value="">-- Choose Doctor --</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.doctorName} ({d.department})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Slot Date</label>
            <input
              type="date"
              required
              className="form-input"
              value={availabilityForm.doctorAvailabilityDate}
              onChange={(e) =>
                setAvailabilityForm({ ...availabilityForm, doctorAvailabilityDate: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input
                type="time"
                step="1"
                required
                className="form-input"
                value={availabilityForm.startTime}
                onChange={(e) => setAvailabilityForm({ ...availabilityForm, startTime: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">End Time</label>
              <input
                type="time"
                step="1"
                required
                className="form-input"
                value={availabilityForm.endTime}
                onChange={(e) => setAvailabilityForm({ ...availabilityForm, endTime: e.target.value })}
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
