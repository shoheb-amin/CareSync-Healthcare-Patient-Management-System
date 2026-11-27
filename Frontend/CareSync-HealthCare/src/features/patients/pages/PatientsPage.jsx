import React, { useState, useEffect, useMemo } from 'react';
import { patientService } from '../../../services/patientService';
import { formatDate } from '../../../utils/formatters';
import { useToast } from '../../../context/NotificationContext';
import { Edit2, Trash2, Eye, UserPlus } from 'lucide-react';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import SearchInput from '../../../components/common/SearchInput';
import Pagination from '../../../components/common/Pagination';
import Modal from '../../../components/common/Modal';

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    dateOfBirth: '',
    registeredDate: new Date().toISOString().split('T')[0],
    gender: 'male',
  });
  const [submitting, setSubmitting] = useState(false);

  const { addToast } = useToast();

  const loadPatients = async () => {
    try {
      setLoading(true);
      const data = await patientService.getPatients();
      setPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      addToast('Failed to load patients from Patient Service', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const q = search.toLowerCase();
      return (
        p.name?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.address?.toLowerCase().includes(q)
      );
    });
  }, [patients, search]);

  const totalPages = Math.ceil(filteredPatients.length / pageSize) || 1;
  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPatients.slice(start, start + pageSize);
  }, [filteredPatients, currentPage, pageSize]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await patientService.createPatient(formData);
      addToast('Patient registered successfully & billing account created', 'success');
      setIsCreateOpen(false);
      setFormData({
        name: '',
        email: '',
        address: '',
        dateOfBirth: '',
        registeredDate: new Date().toISOString().split('T')[0],
        gender: 'male',
      });
      loadPatients();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create patient. Verify email uniqueness.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setSubmitting(true);
    try {
      await patientService.updatePatient(selectedPatient.id, {
        name: formData.name,
        email: formData.email,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth,
        registeredDate: formData.registeredDate,
        gender: formData.gender,
      });
      addToast('Patient information updated successfully', 'success');
      setIsEditOpen(false);
      loadPatients();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update patient', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete patient "${name}"?`)) return;
    try {
      await patientService.deletePatient(id);
      addToast('Patient record deleted successfully', 'success');
      loadPatients();
    } catch (err) {
      addToast('Failed to delete patient', 'error');
    }
  };

  const openEditModal = (p) => {
    setSelectedPatient(p);
    setFormData({
      name: p.name || '',
      email: p.email || '',
      address: p.address || '',
      dateOfBirth: p.dateOfBirth || '',
      registeredDate: p.registeredDate || new Date().toISOString().split('T')[0],
      gender: p.gender || 'male',
    });
    setIsEditOpen(true);
  };

  const openDetailModal = (p) => {
    setSelectedPatient(p);
    setIsDetailOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
            Patient Directory
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>
            Manage patient records, demographics, and registration.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
          <UserPlus size={18} /> Register Patient
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', gap: '16px' }}>
          <SearchInput
            placeholder="Search by name, email, address..."
            value={search}
            onChange={(val) => {
              setSearch(val);
              setCurrentPage(1);
            }}
          />
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
                    <th>Name</th>
                    <th>Email</th>
                    <th>Gender</th>
                    <th>Date of Birth</th>
                    <th>Address</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPatients.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--slate-500)' }}>
                        No patients found matching your search.
                      </td>
                    </tr>
                  ) : (
                    paginatedPatients.map((patient) => (
                      <tr key={patient.id}>
                        <td style={{ fontWeight: 600 }}>{patient.name}</td>
                        <td>{patient.email}</td>
                        <td style={{ textTransform: 'capitalize' }}>{patient.gender}</td>
                        <td>{formatDate(patient.dateOfBirth)}</td>
                        <td>{patient.address}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => openDetailModal(patient)}
                              title="View Details"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => openEditModal(patient)}
                              title="Edit Patient"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(patient.id, patient.name)}
                              title="Delete Patient"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </>
        )}
      </div>

      {/* Patient Registration Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Register New Patient"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsCreateOpen(false)} disabled={submitting}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleCreate} disabled={submitting}>
              {submitting ? <LoadingSpinner size="16px" color="#ffffff" /> : 'Register Patient'}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Aarav Sharma, Priya Patel, Shoheb Amin..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="e.g. aarav.sharma@gmail.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Gender</label>
            <select
              className="form-select"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <input
              type="date"
              required
              className="form-input"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Residential Address</label>
            <textarea
              required
              rows={2}
              className="form-input"
              placeholder="e.g. 42 MG Road, Hazratganj, Lucknow, Uttar Pradesh"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* Patient Edit Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Patient Details"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsEditOpen(false)} disabled={submitting}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleEdit} disabled={submitting}>
              {submitting ? <LoadingSpinner size="16px" color="#ffffff" /> : 'Save Changes'}
            </button>
          </>
        }
      >
        <form onSubmit={handleEdit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Aarav Sharma, Priya Patel, Shoheb Amin..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="e.g. aarav.sharma@gmail.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Gender</label>
            <select
              className="form-select"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date of Birth</label>
            <input
              type="date"
              required
              className="form-input"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Residential Address</label>
            <textarea
              required
              rows={2}
              className="form-input"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title="Patient Record Details"
        footer={
          <button className="btn btn-secondary" onClick={() => setIsDetailOpen(false)}>
            Close
          </button>
        }
      >
        {selectedPatient && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.875rem' }}>
            <div>
              <span style={{ color: 'var(--slate-500)' }}>Patient ID (UUID):</span>
              <div style={{ fontFamily: 'monospace', fontWeight: 600 }}>{selectedPatient.id}</div>
            </div>
            <div>
              <span style={{ color: 'var(--slate-500)' }}>Full Name:</span>
              <div style={{ fontWeight: 600 }}>{selectedPatient.name}</div>
            </div>
            <div>
              <span style={{ color: 'var(--slate-500)' }}>Email:</span>
              <div>{selectedPatient.email}</div>
            </div>
            <div>
              <span style={{ color: 'var(--slate-500)' }}>Gender:</span>
              <div style={{ textTransform: 'capitalize' }}>{selectedPatient.gender}</div>
            </div>
            <div>
              <span style={{ color: 'var(--slate-500)' }}>Date of Birth:</span>
              <div>{formatDate(selectedPatient.dateOfBirth)}</div>
            </div>
            <div>
              <span style={{ color: 'var(--slate-500)' }}>Residential Address:</span>
              <div>{selectedPatient.address}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
