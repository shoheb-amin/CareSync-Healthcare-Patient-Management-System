import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../../services/analyticsService';
import { patientService } from '../../../services/patientService';
import { doctorService } from '../../../services/doctorService';
import { appointmentService } from '../../../services/appointmentService';
import { billingService } from '../../../services/billingService';
import { formatCurrency } from '../../../utils/formatters';
import { useToast } from '../../../context/NotificationContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const COLORS = ['#0d9488', '#2563eb', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    specialistsOnDuty: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    scheduled: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    successfulPayments: 0,
    pendingPayments: 0,
    failedPayments: 0,
    departmentData: [],
  });

  const { addToast } = useToast();

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const [
          pStatsRes,
          dCountRes,
          dListRes,
          aStatsRes,
          payStatsRes,
          livePtsRes,
          liveDocsRes,
          liveApptsRes,
          livePaymentsRes,
        ] = await Promise.allSettled([
          analyticsService.getPatientStats(),
          analyticsService.getTotalDoctors(),
          analyticsService.getAllDoctorsAnalytics(),
          analyticsService.getAppointmentStats(),
          analyticsService.getPaymentStats(),
          patientService.getPatients(),
          doctorService.getDoctors(),
          appointmentService.getAllAppointments(),
          billingService.getAllPayments(),
        ]);

        const pStats = pStatsRes.status === 'fulfilled' ? pStatsRes.value : null;
        const dCount = dCountRes.status === 'fulfilled' ? dCountRes.value : null;
        const dList = dListRes.status === 'fulfilled' && Array.isArray(dListRes.value) ? dListRes.value : [];
        const aStats = aStatsRes.status === 'fulfilled' ? aStatsRes.value : null;
        const payStats = payStatsRes.status === 'fulfilled' ? payStatsRes.value : null;

        const livePts = livePtsRes.status === 'fulfilled' && Array.isArray(livePtsRes.value) ? livePtsRes.value : [];
        const liveDocs = liveDocsRes.status === 'fulfilled' && Array.isArray(liveDocsRes.value) ? liveDocsRes.value : [];
        const liveAppts = liveApptsRes.status === 'fulfilled' && Array.isArray(liveApptsRes.value) ? liveApptsRes.value : [];
        const livePayments = livePaymentsRes.status === 'fulfilled' && Array.isArray(livePaymentsRes.value) ? livePaymentsRes.value : [];

        // Operational calculations from live microservices
        const liveScheduled = liveAppts.filter((a) => {
          const s = (a.status || '').toUpperCase();
          return s === 'SCHEDULED' || s === 'BOOKED' || s === 'PENDING' || s === 'RESCHEDULED';
        }).length;
        const liveConfirmed = liveAppts.filter((a) => (a.status || '').toUpperCase() === 'CONFIRMED').length;
        const liveCompleted = liveAppts.filter((a) => (a.status || '').toUpperCase() === 'COMPLETED').length;
        const liveCancelled = liveAppts.filter((a) => (a.status || '').toUpperCase() === 'CANCELLED').length;

        const liveSuccessPayments = livePayments.filter((p) => (p.status || p.paymentStatus || '').toUpperCase() === 'SUCCESS');
        const livePendingPayments = livePayments.filter((p) => (p.status || p.paymentStatus || '').toUpperCase() === 'PENDING');
        const liveFailedPayments = livePayments.filter((p) => (p.status || p.paymentStatus || '').toUpperCase() === 'FAILED');
        const liveRevenue = liveSuccessPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

        // Department breakdown
        const allDoctors = dList.length > 0 ? dList : liveDocs;
        const departmentCounts = allDoctors.reduce((acc, doc) => {
          const dept = doc.department || doc.specialization || 'General';
          acc[dept] = (acc[dept] || 0) + 1;
          return acc;
        }, {});

        const departmentData = Object.entries(departmentCounts).map(([dept, count]) => ({
          department: dept,
          doctors: count,
        }));

        // Query real-time duty schedules on the current date for specialists on duty
        const todayStr = new Date().toISOString().split('T')[0];
        const onDutyChecks = await Promise.allSettled(
          liveDocs.map(async (doc) => {
            try {
              const slots = await appointmentService.getDoctorAvailability(doc.id, todayStr);
              return Array.isArray(slots) && slots.length > 0;
            } catch {
              return false;
            }
          })
        );
        const specialistsOnDutyCount = onDutyChecks.filter(
          (r) => r.status === 'fulfilled' && r.value === true
        ).length;

        setStats({
          totalPatients: Math.max(livePts.length, pStats?.totalPatients || 0),
          specialistsOnDuty: specialistsOnDutyCount,
          totalDoctors: Math.max(liveDocs.length, typeof dCount === 'number' ? dCount : dCount?.count || 0),
          totalAppointments: Math.max(liveAppts.length, aStats?.totalAppointments || 0),
          totalRevenue: Math.max(liveRevenue, payStats?.totalRevenue || 0),
          scheduled: Math.max(liveScheduled, aStats?.pendingAppointments || aStats?.bookedAppointments || 0),
          confirmed: Math.max(liveConfirmed, aStats?.confirmedAppointments || 0),
          completed: Math.max(liveCompleted, aStats?.completedAppointments || 0),
          cancelled: Math.max(liveCancelled, aStats?.cancelledAppointments || 0),
          successfulPayments: Math.max(liveSuccessPayments.length, payStats?.successfulPayments || 0),
          pendingPayments: Math.max(livePendingPayments.length, payStats?.pendingPayments || 0),
          failedPayments: Math.max(liveFailedPayments.length, payStats?.failedPayments || 0),
          departmentData,
        });
      } catch {
        addToast('Failed to load metrics from Analytics Service', 'error');
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '64px' }}>
        <LoadingSpinner size="36px" />
      </div>
    );
  }

  // Appointment Status data for Recharts
  const appointmentChartData = [
    { name: 'Scheduled', count: stats.scheduled },
    { name: 'Confirmed', count: stats.confirmed },
    { name: 'Completed', count: stats.completed },
    { name: 'Cancelled', count: stats.cancelled },
  ];

  // Payment Breakdown for Recharts
  const paymentPieData = [
    { name: 'Successful', value: stats.successfulPayments },
    { name: 'Pending', value: stats.pendingPayments },
    { name: 'Failed', value: stats.failedPayments },
  ].filter((d) => d.value > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
          Healthcare Analytics &amp; Telemetry
        </h1>
        <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>
          Aggregate metrics fed through Kafka event streams and reconciled with live microservices.
        </p>
      </div>

      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-4 gap-6">
        <div className="card">
          <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', fontWeight: 500 }}>
            Registered Patients
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary-navy)', marginTop: '4px' }}>
            {stats.totalPatients}
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', fontWeight: 500 }}>
              Specialists on Duty
            </div>
            <span
              style={{
                fontSize: '0.675rem',
                fontWeight: 600,
                color: '#059669',
                backgroundColor: '#ecfdf5',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              Today
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary-navy)', marginTop: '4px' }}>
            {stats.specialistsOnDuty}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '2px' }}>
            {stats.totalDoctors} total registered
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', fontWeight: 500 }}>
            Total Consultations
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary-navy)', marginTop: '4px' }}>
            {stats.totalAppointments}
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: '0.8125rem', color: 'var(--slate-500)', fontWeight: 500 }}>
            Collected Revenue
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--teal-600)', marginTop: '4px' }}>
            {formatCurrency(stats.totalRevenue)}
          </div>
        </div>
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-2 gap-6">
        {/* Appointment Status Distribution */}
        <div className="card">
          <h2 className="card-title">Appointment Lifecycle Distribution</h2>
          <p className="card-subtitle">Volume of clinical visits by current status</p>
          <div style={{ height: '300px', marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appointmentChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis allowDecimals={false} stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="count" fill="var(--teal-600)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Success Breakdown */}
        <div className="card">
          <h2 className="card-title">Payment Settlement Status</h2>
          <p className="card-subtitle">Completed vs. Pending vs. Failed billing records</p>
          <div style={{ height: '300px', marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {paymentPieData.length === 0 ? (
              <div style={{ color: 'var(--slate-400)', fontSize: '0.875rem' }}>
                No payment transactions recorded.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {paymentPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Department Staffing Analysis */}
      {stats.departmentData.length > 0 && (
        <div className="card">
          <h2 className="card-title">Medical Staffing by Department</h2>
          <p className="card-subtitle">Distribution of registered physicians and specialists</p>
          <div style={{ height: '280px', marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.departmentData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" allowDecimals={false} stroke="#64748b" />
                <YAxis dataKey="department" type="category" stroke="#64748b" width={120} />
                <Tooltip />
                <Bar dataKey="doctors" fill="var(--accent-blue)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
