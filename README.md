# Cognisense Frontend

Cognisense (Digital Footprint) empowers you to visualize and analyze your digital productivity, featuring both a powerful **web dashboard** and an integrated **browser extension** in a single repo.

Use it to understand how you spend time online, track patterns, and get actionable insights to improve your digital habits.

## 👥 Authors

- [Mritunjay Tiwari](https://github.com/MritunjayTiwari14)
- [Kartik](https://github.com/karthik768990)
- [Shivam](https://github.com/shivam-purve)

---

## ✨ Overview

The system tracks your online activity (via the browser extension and backend) and presents insights in a focused dashboard UI.

**This project contains:**
- 🌐 **Web Dashboard** (React, Vite, Tailwind)
- 🧩 **Browser Extension** (direct activity tracking; see [footprint-extension/README.md](./footprint-extension/README.md))

### Key Features

- 📊 **Dashboard Analytics:** Visualize detailed activity by day/week
- 📈 **Productivity Metrics:** Productive vs distracting time
- 💡 **Insights & Suggestions:** Personalized recommendations based on your usage
- 🎨 **Modern, Responsive UI:** Dark theme, mobile-friendly layout

---

## ⚙️ Tech Stack

- **React + Vite:** Fast SPA development for the dashboard
- **Tailwind CSS:** Utility-first styling
- **React Router v6:** Client-side routing between pages
- **Recharts:** Interactive charts and visualizations
- **lucide-react:** Icons used across the UI
- **Supabase:** Authentication (Google OAuth) and session management
- **ESLint:** Linting via `eslint.config.js`

---

## 🚀 Getting Started (Web Dashboard)

### 1. Clone the repository
```bash
git clone https://github.com/DhruvPokhriyal/cognisense-frontend.git
cd cognisense-frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration (Supabase)

Create a `.env.local` file in the project root with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-supabase-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

> These are used in `src/supabaseClient.js` to create the Supabase client.

The dashboard expects a backend API available at:

```text
http://localhost:8080/api/v1
```

This base URL is referenced in the dashboard pages (e.g. `Dashboard.jsx`, `Analytics.jsx`, `Insights.jsx`, `Settings.jsx`) when fetching metrics and insights. For a reference implementation, see the backend described in the extension docs.

### 4. Launch the development server
```bash
npm run dev
```
Then open [http://localhost:5173](http://localhost:5173).

### 5. Other useful scripts

- `npm run build` – production build
- `npm run preview` – preview the production build locally
- `npm run lint` – run ESLint over the project

---

## 🧩 Browser Extension

- Source code is located in `/footprint-extension`.
- Please read [footprint-extension/README.md](./footprint-extension/README.md) for extension-specific setup, features, and developer guidance.

The extension tracks browser activity and sends data to the backend API. The dashboard then reads that processed data and presents analytics.

---

## 🛠 Project Structure

```text
cognisense-frontend/
├── footprint-extension/    # Browser extension code & docs
│   └── README.md           # Extension-specific documentation
├── mock-data/              # Sample/mock responses used during development
├── public/                 # Static assets for the web app
├── screenshots/            # UI screenshots (optional)
├── src/
│   ├── assets/             # Images, icons
│   ├── components/         # Reusable UI components (e.g. Navbar)
│   ├── pages/              # Dashboard routes (Dashboard, Analytics, Insights, Settings, Auth)
│   ├── App.jsx             # App shell and routing
│   ├── AuthContext.jsx     # Supabase auth context provider
│   ├── supabaseClient.js   # Supabase client configuration
│   └── main.jsx            # React entrypoint
├── tailwind.config.js      # Tailwind configuration
├── vite.config.js          # Vite configuration
├── package.json
└── README.md
```

---

## 🧑‍💻 Technical Notes

### Website (Dashboard)

- **Routing:** React Router v6 (see `src/App.jsx`)
- **Authentication:** Supabase with Google OAuth (see `src/Auth.jsx` and `src/AuthContext.jsx`)
- **Backend API:** Pages call a backend service at `http://localhost:8080/api/v1` with the Supabase access token in the `Authorization` header
- **State:** React hooks and context for auth and local UI state
- **Charts:** Recharts components for time and category visualizations
- **Styling:** Tailwind CSS classes defined in `src/index.css`
- **Linting:** ESLint via `npm run lint`
- **Build:** Vite static build via `npm run build`

### Extension

- **Code:** See `/footprint-extension`
- **API:** Chrome/Browser APIs for tab and URL activity tracking
- **Sync:** Extension sends data to backend; dashboard reads aggregated analytics

---

## 📢 Contributing

Pull requests and issues are welcome.

---

## 📚 License

MIT © DhruvPokhriyal

---

## 🧬 Technical Deep-Dive

- **Monorepo:** Website + extension, built independently
- **Extension:** Tracks browser events, sends activity to backend for analytics by the dashboard
- **Data Flow:** Extension → Backend → Dashboard (Web)
- **Config:** Tailwind themes, ENV backend endpoint
- **Scalability:** Modular design for adding new analytics or extension features

Find extension docs in [footprint-extension/README.md](./footprint-extension/README.md)
