# Walkthrough Pengembangan KiCob (Mei 2026)

Dokumen ini berisi ringkasan teknis perubahan besar yang dilakukan pada fase Modernisasi Hierarchical RBAC & DSS.

## 1. Implementasi Hirarki Jabatan (Job Level)
- **Database**: Menambahkan kolom `job_level` (Integer) pada tabel `employees`.
  - Level 1: Staff
  - Level 2: Supervisor
  - Level 3: Manager
  - Level 4: Director
- **Logic**: Fitur penilaian sekarang menggunakan `assessorLevel > targetLevel` untuk menentukan apakah seseorang boleh mengisi sebagai **Supervisor**.

## 2. Refactoring Sistem Assessment
- **360-Feedback**: Implementasi pembobotan dinamis:
  - Supervisor: 50%
  - Peer: 30%
  - Self: 20%
- **Normalisasi**: Jika salah satu penilai belum mengisi, bobot akan didistribusikan secara proporsional sehingga total nilai tetap valid (Skala 5).
- **Eksklusivitas**: Form penilaian sekarang otomatis mendeteksi hubungan (Atasan/Rekan/Mandiri) dan hanya menampilkan satu opsi yang relevan.

## 3. Perbaikan Bug & UI/UX
- **Numeric Fix**: Mengatasi error `.toFixed is not a function` dengan mengonversi data string dari database menggunakan `Number()`.
- **Breadcrumb**: Mengubah tampilan ID angka mentah menjadi label "Detail" yang lebih bersih.
- **Tabel Riwayat**: Menambahkan kolom **Periode** agar pelacakan performa bulanan lebih transparan.
- **Dropdown**: Melebarkan UI Select agar teks level jabatan (Manager, Director, dsb) tidak terpotong.

## 4. Keamanan (RBAC)
- Membatasi fitur "Tambah Karyawan" dan "Edit Level" hanya untuk role `admin` dan `hr`.
- Admin sekarang bisa mengubah level jabatan karyawan langsung melalui tabel karyawan (fitur Edit Profile).

---
*Status Proyek: Stable & Feature Complete untuk fase Hierarchical RBAC.*
