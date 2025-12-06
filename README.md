# Paggo OCR Case Solution

This repository contains the fullstack solution for the Paggo OCR Case, featuring a **NestJS** backend and a **Next.js** frontend.

## 📋 Prerequisites

- **Node.js**: Version 20 or higher recommended.
- **PostgreSQL / Supabase**: A database instance is required (configured in `.env`).

---

## 🚀 Getting Started

Follow these steps to run the project locally.

### 1. Backend Setup

The backend handles the API, database connections, and OCR processing.

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Configure Environment Variables:**
   Copy the example file and fill in your credentials (Supabase, Groq, etc.).
   ```bash
   cp .env.example .env
   ```

3. **Install Dependencies:**
   ```bash
   pnpm install
   ```

4. **Run Database Migrations:**
   This will set up your database schema using Prisma.
   ```bash
   npx prisma migrate dev
   ```

5. **Start the Server:**
   ```bash
   pnpm start:dev
   ```
   The backend will be running at `http://localhost:3001`.

---

### 2. Frontend Setup

The frontend provides the user interface for uploading documents and viewing results.

1. **Open a new terminal and navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Configure Environment Variables:**
   Copy the example file. You will need Google OAuth credentials for login.
   ```bash
   cp .env.example .env.local
   ```

3. **Install Dependencies:**
   ```bash
   pnpm install
   ```

4. **Start the Development Server:**
   ```bash
   pnpm dev
   ```
   The frontend will be available at `http://localhost:3000`.

---

## 🛠️ Tech Stack

- **Backend:** NestJS, Prisma, PostgreSQL (Supabase), Tesseract.js (OCR), Groq SDK (LLM).
- **Frontend:** Next.js 15, Tailwind CSS, Shadcn UI, NextAuth.js (v5).

## 📝 Notes for Evaluator

- Ensure your `.env` files are correctly populated before running.
- The project uses **Google OAuth** for authentication. You will need valid Client ID/Secret in `frontend/.env.local`.
- The backend requires a **Groq API Key** for the LLM analysis features.
