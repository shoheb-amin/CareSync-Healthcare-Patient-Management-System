# CareSync – Healthcare & Patient Management System (Frontend)

CareSync Frontend is a modern, responsive React.js single-page application (SPA) built with Vite and integrated with the CareSync Spring Boot microservices ecosystem.

---

## Architecture & Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Framework / Core** | React 19 (Functional + Hooks) | Context API for Auth and Toast state management |
| **Build & Dev Tool** | Vite 8 + Rolldown | HMR, optimized manual vendor/charts/icons chunking |
| **Navigation** | React Router DOM v7 | Protected route wrappers, role-based navigation guards |
| **API Client** | Axios | Interceptors for Bearer JWT injection & 401 redirect handling |
| **Visual Analytics** | Recharts | Responsive Bar and Pie charts for telemetry metrics |
| **Design System** | Pure CSS3 + Custom Theme | Healthcare Navy (`#0A2540`) & Teal (`#0d9488`), clean card layouts |
| **Icons** | Lucide React | Lightweight, consistent healthcare icon set |
| **Production Hosting**| Nginx Alpine | Serves production SPA with `/auth/` and `/api/` reverse proxy |

---

## Microservices Integration Summary

All frontend communications route through the **CareSync API Gateway** (listening on port `4004`):

```
React Frontend (Vite Dev :5173 / Nginx :80)
        │
        ├── /auth/*  ────────► API Gateway (:4004) ──► Auth Service (:4005)
        │
        └── /api/*   ────────► API Gateway (:4004)
                                    │
                                    ├── /api/patients/**      ──► Patient Service (:4000)
                                    ├── /api/doctors/**       ──► Doctor Service (:4007)
                                    ├── /api/appointments/**  ──► Appointment Service (:4006)
                                    ├── /api/payments/**      ──► Billing Service (:4001)
                                    ├── /api/notifications/** ──► Notification Service (:4008)
                                    └── /api/analytics/**     ──► Analytics Service (:4002)
```

---

## Getting Started

### Prerequisites
- **Node.js**: v18.x or v20.x+
- **CareSync Backend Microservices**: API Gateway and underlying services running (default port `4004`).

### 1. Installation
Navigate into the `frontend/` directory and install project dependencies:

```bash
cd frontend
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configuration variables:
```properties
# Leave VITE_API_BASE_URL empty to route via Vite dev proxy (recommended, avoids CORS issues)
VITE_API_BASE_URL=
VITE_API_GATEWAY_URL=http://localhost:4004
```

### 3. Development Server
Start the local Vite development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Default Seeded Credentials
- **Email**: `testuser@test.com`
- **Password**: `password123`
- **Role**: `ADMIN`

---

## Production Build & Deployment

### Build the Static Bundle
```bash
npm run build
```
The optimized production bundle will be generated in `frontend/dist/`.

### Run via Docker & Nginx
Build and launch the containerized frontend:

```bash
docker build -t caresync-frontend .
docker run -d -p 80:80 --name caresync-frontend caresync-frontend
```

In production, Nginx automatically:
- Serves the built React application with SPA routing (`try_files $uri $uri/ /index.html;`).
- Proxies `/auth/` and `/api/` requests to `http://api-gateway:4004/`.
- Applies security headers (`X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`).

---

## Project Structure

```
frontend/
├── dist/                         # Production build artifacts
├── public/                       # Static public assets
├── src/
│   ├── assets/
│   │   └── styles/
│   │       └── variables.css     # CSS custom properties (Navy, Teal, Slate)
│   ├── components/
│   │   ├── common/
│   │   │   ├── Badge.jsx         # Status pills (Scheduled, Confirmed, etc.)
│   │   │   ├── LoadingSpinner.jsx# Accessible loading animation
│   │   │   ├── Modal.jsx         # Reusable accessible dialog modal
│   │   │   ├── Pagination.jsx    # Table pagination controls
│   │   │   └── SearchInput.jsx   # Filter search input
│   │   └── layout/
│   │       ├── AppLayout.jsx     # Master application shell
│   │       ├── Header.jsx        # Sticky top bar with user profile & logout
│   │       └── Sidebar.jsx       # Navigation drawer with active route states
│   ├── context/
│   │   ├── AuthContext.jsx       # JWT token management & session validation
│   │   └── NotificationContext.jsx # Toast notification alert system
│   ├── features/
│   │   ├── analytics/pages/
│   │   │   └── AnalyticsPage.jsx # Recharts telemetry & department distribution
│   │   ├── appointments/pages/
│   │   │   └── AppointmentsPage.jsx # Appointment booking, slots, status transitions
│   │   ├── auth/pages/
│   │   │   └── LoginPage.jsx     # Clinical staff authentication portal
│   │   ├── billing/pages/
│   │   │   └── BillingPage.jsx   # Patient invoicing, status updates (SUCCESS/FAILED)
│   │   ├── dashboard/pages/
│   │   │   └── DashboardPage.jsx # Operations KPI cards & recent activity table
│   │   ├── doctors/pages/
│   │   │   └── DoctorsPage.jsx   # Doctor directory, profile creation & editing
│   │   ├── notifications/pages/
│   │   │   └── NotificationsPage.jsx # Multi-channel dispatch console
│   │   └── patients/pages/
│   │       └── PatientsPage.jsx  # Patient registry, search, edit & deletion
│   ├── router/
│   │   ├── AppRouter.jsx         # Route configuration
│   │   └── ProtectedRoute.jsx    # Authentication route guard
│   ├── services/
│   │   ├── api.js                # Axios client with request/response interceptors
│   │   ├── analyticsService.js   # Analytics Service endpoints
│   │   ├── appointmentService.js # Appointment & Availability endpoints
│   │   ├── authService.js        # Login & Token validation
│   │   ├── billingService.js     # Payments & Invoicing endpoints
│   │   ├── doctorService.js      # Doctor directory CRUD
│   │   ├── notificationService.js# Notification dispatch endpoint
│   │   └── patientService.js     # Patient registry CRUD
│   ├── utils/
│   │   ├── constants.js          # Verified status enums & channels
│   │   ├── formatters.js         # Currency, date & timestamp formatters
│   │   └── jwt.js                # Base64 JWT decoder & expiry verification
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .dockerignore
├── .env
├── .env.example
├── .gitignore
├── Dockerfile
├── nginx.conf
├── package.json
└── vite.config.js
```

---

## Verification & Compatibility Notes

1. **No Backend Modifications**:
   All features integrate directly with existing REST endpoints exposed by CareSync microservices via the API Gateway.
2. **CORS Handling**:
   In local development, the Vite dev server proxies `/api` and `/auth` requests to `http://localhost:4004`. In production, Nginx proxies these paths. This guarantees zero browser CORS errors without requiring changes to the backend Spring Boot Gateway.
3. **Doctor Availability Validation**:
   Booking an appointment requires a valid doctor availability slot. Use the **Add Doctor Slot** feature in the Appointments view to register available dates and times.
4. **Client-Side Pagination**:
   Backend microservices return complete collections (`findAll()`). The frontend executes responsive, high-performance client-side pagination, debounced searching, and status filtering.
