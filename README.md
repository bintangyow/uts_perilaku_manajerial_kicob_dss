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

KiCob (KinerjaCollab) adalah platform **Decision Support System (DSS)** berbasis web yang dirancang khusus untuk membantu organisasi dalam menganalisis dan mengambil keputusan terkait manajemen kinerja karyawan. Platform ini mengimplementasikan metode **360-Degree Feedback** yang menggabungkan penilaian dari atasan langsung, rekan kerja, dan diri sendiri, lalu menggunakan hasilnya untuk merekomendasikan komposisi tim proyek yang optimal secara algoritmis.

**🇬🇧 English**

KiCob (KinerjaCollab) is a web-based **Decision Support System (DSS)** platform specifically designed to assist organizations in analyzing and making informed decisions related to employee performance management. The platform implements a **360-Degree Feedback** methodology that combines assessments from direct supervisors, peers, and self-evaluation, then uses the results to algorithmically recommend optimal project team compositions.

---

## ✨ Fitur Utama / Key Features

### 🔐 1. Hierarchical RBAC (Role-Based Access Control)

**🇮🇩** Sistem hak akses yang terintegrasi penuh dengan hirarki jabatan organisasi.
- **Admin**: Akses penuh ke seluruh sistem, termasuk manajemen user dan master data.
- **HR**: Mengelola data karyawan, departemen, jabatan, dan periode penilaian.
- **Manager**: Melihat analitik tim, membuat proyek, dan menjalankan engine rekomendasi.
- **Reviewer**: Mengisi form penilaian 360 untuk diri sendiri, rekan, atau atasan/bawahan.

**🇬🇧** A fully integrated access control system tied to the organizational job hierarchy.
- **Admin**: Full system access, including user management and master data.
- **HR**: Manages employee data, departments, positions, and assessment periods.
- **Manager**: Views team analytics, creates projects, and runs the recommendation engine.
- **Reviewer**: Fills out 360 assessment forms for self, peers, or supervisors/subordinates.

---

### 📊 2. Advanced 360-Degree Behavioral Assessment

**🇮🇩** Penilaian kolaboratif dengan pembobotan dinamis pada skala **1–10**:
- **Stabilitas Emosi** (Emotional Stability)
- **Komunikasi** (Communication)
- **Kerja Sama Tim** (Teamwork)
- **Adaptabilitas** (Adaptability)

Pembobotan penilaian:
| Tipe Penilai | Bobot | Peran |
|---|---|---|
| Supervisor (Atasan) | **50%** | Top-Down |
| Upward (Bawahan) | **50%** | Bottom-Up |
| Peer (Rekan Kerja) | **30%** | Horizontal |
| Self (Diri Sendiri) | **20%** | Individual |

> **Smart Normalization**: Jika salah satu tipe penilai belum mengisi, bobot akan didistribusikan secara proporsional sehingga total skor akhir tetap valid di skala **1–10**.
 
### 🔄 Mekanisme Relasi 360-Degree
Sistem secara otomatis memetakan siapa yang harus dinilai berdasarkan struktur hirarki (`supervisorId`):
- **Top-Down**: Supervisor memberikan penilaian kepada bawahan langsungnya.
- **Peer-to-Peer**: Karyawan menilai rekan kerja di tingkat jabatan yang setara.
- **Upward Feedback**: Bawahan memberikan penilaian kepada atasannya secara terstruktur.
- **Self-Evaluation**: Karyawan menilai kinerjanya sendiri sebagai pembanding.

**🇬🇧** Collaborative assessment with dynamic weighting on a **1–10 scale**:
- **Emotional Stability**, **Communication**, **Teamwork**, and **Adaptability**.

> **Smart Normalization**: Weights are redistributed proportionally if an assessor type is missing, ensuring the final score remains valid on the **1–10 scale**.

---

### 🤖 3. DSS Recommendation Engine

**🇮🇩** Algoritma cerdas untuk merekomendasikan komposisi tim proyek terbaik.
- Setiap proyek mendefinisikan kebutuhan **Hard Skill** (Skala 1-5).
- Algoritma menghitung **Total Score** tiap karyawan berdasarkan:
  - `Hard Skill Score` (60%) – berdasarkan gap antara skill yang dimiliki vs. yang dibutuhkan.
  - `Soft Factor Score` (40%) – berdasarkan rata-rata skor agregat 360-Degree (Skala 1-10).
- Output: **Ranking kandidat** terpilih yang paling cocok untuk tim proyek tersebut.

**🇬🇧** A smart algorithm to recommend the best project team composition.
- Projects define **Hard Skill** requirements (Scale 1-5).
- Algorithm calculates a **Total Score** based on Technical Gap (60%) and 360-Degree Behavioral Score (40%).

---

### 📈 4. Visual Analytics & Reporting

**🇮🇩**
- **Skill Radar Chart**: Visualisasi interaktif dengan skala dinamis (Skala 5 untuk Hard Skill, Skala 10 untuk Perilaku).
- **Dashboard Analitik**: KPI card, tren performa organisasi, dan ringkasan status.
- **Ekspor PDF (Raport)**: Cetak laporan performa individu "Raport Kompetensi" dalam format profesional.
- **Audit Trail**: Riwayat lengkap setiap aktivitas persetujuan dan perubahan data.

**🇬🇧**
- **Skill Radar Chart**: Interactive radar visualization with adaptive scaling.
- **Analytics Dashboard**: Real-time KPI cards and performance trends.
- **PDF Export**: Print professional "Competency Reports" for individuals.

---
 
### 🖼️ 5. Dynamic Profile Management
 
**🇮🇩** Integrasi sistem unggah foto profil yang sinkron ke seluruh platform.
- **Vercel Blob Storage**: Penyimpanan foto profil yang aman dan cepat di cloud.
- **Unified Avatar**: Foto profil muncul secara konsisten di seluruh modul aplikasi.
- **Smart Fallback**: Otomatis menampilkan inisial nama jika foto profil belum tersedia.
 
**🇬🇧** Integrated profile picture upload system synchronized across the platform.

---
 
### 🚀 Future Roadmap & Development
 
**🇮🇩** Proyek ini dikembangkan sebagai tugas **UTS Mata Kuliah Perilaku Manajerial**. Rencana selanjutnya:
- **Advanced Audit Trail**: Pencatatan histori perubahan skor secara mendalam.
- **Real-time Notifications**: Notifikasi instan saat periode penilaian dimulai.
- **Machine Learning Integration**: Optimasi rekomendasi menggunakan AI.
 
**🇬🇧** Developed as a **Midterm Assignment for the Managerial Behavior Course**.
 
---
 
## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16+ (App Router) |
| **Language** | TypeScript 5+ |
| **Styling** | Tailwind CSS 4 |
| **UI Components** | Shadcn UI |
| **Database** | PostgreSQL 16+ |
| **ORM** | Drizzle ORM |
| **Authentication** | Better Auth |
| **Charts** | Recharts (Dynamic Scaling) |
| **PDF Generation** | jsPDF + autoTable |

---

## 📂 Struktur Proyek / Project Structure

```bash
kicob/
├── src/
│   ├── app/
│   │   ├── (dashboard)/          # Halaman utama aplikasi (protected routes)
│   │   │   ├── page.tsx          # Dashboard Analitik
│   │   │   ├── assessment/       # Form & List Penilaian 360
│   │   │   ├── karyawan/         # Manajemen Karyawan & Hirarki
│   │   │   ├── proyek/           # Manajemen Proyek DSS
│   │   │   ├── rekomendasi/      # Hasil Engine Rekomendasi
│   │   │   └── pengaturan/       # Master Data (Dept, Jabatan, Periode)
│   │   ├── api/                  # Route Handlers (JSON API)
│   │   │   ├── assessments/      # Logic kalkulasi 360
│   │   │   ├── employees/        # CRUD Karyawan
│   │   │   └── projects/         # Engine DSS
│   ├── components/               # UI Atoms & Complex Charts
│   ├── db/                       # Schema (Drizzle) & Seed Data
│   └── lib/                      # Auth & Context Providers
├── public/                       # Static Assets & Screenshots
├── .env                          # Environment Variables
├── package.json
└── tsconfig.json
```

---

## 🗄️ Skema Database / Database Schema

Platform ini menggunakan **15 tabel relasional** yang dikelola via Drizzle ORM:

### Tabel Aplikasi Utama
| Tabel | Deskripsi |
|---|---|
| `user` | Data kredensial pengguna & role akses |
| `employees` | Profil karyawan, termasuk relasi `supervisor_id` & `job_level` |
| `positions` | Master jabatan & level hirarki (1-4) |
| `departments` | Struktur departemen organisasi |
| `skills` | Master data skill (Hard & Soft) |
| `assessments` | Data mentah 16 indikator penilaian perilaku (Skala 1-10) |
| `behavioral_scores` | Skor agregat akhir yang sudah terbobot |
| `projects` | Proyek DSS dengan konfigurasi prioritas bobot |
| `assessment_periods` | Periode penilaian (Status: Active/Closed/Locked) |

### Relasi Kunci / Key Relations
```
user (1) ──────────── (1) employees       [satu user = satu data karyawan]
employees (1) ──────── (N) assessments    [satu karyawan dinilai oleh banyak pihak]
employees (1) ──────── (1) supervisor     [hirarki atasan langsung]
projects (1) ──────── (N) team_candidates  [beberapa skenario tim per proyek]
```

---

## ⚙️ Cara Instalasi / Installation Guide

### Langkah 1 — Clone & Install
```bash
git clone https://github.com/username/kicob.git
cd kicob
npm install
```

### Langkah 2 — Database Setup
**🇮🇩** Buat database PostgreSQL bernama `kicob`, lalu set di `.env`:
```env
DATABASE_URL=postgres://user:password@localhost:5432/kicob
BETTER_AUTH_SECRET=long_random_string
BETTER_AUTH_URL=http://localhost:3000
```

### Langkah 3 — Sinkronisasi & Run
```bash
npm run db:push
npm run db:seed
npm run dev
```

---

## 📋 Tutorial Langkah demi Langkah / Step-by-Step Tutorial

#### Step 1: Setup Organisasi (Admin/HR)
1. Buka **Pengaturan** → Tambah **Departemen** dan **Jabatan**.
2. Pastikan **Job Level** (1-4) sudah sesuai (Level 4 untuk Direktur/Admin).
3. Tambahkan master **Skill** di menu Skills.

#### Step 2: Input Karyawan & Atasan (HR)
1. Buka menu **Karyawan** → Klik **Tambah Karyawan**.
2. Pilih akun user, jabatan, dan **Supervisor** (Atasan Langsung).
3. Level jabatan akan otomatis sinkron berdasarkan posisi yang dipilih.

#### Step 4: Proses Assessment (User)
1. HR mengaktifkan **Periode Penilaian** baru.
2. User login → Menu **Assessment** → Pilih target penilaian.
3. Isi 16 indikator perilaku (Skala 1-10). Skor otomatis dihitung setelah submit.

#### Step 5: Rekomendasi Tim (Manager)
1. Buka menu **Proyek** → Klik **Buat Proyek Baru**.
2. Tentukan kebutuhan skill. Klik **Generate Rekomendasi**.
3. Pilih tim terbaik berdasarkan ranking DSS.

---

<div align="center">

Dibuat untuk UTS Mata Kuliah Perilaku Manajerial.
*Built for the Managerial Behavior Midterm Project.*

</div>
