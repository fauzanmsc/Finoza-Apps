Berikut adalah **Product Requirement Document (PRD) Komprehensif Tingkat Profesional (PRO)** yang telah disempurnakan, diselesaikan, dan disusun secara sistematis. Dokumen ini dirancang khusus untuk tim teknis (developer, designer, QA) dan pengambil keputusan produk demi memastikan siklus pengembangan perangkat lunak berjalan lancar, terukur, dan aman.

---

# PRODUCT REQUIREMENT DOCUMENT (PRD)

## BRAND PRODUCT: Moniq (Money IQ) – Smart Personal Finance Companion
**Versi:** 1.0.0 | **Status:** Ready for Development | **Target Platform:** Progressive Web Application (PWA) / Responsive Web

---

## 1. STRUKTUR BRANDING & IDENTITAS VISUAL

### 1.1 Konsep Brand
*   **Nama Aplikasi:** Moniq (Kependekan dari *Money Intelligence Quotient*, dibaca: Mo-nik).
*   **Tagline:** *"Own your money, don't let it own you."*
*   **Persona:** Cerdas, minimalis, suportif, dan intuitif. Moniq bukan sekadar kalkulator mati, melainkan asisten finansial proaktif yang membantu pengguna mengelola uang dengan gaya hidup modern.

### 1.2 Panduan Desain & UI/UX (Design System)
*   **Tema Warna:**
    *   *Primary (Dark Mode Dominant):* Deep Slate Gray (`#121829`) – Memberikan kesan premium, tenang, cerdas, dan fokus tinggi pada visualisasi data finansial.
    *   *Secondary/Accent:* Emerald Green (`#10B981`) untuk tanda positif/pemasukan, Coral Red (`#EF4444`) untuk pengeluaran/peringatan, dan Bright Indigo (`#6366F1`) untuk elemen interaktif, tombol primer, & transfer.
*   **Tipografi:** `Inter` atau `Jakarta Plus Sans` (font modern, bersih, dengan tingkat keterbacaan tinggi di layar HP maupun Desktop).
*   **Ikonografi:** `Lucide Icons` atau `Phosphor Icons` (gaya garis tipis, minimalis, konsisten, dan relevan dengan topik keuangan).
*   **Interaksi & Animasi (Micro-interactions):**
    *   *Skeleton Loading:* UI abu-abu redup (*soft pulsing*) saat memuat database Google Sheets.
    *   *Smooth Transition:* Durasi transisi global `0.2s ease-in-out` untuk pergantian tab/menu.
    *   *FAB (Floating Action Button):* Memiliki animasi bounce/scale lembut ketika ditekan atau di-hover.

---

## 2. ARSITEKTUR SISTEM & ALIRAN INTEGRASI

Moniq dibangun dengan prinsip pemisahan total antara **Client Presentation Layer** dan **Database/API Engine Layer**. Kode sumber tersentralisasi di GitHub untuk memfasilitasi integrasi berkelanjutan (CI/CD).

```
[ Frontend PWA (Moniq Client) ]  <--- React / Vite / Tailwind CSS (Hosted on Vercel / Netlify)
            │
            ▼ (Secure API Request via HTTPS POST/GET with JWT-like Payload)
[ Google Apps Script (Web App Proxy / API Gateway) ]
            │ (Read / Write / Batch Operations / Drive API Integration)
            ▼
[ Google Sheets Database ] <--- (Tab-Tab Relasional / Multi-Sheet)
            │
            ▼ (Saves Receipt Images)
[ Google Drive Storage File ]
```

### Komponen Infrastruktur:
1.  **Frontend Client (Vercel/Netlify):** Kode React/TS + Vite + Tailwind CSS yang dideploy secara statis. Menangani proses caching PWA (*Service Workers*) agar responsif dan bisa diinstal di layar utama ponsel Android/iOS.
2.  **API Gateway / Middleware (Google Apps Script Web App):** Script terkompilasi yang berperan sebagai web server mikro untuk memproses panggilan REST API, memvalidasi enkripsi token sesi, melakukan kalkulasi beban kerja di sisi server, serta berinteraksi langsung dengan Spreadsheet dan Drive.
3.  **Database Storage (Google Sheets):** Berperan sebagai database relasional terstruktur dengan tabel-tabel terpisah yang saling terhubung menggunakan relasi ID unik (UUID).

---

## 3. SPESIFIKASI FITUR DETAIL (FUNCTIONAL REQUIREMENTS)

### F01. Sistem Registrasi & Login (Authentication)
*   **Deskripsi:** Membatasi akses aplikasi agar hanya pengguna yang terdaftar pada tabel user Spreadsheet yang dapat mengelola data keuangan mereka.
*   **Spesifikasi Teknis:**
    *   Autentikasi menggunakan komparasi password terenkripsi atau *Secure Email-Key* berbasis token sesi unik (`Moniq-Auth-Token`) yang ditaruh di `localStorage`.
    *   Menyediakan tombol "Coba Demo" di halaman login yang otomatis mengarahkan ke akun *test sandboxing* dengan isi data fiktif siap pakai tanpa registrasi.

### F02. Dashboard Keuangan (Main Hub)
*   **Deskripsi:** Visualisasi ringkas kondisi aset secara *real-time* saat membuka aplikasi.
*   **Komponen UI:**
    *   *Card Saldo Bersih:* Menampilkan total saldo akumulatif dari semua akun rekening aktif dalam format mata uang dinamis (misal: IDR/USD).
    *   *In/Out Cashflow Widget:* Menampilkan perbandingan total "Uang Masuk" vs "Uang Keluar" dalam periode bulan berjalan dengan visual bar horizontal.
    *   *Account Carousel:* Slideshow horizontal kartu-kartu dompet digital/rekening bank beserta logo dan sisa saldo masing-masing.
    *   *Quick Action Floating Button:* Tombol melayang cepat untuk langsung mengaktifkan modal Input Transaksi (Masuk, Keluar, Transfer).
    *   *Jatuh Tempo Card:* Peringatan tagihan hutang/piutang yang jatuh temponya kurang dari 5 hari.

### F03. Modul Catat Transaksi (Pemasukan & Pengeluaran - CRUD)
*   **Deskripsi:** Pintu utama pencatatan uang masuk dan keluar dari dompet keuangan user.
*   **Alur Kerja Form Input (CRUD):**
    *   **Create:** Membuka lembar geser bawah (*Bottom Sheet* di mobile, *Center Modal* di desktop). Kolom mencakup: Nominal (format ribuan otomatis saat mengetik), Tanggal (default: hari ini), Tipe (Masuk/Keluar), Pilihan Rekening, Kategori, Catatan Pendek, dan Lampiran Foto Nota.
    *   **Read:** Daftar transaksi harian (diklasifikasikan per tanggal) dengan fitur *Infinite Scroll* atau pagination per 20 transaksi.
    *   **Update & Delete:** Mengetuk baris transaksi membuka peninjau detail transaksi dengan opsi tombol "Edit" atau "Hapus" (dilengkapi dialog konfirmasi ganda).
*   **F21. Integrasi Arsip & Preview Foto Nota:**
    *   Dukungan kamera internal ponsel langsung dan unggahan galeri.
    *   Klien melakukan kompresi biner gambar menjadi base64 dengan format WebP mini sebelum dikirim ke Apps Script.
    *   Apps Script menyimpan berkas di Google Drive, mempublikasikan tautan akses, dan menyimpannya di kolom `attachment_url` pada Spreadsheet.
    *   Di UI Moniq, terdapat ikon klip kertas kecil; jika diklik, akan membuka modal preview gambar bawaan (*Image Lightbox*) dengan tombol hapus/ganti berkas.

### F04. Pindah Dana / Transfer Account (CRUD)
*   **Deskripsi:** Pencatatan perpindahan uang antar-rekening internal tanpa memengaruhi neraca pengeluaran/pemasukan bersih kumulatif.
*   **Spesifikasi UI & Logika:**
    *   Form input: Rekening Sumber (Debet) -> Rekening Tujuan (Kredit), Nominal, Biaya Admin (opsional), Tanggal, dan Catatan.
    *   *Database Logic:* Sistem akan mencatat baris transaksi bertipe `Transfer`, mengurangi saldo rekening asal, menambah rekening tujuan, dan memisahkan biaya admin ke dalam transaksi pengeluaran kategori "Biaya Admin & Transfer".

### F05. Manajemen Akun Rekening / Jenis Akun (CRUD)
*   **Deskripsi:** Pengelolaan dompet virtual tempat menyimpan uang (misal: Kas Tunai, Bank BCA, Mandiri, GoPay, Tokopedia, Reksa Dana).
*   **Spesifikasi:**
    *   Menampilkan daftar rekening aktif beserta jenisnya (Bank, E-Wallet, Cash, Investasi).
    *   Formulir Pembuatan Akun: Nama Akun, Jenis Akun, Saldo Awal, Kode Warna Kartu (Hex Code), dan Ikon Representatif.

### F06. Jurnal Transaksi Lengkap (Filter Dinamis & Buku Besar)
*   **Deskripsi:** Lembar kerja komprehensif untuk melacak dan mencari seluruh histori transaksi.
*   **Spesifikasi & Filter:**
    *   Menampilkan daftar transaksi menyerupai format buku besar akuntansi: Tanggal | Transaksi/Catatan | Kategori | Dari/Ke Akun | Debit (Pemasukan) | Kredit (Pengeluaran).
    *   *Filter Dinamis:*
        *   Berdasarkan Rentang Tanggal (Hari ini, 7 Hari Terakhir, Bulan Ini, Bulan Lalu, Kustom Kalender).
        *   Berdasarkan Kategori Multiselect.
        *   Berdasarkan Akun Rekening Multiselect.
    *   *Instant Search:* Pencarian langsung berlandaskan teks/karakter yang diketik pada kolom deskripsi/catatan transaksi.
    *   *Ekspor:* Tombol satu klik untuk mengekspor data yang terfilter ke format `.xlsx` (Excel) atau `.csv`.

### F07. Kategori Khusus Income & Expense (CRUD)
*   **Deskripsi:** Memberikan fleksibilitas bagi pengguna untuk membentuk sistem pengkategorian mereka sendiri.
*   **Spesifikasi:**
    *   Sistem pembagian kategori terpisah antara kelompok Kategori Pemasukan dan Kategori Pengeluaran.
    *   Setiap kategori wajib memiliki kustomisasi warna khusus dan pustaka ikon tersimpan (misal: ikon makanan, transportasi, hobi).

### F08. Perencanaan Anggaran Bulanan & Realisasi (Monthly Budget Plan)
*   **Deskripsi:** Fitur pengendali nafsu belanja (*envelope budgeting*).
*   **Spesifikasi:**
    *   *Budget Setting:* Pengguna menetapkan batas anggaran maksimal untuk tiap kategori pengeluaran di awal bulan (misal: Target Belanja Makanan = Rp2.000.000).
    *   *Halaman Realisasi:* Berisi grafik indikator visual (*progress bar*) interaktif yang membandingkan realisasi pengeluaran riil saat ini terhadap batas target anggaran bulanan.
    *   *Skema Warna Progress Bar:*
        *   Hijau: Pemakaian < 75% anggaran.
        *   Kuning: Pemakaian 75% - 94% anggaran.
        *   Merah: Pemakaian >= 95% (Kritis/Overbudget).
    *   *Chart Visual:* Grafik Donat (*Doughnut Chart*) porsi persentase alokasi tiap kategori pengeluaran dari total anggaran global.

### F09. Manajemen Hutang & Piutang (CRUD)
*   **Deskripsi:** Pelacakan komitmen finansial di luar transaksi harian reguler.
*   **Spesifikasi:**
    *   Tipe Relasi: "Hutang Saya" (Kewajiban bayar) dan "Piutang Saya" (Hak tagih).
    *   Metode CRUD: Nama Kontak/Debitur, Nilai Pokok Pinjaman, Tanggal Pinjam, Jatuh Tempo, Suku Bunga (opsional), Catatan, dan Status Keaktifan (Lunas / Belum Lunas).
    *   *Pembayaran Bertahap (Cicilan):* Pengguna dapat mengklik tombol "Bayar Cicilan" pada item hutang/piutang tertentu. Aksi ini secara otomatis merekam transaksi baru terkait pengeluaran/pemasukan di rekening terpilih dan mengurangi saldo buku hutang terkait secara proporsional.

### F10. Monthly Review (Data Analytics & Insights)
*   **Deskripsi:** Laporan analitikal otomatis di setiap pergantian siklus bulan.
*   **Spesifikasi Visual & Logika:**
    *   *Top 5 Expenses:* Grafik batang horizontal yang mengurutkan 5 kategori dengan konsumsi dana terbesar.
    *   *Trend Line Chart:* Grafik garis komparasi tren pengeluaran harian sepanjang bulan ini dibanding bulan lalu pada rentang tanggal yang sama.
    *   *Insight Generatif (AI/Logic-based):* Kotak boks opini rekomendasi. Contoh: *"Pengeluaran Anda untuk Transportasi naik sebesar 18% dari bulan lalu. Pertimbangkan untuk membatasi pemesanan ojek online pada minggu ini."*

### F11. Menu Pengaturan & Profil (F19, F20)
*   **Deskripsi:** Area kustomisasi identitas pengguna dan pengelolaan sistem internal aplikasi.
*   **Spesifikasi:**
    *   *Edit Profile:* Mengubah Nama Pengguna, Email Utama, dan Preferensi format mata uang default (IDR, USD, EUR, dsb).
    *   *Ubah Foto Profil:* Pengunggahan langsung foto dari galeri wajah pengguna, dipotong berbentuk bundar (*circular crop*), dan disimpan di sistem cloud dengan penyegaran instans di sisi dashboard/sidebar.
    *   *Theme Switcher:* Tombol geser beralih dari Mode Gelap secara manual atau mengikuti pengaturan modus bawaan sistem HP (*Device Native Theme*).
    *   *Reset Data Factory:* Sistem tombol keamanan tinggi bersyarat (pengguna harus mengetik kata "HAPUS DATA SAYA") untuk menghapus seluruh catatan transaksi di Spreadsheet namun tetap mempertahankan struktur kolom tabel dasar.

---

## 4. DESAIN SISTEM NON-FUNGSIONAL (NFR)

### 4.1 UI & Layout Responsif Adaptif
Aplikasi harus mendeteksi resolusi ukuran layar pengguna secara otomatis untuk mengubah tata letak antarmuka secara adaptif:

*   **Mode Desktop (Lebar Monitor > 1024px):**
    *   *Layout:* Tiga kolom penuh layar statis tanpa bar navigasi bawah.
    *   *Kolom Kiri:* Sidebar menu statis dengan menu profil pengguna di bagian paling bawah.
    *   *Kolom Tengah:* Konten kerja utama (Daftar transaksi, form isian, atau tabel jurnal lengkap).
    *   *Kolom Kanan:* Panel instan info saldo rekening, ringkasan grafik cepat, kartu daftar tugas jatuh tempo.
    *   *Form Interaction:* Berupa modal jandela melayang (*fixed center overlays*) dengan penutup bayangan redup di latar belakang (*backdrop blur*).
*   **Mode Mobile / PWA (Lebar Layar <= 1024px):**
    *   *Layout:* Menggunakan pola navigasi bar bawah (*Bottom Nav Bar*) statis untuk kemudahan jangkauan satu ibu jari.
    *   *Interactive Form:* Alih-alih modal mengambang, formulir isian akan muncul dari bawah (*Bottom Sheets Drawer*) dengan efek transisi gerak geser ke atas.
    *   *Gesture:* Mendukung sapuan jari (*Swipe left-right*) antar menu utama halaman dasbor.

### 4.2 Progressive Web Application (PWA) Requirements
*   **Instalasi Mandiri (A2HS):** PWA wajib menyediakan file `manifest.json` valid dengan ikon beresolusi `192x192` dan `512x512` piksel agar dapat diinstal di layar utama pengguna, menghasilkan penampakan tanpa bar pencarian browser (status bar menyatu/immersive).
*   **Service Workers Caching:** Wajib mengaktifkan *Workbox Service Worker* untuk melakukan caching file statis (HTML, CSS, JS, Fonts, Assets) di penyimpanan lokal, menjamin aplikasi tetap langsung terbuka meski koneksi internet tidak stabil (*Offline Capability* dasar).

### 4.3 Ketersediaan Visual & Penanganan Pemuatan (Loader)
*   Segala proses interaksi baca/tulis yang berkomunikasi dengan API Google Sheets wajib menyajikan visualisasi penunggu berupa skeleton loader untuk komponen kartu, silsilah daftar, dan indikator lingkaran putar (*Spinner Loading*) pada bagian tombol simpan guna mencegah insiden penekanan tombol ganda oleh konsumen (*double submit preventer*).

---

## 5. ARSITEKTUR DATABASE SPREADSHEET (GOOGLE SHEETS SCHEMA)

Satu file Google Spreadsheet bertindak sebagai basis data penampung. Spreadsheet wajib dipisahkan menjadi beberapa lembar (*sheet tab*) terstruktur sebagai berikut:

### 5.1 Sheet: `tb_users`
Menyimpan identitas rahasia data akun pengguna sistem Moniq.

| Nama Kolom | Tipe Data | Deskripsi / Constraint | Contoh Data |
| :--- | :--- | :--- | :--- |
| `user_id` | String/UUID | Primary Key (Unik) | `USR-820129` |
| `email` | String | Unik, Kunci Autentikasi | `budi@gmail.com` |
| `password_hash`| String | Enkripsi Sandi | `$2a$12$K3...` |
| `full_name` | String | Nama Profil | `Budi Setiawan` |
| `photo_url` | String | Link Foto Profil | `https://lh3.googleusercontent.com/...` |
| `currency` | String | Kode Mata Uang Default | `IDR` |
| `created_at` | DateTime | Penunjuk Waktu | `2023-10-12 12:00:00` |

### 5.2 Sheet: `tb_accounts`
Menyimpan klasifikasi akun keuangan / wadah kas saldo pengguna.

| Nama Kolom | Tipe Data | Deskripsi / Constraint | Contoh Data |
| :--- | :--- | :--- | :--- |
| `account_id` | String/UUID | Primary Key | `ACC-001` |
| `user_id` | String | Foreign Key -> `tb_users` | `USR-820129` |
| `account_name` | String | Nama Akun Dompet | `BCA Personal` |
| `account_type` | String | `Bank` / `E-Wallet` / `Cash` / `Investment` | `Bank` |
| `initial_balance`| Double | Saldo Pembuka Pertama | `5000000.00` |
| `color_hex` | String | Warna Desain Kartu | `#1E3A8A` |
| `icon_name` | String | Nama Ikon Lucide | `credit-card` |

### 5.3 Sheet: `tb_categories`
Daftar pengelompokkan jenis transaksi.

| Nama Kolom | Tipe Data | Deskripsi / Constraint | Contoh Data |
| :--- | :--- | :--- | :--- |
| `category_id` | String/UUID | Primary Key | `CAT-992` |
| `user_id` | String | Foreign Key -> `tb_users` | `USR-820129` |
| `category_type`| String | `Income` / `Expense` | `Expense` |
| `name` | String | Nama Kategori | `Makanan & Minuman` |
| `color_hex` | String | Warna Aksen Visual | `#E11D48` |
| `icon_name` | String | Nama Ikon Lucide | `utensils` |

### 5.4 Sheet: `tb_transactions`
Tempat merekam catatan aktivitas uang masuk, keluar, dan pemindahan dana.

| Nama Kolom | Tipe Data | Deskripsi / Constraint | Contoh Data |
| :--- | :--- | :--- | :--- |
| `transaction_id`| String/UUID | Primary Key | `TX-44012` |
| `user_id` | String | Foreign Key -> `tb_users` | `USR-820129` |
| `tx_date` | Date | Tanggal Transaksi terlaksana | `2023-10-15` |
| `tx_type` | String | `Income` / `Expense` / `Transfer` | `Expense` |
| `category_id` | String | Foreign Key -> `tb_categories` (bisa kosong jika Transfer) | `CAT-992` |
| `account_src_id`| String | Penarik Dana (Foreign Key -> `tb_accounts`) | `ACC-001` |
| `account_dst_id`| String | Penerima Dana (Khusus Transfer, Opsional) | `ACC-002` |
| `amount` | Double | Nominal Transaksi Riil | `150000.00` |
| `note` | String | Catatan Tambahan Penjelas | `Makan siang bersama klien` |
| `attachment_url`| String | Tautan Gambar Google Drive (Opsional) | `https://drive.google.com/uc?id=12aB...` |
| `created_at` | DateTime | Waktu Pembuatan | `2023-10-15 13:02:10` |

### 5.5 Sheet: `tb_budgets`
Merekam target dana anggaran bulanan.

| Nama Kolom | Tipe Data | Deskripsi / Constraint | Contoh Data |
| :--- | :--- | :--- | :--- |
| `budget_id` | String/UUID | Primary Key | `BGT-881` |
| `user_id` | String | Foreign Key -> `tb_users` | `USR-820129` |
| `category_id` | String | Foreign Key -> `tb_categories` | `CAT-992` |
| `monthly_limit`| Double | Batas Maksimum Belanja | `2000000.00` |
| `period_month` | String | Periode Anggaran format `YYYY-MM` | `2023-10` |

### 5.6 Sheet: `tb_debts`
Menyimpan kewajiban hutang dan hak penagihan piutang personal.

| Nama Kolom | Tipe Data | Deskripsi / Constraint | Contoh Data |
| :--- | :--- | :--- | :--- |
| `debt_id` | String/UUID | Primary Key | `DEB-501` |
| `user_id` | String | Foreign Key -> `tb_users` | `USR-820129` |
| `debt_type` | String | `Debt` (Hutang) / `Receivable` (Piutang) | `Debt` |
| `contact_name` | String | Nama Pihak Ketiga | `Ahmad Fauzi` |
| `amount_total` | Double | Nilai Awal Pinjaman | `1000000.00` |
| `amount_paid` | Double | Akumulasi Bayar Terbayarkan | `250000.00` |
| `due_date` | Date | Batas Waktu Pelunasan | `2023-11-30` |
| `status` | String | `Unpaid` / `Partially Paid` / `Paid` | `Partially Paid` |
| `notes` | String | Keterangan | `Pinjam dana darurat wisuda` |

---

## 6. PROTOKOL ROUTING API (GOOGLE APPS SCRIPT MIDDLEWARE)

Karena Google Apps Script (`doPost` & `doGet`) menangani seluruh operasi API, payload request dan response wajib diformat seragam menggunakan skema JSON berikut:

### 6.1 Desain Struktur Request General (Klien -> Apps Script)
Setiap permintaan mutasi wajib menggunakan metode **POST** dengan mengirimkan parameter identifikasi operasi (`action`) di dalam body request:

```json
{
  "action": "CREATE_TRANSACTION",
  "authToken": "AUTH-TOKEN-STRING-10293",
  "payload": {
    "tx_date": "2023-10-15",
    "tx_type": "Expense",
    "category_id": "CAT-992",
    "account_src_id": "ACC-001",
    "amount": 150000.00,
    "note": "Pembelian makan siang",
    "attachment_base64": "data:image/webp;base64,UklGR...",
    "attachment_name": "receipt_1510.webp"
  }
}
```

### 6.2 Desain Antarmuka Response General (Apps Script -> Klien)
Setiap aksi balik dari Apps Script wajib menghasilkan kode status terpadu:

```json
{
  "status": "success",
  "statusCode": 201,
  "message": "Transaction recorded successfully",
  "data": {
    "transaction_id": "TX-44012",
    "attachment_url": "https://drive.google.com/uc?id=12aB_X992_Z"
  }
}
```
*Jika terjadi kesalahan:*
```json
{
  "status": "error",
  "statusCode": 401,
  "message": "Token expired or invalid",
  "data": null
}
```

---

## 7. CORE USER FLOW (DIAGRAM ALIR PENGGUNA)

### 7.1 Alur Pencatatan Transaksi Baru + Upload Lampiran Nota
```
[User] -> Mengetik Data Form -> Klik Ambil Kamera -> Menyisipkan Foto Nota
                                                               │
                                                               ▼
[Moniq (Client)] -> Kompres / Resize Gambar menjadi WebP base64 (< 500 KB)
                                                               │
                                                               ▼
[Moniq (Client)] -> Mengirim Paket POST JSON payload ke Endpoint Google Apps Script
                                                               │
                                                               ▼
[Apps Script Web App] -> Memvalidasi `authToken` pada tabel `tb_users`
                                                               │ (Jika valid)
                                                               ▼
[Apps Script Web App] -> Mengunggah Base64 File ke Folder Google Drive yang ditentukan
                                                               │
                                                               ▼
[Apps Script Web App] -> Memperoleh tautan gambar publik google drive (`attachment_url`)
                                                               │
                                                               ▼
[Apps Script Web App] -> Menulis Baris Transaksi Baru di sheet `tb_transactions`
                                                               │
                                                               ▼
[Apps Script Web App] -> Memperbarui / Mengurangi saldo akhir di baris sheet `tb_accounts`
                                                               │
                                                               ▼
[Moniq (Client)] <- Mengembalikan Response Status Sukses OK (201)
                               │
                               ▼
[User] -> Dashboard ter-refresh secara instan, saldo langsung berkurang & nota bisa di-preview.
```

---

## 8. STRATEGI DEPLOYMENT & ALUR DEVOPS

Demi menjaga kualitas kode dan keamanan agar source code asli tidak langsung ditulis manual di editor web Google Apps Script, tim pengembang wajib menggunakan lingkungan modern berikut:

```
                  ┌───────────────────────┐
                  │   Lokal Developer     │ (React & Apps Script Code: JS/TS)
                  └───────────┬───────────┘
                              │ git push
                              ▼
                  ┌───────────────────────┐
                  │    GitHub Repository  │
                  └─────┬───────────┬─────┘
                        │           │
      Trigger CI/CD     │           │ Trigger Build Flow
      (Vercel Deploy)   │           │ (GitHub Action with CLASP)
                        ▼           ▼
       ┌───────────────────┐     ┌────────────────────────┐
       │   Vercel Hosting  │     │   Google Apps Script   │
       │ (Frontend Client) │     │ (Web App Executing API)│
       └───────────────────┘     └────────────────────────┘
```

1.  **Pengembangan Lokal:** Seluruh penulisan script frontend (React, Tailwind CSS) dan skrip backend (Google Apps Script API) dikerjakan di editor kode lokal (e.g., VS Code).
2.  **Manajemen Apps Script via CLASP:** Menggunakan kakas `@google/clasp` (Command Line Apps Script Projects) di terminal pengembang. Hal ini memungkinkan kode Google Apps Script dipisah ke beberapa file modular TypeScript/JavaScript di repo lokal dan dipush otomatis ke Cloud.
3.  **CI/CD Pipeline:**
    *   Setiap kali pengembang melakukan `git push` ke cabang `main` di GitHub, **Vercel** otomatis melakukan *build* ulang dan memperbarui berkas PWA statis di sisi klien secara instan.
    *   Langkah **GitHub Action** opsional dapat dikonfigurasi untuk memicu proses transfer otomatis (`clasp push`) guna menerbitkan revisi versi Apps Script API terbaru ke lingkungan *Production* (Web App Exec) secara mulus.