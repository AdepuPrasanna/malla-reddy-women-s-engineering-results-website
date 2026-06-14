# 🎓 MRECW Results Portal

<div align="center">

# 🚀 MRECW Results Portal

### Fast • Smart • Modern Academic Results Platform

Check Academic Results, Backlogs, Credits, Class Rankings, and Performance Analytics instantly without login.

Built for **Malla Reddy Engineering College for Women (Autonomous), Hyderabad**

---

⭐ Star this repository if you find it useful!

🌐 Live Demo: https://mrecwexamcell.vercel.app/

🔗 Backend API: https://malla-reddy-women-s-engineering-results.onrender.com/

💼 LinkedIn: https://www.linkedin.com/in/adepusukumar/

📧 Contact: [bannysukumar@gmail.com](mailto:bannysukumar@gmail.com)

</div>

---

## 📑 Table of Contents

- [About The Project](#-about-the-project)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Local Development](#-local-development)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Deployment](#-deployment)
  - [Frontend — Vercel](#frontend--vercel)
  - [Backend — Render](#backend--render-docker)
  - [Docker (Local / Self-Hosted)](#docker-local--self-hosted)
- [Screenshots](#-screenshots)
- [Performance Goals](#-performance-goals)
- [Troubleshooting](#-troubleshooting)
- [Future Roadmap](#-future-roadmap)
- [Contributing](#-contributing)
- [Developer](#-developer)
- [Support](#-support)

---

## 📖 About The Project

MRECW Results Portal is a modern academic analytics platform designed to help students access their academic information quickly and efficiently.

Unlike traditional result portals, this platform provides:

✅ Instant Result Access  
✅ Backlog Tracking  
✅ Credits Analysis  
✅ Academic Performance Monitoring  
✅ Class Ranking Insights  
✅ Result Comparison  
✅ Mobile Friendly Experience  
✅ Fast and Secure Search  

The goal is to provide students with a seamless and intelligent academic experience.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 📊 **Academic Results** | Complete semester-wise marksheet, CGPA, SGPA, and subject grades |
| 📚 **Backlog Report** | Pending subjects and backlog status |
| 🏆 **Class Rankings** | Section-wise rankings from a sample hall ticket |
| 🎯 **Credits Analyzer** | Earned vs required credits progress |
| 📈 **Performance Analytics** | SGPA, CGPA growth, pass rate, and backlog charts |
| ⚡ **Lightning Fast Search** | Hall ticket search with history and autocomplete |
| 📱 **Mobile Responsive** | Sidebar, bottom nav, and touch-friendly UI |
| 🌓 **Dark / Light Mode** | Theme toggle with persisted preference |
| 🔒 **No Login** | Privacy-focused — hall ticket only |

---

## 🏗 Architecture

```
┌─────────────────────┐         HTTPS          ┌──────────────────────────┐
│   Vercel (Frontend) │  ───────────────────►  │   Render (Backend API)   │
│   React + Vite      │      REST / SSE        │   Flask + Gunicorn       │
│   mrecwexamcell.    │                        │   Playwright Scraper     │
│   vercel.app        │                        │   onrender.com           │
└─────────────────────┘                        └────────────┬─────────────┘
                                                              │
                                                              │ Playwright
                                                              ▼
                                                 ┌──────────────────────────┐
                                                 │  MRECW Exam Cell Portal  │
                                                 │  (Official Results Site) │
                                                 └──────────────────────────┘
```

**How it works**

1. Student enters a hall ticket on the frontend (no login).
2. Frontend calls the Flask API on Render.
3. Backend checks **Firebase Firestore** for cached results.
4. **Cache miss** → Playwright scrapes the exam cell portal → saves to Firebase → returns data.
5. **Cache hit** → returns Firebase data instantly → scrapes in background → updates Firebase if results changed.
6. Next search for the same hall ticket serves the updated cached data (fast).

```
Search Request
     │
     ▼
┌─────────────┐     miss     ┌──────────────┐     ┌─────────────┐
│  Firestore  │ ──────────►  │  Playwright  │ ──► │   Firebase  │
│   lookup    │              │   scraper    │     │    save     │
└─────────────┘              └──────────────┘     └─────────────┘
     │ hit
     ▼
 Return cached data ──► background scrape ──► update if changed
```

---

## 📁 Project Structure

```
mrecw-results-portal/
│
├── README.md                    # Project documentation
├── vercel.json                  # Vercel build & SPA routing config
├── render.yaml                  # Render Blueprint (Docker service)
├── Dockerfile                   # Multi-stage: React build + Python/Playwright
├── .vercelignore                # Files excluded from Vercel upload
├── .dockerignore                # Files excluded from Docker build
│
├── scripts/
│   └── prepare-deploy.ps1       # Local build helper & deploy notes
│
├── backend/                     # Flask API + Playwright scraper
│   ├── server.py                # API routes, CORS, SPA fallback
│   ├── scraper.py               # Login, fetch, parse results HTML
│   ├── results_service.py       # Cache-first results orchestration
│   ├── firebase_cache.py        # Firestore read/write + change detection
│   ├── fetch_class.py           # Class results batch fetch helpers
│   ├── requirements.txt         # Python dependencies
│   └── .env.example             # Backend env template
│
└── frontend/                    # React + TypeScript + Vite app
    ├── index.html               # HTML shell + theme bootstrap script
    ├── package.json
    ├── vite.config.ts           # Aliases, proxy, code splitting
    ├── tsconfig.json
    ├── tailwind.config.js       # Design tokens & theme colors
    ├── postcss.config.js
    ├── .env.example             # Frontend env template
    │
    ├── public/                  # Static assets (copied as-is to dist/)
    │   ├── favicon.svg
    │   ├── robots.txt
    │   ├── sitemap.xml
    │   └── site.webmanifest
    │
    └── src/
        ├── main.tsx             # App entry point
        ├── index.css            # Global styles + light/dark CSS variables
        ├── vite-env.d.ts
        │
        ├── app/                 # Application shell
        │   ├── App.tsx
        │   ├── providers.tsx    # React Query provider
        │   └── router.tsx       # Lazy-loaded routes
        │
        ├── layouts/             # Shared layout components
        │   ├── AppLayout.tsx    # Sidebar + TopNav + Footer wrapper
        │   ├── Sidebar.tsx      # 280px collapsible sidebar
        │   ├── TopNav.tsx       # 72px sticky glass header
        │   ├── MobileNav.tsx    # Bottom navigation (mobile)
        │   └── Footer.tsx
        │
        ├── features/            # Feature-based pages
        │   ├── dashboard/DashboardPage.tsx
        │   ├── results/AcademicResultsPage.tsx
        │   ├── backlog/BacklogReportPage.tsx
        │   ├── class-results/ClassResultsPage.tsx
        │   ├── credits/CreditsAnalyzerPage.tsx
        │   ├── compare/ResultComparePage.tsx
        │   ├── trends/PerformanceTrendsPage.tsx
        │   ├── notifications/NotificationsPage.tsx
        │   └── help/HelpCenterPage.tsx
        │
        └── shared/              # Reusable code
            ├── components/
            │   ├── AnalyticsCharts.tsx
            │   ├── HallTicketSearch.tsx
            │   ├── ResultView.tsx
            │   ├── SEOHead.tsx
            │   └── ui/          # Button, Card, Input, Badge, Skeleton
            ├── constants/
            │   ├── navigation.ts
            │   └── seo.ts
            ├── hooks/
            │   ├── useTheme.ts
            │   └── useSearchHistory.ts
            ├── lib/
            │   ├── api.ts       # API client + React Query keys
            │   ├── cn.ts
            │   └── searchHistory.ts
            └── types/
                └── results.ts
```

---

## 🛠 Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| React 18 | UI library |
| TypeScript | Type safety |
| Vite 6 | Dev server & production build |
| Tailwind CSS | Styling & design system |
| React Router 7 | Client-side routing |
| React Query | Data fetching & caching |
| Framer Motion | Page & card animations |
| Recharts | Academic analytics charts |
| React Helmet Async | SEO meta tags |
| Lucide Icons | Icon set |

### Backend

| Technology | Purpose |
|------------|---------|
| Flask | REST API server |
| Flask-CORS | Cross-origin requests from Vercel |
| Firebase Admin | Firestore cache for student results |
| Playwright 1.60 | Browser automation for result scraping |
| BeautifulSoup4 | HTML parsing |
| Gunicorn | Production WSGI server (Render) |

### Deployment

| Platform | Service |
|----------|---------|
| **Vercel** | Frontend (React SPA) |
| **Render** | Backend API (Docker + Playwright) |

---

## 📋 Prerequisites

### For frontend development

- **Node.js** 18+ (20 recommended)
- **npm** 9+

### For backend development

- **Python** 3.10+
- **pip**

### For full local stack

- Both of the above
- Playwright browsers (installed automatically — see below)

---

## 💻 Local Development

### 1. Clone the repository

```bash
git clone https://github.com/Bannysukumar/malla-reddy-women-s-engineering-results-website.git
cd malla-reddy-women-s-engineering-results-website
```

### 2. Backend setup

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Install Playwright browser (required once)
playwright install chromium

# Copy env template (optional for local dev)
copy .env.example .env   # Windows
# cp .env.example .env   # macOS / Linux

# Start API server (default port 3000)
python server.py
```

Backend runs at: **http://127.0.0.1:3000**

Health check: **http://127.0.0.1:3000/api/health**

### 3. Frontend setup

Open a **new terminal**:

```bash
cd frontend

# Install dependencies
npm install

# Copy env template
copy .env.example .env   # Windows
# cp .env.example .env   # macOS / Linux

# Start dev server (port 5173)
npm run dev
```

Frontend runs at: **http://localhost:5173**

> **Note:** In dev mode, Vite proxies `/api/*` requests to `http://127.0.0.1:3000` automatically (see `frontend/vite.config.ts`). You do **not** need to set `VITE_API_URL` for local development if the backend is on port 3000.

### 4. Verify locally

1. Open http://localhost:5173
2. Enter a valid hall ticket on the Dashboard or Academic Results page
3. Confirm results load from the backend

### Useful commands

```bash
# Frontend
cd frontend
npm run dev          # Development server
npm run build        # Production build (TypeScript check + Vite)
npm run preview      # Preview production build locally
npm run typecheck    # TypeScript only

# Backend
cd backend
python server.py     # Dev server on :3000
```

---

## 🔐 Environment Variables

### Frontend (`frontend/.env`)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_URL` | Production | Backend API base URL | `https://malla-reddy-women-s-engineering-results.onrender.com` |
| `VITE_SITE_URL` | Production | Public site URL (SEO, sitemap) | `https://mrecwexamcell.vercel.app` |
| `VITE_FIREBASE_*` | Optional | Firebase client config (Analytics) | See [Firebase setup](#firebase-setup-firestore-cache) |

```env
VITE_API_URL=https://malla-reddy-women-s-engineering-results.onrender.com
VITE_SITE_URL=https://mrecwexamcell.vercel.app
```

### Backend (`backend/.env` or Render dashboard)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | Render | Server port | `10000` |
| `ALLOWED_ORIGINS` | Production | Comma-separated CORS origins | `https://mrecwexamcell.vercel.app` |
| `PYTHONUNBUFFERED` | Render | Real-time logs | `1` |
| `FLASK_DEBUG` | Optional | Enable Flask debug mode locally | `false` |
| `FRONTEND_DIST` | Optional | Path to built frontend (Docker only) | `/app/frontend/dist` |
| `FIREBASE_CREDENTIALS_JSON` | Optional | Firebase service account JSON (single-line string) | `{"type":"service_account",...}` |
| `FIREBASE_CREDENTIALS_PATH` | Optional | Local path to service account file | `./firebase-service-account.json` |
| `FIREBASE_SYNC_REFRESH` | Optional | Scrape on every cache hit (slower, always fresh) | `false` |

```env
PORT=10000
ALLOWED_ORIGINS=https://mrecwexamcell.vercel.app
PYTHONUNBUFFERED=1
FIREBASE_CREDENTIALS_JSON={"type":"service_account","project_id":"your-project",...}
FIREBASE_SYNC_REFRESH=false
```

> Without Firebase credentials, the API still works but scrapes the portal on every request.

### Firebase setup (Firestore cache + Analytics)

**Project:** `malla-reddy-results-webs-ec93d`

#### Backend (Firestore cache — required for fast cached results)

1. Open [Firebase Console](https://console.firebase.google.com/) → project **malla-reddy-results-webs-ec93d**.
2. Enable **Firestore Database** → Start in **production mode** (or test mode for dev).
3. **Project Settings** → **Service accounts** → **Generate new private key** → download JSON.
4. Add to Render as `FIREBASE_CREDENTIALS_JSON` — paste the **entire JSON file contents** as one line.
5. Firestore collection used: `mrecw_results` (document ID = hall ticket, e.g. `23RH1A0511`).
6. Redeploy Render backend. Check `/api/health` — `"firebaseCache": true` means cache is active.

**Firestore security:** The backend uses a service account (Admin SDK). Do not expose this JSON in the frontend or commit it to GitHub.

#### Frontend (Firebase Analytics)

Add these in **Vercel → Environment Variables** (from Firebase Console → Project settings → Your apps):

| Variable | Value |
|----------|-------|
| `VITE_FIREBASE_API_KEY` | Your web app API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `malla-reddy-results-webs-ec93d.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `malla-reddy-results-webs-ec93d` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `malla-reddy-results-webs-ec93d.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `476309209964` |
| `VITE_FIREBASE_APP_ID` | `1:476309209964:web:185ac0a1d2663189726949` |
| `VITE_FIREBASE_MEASUREMENT_ID` | `G-MMGG20Z3E8` |

For local dev: copy `frontend/.env.example` to `frontend/.env` and fill in your API key.

> **Note:** The client Firebase config powers **Analytics** on the frontend. Result caching uses the **backend service account** — students never read Firestore directly from the browser.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check (+ Firebase cache status) |
| `GET` | `/api/results/<hall_ticket>` | Full academic marksheet (Firebase cache → scrape) |
| `GET` | `/api/results/<hall_ticket>?refresh=1` | Force scrape and refresh Firebase cache |
| `POST` | `/api/results` | Full marksheet (JSON body: `{ "hallTicket": "..." }`) |
| `GET` | `/api/backlog-report/<hall_ticket>` | Backlog subjects only |
| `POST` | `/api/backlog-report` | Backlog report (JSON body: `{ "hallTicket": "..." }`) |
| `POST` | `/api/result-contrast` | Compare two hall tickets |
| `POST` | `/api/class-results` | Class rankings (supports SSE streaming) |

**Example — fetch results**

```bash
curl https://malla-reddy-women-s-engineering-results.onrender.com/api/health

curl https://malla-reddy-women-s-engineering-results.onrender.com/api/results/22R01A0501
```

---

## 🚀 Deployment

The project uses a **split deployment**:

- **Frontend** → Vercel (fast CDN, automatic builds)
- **Backend** → Render (Docker with Playwright)

Deploy the **backend first**, then set `VITE_API_URL` on Vercel to your Render URL.

---

### Frontend — Vercel

#### Option A: Connect GitHub (recommended)

1. Push code to GitHub.
2. Go to [vercel.com](https://vercel.com) → **Add New Project**.
3. Import the repository: `Bannysukumar/malla-reddy-women-s-engineering-results-website`.
4. Configure project settings:

| Setting | Value |
|---------|-------|
| **Root Directory** | `frontend` |
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

5. Add **Environment Variables** (Settings → Environment Variables):

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://your-backend.onrender.com` |
| `VITE_SITE_URL` | `https://your-app.vercel.app` |

6. Click **Deploy**.

> The root `vercel.json` is used when Root Directory is empty. If Root Directory is `frontend`, Vercel uses `frontend/package.json` scripts. Both approaches work — **Root Directory = `frontend`** is the recommended setup.

#### Option B: Vercel CLI

```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

Set env vars in the Vercel dashboard or via CLI:

```bash
vercel env add VITE_API_URL production
vercel env add VITE_SITE_URL production
```

#### After deploy

- SPA routing is handled by rewrites in `vercel.json`.
- Static assets are cached with long `Cache-Control` headers.
- Update `frontend/public/sitemap.xml` and `robots.txt` if your domain changes.

---

### Backend — Render (Docker)

#### Option A: Blueprint (`render.yaml`)

1. Go to [render.com](https://render.com) → **New** → **Blueprint**.
2. Connect the GitHub repository.
3. Render reads `render.yaml` and creates a Docker web service.
4. Set `ALLOWED_ORIGINS` in the Render dashboard:

```
https://mrecwexamcell.vercel.app
```

5. Deploy and copy the service URL (e.g. `https://mrecw-connect-api.onrender.com`).

#### Option B: Manual Docker service

1. **New** → **Web Service** → connect GitHub repo.
2. Settings:

| Setting | Value |
|---------|-------|
| **Runtime** | Docker |
| **Dockerfile Path** | `./Dockerfile` |
| **Docker Context** | `.` (repository root) |
| **Health Check Path** | `/api/health` |
| **Plan** | Free (note: cold starts ~30–60s) |

3. **Environment Variables:**

| Key | Value |
|-----|-------|
| `PORT` | `10000` |
| `ALLOWED_ORIGINS` | `https://mrecwexamcell.vercel.app` |
| `PYTHONUNBUFFERED` | `1` |

4. Click **Create Web Service**.

#### What the Dockerfile does

```
Stage 1 (Node)     →  npm ci && npm run build  →  frontend/dist
Stage 2 (Playwright) →  pip install + copy backend + copy dist
                      →  gunicorn on port 10000
```

The Docker image bundles a built frontend so the same Render URL can serve both API and static files if needed. In production, the Vercel frontend talks to Render API via `VITE_API_URL`.

#### After backend deploy

1. Test: `curl https://YOUR-SERVICE.onrender.com/api/health`
2. Update Vercel `VITE_API_URL` to this URL.
3. Redeploy Vercel frontend.

---

### Docker (Local / Self-Hosted)

Build and run the full stack locally with Docker:

```bash
# From repository root
docker build -t mrecw-results \
  --build-arg VITE_API_URL=http://localhost:10000 \
  --build-arg VITE_SITE_URL=http://localhost:10000 \
  .

docker run -p 10000:10000 \
  -e PORT=10000 \
  -e ALLOWED_ORIGINS=http://localhost:10000 \
  mrecw-results
```

Open: **http://localhost:10000**

---

### Deployment checklist

- [ ] Backend deployed on Render and `/api/health` returns `{ "status": "ok" }`
- [ ] `ALLOWED_ORIGINS` on Render matches your Vercel URL exactly (no trailing slash)
- [ ] `VITE_API_URL` on Vercel points to Render backend URL
- [ ] `VITE_SITE_URL` on Vercel matches your live frontend URL
- [ ] Vercel Root Directory set to `frontend`
- [ ] Frontend redeployed after env vars are set
- [ ] Test hall ticket search on live site

---

## 📸 Screenshots

### Dashboard

Add Screenshot Here

### Academic Results

Add Screenshot Here

### Backlog Report

Add Screenshot Here

### Credits Analyzer

Add Screenshot Here

---

## 🚀 Performance Goals

| Metric | Target |
|--------|--------|
| SEO | 100 |
| Accessibility | 100 |
| Best Practices | 100 |
| Performance | 95+ |

**Optimizations included:** lazy-loaded routes, code splitting (vendor / charts / motion chunks), React Query caching, skeleton loaders, SEO meta tags, sitemap, and robots.txt.

---

## 🎨 Modern UI/UX

Built using modern design principles:

* Clean Dashboard Layout
* Responsive Design
* Dark / Light Mode
* Smooth Animations
* Professional Typography
* Premium Card Design
* Modern Navigation

Inspired by: Vercel · Stripe · Linear · GitHub · Notion

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| **CORS error in browser** | Set `ALLOWED_ORIGINS` on Render to your exact Vercel URL |
| **API returns 404 on Vercel** | Ensure `VITE_API_URL` is set and frontend was redeployed |
| **First request very slow** | Render free tier cold start + Playwright launch (~30–60s) |
| **Build fails: TS5103** | Use pinned TypeScript `5.9.3` (see `frontend/package.json`) |
| **Playwright version mismatch** | Docker image and `requirements.txt` must both use `playwright==1.60.0` |
| **Firebase cache not working** | Set `FIREBASE_CREDENTIALS_JSON` on Render; verify `/api/health` shows `firebaseCache: true` |
| **Stale results shown** | Use `?refresh=1` or set `FIREBASE_SYNC_REFRESH=true`; background refresh updates cache for next search |
| **Class results timeout** | Class fetch scans many roll numbers — can take several minutes |
| **Theme not changing** | Clear cache; theme uses CSS variables on `.dark` / `.light` classes |
| **Local API not reached** | Backend must run on port `3000`; Vite proxy handles `/api` in dev |

---

## 🔥 Why This Project?

Most college result portals suffer from:

❌ Slow loading  
❌ Poor UI/UX  
❌ Outdated designs  
❌ Difficult navigation  
❌ Mobile issues  

MRECW Results Portal solves these problems with a modern and student-friendly experience.

---

## 🌟 Future Roadmap

* AI Academic Assistant
* Smart Subject Recommendations
* Placement Readiness Dashboard
* Attendance Analytics
* Predictive CGPA Calculator
* Student Notifications
* Academic Insights AI

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m "Add my feature"`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 👨‍💻 Developer

### Adepu Sukumar

Passionate Full Stack & Blockchain Developer

📧 Email: [bannysukumar@gmail.com](mailto:bannysukumar@gmail.com)  
💼 LinkedIn: https://www.linkedin.com/in/adepusukumar/

---

## ⭐ Support

If you like this project:

⭐ Star the repository  
🍴 Fork the repository  
📢 Share it with your friends  
💼 Connect on LinkedIn  

Your support helps improve the project and reach more students.

---

<div align="center">

### Made with ❤️ for MRECW Students

⭐ Don't forget to Star the Repository ⭐

</div>
