# Vault — Frontend

React/Next.js frontend for the Vault personal finance manager.

> This is the frontend repository. For the backend API see [vault-backend](https://github.com/MelissaPleitez/task-api.git).

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 14 (App Router) | React framework |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| shadcn/ui | Component library |
| Zustand | Global state management |
| React Hook Form + Zod | Forms and validation |
| Recharts | Charts and data visualization |
| Axios | HTTP client |
| Lucide React | Icons |

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- The [backend API](https://github.com/MelissaPleitez/task-api.git) running on `http://localhost:3000`

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/MelissaPleitez/personal-finance-task-management.git
cd finance-management
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 4. Run the development server

```bash
npm run dev
```

The app will be available at `http://localhost:3001 or http://localhost:5173/`.

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:3000` |

---

## Project Structure
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   └── (dashboard)/
│       ├── accounts/
│       ├── budgets/
│       ├── categories/
│       ├── dashboard/
│       ├── profile/
│       ├── recurring/
│       ├── reports/
│       ├── tasks/
│       └── transactions/
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── Topbar.tsx
│   ├── shared/
│   │   ├── StatCard.tsx
│   │   ├── PageHeader.tsx
│   │   └── EmptyState.tsx
│   └── ui/              ← shadcn components
├── hooks/
│   ├── useAuth.ts
│   ├── useAccounts.ts
│   ├── useBudgets.ts
│   ├── useCategories.ts
│   └── useTransactions.ts
├── lib/
│   ├── axios.ts         ← axios instance with interceptors
│   └── utils.ts
├── store/
│   ├── auth.store.ts    ← Zustand auth state
│   └── ui.store.ts      ← sidebar state
└── types/
├── account.types.ts
├── budget.types.ts
├── category.types.ts
├── transaction.types.ts
└── user.types.ts

## Available Scripts

```bash
npm run dev        # start development server
npm run build      # build for production
npm run start      # start production server
