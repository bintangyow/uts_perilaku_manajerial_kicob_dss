<div align="center">

# 🏆 KiCob — KinerjaCollab

### Enterprise Behavioral Decision Support System
### Platform DSS Penilaian Kinerja Perilaku Karyawan

[![Next.js](https://img.shields.io/badge/Next.js-16.x-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-blue?logo=postgresql)](https://www.postgresql.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-green)](https://orm.drizzle.team/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## 📖 Tentang Proyek / About the Project

**🇮🇩 Bahasa Indonesia**

KiCob (KinerjaCollab) adalah platform **Decision Support System (DSS)** berbasis web yang dirancang khusus untuk membantu organisasi dalam menganalisis dan mengambil keputusan terkait manajemen kinerja karyawan. Platform ini mengimplementasikan metode **360-Degree Feedback** yang menggabungkan penilaian dari atasan, rekan kerja, dan diri sendiri, lalu menggunakan hasilnya untuk merekomendasikan komposisi tim proyek yang optimal secara algoritmis.

**🇬🇧 English**

KiCob (KinerjaCollab) is a web-based **Decision Support System (DSS)** platform specifically designed to assist organizations in analyzing and making informed decisions related to employee performance management. The platform implements a **360-Degree Feedback** methodology that combines assessments from supervisors, peers, and self-evaluation, then uses the results to algorithmically recommend optimal project team compositions.

---

## ✨ Fitur Utama / Key Features

### 🔐 1. Hierarchical RBAC (Role-Based Access Control)

**🇮🇩** Sistem hak akses yang terintegrasi penuh dengan hirarki jabatan organisasi.
- **Admin**: Akses penuh ke seluruh sistem, termasuk manajemen pengguna.
- **HR**: Mengelola data karyawan, departemen, jabatan, dan periode penilaian.
- **Manager**: Melihat analitik tim, menyetujui rekomendasi proyek.
- **Reviewer**: Mengisi form penilaian untuk karyawan yang relevan.

**🇬🇧** A fully integrated access control system tied to the organizational job hierarchy.
- **Admin**: Full system access, including user management.
- **HR**: Manages employee data, departments, positions, and assessment periods.
- **Manager**: Views team analytics and approves project recommendations.
- **Reviewer**: Fills out assessment forms for relevant employees.

---

### 📊 2. 360-Degree Behavioral Assessment

**🇮🇩** Penilaian kolaboratif dengan pembobotan dinamis. Terdapat 4 indikator perilaku yang dinilai pada skala 1–5:
- **Stabilitas Emosi** (Emotional Stability)
- **Komunikasi** (Communication)
- **Kerja Sama Tim** (Teamwork)
- **Adaptabilitas** (Adaptability)

Pembobotan penilaian:
| Tipe Penilai | Bobot |
|---|---|
| Supervisor (Atasan) | **50%** |
| Peer (Rekan Kerja) | **30%** |
| Self (Diri Sendiri) | **20%** |

> **Smart Normalization**: Jika salah satu tipe penilai belum mengisi, bobot akan didistribusikan secara proporsional sehingga total skor akhir tetap valid di skala 1–5.

**🇬🇧** Collaborative assessment with dynamic weighting. Four behavioral indicators are rated on a scale of 1–5:
- **Emotional Stability**
- **Communication**
- **Teamwork**
- **Adaptability**

Assessment weights:
| Assessor Type | Weight |
|---|---|
| Supervisor | **50%** |
| Peer | **30%** |
| Self | **20%** |

> **Smart Normalization**: If one assessor type has not submitted, weights are redistributed proportionally so the final score remains valid on the 1–5 scale.

---

### 🤖 3. DSS Recommendation Engine

**🇮🇩** Algoritma cerdas untuk merekomendasikan komposisi tim proyek terbaik.
- Setiap proyek mendefinisikan kebutuhan **Hard Skill** (level minimum skill yang dibutuhkan).
- Algoritma menghitung **Total Score** tiap karyawan berdasarkan:
  - `Hard Skill Score` (default bobot: 60%) – berdasarkan gap antara skill yang dimiliki vs. yang dibutuhkan.
  - `Soft Factor Score` (default bobot: 40%) – berdasarkan rata-rata skor 360-Degree.
- Output: **Ranking kandidat** dengan skor tertinggi yang paling cocok untuk proyek tersebut.

**🇬🇧** A smart algorithm to recommend the best project team composition.
- Each project defines **Hard Skill** requirements (minimum required skill level).
- The algorithm calculates a **Total Score** for each employee based on:
  - `Hard Skill Score` (default weight: 60%) – based on the gap between owned skills vs. required.
  - `Soft Factor Score` (default weight: 40%) – based on the averaged 360-Degree score.
- Output: **Ranked candidates** with the highest scores most suitable for the project.

---

### 📈 4. Analytics & Reporting

**🇮🇩**
- **Skill Radar Chart**: Visualisasi interaktif radar untuk membandingkan kompetensi antar karyawan.
- **Dashboard Analitik**: KPI card, tren performa, dan ringkasan kondisi organisasi.
- **Ekspor PDF**: Cetak laporan performa individu maupun tim dalam format dokumen profesional.
- **Audit Trail**: Riwayat lengkap setiap persetujuan dan penolakan rekomendasi tim.

**🇬🇧**
- **Skill Radar Chart**: Interactive radar visualization for comparing employee competencies.
- **Analytics Dashboard**: KPI cards, performance trends, and organizational health summary.
- **PDF Export**: Print individual or team performance reports in a professional document format.
- **Audit Trail**: Complete history of every approval and rejection of team recommendations.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16+](https://nextjs.org/) (App Router) |
| **Language** | [TypeScript 5+](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **UI Components** | [Shadcn UI](https://ui.shadcn.com/) + [Base UI](https://base-ui.com/) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Database** | [PostgreSQL 16+](https://www.postgresql.org/) |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team/) |
| **Authentication** | [Better Auth](https://www.better-auth.com/) |
| **Charts** | [Recharts](https://recharts.org/) |
| **PDF Generation** | [jspdf](https://github.com/parallax/jsPDF) + [html2canvas](https://html2canvas.hertzen.com/) |
| **Form Handling** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **Data Fetching** | [SWR](https://swr.vercel.app/) |

---

## 📂 Struktur Proyek / Project Structure

```
kicob/
├── src/
│   ├── app/
│   │   ├── (dashboard)/          # Halaman utama aplikasi (protected routes)
│   │   │   ├── page.tsx          # Dashboard Analitik Utama
│   │   │   ├── assessment/       # Form & List Penilaian 360
│   │   │   ├── karyawan/         # Manajemen Data Karyawan
│   │   │   ├── pengaturan/       # Pengaturan Akun & Profil
│   │   │   ├── profil/           # Profil Karyawan Individual
│   │   │   ├── proyek/           # Manajemen Proyek DSS
│   │   │   ├── rekomendasi/      # Hasil Rekomendasi Tim
│   │   │   ├── riwayat/          # Audit Trail & Riwayat
│   │   │   └── skills/           # Manajemen Master Skill
│   │   ├── api/                  # API Routes (Next.js Route Handlers)
│   │   │   ├── assessments/      # CRUD data penilaian
│   │   │   ├── auth/             # Better Auth handler
│   │   │   ├── departments/      # CRUD departemen
│   │   │   ├── employees/        # CRUD data karyawan
│   │   │   ├── history/          # Audit trail
│   │   │   ├── periods/          # Manajemen periode penilaian
│   │   │   ├── positions/        # CRUD jabatan
│   │   │   ├── projects/         # CRUD proyek DSS
│   │   │   ├── recommendations/  # Engine rekomendasi
│   │   │   ├── skills/           # CRUD master skill
│   │   │   └── user/             # Profil & upload foto
│   │   ├── login/                # Halaman login
│   │   ├── globals.css           # Global styles
│   │   └── layout.tsx            # Root layout
│   ├── components/
│   │   ├── layout/               # Sidebar, header, navigasi
│   │   ├── settings/             # Komponen halaman pengaturan
│   │   ├── ui/                   # Komponen UI atomik (Shadcn)
│   │   ├── kpi-card.tsx          # Kartu KPI dashboard
│   │   ├── score-breakdown.tsx   # Breakdown skor penilaian
│   │   └── skill-radar-chart.tsx # Radar chart kompetensi
│   ├── db/
│   │   ├── schema.ts             # Definisi skema database (Drizzle)
│   │   ├── index.ts              # Koneksi database
│   │   └── seed.ts               # Data awal untuk development
│   ├── hooks/                    # Custom React hooks
│   └── lib/
│       ├── auth.ts               # Konfigurasi Better Auth (server)
│       ├── auth-client.ts        # Better Auth (client-side)
│       └── auth-context.tsx      # Auth context provider
├── public/
│   └── uploads/                  # Foto profil karyawan
├── .env                          # Variabel lingkungan (JANGAN di-commit!)
├── .gitignore
├── drizzle.config.ts             # Konfigurasi Drizzle Kit
├── next.config.ts                # Konfigurasi Next.js
├── package.json
└── tsconfig.json
```

---

## 🗄️ Skema Database / Database Schema

Platform ini menggunakan **15 tabel relasional**. Berikut penjelasan tiap tabelnya:

### Tabel Autentikasi (Dikelola oleh Better Auth)
| Tabel | Deskripsi |
|---|---|
| `user` | Data pengguna: nama, email, role (`admin`, `hr`, `manager`, `reviewer`) |
| `session` | Sesi login aktif pengguna |
| `account` | Akun provider (email/password, OAuth) |
| `verification` | Token verifikasi email |

### Tabel Aplikasi Utama
| Tabel | Deskripsi |
|---|---|
| `departments` | Struktur departemen dengan dukungan hierarki (parentId) |
| `positions` | Jabatan dan level hierarkinya (`job_level` 1–4) |
| `employees` | Data karyawan, termasuk `supervisor_id` dan `job_level` |
| `skills` | Master data skill (kategori: `hard` / `soft`) |
| `employee_skills` | Skill yang dimiliki tiap karyawan beserta levelnya (1–5) |
| `assessment_periods` | Periode penilaian (misal "Mei 2026"), dengan status `active`/`locked` |
| `assessments` | Data mentah penilaian 360 per karyawan per periode |
| `behavioral_scores` | Skor perilaku akhir yang sudah dihitung pembobotan-nya |
| `projects` | Proyek DSS dengan konfigurasi bobot Hard/Soft |
| `project_requirements` | Kebutuhan skill per proyek |
| `team_candidates` | Kandidat tim hasil algoritma rekomendasi |
| `team_members` | Anggota dari setiap kandidat tim beserta skor kontribusinya |
| `recommendation_history` | Audit trail persetujuan/penolakan rekomendasi |

### Relasi Kunci / Key Relations
```
user (1) ──────────── (1) employees       [satu user = satu data karyawan]
employees (1) ──────── (N) assessments    [satu karyawan bisa dinilai berkali-kali]
assessments (N) ─────── (1) periods       [setiap penilaian terikat ke satu periode]
projects (1) ──────── (N) project_requirements [setiap proyek punya kebutuhan skill]
projects (1) ──────── (N) team_candidates  [setiap proyek bisa punya beberapa skenario tim]
```

---

## ⚙️ Cara Instalasi / Installation Guide

### Prasyarat / Prerequisites

**🇮🇩** Pastikan Anda sudah menginstall software berikut:
**🇬🇧** Make sure you have the following installed:

- **Node.js** v20 atau lebih baru / v20 or newer — [Download](https://nodejs.org/)
- **npm** v10+ (sudah termasuk dengan Node.js / included with Node.js)
- **PostgreSQL** v14 atau lebih baru / v14 or newer — [Download](https://www.postgresql.org/download/)
- **Git** — [Download](https://git-scm.com/)

---

### Langkah 1 — Clone Repositori / Clone Repository

```bash
git clone https://github.com/username/kicob.git
cd kicob
```

### Langkah 2 — Install Dependensi / Install Dependencies

```bash
npm install
```

### Langkah 3 — Buat Database PostgreSQL / Create PostgreSQL Database

**🇮🇩** Buka terminal PostgreSQL atau GUI (contoh: pgAdmin / TablePlus) lalu jalankan:
**🇬🇧** Open a PostgreSQL terminal or GUI (e.g., pgAdmin / TablePlus) and run:

```sql
CREATE DATABASE kicob;
```

### Langkah 4 — Konfigurasi Environment Variables

**🇮🇩** Buat file `.env` di root direktori proyek. File ini **TIDAK AKAN** terupload ke GitHub karena sudah ada di `.gitignore`.
**🇬🇧** Create a `.env` file in the project root directory. This file will **NOT** be uploaded to GitHub as it is already in `.gitignore`.

```env
# ─── Database ───────────────────────────────────────────────────
# Format: postgres://USER:PASSWORD@HOST:PORT/DATABASE_NAME
DATABASE_URL=postgres://postgres:yourpassword@localhost:5432/kicob

# ─── Better Auth ────────────────────────────────────────────────
# Ganti dengan string acak yang panjang dan aman / Replace with a long, secure random string
BETTER_AUTH_SECRET=ganti_dengan_string_rahasia_yang_sangat_panjang_dan_acak

# URL aplikasi kamu saat development / Your app URL during development
BETTER_AUTH_URL=http://localhost:3000
```

> ⚠️ **PERINGATAN / WARNING**: Jangan pernah meng-commit file `.env` ke GitHub. Pastikan `.env*` sudah ada di `.gitignore` kamu. / Never commit the `.env` file to GitHub. Make sure `.env*` is already in your `.gitignore`.

### Langkah 5 — Sinkronisasi Skema Database / Sync Database Schema

**🇮🇩** Perintah ini akan membuat semua tabel di database secara otomatis berdasarkan `src/db/schema.ts`.
**🇬🇧** This command will automatically create all tables in the database based on `src/db/schema.ts`.

```bash
npm run db:push
```

### Langkah 6 — (Opsional) Isi Data Awal / (Optional) Seed Initial Data

**🇮🇩** Mengisi data dummy untuk keperluan development dan testing.
**🇬🇧** Populates dummy data for development and testing purposes.

```bash
npm run db:seed
```

### Langkah 7 — Jalankan Development Server / Run Development Server

```bash
npm run dev
```

**🇮🇩** Buka browser dan akses: **🇬🇧** Open your browser and navigate to:
```
http://localhost:3000
```

---

## 📖 Panduan Penggunaan / User Guide

### Alur Kerja Utama / Main Workflow

```
[Admin/HR Setup] ──► [Karyawan Mengisi Assessment] ──► [Sistem Menghitung Skor]
       │                                                          │
       ▼                                                          ▼
[Buat Data Master]                                    [Manager Buat Proyek DSS]
(Dept, Jabatan, Skill)                                          │
                                                                 ▼
                                                  [Jalankan Engine Rekomendasi]
                                                                 │
                                                                 ▼
                                                  [Review & Setujui Rekomendasi Tim]
```

---

## 🔐 Keamanan & Demo / Security & Demo
 
**🇮🇩** Untuk menjaga integritas data selama periode penilaian UTS:
- **Registrasi Publik Dimatikan**: Fitur pendaftaran akun baru dinonaktifkan untuk mencegah akses tidak sah.
- **Kredensial Live**: Akun untuk mencoba website ini secara langsung bersifat privat (silakan hubungi pengembang).
- **Development**: Untuk mencoba secara lokal, jalankan `npm run db:seed`. Detail akun (email/password) dapat dilihat langsung di file `src/db/seed.ts`.
 
**🇬🇧** To maintain data integrity during the UTS assessment period:
- **Public Registration Disabled**: New account sign-ups are disabled to prevent unauthorized access.
- **Live Credentials**: Accounts for testing the live website are private (please contact the developer).
- **Development**: For local testing, refer to `src/db/seed.ts` for account details after running the seed script.
 
---
 
## 📸 Screenshots
 
<div align="center">
  <p><i>Halaman Dashboard Utama / Main Dashboard Page</i></p>
  <img src="public/screenshots/dashboard.png" alt="Dashboard" width="800" />
 
  <br/><br/>
 
  <p><i>Halaman Daftar Proyek / Projects List Page</i></p>
  <img src="public/screenshots/proyek.png" alt="Proyek" width="800" />
 
  <br/><br/>
 
  <p><i>Hasil Rekomendasi Tim DSS / DSS Team Recommendation Results</i></p>
  <img src="public/screenshots/rekomendasi.png" alt="Recommendations" width="800" />
</div>
 
---
 
### 👤 Akun Admin / Admin Account

**🇮🇩** Saat pertama kali menjalankan aplikasi (setelah seed), gunakan kredensial berikut untuk login sebagai Admin:
**🇬🇧** When first running the application (after seeding), use the following credentials to log in as Admin:

> Kredensial default ada di file `src/db/seed.ts`. Segera ubah password setelah login pertama!
> Default credentials are in `src/db/seed.ts`. Change your password immediately after the first login!

---

### 📋 Tutorial Langkah demi Langkah / Step-by-Step Tutorial

#### Step 1: Setup Organisasi (Admin/HR)
1. Login sebagai Admin atau HR.
2. Buka **Pengaturan** → Tambah **Departemen** yang ada di perusahaan.
3. Buka **Pengaturan** → Tambah **Jabatan** dan tentukan **Job Level**-nya:
   - Level 1 = Staff
   - Level 2 = Supervisor
   - Level 3 = Manager
   - Level 4 = Director
4. Tambah **Skill** di menu **Skills** (contoh: Python, Leadership, Komunikasi).

#### Step 2: Input Data Karyawan (HR)
1. Buka menu **Karyawan** → Klik **Tambah Karyawan**.
2. Isi data: nama, email, departemen, jabatan, dan **Supervisor** (atasan langsung).
3. Tambahkan skill yang dimiliki karyawan beserta levelnya (1–5) di halaman profil.

#### Step 3: Buat Periode Penilaian (HR)
1. Buka **Pengaturan** → Buat **Periode Baru** (contoh: "Mei 2026").
2. Set periode tersebut sebagai **Aktif**.

#### Step 4: Proses Assessment (Semua User)
1. Karyawan login ke dashboard masing-masing.
2. Buka menu **Assessment** → Sistem akan otomatis menampilkan siapa saja yang bisa dinilai (berdasarkan relasi Supervisor/Peer/Self).
3. Isi form penilaian untuk masing-masing indikator (skala 1–5).
4. Submit form. Data tersimpan dan skor agregat otomatis dikalkulasi.

#### Step 5: Rekomendasi Tim Proyek (Manager/Admin)
1. Buka menu **Proyek** → Klik **Buat Proyek Baru**.
2. Isi nama proyek, deskripsi, ukuran tim, dan bobot prioritas (Hard vs Soft).
3. Tambahkan **Skill Requirements** (skill apa yang dibutuhkan dan level minimalnya).
4. Klik **Generate Rekomendasi**. Sistem akan memproses dan menampilkan daftar kandidat.
5. Review ranking kandidat → Setujui atau tolak di halaman **Rekomendasi**.

#### Step 6: Monitoring & Ekspor
1. Pantau performa keseluruhan di halaman **Dashboard**.
2. Buka profil karyawan untuk melihat **Radar Chart** kompetensinya.
3. Klik **Cetak Laporan** untuk mengunduh laporan PDF.
4. Cek **Riwayat** untuk melihat audit trail semua aktivitas.

---

## 🔧 Scripts yang Tersedia / Available Scripts

| Script | Perintah / Command | Fungsi / Function |
|---|---|---|
| Development | `npm run dev` | Menjalankan server development |
| Build | `npm run build` | Build untuk production |
| Start | `npm run start` | Menjalankan build production |
| Lint | `npm run lint` | Memeriksa kualitas kode |
| DB Push | `npm run db:push` | Sinkronisasi skema ke database |
| DB Seed | `npm run db:seed` | Mengisi data awal |
| DB Studio | `npm run db:studio` | Membuka Drizzle Studio (GUI database) |

---

## 🤝 Kontribusi / Contributing

**🇮🇩** Kontribusi sangat disambut! Silakan ikuti langkah berikut:
**🇬🇧** Contributions are welcome! Please follow these steps:

1. Fork repositori ini.
2. Buat branch baru: `git checkout -b feature/nama-fitur-kamu`
3. Commit perubahan: `git commit -m 'feat: tambahkan fitur X'`
4. Push ke branch: `git push origin feature/nama-fitur-kamu`
5. Buat Pull Request.

---

## 📄 Lisensi / License

**🇮🇩** Proyek ini dilisensikan di bawah lisensi **MIT**. Lihat file [LICENSE](LICENSE) untuk detail lebih lanjut.
**🇬🇧** This project is licensed under the **MIT** License. See the [LICENSE](LICENSE) file for more details.

---

<div align="center">

Dibuat dengan ❤️ untuk solusi manajemen SDM berbasis data.
*Built with ❤️ for data-driven human resource management.*

</div>
