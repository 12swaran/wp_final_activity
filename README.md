# Teja Web Studio — Full-Stack Freelance Web Design & Development Services Website

An enterprise-grade, full-stack web studio platform featuring high-conversion public client pages, a secure administrative management portal, conflict-free appointment booking, transactional quotation pipelines, and real-time customer chat with message persistence.

Built with **React 19, TypeScript, Vite, Tailwind CSS, Node.js, Express.js, and MongoDB Atlas / Mongoose**.

---

## 🌟 Key Features

### 1. Public Modules
- **Hero & Landing Page**: Modern dark-slate aesthetic (`Space Grotesk` display typography, `Inter` UI body), hero-grid pattern, glowing cards (`glow-card`), and verified business metric badges.
- **Services Catalog (`/services`, `/services/:slug`)**: Dynamic service offerings with detailed scope, deliverable checklists, starting prices, and booking triggers.
- **Portfolio & Case Studies (`/portfolio`, `/portfolio/:slug`)**: Category-filterable project showcase with quantified client outcomes (e.g. *"Online orders up 40%"*), tech badges, gallery screenshots, and live demo links.
- **Pricing Packages (`/pricing`)**: 3-tier pricing (Starter $199, Business $449 [Most Popular with glowing gradient border], Premium $899), complete deliverable comparison matrix table, and an **interactive custom project price estimator**.
- **About Studio (`/about`)**: Founder story, design philosophy, full-stack tech stack cards, and studio milestones timeline.
- **Contact & Inquiry (`/contact`)**: Contact form with honeypot bot trap, submission debouncing, duplicate prevention, and response guarantee.
- **Quotation Request Engine (`/quote`)**: Multi-step project proposal builder with budget brackets, timelines, feature selector, and duplicate submission checks.
- **Conflict-Free Appointment Scheduler (`/book`)**: Real-time slot calculator (9:00 AM – 6:00 PM business hours), atomic reservation locking, double-booking prevention, instant email dispatch, and **downloadable `.ics` calendar invitation**.
- **Reviews & Testimonials (`/reviews`)**: Verified client reviews, aggregate 5.0-star rating breakdown, and user review submission with admin moderation.
- **Blog & Articles CMS (`/blog`, `/blog/:slug`)**: Searchable articles, tag filters, estimated reading times, and markdown case studies.
- **FAQs (`/faqs`)**: Categorized searchable accordion help center.
- **Legal Policies (`/privacy`, `/terms`)**: Data privacy, intellectual property code ownership, and warranty terms.
- **Custom Error Pages**: Styled `404 Not Found` with quick navigation routes.

### 2. Communication Hub
- **Customer Live Chat Widget**: Floating chat pill with persistent `sessionId` stored in browser `localStorage`, sound/badge notifications, unread count, and live two-way message synchronization.
- **Admin Chat Console (`/admin/chats`)**: Real-time two-pane console allowing the administrator to read customer threads and dispatch replies that instantly appear in the user's widget.
- **WhatsApp Click-to-Chat Integration**: Standardized `wa.me` URL generator pre-filling context-aware greetings for services, quotes, and pricing tiers.
- **Transactional Email Dispatch**: Implemented via Nodemailer with automatic dev-mode console fallback (outputs formatted HTML email bodies for auditability when SMTP is not configured).

### 3. Secure Administrative Management (`/admin/*`)
- **Secure Administrator Login (`/admin/login`)**: Rate-limited brute-force protection, bcrypt salted hashing, and JWT token authentication.
- **Live Operations Dashboard (`/admin/dashboard`)**: Database-driven KPI cards (inquiries, pipeline quote value, confirmed appointments today, published projects/services) and recent activity feeds.
- **Inquiries Manager (`/admin/inquiries`)**: Status pipeline (`new`, `in_progress`, `resolved`, `archived`), search, and **direct email reply composer**.
- **Quotations Pipeline (`/admin/quotations`)**: Manage proposals, assign estimated quote values ($), and maintain internal notes.
- **Appointments Calendar (`/admin/appointments`)**: Table view of bookings with cancel/reschedule actions that trigger automated notification emails to clients.
- **Services Manager (`/admin/services`)**: Full CRUD with icon picker and deliverable checklist editor.
- **Portfolio Manager (`/admin/portfolio`)**: Full CRUD with image preview, live links, and case study markdown editor.
- **Pricing Manager (`/admin/pricing`)**: Full CRUD with price, billing period, and highlighted popular tier controls.
- **Reviews Moderation (`/admin/testimonials`)**: Queue to approve, reject, or feature public client submissions.
- **Blog CMS (`/admin/blog`)**: Create, edit, and toggle draft/published status for articles.
- **FAQs Manager (`/admin/faqs`)**: Question/answer editor with order indexing.
- **Website Settings (`/admin/settings`)**: Studio brand name, primary contact email, WhatsApp number, working hours schedule, and slot duration settings.

### 4. Data Integrity & Conflict Prevention
- **Anti-Double Booking**: MongoDB partial compound unique index `{ appointmentDate: 1, startTime: 1 }` (where status is not cancelled) combined with atomic reservation writes.
- **Anti-Duplicate Form Submissions**: Client UUID idempotency keys + server-side 2-minute payload hash caching + anti-spam honeypot inputs.

---

## 🛠 Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Axios, React Router 6 |
| **Backend** | Node.js, Express.js, TypeScript, Mongoose, JWT, bcryptjs, Nodemailer, Helmet, express-rate-limit |
| **Database** | MongoDB Atlas / Local MongoDB (Mongoose ODM) |
| **Styling & Fonts** | Space Grotesk (display), Inter (sans-serif body), HSL tailored dark-mode tokens |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended; tested on v22)
- npm (v9+)
- Local MongoDB running on `mongodb://127.0.0.1:27017` OR a MongoDB Atlas cluster URI

### 1. Installation
Clone the repository and install all root and submodule dependencies:
```bash
# Install root workspace dependencies
npm install

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
cd ..
```

### 2. Environment Configuration
Backend `.env` file is located at `server/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/freelance_studio
JWT_SECRET=super_secret_jwt_key_freelance_studio_2026_minimum_32_chars
JWT_EXPIRES_IN=7d
DEFAULT_ADMIN_EMAIL=admin@tejastudio.com
DEFAULT_ADMIN_PASSWORD=AdminPassword123!
DEFAULT_ADMIN_NAME="Studio Admin"
EMAIL_SERVICE_ENABLED=false
```

Frontend `.env` is at `client/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Database Seeding
The backend auto-seeds initial services, portfolio projects, pricing tiers, FAQs, testimonials, blog articles, and superadmin credentials automatically on startup. You can also run the seed command manually:
```bash
npm run seed
```

### 4. Running the Application Locally
Run both client and server concurrently from the root directory:
```bash
npm run dev
```

Or run them individually:
```bash
# Terminal 1: Backend API (runs on http://localhost:5000)
npm run server

# Terminal 2: Frontend Client (runs on http://localhost:5173)
npm run client
```

---

## 🔑 Administrator Evaluation Credentials

| Field | Value |
| :--- | :--- |
| **Admin Login URL** | `http://localhost:5173/admin/login` |
| **Admin Email** | `admin@tejastudio.com` |
| **Admin Password** | `AdminPassword123!` |

*(Note: These credentials are also pre-filled on the login screen for one-click convenience during grading).*

---

## 📡 API Endpoint Overview

| Module | Public Endpoint | Protected Admin Endpoint |
| :--- | :--- | :--- |
| **Auth** | `POST /api/auth/login` | `GET /api/auth/me`, `PUT /api/auth/profile` |
| **Dashboard** | — | `GET /api/dashboard/stats` |
| **Services** | `GET /api/services`, `GET /api/services/:slug` | `POST, PUT, DELETE /api/services` |
| **Projects** | `GET /api/projects`, `GET /api/projects/:slug` | `POST, PUT, DELETE /api/projects` |
| **Pricing** | `GET /api/pricing` | `POST, PUT, DELETE /api/pricing` |
| **Inquiries** | `POST /api/inquiries` | `GET, PUT /status, POST /reply, DELETE /api/inquiries` |
| **Quotations** | `POST /api/quotations` | `GET, PUT, DELETE /api/quotations` |
| **Appointments** | `GET /available-slots`, `POST /api/appointments` | `GET, PUT, DELETE /api/appointments` |
| **Testimonials**| `GET /api/testimonials`, `POST /api/testimonials` | `GET /admin/all, PUT /approve, DELETE` |
| **Blog** | `GET /api/blog`, `GET /api/blog/:slug` | `GET /admin/all, POST, PUT, DELETE` |
| **FAQs** | `GET /api/faqs` | `GET /admin/all, POST, PUT, DELETE` |
| **Chats** | `POST /session, GET /messages, POST /message` | `GET /conversations, POST /reply, PUT /close` |
| **Settings** | `GET /api/settings` | `PUT /api/settings` |
