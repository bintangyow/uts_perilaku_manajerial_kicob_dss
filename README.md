# KiCob (KinerjaCollab) - Behavioral DSS Platform

KiCob adalah platform **Decision Support System (DSS)** berbasis web yang dirancang untuk mengelola dan menganalisis kinerja perilaku (soft factors) karyawan menggunakan metode **360-Degree Feedback**.

## Fitur Utama
- **Hierarchical RBAC**: Hak akses dan tipe penilaian yang terintegrasi dengan jenjang jabatan (Staff, Supervisor, Manager, Director).
- **360-Degree Behavioral Assessment**: Penilaian kolaboratif dengan pembobotan otomatis:
  - **Supervisor (50%)**: Penilaian dari atasan langsung.
  - **Peer (30%)**: Penilaian dari rekan sejawat.
  - **Self (20%)**: Penilaian mandiri.
- **Skill Radar Chart**: Visualisasi sebaran kompetensi hard & soft skill secara real-time.
- **Smart Analytics Dashboard**: Ringkasan performa organisasi, tren skill, dan rekomendasi penempatan tim.
- **Automated Normalization**: Perhitungan skor tetap akurat meskipun data penilai belum lengkap (transisi otomatis).

## Teknologi
- **Core**: Next.js 15 (App Router)
- **Database**: PostgreSQL with Drizzle ORM
- **UI/UX**: Tailwind CSS, Shadcn UI, Framer Motion
- **Analytics**: Recharts (Radar & Bar Charts)

## Cara Instalasi
1. Clone repository
2. Install dependencies: `npm install`
3. Setup `.env` untuk database PostgreSQL
4. Push schema: `npm run db:push`
5. Jalankan dev server: `npm run dev`

---
*Dikembangkan untuk profesionalitas manajemen SDM berbasis data.*
