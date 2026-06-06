# Kannada Seva (ಕನ್ನಡ ಸೇವಾ) - School Analytics & Community Portal

Welcome to **Kannada Seva** (ಕನ್ನಡ ಸೇವಾ), a full-stack, production-ready school analytics and community web application designed for Kannada-medium schools, students, teachers, guardians, and administrators. 

The UI/UX is built to replicate the clean data analytics features of **Schoolytics** with a custom Kannada-medium localization twist.

---

## 🚀 Quick Start (Dev Mode)

To start the application locally:

1. **Install Dependencies:**
   At the root of the project, run:
   ```bash
   npm run install:all
   ```

2. **Boot Dev Server:**
   Launch both the React Vite app (client) and Express API server concurrently:
   ```bash
   npm run dev
   ```
   - **Frontend URL:** `http://localhost:5173`
   - **Backend API URL:** `http://localhost:5000`

---

## 📦 Project Structure

```
kannada-seva/
├── package.json              # root package orchestrator
├── README.md                 # this file
├── frontend/                 # React (Vite) + Tailwind CSS v4 + Recharts
│   ├── index.html            # SEO headers
│   └── src/
│       ├── App.tsx           # app routing & layouts
│       ├── index.css         # tailwind import & Google Font configurations
│       ├── i18n/             # react-i18next translation config (en.json, kn.json)
│       ├── context/          # Theme, Auth, Language context state wrappers
│       ├── components/       # reusable Navbar, Sidebar, ChatWidget
│       └── pages/            # Login, dashboards, video wall, registry tables
└── backend/                  # Node.js + Express.js + Prisma ORM
    ├── package.json          # backend packages list
    ├── .env                  # database url and Gemini API key variables
    ├── prisma/               # schema.prisma (PostgreSQL/Supabase target) and seed.ts
    └── src/
        ├── server.ts         # express listener mounting API paths
        ├── controllers/      # chatbot, students, log interventions, video sharing controllers
        ├── routes/           # routing handlers
        └── utils/            # mockData.ts (fallback in-memory 5,000 student registry simulator)
```

---

## 🗄️ Database Setup (Supabase & Prisma)

Supabase runs standard PostgreSQL. To link your Supabase database:

1. Copy the connection strings from your Supabase Dashboard under **Settings > Database**.
2. Open `backend/.env` and insert your credentials into the `DATABASE_URL` (direct pool) and `DIRECT_URL` (session pool) variables.
3. Run the migrations to build your tables and seed default profiles:
   ```bash
   npm run prisma:migrate
   npm run prisma:seed
   ```

*(Note: If no connection details are provided, the backend operates in an in-memory mock data fallback mode automatically so the app remains fully runnable!)*

---

## 🤖 Gemini Chatbot API Setup

The chatbot widget connects to Google's **Gemini 1.5 Flash** for quick, bilingual school assistance.

1. Obtain a free Gemini API key from **Google AI Studio**.
2. Open `backend/.env` and paste it under:
   ```env
   GEMINI_API_KEY=YOUR_GEMINI_KEY
   ```
3. Boot your dev server. The floating bot will now chat live in English and Kannada!

---

## 🌟 Key Features & Verification

- **Role Switcher:** Dynamic preview tabs at the top header (**Admin | Teacher | Guardian | Student**) that swap layout panels, side nav options, and statistics indicators instantly.
- **Bilingual Interface:** Toggle languages instantly between English and Kannada (**EN | ಕನ್ನಡ**) in the top header.
- **Dark Mode:** A persistent theme toggle (**Sun ☀️ / Moon 🌙**) changing visuals cleanly.
- **Manual Data Population:** Go to the **Students Directory** under **Admin**, click **+ Add Student**, and fill out the form. The student is immediately inserted and renders at the top of the table.
- **Video Board:** Submit YouTube links, review submissions as an Admin in the **Pending Review Queue**, approve videos, and watch them render as embeds with working like-counters.
- **Bilingual Chatbot:** Chat with **Seva Helper** in English or Kannada to check missing homework, attendance rates, or navigate the application.
