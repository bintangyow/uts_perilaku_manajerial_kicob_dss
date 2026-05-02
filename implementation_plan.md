# KiCob Frontend Implementation Plan

Implementasi frontend Next.js untuk KiCob — Behavioral DSS for Strategic Team Composition, berdasarkan PRD.

## Scope

> [!IMPORTANT]
> Plan ini fokus pada **frontend-only** implementation menggunakan **mock data**. Backend integration (PostgreSQL, Drizzle ORM, Better Auth) akan dilakukan di fase berikutnya setelah frontend selesai dan divalidasi.

## User Review Required

> [!IMPORTANT]
> **Tailwind CSS Version**: PRD menyebutkan Tailwind CSS. Defaultnya `create-next-app` sekarang menggunakan **Tailwind CSS v4**. Apakah ingin menggunakan v4 (default) atau v3?

> [!IMPORTANT]
> **shadcn/ui Version**: Akan menggunakan shadcn/ui versi terbaru yang kompatibel. Apakah ada preferensi versi?

> [!WARNING]
> **Authentication**: Untuk fase frontend ini, login akan menggunakan mock auth (hardcoded users per role). Better Auth akan diintegrasikan di fase backend.

## Open Questions

1. **Bahasa UI**: Apakah UI text menggunakan Bahasa Indonesia atau English?
2. **Sidebar Navigation**: Apakah sidebar items berubah berdasarkan role (Manager, HR, Reviewer, Admin), atau semua role melihat menu yang sama?
3. **Warna Aksen**: PRD menyebutkan "deep blue gradient" — apakah ada preferensi warna spesifik (hex code) atau cukup pakai palet biru default?

---

## Proposed Changes

### 1. Project Scaffolding

#### [NEW] Next.js App (root project)

- Scaffold dengan `npx create-next-app@latest ./` di folder `KiCob`
- Opsi: TypeScript ✅, Tailwind CSS ✅, ESLint ✅, App Router ✅, `src/` directory ✅, import alias `@/*` ✅
- Install dependencies tambahan:
  ```
  framer-motion recharts react-hook-form zod @hookform/resolvers
  ```
- Setup shadcn/ui via `npx shadcn@latest init`
- Install shadcn components: `button`, `card`, `input`, `label`, `table`, `dialog`, `select`, `badge`, `tabs`, `separator`, `avatar`, `dropdown-menu`, `sidebar`, `sheet`, `tooltip`, `slider`, `progress`, `textarea`, `form`

---

### 2. Design System — Blue Glassmorphism Theme

#### [NEW] `src/app/globals.css`

- CSS custom properties untuk Blue Glass theme:
  - Background: `deep blue gradient` (#0a0e27 → #1a1f4e)
  - Glass card: `rgba(255, 255, 255, 0.05)` dengan `backdrop-filter: blur(16px)`
  - Border: `rgba(100, 150, 255, 0.15)`
  - Accent: `#3b82f6` (blue-500) → `#60a5fa` (blue-400)
  - Text: white/gray hierarchy
- Override shadcn/ui CSS variables untuk dark blue theme
- Utility classes: `.glass-card`, `.glass-sidebar`, `.glow-button`

#### [NEW] `tailwind.config.ts` (customization)

- Extend colors dengan custom blue palette
- Custom backdrop-blur values
- Custom box-shadow untuk glass effect

---

### 3. Layout & Navigation

#### [NEW] `src/app/layout.tsx`

- Root layout dengan gradient background
- Font: Inter dari Google Fonts
- ThemeProvider wrapper (dark mode)

#### [NEW] `src/components/layout/app-sidebar.tsx`

- Glassmorphism sidebar menggunakan shadcn `Sidebar` component
- Navigation items berdasarkan role:
  - **Dashboard** — semua role
  - **Karyawan** — HR, Admin
  - **Skills** — HR, Admin
  - **Proyek** — Manager, Admin
  - **Assessment** — Reviewer, Manager
  - **Rekomendasi** — Manager
  - **Riwayat** — Manager, Admin
  - **Pengaturan** — Admin
- User avatar + role badge di sidebar footer
- Animated active state + hover effects

#### [NEW] `src/app/(dashboard)/layout.tsx`

- Dashboard layout wrapper dengan sidebar + main content area
- Breadcrumb navigation header

---

### 4. Mock Data Layer

#### [NEW] `src/lib/mock-data.ts`

- Mock data untuk semua entities sesuai DB schema:
  - `roles`: Manager, HR, Reviewer, Admin
  - `users`: 4 user (1 per role)
  - `employees`: 12 karyawan dengan department & position
  - `skills`: 8 hard skills (React, Node.js, Python, SQL, Docker, dsb.)
  - `assessments`: Sample penilaian dari berbagai sumber
  - `behavioral_scores`: Skor agregat per karyawan
  - `projects`: 3 sample proyek
  - `project_requirements`: Kebutuhan skill per proyek
  - `team_candidates` & `team_members`: Hasil rekomendasi sample

#### [NEW] `src/lib/types.ts`

- TypeScript interfaces/types sesuai DB schema

#### [NEW] `src/lib/auth-context.tsx`

- React Context untuk mock authentication
- Simpan current user & role
- Login/logout functions

---

### 5. Core Pages

#### 5.1 Login Page

##### [NEW] `src/app/login/page.tsx`

- Glassmorphism login card di tengah layar
- Role selector (dropdown pilih user per role)
- Animated gradient background
- Logo + tagline KiCob

---

#### 5.2 Dashboard

##### [NEW] `src/app/(dashboard)/page.tsx`

- **KPI Cards** (4 cards, animated counter):
  - Total Karyawan
  - Proyek Aktif
  - Assessment Pending
  - Rata-rata Skor Tim
- **Recommendation Table**: Top candidates dengan skor
- **Charts Section**:
  - Radar Chart: Perbandingan skill tim (Recharts)
  - Bar Chart: Skor behavioral per karyawan
- Framer Motion staggered entrance animations

---

#### 5.3 Employee Management

##### [NEW] `src/app/(dashboard)/karyawan/page.tsx`

- Data table karyawan (shadcn Table)
- Search & filter (department, status)
- Add/Edit employee dialog
- Employee skill badges

##### [NEW] `src/app/(dashboard)/karyawan/[id]/page.tsx`

- Detail karyawan dengan:
  - Profile card
  - Skill radar chart
  - Assessment history
  - Behavioral scores breakdown

---

#### 5.4 Skills Management

##### [NEW] `src/app/(dashboard)/skills/page.tsx`

- CRUD skill/kompetensi
- Kategori filter (Hard Skill / Soft Skill)
- Level system visualization (1-5)

---

#### 5.5 Project Management

##### [NEW] `src/app/(dashboard)/proyek/page.tsx`

- Project list dengan status badges (Draft, Active, Completed)
- Create new project dialog
- Project cards dengan progress indicator

##### [NEW] `src/app/(dashboard)/proyek/[id]/page.tsx`

- Project detail:
  - Info proyek & deskripsi
  - Required skills table
  - Bobot hard skill vs soft factor (slider)
  - Team size setting
  - Tombol "Generate Rekomendasi"
  - Hasil rekomendasi (jika sudah ada)

---

#### 5.6 Assessment

##### [NEW] `src/app/(dashboard)/assessment/page.tsx`

- List karyawan yang perlu dinilai
- Filter by assessment type (Self, Peer, Supervisor)
- Status: Belum/Sudah dinilai

##### [NEW] `src/app/(dashboard)/assessment/[id]/page.tsx`

- Form assessment:
  - Emotional Stability (1-5 slider)
  - Communication (1-5 slider)
  - Teamwork (1-5 slider)
  - Adaptability (1-5 slider)
- Real-time score preview
- Submit with Framer Motion transition

---

#### 5.7 Recommendation Results

##### [NEW] `src/app/(dashboard)/rekomendasi/[projectId]/page.tsx`

- **Team Composition Recommendation**:
  - Ranked team alternatives
  - Per-candidate score breakdown (hard skill, soft factor, total)
  - Explainability panel: alasan pemilihan
  - Radar chart perbandingan kandidat
- **Manager Actions**:
  - Accept / Reject / Adjust team
  - Decision notes textarea
  - Save decision

---

#### 5.8 History

##### [NEW] `src/app/(dashboard)/riwayat/page.tsx`

- Riwayat keputusan rekomendasi
- Filter by project, date range
- Status: Approved, Rejected, Adjusted
- Expandable row untuk detail

---

### 6. Shared Components

#### [NEW] `src/components/ui/` (shadcn components)

- Otomatis dari shadcn CLI

#### [NEW] `src/components/kpi-card.tsx`

- Glassmorphism KPI card dengan icon, value, label
- Animated counter (Framer Motion)

#### [NEW] `src/components/skill-radar-chart.tsx`

- Recharts RadarChart wrapper untuk skill visualization

#### [NEW] `src/components/score-breakdown.tsx`

- Component untuk menampilkan breakdown skor rekomendasi

#### [NEW] `src/components/employee-table.tsx`

- Reusable data table untuk karyawan

#### [NEW] `src/components/assessment-form.tsx`

- Reusable assessment form component

---

## File Structure Overview

```
KiCob/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── (dashboard)/
│   │       ├── layout.tsx
│   │       ├── page.tsx              # Dashboard
│   │       ├── karyawan/
│   │       │   ├── page.tsx
│   │       │   └── [id]/page.tsx
│   │       ├── skills/
│   │       │   └── page.tsx
│   │       ├── proyek/
│   │       │   ├── page.tsx
│   │       │   └── [id]/page.tsx
│   │       ├── assessment/
│   │       │   ├── page.tsx
│   │       │   └── [id]/page.tsx
│   │       ├── rekomendasi/
│   │       │   └── [projectId]/page.tsx
│   │       └── riwayat/
│   │           └── page.tsx
│   ├── components/
│   │   ├── layout/
│   │   │   └── app-sidebar.tsx
│   │   ├── ui/                       # shadcn components
│   │   ├── kpi-card.tsx
│   │   ├── skill-radar-chart.tsx
│   │   ├── score-breakdown.tsx
│   │   ├── employee-table.tsx
│   │   └── assessment-form.tsx
│   └── lib/
│       ├── mock-data.ts
│       ├── types.ts
│       ├── auth-context.tsx
│       └── utils.ts                  # shadcn cn() utility
├── public/
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## Verification Plan

### Automated Tests
- `npm run build` — memastikan tidak ada TypeScript/build errors
- `npm run dev` — verifikasi visual di browser

### Manual Verification
- Navigasi semua halaman dari sidebar
- Test login mock flow (pilih role → redirect ke dashboard)
- Verifikasi responsiveness (mobile/tablet/desktop)
- Pastikan glassmorphism effect terlihat konsisten
- Verifikasi chart rendering (radar, bar)
- Test form submission (assessment, project creation)
