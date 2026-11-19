import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { patientService } from '../../../services/patientService';
import { doctorService } from '../../../services/doctorService';
import { appointmentService } from '../../../services/appointmentService';
import { billingService } from '../../../services/billingService';
import { analyticsService } from '../../../services/analyticsService';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import {
  Users,
  UserCheck,
  Calendar,
  IndianRupee,
  Stethoscope,
  Building2,
  Award,
  Phone,
  Clock,
  ChevronRight,
} from 'lucide-react';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import Badge from '../../../components/common/Badge';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    scheduledOrPending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    billingSuccess: 0,
    billingPending: 0,
    billingFailed: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [availableDoctors, setAvailableDoctors] = useState([]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        // Query both live microservices (System of Record) and analytics-services
        const [
          pListRes,
          dListRes,
          apptsRes,
          paymentsRes,
          pStatsRes,
          dCountRes,
          aStatsRes,
          payStatsRes,
        ] = await Promise.allSettled([
          patientService.getPatients(),
          doctorService.getDoctors(),
          appointmentService.getAllAppointments(),
          billingService.getAllPayments(),
          analyticsService.getPatientStats(),
          analyticsService.getTotalDoctors(),
          analyticsService.getAppointmentStats(),
          analyticsService.getPaymentStats(),
        ]);

        const patients = pListRes.status === 'fulfilled' && Array.isArray(pListRes.value) ? pListRes.value : [];
        const doctors = dListRes.status === 'fulfilled' && Array.isArray(dListRes.value) ? dListRes.value : [];
        const appointments = apptsRes.status === 'fulfilled' && Array.isArray(apptsRes.value) ? apptsRes.value : [];
        const payments = paymentsRes.status === 'fulfilled' && Array.isArray(paymentsRes.value) ? paymentsRes.value : [];

        const pStats = pStatsRes.status === 'fulfilled' ? pStatsRes.value : null;
        const dCount = dCountRes.status === 'fulfilled' ? dCountRes.value : null;
        const aStats = aStatsRes.status === 'fulfilled' ? aStatsRes.value : null;
        const payStats = payStatsRes.status === 'fulfilled' ? payStatsRes.value : null;

        // Lookup maps for resolving IDs to human-readable names
        const patientMap = patients.reduce((acc, p) => {
          if (p.id) acc[p.id] = p.name;
          return acc;
        }, {});

        const doctorMap = doctors.reduce((acc, d) => {
          if (d.id) acc[d.id] = d.name || d.doctorName;
          return acc;
        }, {});

        // Operational calculations from live microservices
        const liveScheduled = appointments.filter((a) => {
          const s = (a.status || '').toUpperCase();
          return s === 'SCHEDULED' || s === 'BOOKED' || s === 'PENDING' || s === 'RESCHEDULED';
        }).length;

        const liveConfirmed = appointments.filter((a) => (a.status || '').toUpperCase() === 'CONFIRMED').length;
        const liveCompleted = appointments.filter((a) => (a.status || '').toUpperCase() === 'COMPLETED').length;
        const liveCancelled = appointments.filter((a) => (a.status || '').toUpperCase() === 'CANCELLED').length;

        const liveSuccessPayments = payments.filter((p) => (p.status || p.paymentStatus || '').toUpperCase() === 'SUCCESS');
        const livePendingPayments = payments.filter((p) => (p.status || p.paymentStatus || '').toUpperCase() === 'PENDING');
        const liveFailedPayments = payments.filter((p) => (p.status || p.paymentStatus || '').toUpperCase() === 'FAILED');

        const liveRevenue = liveSuccessPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

        // Reconcile live microservice truth with analytics service
        const totalPatients = Math.max(patients.length, pStats?.totalPatients || 0);
        const totalDoctors = Math.max(
          doctors.length,
          typeof dCount === 'number' ? dCount : dCount?.count || 0
        );
        const totalAppointments = Math.max(appointments.length, aStats?.totalAppointments || 0);
        const totalRevenue = Math.max(liveRevenue, payStats?.totalRevenue || 0);

        const scheduledOrPending = Math.max(
          liveScheduled,
          aStats?.pendingAppointments || aStats?.bookedAppointments || 0
        );
        const confirmed = Math.max(liveConfirmed, aStats?.confirmedAppointments || 0);
        const completed = Math.max(liveCompleted, aStats?.completedAppointments || 0);
        const cancelled = Math.max(liveCancelled, aStats?.cancelledAppointments || 0);

        const billingSuccess = Math.max(liveSuccessPayments.length, payStats?.successfulPayments || 0);
        const billingPending = Math.max(livePendingPayments.length, payStats?.pendingPayments || 0);
        const billingFailed = Math.max(liveFailedPayments.length, payStats?.failedPayments || 0);

        setMetrics({
          totalPatients,
          totalDoctors,
          totalAppointments,
          totalRevenue,
          scheduledOrPending,
          confirmed,
          completed,
          cancelled,
          billingSuccess,
          billingPending,
          billingFailed,
        });

        // Query clinical duty schedules to ONLY show doctors available on the current date
        const todayStr = new Date().toISOString().split('T')[0];
        const doctorAvailabilityChecks = await Promise.allSettled(
          doctors.map(async (doc) => {
            try {
              const availabilitySlots = await appointmentService.getDoctorAvailability(doc.id, todayStr);
              if (Array.isArray(availabilitySlots) && availabilitySlots.length > 0) {
                return {
                  ...doc,
                  isAvailableToday: true,
                  todaySlots: availabilitySlots,
                };
              }
              return null;
            } catch {
              return null;
            }
          })
        );

        const onDutyToday = doctorAvailabilityChecks
          .filter((res) => res.status === 'fulfilled' && res.value !== null)
          .map((res) => res.value);

        setAvailableDoctors(onDutyToday);

        // Enrich recent appointments with resolved names
        const enrichedAppointments = appointments.slice(0, 6).map((appt) => ({
          ...appt,
          patientDisplay: appt.patientName || patientMap[appt.patientId] || appt.patientId || 'Patient',
          doctorDisplay: appt.doctorName || doctorMap[appt.doctorId] || appt.doctorId || 'Physician',
        }));

        setRecentAppointments(enrichedAppointments);
      } catch {
        // Fallback for offline or unreachable services
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <LoadingSpinner size="32px" />
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '28px', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
          Clinical Operations Dashboard
        </h1>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>
          Real-time healthcare metrics aggregated across CareSync microservices.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-4 gap-6" style={{ position: 'relative', zIndex: 1 }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              backgroundColor: 'var(--accent-blue-light)',
              color: 'var(--accent-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', fontWeight: 500 }}>Total Patients</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
              {metrics.totalPatients}
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              backgroundColor: 'var(--teal-50)',
              color: 'var(--teal-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <UserCheck size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', fontWeight: 500 }}>Specialists on Duty</span>
              <span style={{ fontSize: '0.675rem', fontWeight: 600, color: '#059669', backgroundColor: '#ecfdf5', padding: '1px 5px', borderRadius: '4px' }}>Today</span>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
              {availableDoctors.length}
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--slate-400)' }}>
              {metrics.totalDoctors} total registered
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              backgroundColor: 'var(--warning-bg)',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Calendar size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', fontWeight: 500 }}>Appointments</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
              {metrics.totalAppointments}
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '10px',
              backgroundColor: 'var(--success-bg)',
              color: 'var(--success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IndianRupee size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', fontWeight: 500 }}>Hospital Revenue</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
              {formatCurrency(metrics.totalRevenue)}
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Row */}
      <div className="grid grid-cols-3 gap-6" style={{ position: 'relative', zIndex: 1 }}>
        <div className="card">
          <div className="card-title">Booked &amp; Confirmed</div>
          <p className="card-subtitle">Scheduled patient visits pending completion</p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1, padding: '12px', background: 'var(--slate-50)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Scheduled / Pending</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary-navy)' }}>
                {metrics.scheduledOrPending}
              </div>
            </div>
            <div style={{ flex: 1, padding: '12px', background: 'var(--slate-50)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Confirmed</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary-navy)' }}>
                {metrics.confirmed}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Completed &amp; Cancelled</div>
          <p className="card-subtitle">Fulfilled or canceled clinical sessions</p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1, padding: '12px', background: 'var(--slate-50)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Completed</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--success)' }}>
                {metrics.completed}
              </div>
            </div>
            <div style={{ flex: 1, padding: '12px', background: 'var(--slate-50)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>Cancelled</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--danger)' }}>
                {metrics.cancelled}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Billing Summary</div>
          <p className="card-subtitle">Transaction status from Billing Service</p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1, padding: '10px', background: 'var(--slate-50)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>SUCCESS</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--success)' }}>
                {metrics.billingSuccess}
              </div>
            </div>
            <div style={{ flex: 1, padding: '10px', background: 'var(--slate-50)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>PENDING</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--warning)' }}>
                {metrics.billingPending}
              </div>
            </div>
            <div style={{ flex: 1, padding: '10px', background: 'var(--slate-50)', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)' }}>FAILED</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--danger)' }}>
                {metrics.billingFailed}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Doctors on Duty Section */}
      <div className="card" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 className="card-title" style={{ margin: 0 }}>Available Doctors on Duty</h2>
            <p className="card-subtitle">
              Medical specialists scheduled on duty and available for clinical consultation on the current date ({new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})
            </p>
          </div>
          <Link
            to="/doctors"
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <span>View All Doctors</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        {availableDoctors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px', color: 'var(--slate-500)' }}>
            <Calendar size={28} style={{ margin: '0 auto 10px', color: 'var(--slate-400)' }} />
            <div style={{ fontWeight: 600, color: 'var(--slate-700)', fontSize: '1rem' }}>No Doctors Scheduled on Duty for Today</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '4px', maxWidth: '440px', margin: '4px auto 14px' }}>
              No medical specialists currently have active consultation slots for today's date ({new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}).
            </p>
            <Link to="/doctors" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span>Browse All Hospital Doctors</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px',
            }}
          >
            {availableDoctors.map((doc) => {
              const displayName = doc.doctorName?.startsWith('Dr.') ? doc.doctorName : `Dr. ${doc.doctorName || 'Specialist'}`;
              const speciality = doc.speciality || doc.Speciality || 'General Medicine';
              const department = doc.department || 'Clinical Care';
              const shiftTime = doc.todaySlots && doc.todaySlots[0]
                ? `${doc.todaySlots[0].startTime.slice(0, 5)} - ${doc.todaySlots[0].endTime.slice(0, 5)}`
                : 'Active Today';

              return (
                <div
                  key={doc.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderLeft: '4px solid var(--teal-600)',
                    borderRadius: '12px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '16px',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                  }}
                >
                  <div>
                    {/* Top Doctor Avatar & Live Status Pill */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '12px',
                            backgroundColor: 'var(--teal-50)',
                            color: 'var(--teal-600)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Stethoscope size={22} />
                        </div>
                        <div>
                          <h3
                            style={{
                              fontSize: '1rem',
                              fontWeight: 700,
                              color: 'var(--primary-navy)',
                              margin: 0,
                            }}
                          >
                            {displayName}
                          </h3>
                          <div style={{ fontSize: '0.8rem', color: 'var(--teal-600)', fontWeight: 600, marginTop: '2px' }}>
                            {speciality}
                          </div>
                        </div>
                      </div>

                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '3px 10px',
                          borderRadius: '9999px',
                          backgroundColor: '#ecfdf5',
                          color: '#059669',
                          fontSize: '0.725rem',
                          fontWeight: 600,
                          letterSpacing: '0.02em',
                        }}
                      >
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#059669' }}></span>
                        On Duty Today
                      </span>
                    </div>

                    {/* Department, Shift, Qualifications & Details */}
                    <div
                      style={{
                        marginTop: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        fontSize: '0.8125rem',
                        color: 'var(--slate-600)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={14} color="var(--teal-600)" />
                        <span>Today's Shift: <strong style={{ color: 'var(--teal-700)' }}>{shiftTime}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Building2 size={14} color="var(--slate-400)" />
                        <span>Department: <strong style={{ color: 'var(--slate-700)' }}>{department}</strong></span>
                      </div>
                      {doc.qualification && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Award size={14} color="var(--slate-400)" />
                          <span>Qualification: {doc.qualification}</span>
                        </div>
                      )}
                      {doc.doctorPhone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Phone size={14} color="var(--slate-400)" />
                          <span>{doc.doctorPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ paddingTop: '14px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '10px' }}>
                    <Link
                      to={`/appointments?doctorId=${doc.id}`}
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1 }}
                    >
                      Book Appointment
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Appointments Table */}
      <div className="card" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 className="card-title" style={{ margin: 0 }}>Recent Appointments</h2>
            <p className="card-subtitle">Latest booked and scheduled clinical visits</p>
          </div>
        </div>

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
              </tr>
            </thead>
            <tbody>
              {recentAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--slate-500)' }}>
                    No appointments currently recorded in Appointment Service.
                  </td>
                </tr>
              ) : (
                recentAppointments.map((appt) => {
                  let badgeVariant = 'neutral';
                  const s = (appt.status || '').toUpperCase();
                  if (s === 'CONFIRMED') badgeVariant = 'info';
                  if (s === 'COMPLETED') badgeVariant = 'success';
                  if (s === 'CANCELLED') badgeVariant = 'danger';
                  if (s === 'SCHEDULED' || s === 'BOOKED' || s === 'PENDING') badgeVariant = 'warning';
                  if (s === 'RESCHEDULED') badgeVariant = 'neutral';

                  return (
                    <tr key={appt.appointmentId || appt.id}>
                      <td style={{ fontWeight: 600 }}>{appt.patientDisplay}</td>
                      <td>{appt.doctorDisplay}</td>
                      <td>{formatDate(appt.appointmentDate)}</td>
                      <td>{appt.appointmentTime}</td>
                      <td>{appt.reason}</td>
                      <td>
                        <Badge variant={badgeVariant}>{appt.status}</Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
