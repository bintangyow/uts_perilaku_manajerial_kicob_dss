# Roadmap & Saran Pengembangan KiCob / Development Roadmap & Suggestions

**🇮🇩** Dokumen ini berisi rencana fitur masa depan dan saran peningkatan platform KiCob, diurutkan berdasarkan prioritas implementasi.

**🇬🇧** This document contains future feature plans and improvement suggestions for the KiCob platform, ordered by implementation priority.

---

## 🔴 High Priority (Segera Diimplementasikan)

### 1. Penguncian Periode / Period Locking
**🇮🇩** Menutup akses pengisian assessment untuk periode yang sudah berakhir agar data historis tidak dapat dimanipulasi. Implementasi: Tambah cron job atau trigger yang otomatis mengubah status periode dari `active` ke `locked` setelah `end_date`-nya lewat.

**🇬🇧** Close access to assessment submissions for periods that have ended to prevent historical data manipulation. Implementation: Add a cron job or trigger that automatically changes the period status from `active` to `locked` after its `end_date` has passed.

### 2. Validasi Minimal Peer Reviewer
**🇮🇩** Agar nilai Peer (30%) bisa dihitung, dibutuhkan minimal **2 orang** rekan kerja yang sudah mengisi. Ini mencegah bias dari satu orang saja.

**🇬🇧** For the Peer score (30%) to be calculated, at least **2 colleagues** must have submitted an assessment. This prevents single-person bias.

### 3. Audit Trail Perubahan Job Level
**🇮🇩** Setiap kali Job Level karyawan diubah, sistem harus mencatat: siapa yang mengubah, kapan, dari level berapa, dan menjadi level berapa. Ini penting untuk integritas data SDM.

**🇬🇧** Every time an employee's Job Level is changed, the system should record: who changed it, when, from what level, and to what level. This is crucial for HR data integrity.

---

## 🟡 Medium Priority (3–6 Bulan ke Depan)

### 4. Notifikasi Email / Email Notifications
**🇮🇩** Mengirim email pengingat otomatis kepada karyawan yang belum menyelesaikan assessment mereka, 3 hari sebelum periode berakhir. Teknologi rekomendasi: [Resend](https://resend.com/) atau [Nodemailer](https://nodemailer.com/).

**🇬🇧** Send automatic reminder emails to employees who have not completed their assessments, 3 days before the period ends. Recommended tech: [Resend](https://resend.com/) or [Nodemailer](https://nodemailer.com/).

### 5. Gap Analysis Dashboard
**🇮🇩** Dashboard khusus HR yang menampilkan kesenjangan (gap) antara penilaian diri sendiri (Self) vs. penilaian atasan (Supervisor) per karyawan. Ini memberi wawasan tentang blind spot dan area perkembangan yang perlu perhatian.

**🇬🇧** A dedicated HR dashboard that visualizes the gap between self-assessment vs. supervisor assessment per employee. This provides insight into blind spots and development areas that need attention.

### 6. Trend Performa Multi-Periode / Multi-Period Performance Trend
**🇮🇩** Grafik garis yang menampilkan tren skor perilaku seorang karyawan dari bulan ke bulan (minimal 6 periode terakhir). Saat ini data historis sudah tersimpan, hanya perlu diviualisasikan.

**🇬🇧** A line chart showing an employee's behavioral score trend month over month (at least the last 6 periods). Historical data is already stored; it just needs to be visualized.

### 7. Optimasi Mobile / Mobile Optimization (PWA)
**🇮🇩** Menjadikan KiCob sebagai Progressive Web App (PWA) agar bisa diinstall di smartphone dan digunakan secara offline untuk pengisian assessment. Ini meningkatkan partisipasi karyawan yang sering bekerja di lapangan.

**🇬🇧** Make KiCob a Progressive Web App (PWA) so it can be installed on smartphones and used offline for filling out assessments. This increases participation from employees who frequently work in the field.

---

## 🟢 Low Priority / Long-Term Vision

### 8. AI Performance Prediction
**🇮🇩** Mengintegrasikan model Machine Learning sederhana (regresi linier atau LSTM untuk time-series) untuk memprediksi skor perilaku karyawan di periode berikutnya berdasarkan tren historis.

**🇬🇧** Integrate a simple Machine Learning model (linear regression or LSTM for time-series) to predict an employee's behavioral score in the next period based on historical trends.

### 9. Multi-Project Team Optimization
**🇮🇩** Algoritma yang mengoptimalkan pembagian karyawan ke beberapa proyek sekaligus, dengan mempertimbangkan ketersediaan dan beban kerja, untuk menghindari satu karyawan ditempatkan di terlalu banyak proyek.

**🇬🇧** An algorithm that optimizes the assignment of employees to multiple simultaneous projects, considering availability and workload, to avoid a single employee being placed on too many projects.

### 10. Integrasi HRIS / HRIS Integration
**🇮🇩** Membuka REST API publik agar KiCob dapat sinkronisasi data dua arah dengan sistem HRIS yang sudah ada di perusahaan (seperti Talenta, SAP HR, dll).

**🇬🇧** Expose a public REST API so KiCob can two-way synchronize data with existing company HRIS systems (such as Talenta, SAP HR, etc.).

### 11. Single Sign-On (SSO)
**🇮🇩** Mendukung login menggunakan akun **Google Workspace** atau **Microsoft Azure AD** untuk kemudahan akses di lingkungan korporasi tanpa perlu mendaftar ulang.

**🇬🇧** Support login using **Google Workspace** or **Microsoft Azure AD** accounts for easy access in corporate environments without needing to re-register.

---

## 📝 Catatan Teknis / Technical Notes

**🇮🇩** Untuk developer yang akan mengimplementasikan fitur-fitur di atas, perhatikan hal berikut:
- Semua logika bisnis sensitif harus berada di **API Routes** (server-side), bukan di client component.
- Gunakan **Zod** untuk validasi input di setiap API route baru.
- Tambahkan **index** pada kolom foreign key di skema Drizzle untuk menjaga performa query.
- Selalu buat **database migration** (bukan `db:push`) untuk perubahan skema di production.

**🇬🇧** For developers who will implement the above features, note the following:
- All sensitive business logic must reside in **API Routes** (server-side), not in client components.
- Use **Zod** for input validation in every new API route.
- Add **indexes** to foreign key columns in the Drizzle schema to maintain query performance.
- Always create a **database migration** (not `db:push`) for schema changes in production.
