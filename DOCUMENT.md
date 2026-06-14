# KiCob - Decision Support System (DSS) Documentation

## 1. Project Overview
**KiCob** adalah sebuah sistem pendukung keputusan (DSS) berbasis web untuk Manajemen Sumber Daya Manusia (SDM). Sistem ini dirancang untuk mengevaluasi kinerja karyawan menggunakan metode **360-Degree Feedback** (Penilaian Perilaku) dan pemetaan kompetensi teknis (Hard Skills), yang kemudian digunakan untuk memberikan rekomendasi penempatan tim proyek secara otomatis berdasarkan pembobotan (DSS).

### 1.1. Tech Stack Utama
*   **Framework**: Next.js 14+ (App Router)
*   **Language**: TypeScript
*   **Database**: PostgreSQL (via Supabase)
*   **ORM**: Drizzle ORM
*   **Authentication**: Better Auth
*   **Styling**: Tailwind CSS & shadcn/ui
*   **Data Visualization**: Recharts (untuk grafik Radar & Bar)
*   **Deployment**: Vercel

---

## 2. Database Architecture (Drizzle Schema)
File definisi schema berada di `src/db/schema.ts`. Berikut adalah tabel-tabel utama yang menyusun logika bisnis KiCob:

### 2.1. Authentication & Users
*   **`user`**, **`session`**, **`account`**: Dikelola secara otomatis oleh library Better Auth. Field `role` pada tabel `user` menentukan akses (admin, manager, hr, reviewer).

### 2.2. Core Organization
*   **`departments`**: Struktur departemen (bisa hirarkis).
*   **`positions`**: Jabatan beserta `job_level` (untuk mengukur senioritas).
*   **`employees`**: Data inti karyawan yang menghubungkan User ID dengan Department dan Position. Terdapat relasi `supervisorId` untuk struktur manajerial.

### 2.3. Competency (Hard Skills)
*   **`skills`**: Master data keahlian.
*   **`employee_skills`**: Pemetaan skill ke karyawan dengan level kemahiran (1-5). API memungkinkan update (PATCH) level skill secara dinamis.

### 2.4. Behavioral Assessment (Soft Skills / 360-Degree)
*   **`assessment_periods`**: Periode penilaian (misal: "Q1 2026").
*   **`assessments`**: Transaksi penilaian mentah dari Penilai ke Karyawan. Menyimpan skor detail dalam bentuk JSONB (`scores`) untuk 16 indikator perilaku.
*   **`behavioral_scores`**: Tabel Materialized/Summary yang menyimpan nilai rata-rata final (Average) dari seluruh penilaian untuk seorang karyawan. Ini yang digunakan untuk laporan dan perhitungan DSS. Terdapat 4 pilar utama:
    *   `avgEmotionalStability` (Stabilitas Emosional)
    *   `avgCommunication` (Komunikasi)
    *   `avgTeamwork` (Kerja Tim)
    *   `avgAdaptability` (Adaptabilitas)

### 2.5. Decision Support System (DSS)
*   **`projects`**: Definisi proyek baru, mengatur ukuran tim dan pembobotan antara Hard Skill vs Soft Factor (misal: 60% Teknis, 40% Perilaku).
*   **`project_requirements`**: Syarat skill spesifik yang dibutuhkan untuk sebuah proyek.
*   **`team_candidates`** & **`team_members`**: Hasil kalkulasi mesin DSS yang menyimpan kandidat karyawan terbaik yang direkomendasikan masuk ke proyek.

---

## 3. Core Business Logic & Features

### 3.1. Penilaian Perilaku (16 Indikator)
Sistem menggunakan 16 indikator perilaku yang dikelompokkan menjadi 4 pilar utama.
Skala penilaian adalah **1 hingga 10**.
Setiap karyawan dinilai oleh rekan sejawat (*peer*), atasan (*supervisor*), atau diri sendiri (*self*). Nilai-nilai ini dihitung rata-ratanya dan disimpan di `behavioral_scores.finalBehaviorScore`.

### 3.2. Fitur Head-to-Head Comparison (`/perbandingan`)
Fitur unggulan untuk manajerial yang membandingkan dua karyawan secara berdampingan.
*   **Radar Chart**: Visualisasi 4 pilar perilaku.
*   **Hard Skills Duel**: Perbandingan level kemampuan teknis (*bar chart*).
*   **Managerial Insight**: Logika *conditional* otomatis yang menganalisis GAP skor dan merekomendasikan peran (misal: Jika Komunikasi > 7.5, disarankan sebagai *Leader*).

### 3.3. Export Multi-Format
Profil karyawan (`/karyawan/[id]`) dilengkapi dengan ekspor laporan ke dalam 3 format standar bisnis:
*   **PDF**: Untuk cetak formal.
*   **Word (.docx)**: Untuk diedit oleh HRD.
*   **Excel (.xlsx)**: Untuk analisis data lanjutan.

---

## 4. Folder Structure (Next.js App Router)
*   `src/app/`
    *   `(dashboard)/`: Grup layout untuk halaman yang memerlukan autentikasi. Terdapat Sidebar Navigasi.
        *   `karyawan/`: Manajemen profil, update skill, dan cetak raport karyawan.
        *   `perbandingan/`: Modul komparasi Head-to-Head.
        *   `assessment/`: Modul input form penilaian 360-degree.
    *   `api/`: Backend Route Handlers (REST API).
        *   `/employees/[id]/skills`: `PATCH` untuk update skill.
        *   `/assessments`: Logic kalkulasi skor saat form dikirim.
*   `src/components/`
    *   `ui/`: Komponen standar shadcn (Buttons, Select, Dropdown).
    *   `layout/`: `app-sidebar.tsx` untuk navigasi utama.
*   `src/db/`:
    *   `schema.ts`: Definisi Drizzle schema.
    *   `index.ts`: Inisialisasi koneksi Postgres.

---

## 5. Known Gotchas / Technical Notes
1.  **Hydration Errors**: Beberapa komponen Base UI atau shadcn seperti `DropdownMenu` rentan terhadap error bersarang (*nested anchor/button*). Gunakan prop `render` atau bungkus dengan `<div>` atau struktur `DropdownMenuGroup` yang benar jika terjadi.
2.  **TypeScript "any" types**: Pada beberapa bagian data fetching (seperti SWR), tipe balikan data masih menggunakan `any`. Jika waktu memungkinkan, disarankan untuk mendefinisikan interface/type yang sesuai dengan Drizzle Select types.
3.  **Data Fetching**: Aplikasi sangat bergantung pada SWR untuk interaktivitas client-side. Pastikan API selalu mengembalikan JSON yang valid.

---
