import React, { useState, useEffect, useMemo } from 'react';
import { doctorService } from '../../../services/doctorService';
import { useToast } from '../../../context/NotificationContext';
import { Plus, Edit2, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import SearchInput from '../../../components/common/SearchInput';
import Pagination from '../../../components/common/Pagination';
import Modal from '../../../components/common/Modal';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const initialForm = {
    doctorName: '',
    doctorEmail: '',
    doctorPhone: '',
    doctorAddress: '',
    city: '',
    state: '',
    zipCode: '',
    speciality: '',
    department: '',
    gender: 'male',
    qualification: '',
  };

  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const { addToast } = useToast();

  const loadDoctors = async () => {
    try {
      setLoading(true);
      const data = await doctorService.getDoctors();
      setDoctors(Array.isArray(data) ? data : []);
    } catch (err) {
      addToast('Failed to load doctors from Doctor Service', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const filteredDoctors = useMemo(() => {
    return doctors.filter((d) => {
      const q = search.toLowerCase();
      return (
        d.doctorName?.toLowerCase().includes(q) ||
        d.speciality?.toLowerCase().includes(q) ||
        d.department?.toLowerCase().includes(q) ||
        d.city?.toLowerCase().includes(q)
      );
    });
  }, [doctors, search]);

  const totalPages = Math.ceil(filteredDoctors.length / pageSize) || 1;
  const paginatedDoctors = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDoctors.slice(start, start + pageSize);
  }, [filteredDoctors, currentPage, pageSize]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await doctorService.createDoctor(formData);
      addToast('Doctor profile created successfully', 'success');
      setIsCreateOpen(false);
      setFormData(initialForm);
      loadDoctors();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create doctor record', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!selectedDoctor) return;
    setSubmitting(true);
    try {
      await doctorService.updateDoctor(selectedDoctor.id, formData);
      addToast('Doctor profile updated successfully', 'success');
      setIsEditOpen(false);
      loadDoctors();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update doctor record', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete doctor profile "${name}"?`)) return;
    try {
      await doctorService.deleteDoctor(id);
      addToast('Doctor removed successfully', 'success');
      loadDoctors();
    } catch (err) {
      addToast('Failed to delete doctor', 'error');
    }
  };

  const openEditModal = (d) => {
    setSelectedDoctor(d);
    setFormData({
      doctorName: d.doctorName || '',
      doctorEmail: d.doctorEmail || '',
      doctorPhone: d.doctorPhone || '',
      doctorAddress: d.doctorAddress || '',
      city: d.city || '',
      state: d.state || '',
      zipCode: d.zipCode || '',
      speciality: d.speciality || d.Speciality || '',
      department: d.department || '',
      gender: (d.gender || 'male').toLowerCase(),
      qualification: d.qualification || '',
    });
    setIsEditOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
            Medical Staff &amp; Specialists
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>
            Physicians, surgeons, and department specialists in CareSync.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
          <Plus size={18} /> Register Doctor
        </button>
      </div>

      <div className="card">
        <div className="filter-bar">
          <SearchInput
            placeholder="Search doctor, speciality, department, city..."
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
            <div className="grid grid-cols-2 gap-6">
              {paginatedDoctors.length === 0 ? (
                <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '40px', color: 'var(--slate-500)' }}>
                  No doctors found matching query.
                </div>
              ) : (
                paginatedDoctors.map((doc) => (
                  <div
                    key={doc.id}
                    className="card"
                    style={{
                      borderLeft: '4px solid var(--teal-600)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-navy)' }}>
                            {doc.doctorName}
                          </h3>
                          <div style={{ fontSize: '0.8125rem', color: 'var(--teal-600)', fontWeight: 600 }}>
                            {doc.speciality || doc.Speciality} • {doc.department}
                          </div>
                        </div>
                        <span className="badge badge-info">{doc.qualification}</span>
                      </div>

                      <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem', color: 'var(--slate-600)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Mail size={14} color="var(--slate-400)" />
                          <span>{doc.doctorEmail}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Phone size={14} color="var(--slate-400)" />
                          <span>{doc.doctorPhone}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <MapPin size={14} color="var(--slate-400)" />
                          <span>
                            {doc.city}, {doc.state} ({doc.zipCode})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(doc)}>
                        <Edit2 size={14} /> Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(doc.id, doc.doctorName)}>
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => setCurrentPage(p)}
            />
          </>
        )}
      </div>

      {/* Doctor Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Register New Doctor"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setIsCreateOpen(false)} disabled={submitting}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleCreate} disabled={submitting}>
              {submitting ? <LoadingSpinner size="16px" color="#ffffff" /> : 'Register Doctor'}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreate}>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Doctor Name</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Dr. Rajesh Kumar, Dr. Sunita Sharma..."
                value={formData.doctorName}
                onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="e.g. rajesh.kumar@hospital.in"
                value={formData.doctorEmail}
                onChange={(e) => setFormData({ ...formData, doctorEmail: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                required
                className="form-input"
                placeholder="e.g. +91 98765 43210"
                value={formData.doctorPhone}
                onChange={(e) => setFormData({ ...formData, doctorPhone: e.target.value })}
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
          </div>

          <div className="form-group">
            <label className="form-label">Qualification</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. MBBS, MD, MS, DNB"
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Speciality</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Cardiology, Neurology, Orthopedics"
                value={formData.speciality}
                onChange={(e) => setFormData({ ...formData, speciality: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Cardiology, General Surgery, OPD"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Clinic / Hospital Address</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. CareSync Hospital Campus, Sector 4"
              value={formData.doctorAddress}
              onChange={(e) => setFormData({ ...formData, doctorAddress: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Mathura, Lucknow"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Uttar Pradesh"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Zip Code</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. 281001"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Doctor Edit Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Doctor Details"
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
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Doctor Name</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Dr. Rajesh Kumar, Dr. Sunita Sharma..."
                value={formData.doctorName}
                onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="e.g. rajesh.kumar@hospital.in"
                value={formData.doctorEmail}
                onChange={(e) => setFormData({ ...formData, doctorEmail: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                required
                className="form-input"
                value={formData.doctorPhone}
                onChange={(e) => setFormData({ ...formData, doctorPhone: e.target.value })}
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Speciality</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.speciality}
                onChange={(e) => setFormData({ ...formData, speciality: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Qualification</label>
            <input
              type="text"
              required
              className="form-input"
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Address</label>
            <input
              type="text"
              required
              className="form-input"
              value={formData.doctorAddress}
              onChange={(e) => setFormData({ ...formData, doctorAddress: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Zip Code</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
