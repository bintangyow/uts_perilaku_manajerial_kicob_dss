# Saran Pengembangan KiCob (KinerjaCollab)

Dokumen ini mencatat ide dan rencana pengembangan fitur di masa depan untuk meningkatkan kualitas DSS (Decision Support System) dan integritas data.

## 1. Peningkatan Integritas Data
- **Aturan Ketat Assessment**: Implementasi opsi di mana nilai akhir tidak akan muncul/dihitung sampai ketiga indikator (Self, Peer, Supervisor) terisi lengkap.
- **Minimal Peer**: Menambahkan validasi agar minimal 2 atau 3 rekan kerja harus memberikan nilai sebelum porsi "Peer" (30%) dihitung, untuk menghindari subjektivitas satu orang.
- **Penguncian Periode**: Menutup akses pengisian assessment untuk bulan yang sudah lewat agar data tidak bisa dimanipulasi di kemudian hari.

## 2. Fitur Keamanan & Audit
- **Audit Trail Jabatan**: Mencatat log setiap kali ada perubahan `Job Level` karyawan (siapa yang mengubah, kapan, dan menjadi level berapa).
- **Log Perubahan Nilai**: Jika ada fitur edit nilai, setiap perubahan harus tercatat alasannya.

## 3. Notifikasi & UX
- **Email Reminder**: Mengirimkan email otomatis kepada karyawan yang belum mengisi assessment di akhir bulan.
- **Mobile App/Responsive Fix**: Optimasi lebih lanjut untuk tampilan mobile agar pengisian assessment bisa dilakukan via smartphone dengan lebih nyaman.

## 4. Analitik Lanjutan
- **Trend Performa**: Grafik yang menunjukkan kenaikan/penurunan performa perilaku karyawan selama 6 bulan terakhir.
- **Gap Analysis**: Fitur yang membandingkan antara "Self Assessment" (apa yang dirasa karyawan) dengan "Supervisor Assessment" (apa yang dilihat atasan) untuk melihat kesenjangan persepsi.
