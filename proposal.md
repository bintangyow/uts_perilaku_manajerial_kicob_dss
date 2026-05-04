# PROPOSAL PENELITIAN: PENGEMBANGAN MODEL SISTEM INFORMASI PENDUKUNG KEPUTUSAN BERBASIS PERILAKU MANAJERIAL (BEHAVIORAL DSS) UNTUK OPTIMASI PEMBENTUKAN TIM PROYEK

## 1. Latar Belakang
*   **Peran penting sistem informasi**: Dalam era digital, sistem informasi menjadi tulang punggung pengambilan keputusan manajerial yang cepat dan akurat.
*   **Keterbatasan aplikasi saat ini**: 
    *   Kebanyakan sistem (seperti Applicant Tracking System) hanya berbasis pada data numerik atau statistik kaku (seperti nilai IPK atau sertifikasi).
    *   Sistem tersebut cenderung mengabaikan aspek perilaku manusia (soft factors) yang sebenarnya menentukan keberhasilan sebuah tim.
*   **Kompleksitas perilaku manajerial**: Pengambilan keputusan seringkali terganggu oleh bias kognitif, faktor emosional, dan subjektivitas pengalaman manajer.
*   **Kesenjangan penelitian**: Masih minim aplikasi yang secara teknis mengintegrasikan feedback perilaku 360-derajat ke dalam algoritma rekomendasi tim otomatis.
*   **Urgensi**: Dibutuhkan aplikasi seperti **KiCob (Kinerja Collab)** yang mampu menguantifikasi perilaku menjadi data objektif untuk mendukung keputusan manajerial.

## 2. Rumusan Masalah
*   Bagaimana merancang model aplikasi sistem informasi yang mampu mengintegrasikan variabel perilaku manajerial (soft factors) ke dalam proses seleksi tim?
*   Variabel perilaku apa saja (seperti stabilitas emosional, komunikasi, kerjasama) yang dapat dimodelkan secara matematis dalam aplikasi?
*   Bagaimana integrasi data perilaku ini dapat meningkatkan kualitas dan objektivitas pengambilan keputusan dibanding metode konvensional?

## 3. Tujuan Penelitian
*   Mengembangkan model konseptual aplikasi Sistem Informasi Perilaku Manajerial yang mengintegrasikan data hard skill dan soft skill.
*   Mendesain arsitektur aplikasi berbasis web (menggunakan Next.js dan Drizzle ORM) yang mendukung pengolahan data perilaku secara real-time.
*   Menganalisis hubungan antara pembobotan perilaku (Self, Peer, Supervisor) terhadap akurasi rekomendasi tim yang dihasilkan.

## 4. Manfaat Penelitian
### a. Manfaat Teoritis
*   Memberikan kontribusi pada pengembangan ilmu Sistem Informasi Berbasis Perilaku (*Behavioral Information Systems*).
*   Memperkuat teori integrasi antara teknologi informasi dan perilaku organisasi dalam konteks manajemen SDM.
### b. Manfaat Metodologis
*   Menciptakan model aplikasi inovatif yang menggabungkan metode *Weighted Average* dan *Decision Support System* (DSS).
### c. Manfaat Praktis
*   Menjadi dasar bagi perusahaan untuk mengembangkan alat bantu nyata dalam mengelola tim proyek secara lebih efektif dan minim bias.

## 5. Batasan Penelitian
*   Fokus pada model dan desain arsitektur aplikasi (KiCob Framework).
*   Validasi dilakukan secara simulatif menggunakan data penilaian perilaku (360-degree feedback).
*   Penelitian tidak mencakup pengembangan infrastruktur server berskala besar (hanya fokus pada fungsionalitas sistem).

## 6. Tinjauan Pustaka
*   **Sistem Informasi**: Arsitektur aplikasi modern berbasis web dan integrasi database relasional.
*   **Perilaku Manajerial**: Fokus pada faktor Kognitif, Emosional, dan Sosial karyawan yang diukur melalui standar penilaian perilaku.
*   **Teori Pendukung**: 
    *   *Decision Support System* (DSS): Penggunaan algoritma untuk membantu pemilihan alternatif terbaik.
    *   *Human-Computer Interaction* (HCI): Fokus pada dashboard rekomendasi yang mudah diinterpretasikan oleh manajer.
    *   *Behavioral Decision Theory*: Teori pengambilan keputusan yang memperhitungkan perilaku manusia.

## 7. Kerangka Konseptual
**Model Hubungan Variabel:**
*   **Input**: 
    *   Data Hard Skill (Keahlian teknis).
    *   Faktor Perilaku (Emosional, Komunikasi, Kerja Tim, Adaptabilitas) melalui feedback 360 derajat.
*   **Proses**: 
    *   Analisis pembobotan (Supervisor 50%, Peer 30%, Self 20%).
    *   Integrasi data melalui DSS Engine (Algoritma Penormalan Skor).
*   **Output**: 
    *   Dashboard Rekomendasi Tim (Ranking Alternatif).
    *   Analisis Radar Chart untuk visualisasi kekuatan perilaku tim.

## 8. Metodologi Penelitian
*   **Jenis Penelitian**: Penelitian Pengembangan (*Research & Development*) dengan pendekatan desain sistem.
*   **Tahapan**:
    1.  Identifikasi gap pada sistem manajemen tim konvensional.
    2.  Identifikasi variabel perilaku utama (Soft Factors).
    3.  Perancangan model sistem (Logic Flow).
    4.  Desain arsitektur aplikasi (Next.js, Tailwind, Drizzle).
    5.  Simulasi dan validasi melalui testing skenario kasus proyek.
*   **Teknik Analisis**: Pemodelan sistem menggunakan diagram UML (Use Case, Sequence) dan analisis data hasil simulasi rekomendasi.

## 9. Desain Arsitektur Aplikasi (Konseptual KiCob)
*   **Layer Sistem**:
    *   **User Interface (UI)**: Dashboard interaktif berbasis *Glassmorphism* untuk kemudahan pemantauan.
    *   **Processing Layer**: Logic API Route yang menangani perhitungan skor tertimbang (Weighted Scoring).
    *   **Database Layer**: Supabase/PostgreSQL untuk penyimpanan data karyawan dan riwayat keputusan.
*   **Fitur Utama**:
    *   Form Penilaian 360-derajat.
    *   Algoritma "Generate Recommendation".
    *   Visualisasi Radar Chart untuk perbandingan profil perilaku.

## 10. Kebaruan Penelitian (Novelty)
*   Implementasi bobot dinamis pada penilaian perilaku (Weighted 360 Feedback) yang terintegrasi langsung dengan Decision Support System pemilihan tim proyek.
*   Penggunaan desain modern (*Glassmorphism*) pada sistem informasi manajerial untuk meningkatkan engagement pengguna dalam menganalisis data kognitif.

## 11. Luaran Penelitian
*   Dokumen Model Konseptual Sistem Informasi Perilaku.
*   Prototype Aplikasi "KiCob" (Kinerja Collab) yang fungsional.
*   Desain Arsitektur Sistem Terintegrasi.
