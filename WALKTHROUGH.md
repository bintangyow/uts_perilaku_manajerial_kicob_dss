# Walkthrough Teknis Pengembangan KiCob / Technical Development Walkthrough
### Periode: Mei 2026

---

## 🎯 Tujuan Dokumen / Document Purpose

**🇮🇩** Dokumen ini mendokumentasikan secara rinci setiap keputusan teknis, perubahan arsitektur, dan bug fix yang dilakukan selama fase pengembangan KiCob. Tujuannya sebagai referensi bagi developer yang akan melanjutkan atau melakukan maintenance proyek ini.

**🇬🇧** This document details every technical decision, architectural change, and bug fix made during the KiCob development phase. It serves as a reference for any developer who will continue or maintain this project.

---

## 🟢 Fase 1: Fondasi & Autentikasi / Foundation & Authentication

### 1.1 Setup Proyek
- Inisialisasi Next.js 16+ dengan App Router dan TypeScript.
- Integrasi Tailwind CSS v4 dan Shadcn UI sebagai design system.
- Setup Drizzle ORM dengan PostgreSQL untuk manajemen database yang type-safe.

### 1.2 Implementasi Better Auth
**🇮🇩**
- Menggunakan `better-auth` sebagai library autentikasi karena dukungannya terhadap session-based auth yang kompatibel dengan Next.js App Router.
- Tabel `user`, `session`, `account`, dan `verification` dikelola sepenuhnya oleh library ini.
- Kustom field `role` (`admin`, `hr`, `manager`, `reviewer`) ditambahkan ke tabel `user`.
- File konfigurasi: `src/lib/auth.ts` (server) dan `src/lib/auth-client.ts` (client).

**🇬🇧**
- Used `better-auth` as the auth library due to its session-based auth support compatible with Next.js App Router.
- The `user`, `session`, `account`, and `verification` tables are fully managed by this library.
- Custom `role` field (`admin`, `hr`, `manager`, `reviewer`) was added to the `user` table.
- Config files: `src/lib/auth.ts` (server) and `src/lib/auth-client.ts` (client).

---

## 🔵 Fase 2: Hierarchical RBAC & Struktur Organisasi

### 2.1 Implementasi Job Level
**🇮🇩**
- Menambahkan kolom `job_level` (Integer) pada tabel `employees` dan `positions`.
- Mapping level: 1=Staff, 2=Supervisor, 3=Manager, 4=Director.
- Level jabatan digunakan untuk menentukan validitas tipe penilaian (apakah seseorang boleh jadi penilai tipe "supervisor" untuk karyawan tertentu).

**🇬🇧**
- Added `job_level` (Integer) column to the `employees` and `positions` tables.
- Level mapping: 1=Staff, 2=Supervisor, 3=Manager, 4=Director.
- Job level is used to determine the validity of an assessment type (whether someone can be a "supervisor" type assessor for a specific employee).

### 2.2 Supervisor-Target Linking Logic
**🇮🇩**
- Validasi sisi server: Penilai hanya bisa memilih tipe `supervisor` jika `assessorLevel > targetLevel`.
- Ini mencegah Staff menilai Manager mereka sebagai "Supervisor".

**🇬🇧**
- Server-side validation: An assessor can only select the `supervisor` type if `assessorLevel > targetLevel`.
- This prevents a Staff member from evaluating their Manager as a "Supervisor."

### 2.3 RBAC Middleware
**🇮🇩** Proteksi route dilakukan di level layout (`src/app/(dashboard)/layout.tsx`) dengan mengecek session user dan role-nya. Menu sensitif seperti manajemen karyawan hanya dirender untuk role `admin` dan `hr`.

**🇬🇧** Route protection is handled at the layout level (`src/app/(dashboard)/layout.tsx`) by checking the user session and role. Sensitive menus like employee management are only rendered for the `admin` and `hr` roles.

---

## 🟡 Fase 3: Engine Assessment 360-Degree

### 3.1 Algoritma Pembobotan Dinamis
**🇮🇩**
Skor akhir dihitung di API route `src/app/api/assessments/route.ts`. Pseudocode logika normalisasi:

```
total_weight = 0
if ada supervisor assessment: total_weight += 0.5
if ada peer assessment:       total_weight += 0.3
if ada self assessment:       total_weight += 0.2

final_score = Σ (nilai_mentah × bobot_relatif) / total_weight
```

Pendekatan ini memastikan skor selalu valid di skala 1–5, bahkan jika hanya satu jenis penilai yang mengisi.

**🇬🇧**
The final score is calculated in the API route `src/app/api/assessments/route.ts`. Normalization logic pseudocode:

```
total_weight = 0
if supervisor assessment exists: total_weight += 0.5
if peer assessment exists:       total_weight += 0.3
if self assessment exists:       total_weight += 0.2

final_score = Σ (raw_score × relative_weight) / total_weight
```

This approach ensures the score is always valid on the 1–5 scale, even if only one assessor type has submitted.

### 3.2 Bug Fix: Numeric Type Safety & Join Integrity
**🇮🇩**
- **Numeric Type**: Drizzle ORM mengembalikan tipe `numeric` sebagai `string`. Solusi: Menggunakan `Number()` pada kalkulasi.
- **Join Integrity (Vercel Fix)**: Memperbaiki error `Property 'position' does not exist` pada API Export dengan melakukan explicit join ke tabel `positions` dan `departments` alih-alih memanggil kolom yang tidak ada di tabel `employees`.

**🇬🇧**
- **Numeric Type**: Drizzle ORM returns `numeric` as `string`. Fix: Wrapping database values with `Number()`.
- **Join Integrity (Vercel Fix)**: Resolved the `Property 'position' does not exist` error in the Export API by implementing explicit joins to `positions` and `departments` tables instead of accessing non-existent columns on the `employees` table.

---

## 🔴 Fase 4: DSS Recommendation Engine & Visualisasi

### 4.1 Algoritma Rekomendasi
**🇮🇩**
Algoritma berjalan di `src/app/api/recommendations/route.ts`:
1. Ambil semua karyawan aktif beserta skill dan skor perilaku mereka.
2. Untuk setiap karyawan, hitung `Hard Skill Score`: bandingkan level skill yang dimiliki vs. level minimum yang dibutuhkan proyek.
3. Ambil `Soft Factor Score` dari tabel `behavioral_scores`.
4. Kalkulasi `Total Score = (hardSkillScore × hardWeight) + (softFactorScore × softWeight)`.
5. Urutkan berdasarkan `Total Score` descending, ambil N teratas sesuai ukuran tim proyek.
6. Simpan hasilnya ke tabel `team_candidates` dan `team_members`.

**🇬🇧**
The algorithm runs in `src/app/api/recommendations/route.ts`:
1. Fetch all active employees with their skills and behavioral scores.
2. For each employee, calculate `Hard Skill Score`: compare owned skill level vs. the project's minimum required level.
3. Retrieve `Soft Factor Score` from the `behavioral_scores` table.
4. Calculate `Total Score = (hardSkillScore × hardWeight) + (softFactorScore × softWeight)`.
5. Sort by `Total Score` descending, take the top N based on the project's team size.
6. Save results to the `team_candidates` and `team_members` tables.

### 4.2 Skill Radar Chart
**🇮🇩**
- Menggunakan komponen `RadarChart` dari library Recharts.
- Data dinormalisasi ke skala 0–100% untuk konsistensi tampilan.
- Komponen dapat menerima data dari 2 karyawan sekaligus untuk tampilan perbandingan.

**🇬🇧**
- Uses the `RadarChart` component from the Recharts library.
- Data is normalized to a 0–100% scale for display consistency.
- The component can accept data from 2 employees simultaneously for a comparison view.

### 4.3 PDF Export
**🇮🇩**
- Menggunakan `html2canvas` untuk mengambil screenshot dari elemen HTML di DOM.
- Screenshot tersebut kemudian dimasukkan ke dalam dokumen PDF menggunakan `jspdf`.
- Pendekatan ini memungkinkan laporan PDF memiliki tampilan yang identik dengan tampilan di layar (WYSIWYG).

**🇬🇧**
- Uses `html2canvas` to take a screenshot of an HTML element in the DOM.
- The screenshot is then inserted into a PDF document using `jspdf`.
- This approach allows the PDF report to have an appearance identical to the on-screen display (WYSIWYG).

---

## 🟣 Fase 5: Profil & Pengaturan Akun

### 5.1 Upload Foto Profil
**🇮🇩**
- File foto diunggah ke server menggunakan `FormData` dan disimpan di `public/uploads/`.
- API endpoint: `POST /api/user/upload`.
- Nama file disimpan di kolom `image` pada tabel `user` (dikelola Better Auth).

**🇬🇧**
- Profile photos are uploaded to the server using `FormData` and stored in `public/uploads/`.
- API endpoint: `POST /api/user/upload`.
- The filename is stored in the `image` column of the `user` table (managed by Better Auth).

---

## 🏁 Status Proyek / Project Status

| Fitur / Feature | Status |
|---|---|
| Autentikasi & RBAC | ✅ Selesai / Complete |
| Hierarchical Job Level | ✅ Selesai / Complete |
| 360-Degree Assessment | ✅ Selesai / Complete |
| DSS Recommendation Engine | ✅ Selesai / Complete |
| Analytics Dashboard | ✅ Selesai / Complete |
| Skill Radar Chart | ✅ Selesai / Complete |
| PDF Export | ✅ Selesai / Complete |
| Audit Trail & History | ✅ Selesai / Complete |
| Upload Foto Profil | ✅ Selesai / Complete |
| Period Locking | 🔲 Belum / Pending |
| Email Notifications | 🔲 Belum / Pending |
