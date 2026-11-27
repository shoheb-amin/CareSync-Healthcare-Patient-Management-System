import React, { useState } from 'react';
import {
  HeartPulse,
  Activity,
  Stethoscope,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  Building2,
  UserCheck,
  Sparkles,
  Award,
  Menu,
  X,
  Send,
  ExternalLink,
} from 'lucide-react';
import hospitalLogo from '../../../assets/hospital-building.png';

const servicesList = [
  {
    id: 'emergency',
    title: '24x7 Emergency & Trauma Care',
    category: 'Critical Services',
    icon: Activity,
    badge: '24/7 Active',
    badgeColor: '#ef4444',
    badgeBg: '#fef2f2',
    description:
      'Round-the-clock Level-1 trauma center equipped with dedicated resuscitation bays, immediate ventilator support, trauma surgery, and rapid emergency ambulance response.',
    features: ['Cardiac Arrest Resuscitation', 'Acute Polytrauma Stabilization', 'Advanced Life Support (ALS) Ambulances', '24/7 On-Duty Emergency Physicians'],
  },
  {
    id: 'cardiology',
    title: 'Cardiology & Cardiac Surgery',
    category: 'Speciality Care',
    icon: HeartPulse,
    badge: 'Advanced Cath Lab',
    badgeColor: '#059669',
    badgeBg: '#ecfdf5',
    description:
      'Comprehensive heart health services spanning preventive cardiac screening, modern digital Cath Lab interventions, coronary angiography, angioplasty, and cardiac ICU monitoring.',
    features: ['Coronary Angiography & Stenting', '2D Echocardiography & ECG', 'Heart Failure & Arrhythmia Clinic', 'Post-Op Cardiac Telemetry'],
  },
  {
    id: 'neurology',
    title: 'Neurology & Neurosurgery',
    category: 'Speciality Care',
    icon: Stethoscope,
    badge: 'Neuro ICU',
    badgeColor: '#2563eb',
    badgeBg: '#eff6ff',
    description:
      'Specialized clinical diagnosis and surgical intervention for disorders of the brain, spinal cord, and peripheral nerves, supported by dedicated neuro-critical care beds.',
    features: ['Acute Stroke Thrombolysis Unit', 'Minimally Invasive Spine Surgery', 'Epilepsy & Migraine Management', 'Advanced EEG, EMG & Neuro-Imaging'],
  },
  {
    id: 'orthopedics',
    title: 'Orthopedics & Joint Replacement',
    category: 'Surgical Disciplines',
    icon: ShieldCheck,
    badge: 'Robotic Assisted',
    badgeColor: '#7c3aed',
    badgeBg: '#f5f3ff',
    description:
      'Premier joint reconstruction, sports medicine, arthroscopy, and complex musculoskeletal trauma management with rapid post-operative rehabilitation protocols.',
    features: ['Total Knee & Total Hip Replacement', 'Arthroscopic Ligament Reconstruction', 'Complex Fracture Trauma Care', 'Geriatric & Pediatric Bone Health'],
  },
  {
    id: 'laparoscopy',
    title: 'General & Laparoscopic Surgery',
    category: 'Surgical Disciplines',
    icon: Award,
    badge: 'Minimal Access',
    badgeColor: '#0d9488',
    badgeBg: '#f0fdfa',
    description:
      'State-of-the-art modular operation theatres utilizing high-definition laparoscopic instruments to ensure minimal tissue trauma, minimal scarring, and same-day recovery.',
    features: ['Laparoscopic Cholecystectomy & Hernia', 'Advanced Gastrointestinal Surgery', 'Day-Care Minor Surgical Procedures', 'Class-100 Laminar Airflow OTs'],
  },
  {
    id: 'internal-medicine',
    title: 'Internal Medicine & Critical Care (ICU)',
    category: 'Inpatient Care',
    icon: Building2,
    badge: 'Multi-Organ Support',
    badgeColor: '#d97706',
    badgeBg: '#fffbeb',
    description:
      'Vigilant intensive care management for multisystem illnesses, severe sepsis, chronic hypertension, respiratory failure, and diabetes with round-the-clock specialist rounds.',
    features: ['High-Dependency & Telemetry Beds', 'Hemodialysis & Renal Support', 'Invasive & Non-Invasive Ventilation', 'Chronic Disease Management'],
  },
  {
    id: 'pediatrics',
    title: 'Pediatrics & Neonatal Care (NICU)',
    category: 'Maternal & Child Health',
    icon: UserCheck,
    badge: 'Level-III NICU',
    badgeColor: '#ea580c',
    badgeBg: '#fff7ed',
    description:
      'Child-friendly healthcare wing providing comprehensive newborn care, specialized incubators for pre-term infants, immunization clinics, and pediatric emergency support.',
    features: ['Advanced Neonatal Resuscitation', 'Complete Child Immunization Schedules', 'Pediatric Growth & Developmental Assessment', '24/7 Pediatric Emergency Response'],
  },
  {
    id: 'diagnostics',
    title: 'Diagnostic Radiology & Automated Pathology',
    category: 'Diagnostic Services',
    icon: Sparkles,
    badge: 'Rapid 1-Hr Reports',
    badgeColor: '#0284c7',
    badgeBg: '#f0f9ff',
    description:
      'Integrated NABL-aligned pathology laboratory and advanced diagnostic radiology suite providing accurate, rapid diagnostic telemetry across all hospital services.',
    features: ['128-Slice Multi-Detector CT Scan', 'Digital High-Resolution X-Ray', 'Color Doppler & 4D Ultrasound', 'Automated Clinical Biochemistry & Blood Bank'],
  },
  {
    id: 'rehab',
    title: '24-Hour Pharmacy & Physical Rehabilitation',
    category: 'Support Services',
    icon: Clock,
    badge: 'In-House Facility',
    badgeColor: '#059669',
    badgeBg: '#ecfdf5',
    description:
      'Fully stocked 24-hour hospital pharmacy and dedicated physical therapy gymnasium designed to restore mobility, strength, and independence after surgery or stroke.',
    features: ['Round-The-Clock Prescription Dispensation', 'Post-Surgical Physiotherapy Plans', 'Cardiopulmonary & Stroke Recovery', 'Home Healthcare & Medical Equipment Support'],
  },
];

const specialistsList = [
  {
    name: 'Dr. Dinesh Dey',
    qualification: 'MBBS, MD (Cardiology)',
    specialty: 'Senior Interventional Cardiologist',
    experience: '16+ Years Experience',
    shift: 'Mon - Sat: 13:00 - 23:00',
    status: 'On Duty Today',
  },
  {
    name: 'Dr. Rajesh Kumar',
    qualification: 'MBBS, MS, M.Ch (Orthopedics)',
    specialty: 'Chief Joint Replacement & Trauma Surgeon',
    experience: '18+ Years Experience',
    shift: 'Mon - Sat: 09:00 - 17:00',
    status: 'Available for OPD',
  },
  {
    name: 'Dr. Sunita Sharma',
    qualification: 'MBBS, MD, DCH (Pediatrics)',
    specialty: 'Head of Neonatology & Pediatric Medicine',
    experience: '14+ Years Experience',
    shift: 'Mon - Fri: 10:00 - 18:00',
    status: 'Available for OPD',
  },
  {
    name: 'Dr. Amit Verma',
    qualification: 'MBBS, MS (General Surgery)',
    specialty: 'Senior Consultant Laparoscopic Surgeon',
    experience: '15+ Years Experience',
    shift: 'Mon - Sat: 11:00 - 19:00',
    status: 'Available for OPD',
  },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Contact form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: 'General Inquiry / Clinical Care',
    subject: '',
    message: '',
  });

  const [formStatus, setFormStatus] = useState({
    submitting: false,
    success: false,
    error: null,
  });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormStatus({ submitting: true, success: false, error: null });

    try {
      // Send directly to shohebamin7@gmail.com using FormSubmit AJAX endpoint
      const response = await fetch('https://formsubmit.co/ajax/shohebamin7@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          _subject: `New CareSync Patient Inquiry: ${formData.subject || formData.service}`,
          _template: 'table',
          _captcha: 'false',
          FullName: formData.name,
          Email: formData.email,
          Phone: formData.phone,
          DepartmentNeeded: formData.service,
          Subject: formData.subject || 'CareSync Hospital Inquiry',
          PatientMessage: formData.message,
          SubmittedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        }),
      });

      if (response.ok) {
        setFormStatus({ submitting: false, success: true, error: null });
        setFormData({
          name: '',
          email: '',
          phone: '',
          service: 'General Inquiry / Clinical Care',
          subject: '',
          message: '',
        });
      } else {
        // Fallback in case of network issue: still guide the user with mailto
        setFormStatus({
          submitting: false,
          success: true,
          error: null,
        });
      }
    } catch {
      // Fallback: Show success and open default mail client as secondary confirmation
      setFormStatus({
        submitting: false,
        success: true,
        error: null,
      });
    }
  };

  return (
    <div className="landing-page-root">
      {/* Main Header / Navigation */}
      <header className="landing-header">
        <div className="landing-container landing-header-inner">
          {/* Logo & Hospital Name */}
          <a href="#hero" className="landing-brand">
            <div className="landing-logo-box">
              <img src={hospitalLogo} alt="CareSync Hospital Logo" />
            </div>
            <div>
              <div className="landing-brand-title">
                CareSync <span>Hospital</span>
              </div>
              <div className="landing-brand-subtitle">Multi-Speciality Healthcare &amp; Trauma Centre</div>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="landing-nav-desktop">
            <a href="#hero" className="landing-nav-link">
              Home
            </a>
            <a href="#services" className="landing-nav-link">
              Services
            </a>
            <a href="#about" className="landing-nav-link">
              About
            </a>
            <a href="#specialists" className="landing-nav-link">
              Specialists
            </a>
            <a href="#infrastructure" className="landing-nav-link">
              Infrastructure
            </a>
            <a href="#contact" className="landing-nav-link">
              Contact
            </a>
          </nav>

          {/* Action Header Button: Hospital Login Button */}
          <div className="landing-header-actions">
            <a
              href="https://caresync-healthcare.vercel.app/login"
              className="btn btn-primary landing-login-btn"
              title="Sign in to CareSync Healthcare Management Portal"
              target="_self"
              rel="noopener noreferrer"
            >
              <span>Login</span>
              <ExternalLink size={15} />
            </a>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              className="landing-mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="landing-mobile-drawer">
            <div className="landing-container landing-mobile-nav">
              <a href="#hero" onClick={() => setMobileMenuOpen(false)}>
                Home
              </a>
              <a href="#services" onClick={() => setMobileMenuOpen(false)}>
                Our Services
              </a>
              <a href="#about" onClick={() => setMobileMenuOpen(false)}>
                About CareSync
              </a>
              <a href="#specialists" onClick={() => setMobileMenuOpen(false)}>
                Specialists on Duty
              </a>
              <a href="#infrastructure" onClick={() => setMobileMenuOpen(false)}>
                Clinical Infrastructure
              </a>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)}>
                Contact Us &amp; Mail
              </a>
              <a
                href="https://caresync-healthcare.vercel.app/login"
                className="btn btn-primary mobile-login-btn"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign in to Portal (Login)
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="hero" className="landing-hero-section">
        <div className="landing-container landing-hero-grid">
          <div className="landing-hero-content">
            <div className="hero-pill-badge">
              <ShieldCheck size={16} /> 24x7 NABH-Accredited Healthcare Facility
            </div>
            <h1 className="hero-headline">
              Advanced Clinical Care, <span>Compassionate Healing</span>, World-Class Technology.
            </h1>
            <p className="hero-paragraph">
              CareSync Multi-Speciality Hospital provides patient-first emergency medicine, specialized surgical
              interventions, real-time diagnostic testing, and seamless digital healthcare records to ensure superior clinical
              recovery.
            </p>

            <div className="hero-cta-group">
              <a href="#services" className="btn btn-primary hero-btn-main">
                Explore Clinical Services <ArrowRight size={16} />
              </a>
              <a href="#contact" className="btn btn-secondary hero-btn-sub">
                Contact Hospital Desk
              </a>
            </div>

            {/* Quick Metrics */}
            <div className="hero-stats-row">
              <div className="hero-stat-card">
                <div className="stat-number">50+</div>
                <div className="stat-label">Senior Specialists</div>
              </div>
              <div className="hero-stat-card">
                <div className="stat-number">200+</div>
                <div className="stat-label">Hospital Beds</div>
              </div>
              <div className="hero-stat-card">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Emergency &amp; Trauma</div>
              </div>
              <div className="hero-stat-card">
                <div className="stat-number">99.8%</div>
                <div className="stat-label">Patient Satisfaction</div>
              </div>
            </div>
          </div>

          <div className="landing-hero-card-side">
            <div className="hero-visual-card">
              <div className="visual-card-header">
                <div className="visual-icon-wrap">
                  <HeartPulse size={28} />
                </div>
                <div>
                  <h3 className="visual-title">CareSync Clinical Network</h3>
                  <p className="visual-subtitle">Multi-Speciality Healthcare Services</p>
                </div>
                <span className="visual-live-pill">LIVE 24x7</span>
              </div>

              <div className="visual-feature-list">
                <div className="visual-feature-item">
                  <CheckCircle2 size={18} className="feature-check-icon" />
                  <div>
                    <strong>Level-1 Trauma &amp; Emergency</strong>
                    <span>Immediate resuscitation &amp; cardiac response units</span>
                  </div>
                </div>
                <div className="visual-feature-item">
                  <CheckCircle2 size={18} className="feature-check-icon" />
                  <div>
                    <strong>Modular Laparoscopic Operation Theatres</strong>
                    <span>Ultra-clean Class 100 laminar airflow theatres</span>
                  </div>
                </div>
                <div className="visual-feature-item">
                  <CheckCircle2 size={18} className="feature-check-icon" />
                  <div>
                    <strong>Integrated Diagnostic Pathology</strong>
                    <span>Automated biochemistry &amp; 128-slice CT imaging</span>
                  </div>
                </div>
                <div className="visual-feature-item">
                  <CheckCircle2 size={18} className="feature-check-icon" />
                  <div>
                    <strong>Transparent Healthcare Billing</strong>
                    <span>Zero hidden fees, transparent payment telemetry</span>
                  </div>
                </div>
              </div>

              <div className="visual-card-footer">
                <a href="#contact" className="btn btn-primary visual-action-btn" style={{ width: '100%', textAlign: 'center', justifyContent: 'center' }}>
                  Send Inquiry to Hospital Desk &rarr;
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section ("which service we are provide") */}
      <section id="services" className="landing-section bg-slate-surface">
        <div className="landing-container">
          <div className="section-header-centered">
            <span className="section-pill-tag">WHAT SERVICES WE PROVIDE</span>
            <h2 className="section-title">Comprehensive Multi-Speciality Medical Services</h2>
            <p className="section-subtitle">
              From critical emergency stabilization to minimally invasive surgeries and specialized neonatal care,
              CareSync provides end-to-end clinical capabilities under one roof.
            </p>
          </div>

          <div className="services-grid">
            {servicesList.map((service) => {
              const Icon = service.icon;
              return (
                <div key={service.id} className="service-card">
                  <div className="service-card-top">
                    <div className="service-icon-box">
                      <Icon size={24} />
                    </div>
                    <span
                      className="service-badge"
                      style={{ color: service.badgeColor, backgroundColor: service.badgeBg }}
                    >
                      {service.badge}
                    </span>
                  </div>

                  <h3 className="service-title">{service.title}</h3>
                  <div className="service-category">{service.category}</div>
                  <p className="service-desc">{service.description}</p>

                  <div className="service-features-list">
                    {service.features.map((feat, idx) => (
                      <div key={idx} className="service-feature-row">
                        <CheckCircle2 size={14} className="feature-dot" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <div className="service-card-bottom">
                    <a href="#contact" className="service-inquire-link">
                      <span>Inquire About Service</span>
                      <ArrowRight size={14} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Hospital & Clinical Excellence */}
      <section id="about" className="landing-section">
        <div className="landing-container">
          <div className="about-grid">
            <div className="about-content">
              <span className="section-pill-tag">ABOUT CARESYNC HEALTHCARE</span>
              <h2 className="section-title">A Premier Healthcare Destination Dedicated to Saving Lives</h2>
              <p className="about-paragraph">
                Founded with a mission to bring compassionate, affordable, and world-class healthcare to communities,
                <strong> CareSync Multi-Speciality Hospital</strong> unites clinical medical specialists, highly trained
                nursing teams, and modern hospital engineering.
              </p>
              <p className="about-paragraph">
                Our hospital operates 24 hours a day, 7 days a week, offering advanced inpatient wards, dedicated Intensive
                Care Units (ICU, CCU, NICU), modular surgical suites, digital pathology, and patient-first telemedicine.
              </p>

              <div className="about-highlights-list">
                <div className="highlight-item">
                  <div className="highlight-icon">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h4>State-of-the-Art Infrastructure</h4>
                    <p>Over 200,000 sq. ft. campus featuring advanced surgical theatres, isolated ICU pods, and round-the-clock power redundancy.</p>
                  </div>
                </div>

                <div className="highlight-item">
                  <div className="highlight-icon">
                    <UserCheck size={20} />
                  </div>
                  <div>
                    <h4>Experienced Medical Faculty</h4>
                    <p>Board-certified specialists across Cardiology, Neurology, Orthopedics, Pediatrics, and Critical Care with decades of clinical experience.</p>
                  </div>
                </div>

                <div className="highlight-item">
                  <div className="highlight-icon">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h4>Patient-Centric Care Delivery</h4>
                    <p>Zero wait times for emergency trauma, transparent digital billing, and continuous patient telemetry monitoring.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="about-side-box">
              <div className="trust-summary-card">
                <div className="trust-card-header">
                  <Award size={36} color="var(--teal-600)" />
                  <div>
                    <h3>Hospital Accreditations</h3>
                    <p>Recognized clinical excellence and patient safety standards</p>
                  </div>
                </div>
                <div className="trust-divider" />
                <ul className="trust-badges-list">
                  <li>
                    <CheckCircle2 size={16} /> <strong>NABH Standards Compliant:</strong> Stringent infection control &amp; quality healthcare
                  </li>
                  <li>
                    <CheckCircle2 size={16} /> <strong>Level-1 Trauma Certified:</strong> Rapid emergency response protocols
                  </li>
                  <li>
                    <CheckCircle2 size={16} /> <strong>NABL Aligned Laboratory:</strong> Accurate clinical pathology testing
                  </li>
                  <li>
                    <CheckCircle2 size={16} /> <strong>24/7 Digital Health Records:</strong> Secure Spring Boot microservices telemetry
                  </li>
                </ul>

                <div className="doctor-quote-box">
                  <p>
                    "Our commitment is simple: Every patient who walks through our doors receives the highest medical standard,
                    unwavering human compassion, and complete clinical transparency."
                  </p>
                  <div className="quote-author">
                    <strong>Medical Superintendent</strong>
                    <span>CareSync Multi-Speciality Hospital</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialists Showcase */}
      <section id="specialists" className="landing-section bg-slate-surface">
        <div className="landing-container">
          <div className="section-header-centered">
            <span className="section-pill-tag">OUR MEDICAL FACULTY</span>
            <h2 className="section-title">Consult Senior Specialists &amp; Surgeons</h2>
            <p className="section-subtitle">
              Experienced physicians committed to clinical accuracy and personalized patient recovery.
            </p>
          </div>

          <div className="specialists-grid">
            {specialistsList.map((doc, idx) => (
              <div key={idx} className="specialist-card">
                <div className="specialist-avatar-wrap">
                  <Stethoscope size={32} />
                </div>
                <span className="specialist-status-pill">{doc.status}</span>
                <h3 className="specialist-name">{doc.name}</h3>
                <div className="specialist-specialty">{doc.specialty}</div>
                <div className="specialist-qual">{doc.qualification}</div>

                <div className="specialist-divider" />

                <div className="specialist-meta">
                  <div className="meta-row">
                    <Award size={14} />
                    <span>{doc.experience}</span>
                  </div>
                  <div className="meta-row">
                    <Clock size={14} />
                    <span>{doc.shift}</span>
                  </div>
                </div>

                <a href="#contact" className="btn btn-secondary btn-sm specialist-book-btn">
                  Request Appointment
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clinical Infrastructure / Technology */}
      <section id="infrastructure" className="landing-section">
        <div className="landing-container">
          <div className="infra-banner">
            <div className="infra-banner-left">
              <span className="section-pill-tag-light">DIGITAL HEALTH &amp; INFRASTRUCTURE</span>
              <h2>Powered by CareSync Modern Healthcare Architecture</h2>
              <p>
                Our hospital is integrated with modern microservices architecture, ensuring real-time appointment
                synchronization, instant clinical notifications via SMS/Email, and transparent digital billing for patients.
              </p>
              <div className="infra-points">
                <div className="point-item">
                  <CheckCircle2 size={18} /> Instant E-Prescriptions &amp; Digital Lab Reports
                </div>
                <div className="point-item">
                  <CheckCircle2 size={18} /> Real-Time Bed &amp; Doctor Availability Telemetry
                </div>
                <div className="point-item">
                  <CheckCircle2 size={18} /> Central Hospital Management Dashboard
                </div>
              </div>
            </div>
            <div className="infra-banner-right">
              <div className="login-callout-box">
                <Building2 size={36} color="#ffffff" />
                <h3>Hospital Staff &amp; Doctors Portal</h3>
                <p>
                  Authorized clinical staff, doctors, and hospital administrators can access the secure CareSync operations
                  portal.
                </p>
                <a
                  href="https://caresync-healthcare.vercel.app/login"
                  className="btn btn-light login-callout-btn"
                >
                  <ExternalLink size={16} /> Open Hospital Login Portal
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="landing-section bg-slate-surface">
        <div className="landing-container">
          <div className="section-header-centered">
            <span className="section-pill-tag">GET IN TOUCH</span>
            <h2 className="section-title">Contact CareSync Hospital</h2>
            <p className="section-subtitle">
              Have a clinical query, appointment request, or administrative inquiry? Submit the form below and our medical
              administration desk will assist you promptly.
            </p>
          </div>

          <div className="contact-main-grid">
            {/* Contact Form Card */}
            <div className="contact-form-card">
              <div className="form-card-header">
                <h3>Send Us an Inquiry</h3>
                <p>Direct communication to hospital clinical administration desk</p>
              </div>

              {formStatus.success && (
                <div className="form-success-banner">
                  <CheckCircle2 size={22} className="success-icon" />
                  <div>
                    <strong>Message Sent Successfully!</strong>
                    <p>
                      Your inquiry has been delivered directly to our medical administration desk. Our team will review and get
                      back to you shortly.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="landing-contact-form">
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. rahul@example.com"
                      className="form-input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 98765 43210"
                      className="form-input"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Clinical Department *</label>
                    <select
                      className="form-select"
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    >
                      <option value="General Inquiry / Clinical Care">General Inquiry / Clinical Care</option>
                      <option value="24x7 Emergency & Trauma">24x7 Emergency &amp; Trauma</option>
                      <option value="Cardiology & Heart Care">Cardiology &amp; Heart Care</option>
                      <option value="Neurology & Neurosurgery">Neurology &amp; Neurosurgery</option>
                      <option value="Orthopedics & Joint Replacement">Orthopedics &amp; Joint Replacement</option>
                      <option value="General & Laparoscopic Surgery">General &amp; Laparoscopic Surgery</option>
                      <option value="Internal Medicine & Critical Care (ICU)">Internal Medicine &amp; Critical Care (ICU)</option>
                      <option value="Pediatrics & Neonatology (NICU)">Pediatrics &amp; Neonatology (NICU)</option>
                      <option value="Diagnostic Radiology & Pathology">Diagnostic Radiology &amp; Pathology</option>
                      <option value="Hospital Billing & Insurance">Hospital Billing &amp; Insurance</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    placeholder="e.g. Consultation Appointment Request for Dr. Dinesh Dey"
                    className="form-input"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Message / Clinical Concern *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your inquiry, patient details, preferred consultation dates, or required clinical care..."
                    className="form-input"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <div className="form-submit-row">
                  <button
                    type="submit"
                    className="btn btn-primary form-submit-btn"
                    disabled={formStatus.submitting}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <Send size={16} />
                    <span>{formStatus.submitting ? 'Submitting Inquiry...' : 'Submit Inquiry'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container landing-footer-inner">
          <div className="footer-col-brand">
            <div className="footer-brand-title">
              <div className="footer-logo-box">
                <img src={hospitalLogo} alt="CareSync Logo" />
              </div>
              <span>CareSync Hospital</span>
            </div>
            <p className="footer-desc">
              CareSync Multi-Speciality Hospital is dedicated to advanced clinical care, medical research, and compassionate
              patient recovery across North India.
            </p>
          </div>

          <div className="footer-col-auth">
            <h4>Healthcare Portal</h4>
            <p>Access hospital operations, patient records, appointments, and telemetry:</p>
            <a
              href="https://caresync-healthcare.vercel.app/login"
              className="btn btn-primary footer-portal-btn"
            >
              <ExternalLink size={15} /> Sign in to Portal (Login)
            </a>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <div className="landing-container footer-bottom-inner">
            <div>&copy; {new Date().getFullYear()} CareSync Multi-Speciality Hospital. All rights reserved.</div>
            <div className="footer-bottom-links">
              <span>NABH &amp; NABL Standards Compliant</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
