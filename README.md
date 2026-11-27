# Aku Mw Magang — War Room & Job Application Matcher
> **Tugas Praktikum Pemrograman Web 2026 (Modul 5)**  
> **Kelompok: P11**  
> **Repositori:** `pweb-react-p11-2026`  
> **Form Pengumpulan:** [https://its.id/m/SubmitPemweb2026](https://its.id/m/SubmitPemweb2026)

---

##  Ringkasan Aplikasi
**"Aku Mw Magang"** adalah aplikasi web manajemen pelacakan lamaran kerja dan pencocokan lowongan magang (job tracking & matching platform) yang dirancang khusus untuk memandu mahasiswa (Kapten) mulai dari eksplorasi lowongan, verifikasi kecocokan skill, pelacakan ketat tahapan seleksi (state machine), simulasi ghosting, pendeteksian jadwal interview bentrok, hingga komparasi penawaran magang (offer) berbobot secara objektif.

Aplikasi dibangun menggunakan **React 19** dan **TypeScript** dengan strict mode (`strict: true`, tanpa tipe `any`), serta mematuhi aturan ketat **tanpa library state management eksternal** (tanpa Redux, Zustand, TanStack Query) dan **tanpa form library eksternal** (tanpa React Hook Form, Formik). Seluruh logika dibangun menggunakan React Hooks bawaan dan Custom Hooks buatan sendiri.

---

##  Tech Stack & Aturan
- **Frontend Framework:** React 19 (`react` & `react-dom` 19.x)
- **Language:** TypeScript 5.6+ (`strict: true`, `noImplicitAny: true`, tanpa `any`)
- **Build Tool:** Vite 6.x (Template `react-ts`)
- **Styling:** Tailwind CSS v4 + CSS Modern
- **Icons:** SVG Icon System mandiri (zero-dependency, bebas galat jaringan)
- **State & Form Management:** React Hooks bawaan (`useState`, `useEffect`, `useRef`, `useCallback`, `useMemo`) + 2 Custom Hooks wajib (`useLocalStorage<T>`, `useDebounce<T>`)

---

##  Struktur Folder Proyek
```text
pweb-react-p11-2026/
├── public/
│   └── magang-fallback.json        # 15 lowongan magang tech Indonesia (format Remotive)
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.tsx          # Navigasi tab, dark mode toggle, backup/restore
│   │   │   ├── Icons.tsx           # Komponen SVG icon modular mandiri
│   │   │   └── UndoToast.tsx       # Toast 5 detik dengan countdown & pembatalan useRef
│   │   ├── dashboard/
│   │   │   ├── ConflictBanner.tsx  # Banner peringatan bentrok jadwal interview (< 60 menit)
│   │   │   └── StatCards.tsx       # 5 kartu statistik derived state
│   │   ├── jobs/
│   │   │   ├── JobExplorer.tsx     # Katalog lowongan, search debounce, filter & sort
│   │   │   └── KaptenSkillProfile.tsx # Profil skill Kapten & toggle sumber data
│   │   ├── pipeline/
│   │   │   ├── AddApplicationModal.tsx # Form manual terkontrol + auto-focus useRef
│   │   │   ├── ApplicationDetailModal.tsx # State machine, nested checklist, log & prep
│   │   │   └── WarRoomPipeline.tsx # Daftar lamaran, filter status, simulasi +15 hari
│   │   ├── comparator/
│   │   │   └── OfferComparatorView.tsx # Komparator berbobot penawaran magang (A vs B)
│   │   └── interview/
│   │       └── InterviewPrepSection.tsx # Countdown timer 02:00 & 5 soal IT interview
│   ├── hooks/
│   │   ├── useDebounce.ts          # Custom Hook debounce generik (400ms)
│   │   └── useLocalStorage.ts      # Custom Hook persistensi localStorage dengan sinkronisasi
│   ├── services/
│   │   └── jobService.ts           # Service fetch data (Remotive Live API + Fallback Lokal)
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces & types lengkap (tanpa any)
│   ├── utils/
│   │   ├── formatters.ts           # Format mata uang Rupiah & datetime Indonesia
│   │   ├── ghosting.ts             # Logika deteksi rawan ghosting (> 14 hari)
│   │   ├── initialData.ts          # Dataset awal demo (12 lamaran & skill bawaan Kapten)
│   │   ├── interviewConflict.ts    # Algoritma deteksi bentrok jadwal interview (< 60 menit)
│   │   ├── offerComparator.ts      # Perhitungan skor berbobot komparator offer
│   │   ├── skillMatch.ts           # Rumus perhitungan live skill match & badge color tier
│   │   └── stateMachine.ts         # Aturan transisi ketat & validasi form state machine
│   ├── App.tsx                     # State utama, orkestrasi hooks & views
│   ├── index.css                   # Tailwind v4 import & custom styling
│   └── main.tsx                    # Entry point React 19
├── index.html                      # Template HTML5
├── package.json                    # Metadata proyek & script perintah
├── tsconfig.json                   # Konfigurasi TypeScript strict
└── vite.config.ts                  # Konfigurasi bundler Vite
```

---

##  7 Spesifikasi Fitur Utama & Implementasinya

### 1. Profil Skill Kapten & Eksplorasi Lowongan
- **Profil Skill:** Kapten dapat menambah skill baru dan menghapus skill (default awal: React, TypeScript, CSS, Git, REST API). Dilengkapi validasi penolakan skill duplikat (case-insensitive) dan tersimpan di `localStorage`.
- **Fetch Data Asinkron:** Mengambil lowongan dari Remotive API menggunakan `useEffect` + `fetch()` + `AbortController` untuk mencegah race-condition/memory leak. Terdapat penanganan lengkap: Loading State (skeleton), Error State (pesan informatif + tombol Coba Lagi & Fallback Lokal), dan Empty State.
- **Search Debounce & Filter:** Pencarian posisi/perusahaan ditenagai custom hook `useDebounce(keyword, 400)`. Didukung filter kategori lowongan dan opsi pengurutan (Match Tertinggi, Match Terendah, Perusahaan A-Z).
- **Badge & Aksi:** Match Score % dihitung live (`hijau >= 70%`, `kuning 40–69%`, `merah < 40%`), chip pemisah skill cocok vs missing skills, serta tombol "Simpan ke Wishlist" yang otomatis ter-disable ("Sudah Dilamar") jika posisi tersebut sudah ada di daftar lamaran.

### 2. Form Tambah Lamaran Manual
- Form terkontrol penuh (`value` + `onChange`).
- Input: Perusahaan, Posisi/Role, Mode Kerja (Remote / Hybrid / Onsite), Status Awal (WISHLIST / APPLIED), dan Required Skills (dipisahkan koma).
- Jika status awal dipilih `APPLIED`, input versi CV (`cvVersion`) dan tanggal melamar (`appliedDate`) otomatis muncul dan wajib diisi.
- **Validasi & Auto-Focus (`useRef`):** Menolak input kosong dan mendeteksi duplikat pasangan `company + role` (case-insensitive). Jika submit gagal, kursor otomatis berpindah fokus ke elemen input pertama yang mengalami galat menggunakan `useRef`.

### 3. War Room Pipeline, Ghosting & Bentrok Jadwal
- Tampilan kartu lamaran komprehensif: Company, Role, Status, Versi CV, Jadwal Interview, Progress Checklist, dan Skill Match %.
- Filter gabungan: Pencarian teks, filter status lamaran, toggle "Hanya Rawan Ghosting", dan sorting (Terbaru, Jadwal Interview Terdekat, Offer Tertinggi).
- **Simulasi +15 Hari:** Tombol `+15 Hari` pada kartu lamaran berstatus APPLIED dan SCREENING untuk memundurkan `lastUpdatedAt` sebanyak 15 hari ke belakang agar badge "Rawan Ghosting (> 14 hari)" dan kenaikan kartu statistik dapat langsung diuji saat demo.
- **Banner Bentrok Jadwal:** Jika terdapat 2 atau lebih lamaran berstatus INTERVIEW dengan selisih jadwal < 60 menit, banner peringatan menyala di bagian paling atas halaman dan tetap tampil meskipun filter sedang aktif.

### 4. Detail Lamaran: State Machine, Checklist & Activity Log
- **State Machine Ketat:** Status hanya boleh berpindah sesuai arah panah:
  - `WISHLIST ➔ APPLIED`
  - `APPLIED ➔ SCREENING | REJECTED | GHOSTED`
  - `SCREENING ➔ INTERVIEW | REJECTED | GHOSTED`
  - `INTERVIEW ➔ OFFER | REJECTED | GHOSTED`
  - `GHOSTED ➔ SCREENING | REJECTED` (khusus GHOSTED diizinkan kembali ke SCREENING)
  - `OFFER` & `REJECTED` bersifat final (tidak ada transisi lanjutan).
- Input kondisional saat transisi:
  - Pindah ke `APPLIED`: wajib melengkapi `cvVersion` & `appliedDate`.
  - Pindah ke `INTERVIEW`: wajib melengkapi `interviewDateTime`.
  - Pindah ke `OFFER`: wajib melengkapi `salaryOffer > 0` & `workMode`.
- **Nested Checklist:** Menambah, mencentang selesai, dan menghapus tugas persiapan per lamaran lengkap dengan visual progress bar ($X/Y$ selesai). Seluruh mutasi state ditulis secara **immutable** murni (memakai `map`, `filter`, dan spread operator; dilarang `.push()` atau mutasi langsung).
- **Activity Log:** Mencatat otomatis setiap tanggal pembuatan lamaran dan pergantian status ke riwayat, ditambah fitur input catatan manual Kapten.

### 5. Interview Prep Timer
- Tab latihan interview di dalam modal detail lamaran menyediakan 5 pertanyaan wawancara teknis magang IT.
- Countdown Timer 02:00 per soal dengan tombol Mulai/Jeda, Reset (kembali ke 02:00), dan Soal Berikutnya (otomatis reset ke 02:00).
- **Wajib Cleanup:** Menggunakan `useEffect` dengan fungsi pembersih `return () => clearInterval(...)` sehingga interval timer berhenti bersih saat modal ditutup (unmount) dan tidak berakselerasi saat modal dibuka kembali.

### 6. Undo Delete (5 Detik) & Persistensi Local Storage
- Saat lamaran dihapus, muncul Toast Undo selama 5 detik di sudut kanan bawah.
- Jika tombol Undo ditekan dalam 5 detik, lamaran dikembalikan utuh ke posisinya semula beserta seluruh checklist dan log aktivitasnya.
- **Timer dengan `useRef`:** ID timeout disimpan di `useRef` (`undoTimeoutRef.current`). Jika user menghapus 2 lamaran berturut-turut dalam kurun < 5 detik, timer lama dibatalkan menggunakan `clearTimeout` sehingga tidak terjadi tumpang tindih state.
- **Persistensi Penuh:** State `applications` dan `kaptenSkills` disimpan menggunakan custom hook `useLocalStorage<T>` sehingga data tidak hilang saat browser di-refresh.

### 7. Dashboard Statistik & Offer Comparator
- **5 Kartu Statistik (Derived State):**
  1. *Total Lamaran* (jumlah seluruh data)
  2. *Response Rate %* ($\frac{\text{Diproses}}{\text{Total}} \times 100\%$, status bukan WISHLIST)
  3. *Interview Rate %* ($\frac{\text{Interview + Offer}}{\text{Total}} \times 100\%$)
  4. *Rawan Ghosting* (lamaran APPLIED/SCREENING tidak ter-update > 14 hari)
  5. *Total Offer* (jumlah status OFFER)
  *(Seluruh nilai dihitung langsung sebagai derived state tanpa `useState` terpisah)*.
- **Offer Comparator Objektif:**
  - Jika lamaran berstatus OFFER < 2: menampilkan pesan edukatif dan panduan cara menguji fitur.
  - Jika OFFER $\ge 2$: Kapten dapat memilih Offer A dan Offer B untuk membandingkan:
    - **Uang Saku / Bulan (Bobot 50%):** $\frac{\text{Gaji}}{\text{Max Gaji}} \times 50$
    - **Mode Kerja (Bobot 25%):** Remote = $100 \times 25\% = 25.0$, Hybrid = $75 \times 25\% = 18.8$, Onsite = $50 \times 25\% = 12.5$
    - **Kecocokan Skill (Bobot 25%):** $\text{Skill Match \%} \times 25\%$
    - **Total Skor Berbobot:** Jumlah ketiga komponen (skor maksimal 100).
    - Badge **"Rekomendasi Terbaik"** disematkan otomatis pada penawaran dengan skor tertinggi.

---

##  Nilai Tambahan (Bonus Features)
1. **Dark Mode:** Toggle tema Gelap / Terang di header yang tersimpan di `localStorage` melalui hook `useLocalStorage`.
2. **Export & Import JSON Backup:** Tombol download backup seluruh lamaran & skill ke file `.json`, serta upload file JSON untuk restore data instan.
3. **Keyboard Shortcut:** Tekan tombol `/` pada keyboard dari mana saja untuk langsung memfokuskan kursor ke search bar pencarian lowongan melalui `useRef`.
4. **Tombol Reset / Muat Ulang Data Contoh:** Memudahkan asisten saat pengujian demo untuk mengembalikan state ke data awal demo hanya dengan 1 klik.

---

##  Tabel Verifikasi 10 Skenario Testcase

| No | Skenario | Langkah Pengujian | Hasil yang Diharapkan | Status |
|:--:|:---|:---|:---|:---:|
| **1** | **Fetch & Offline Error** | Buka tab Lowongan. Buka DevTools ➔ Network: *Offline*, lalu klik tombol *Coba Lagi* atau toggle sumber data. | Muncul indikator Loading, disusul pesan error informatif serta tombol *Coba Lagi* dan *Gunakan Fallback Lokal*. |  Lolos |
| **2** | **Skill Match Live** | Tambahkan skill baru `Docker` pada box *Profil Skill Kapten*. | Persentase Match pada seluruh lowongan yang mensyaratkan Docker (misal: DevOps & Cloud Infrastructure) langsung naik secara real-time. |  Lolos |
| **3** | **Debounce Search** | Ketik cepat nama posisi atau perusahaan di input pencarian. | State pencarian tidak memicu re-filter seketika di setiap ketikan, melainkan menunggu jeda ~400ms setelah pengetikan berhenti. |  Lolos |
| **4** | **Anti-Duplikat & Focus** | Simpan lowongan yang sudah ada atau ketik company + role yang sama di Form Manual lalu klik submit. | Pada lowongan katalog, tombol disabled bertuliskan "Sudah Dilamar". Pada form manual, ditolak dengan pesan error dan kursor otomatis auto-focus ke input company via `useRef`. |  Lolos |
| **5** | **State Machine** | Buka detail lamaran WISHLIST, coba alihkan status langsung ke OFFER (tidak ada opsi). Pindahkan bertahap ke APPLIED ➔ SCREENING ➔ INTERVIEW. | Hanya tombol status yang valid yang muncul. Saat memilih APPLIED wajib isi CV & tanggal; saat INTERVIEW wajib isi jadwal wawancara. |  Lolos |
| **6** | **Simulasi Ghosting** | Klik tombol `+15 Hari` pada salah satu lamaran APPLIED atau SCREENING di War Room Pipeline. | Nilai `lastUpdatedAt` mundur 15 hari, badge "Rawan Ghosting (> 14 hari)" langsung aktif menyala, dan angka pada kartu statistik bertambah 1. |  Lolos |
| **7** | **Bentrok Interview** | Ubah status 2 lamaran menjadi INTERVIEW dengan selisih jam jadwal < 60 menit (misal: 10:00 dan 10:30). | Banner Peringatan Bentrok muncul di bagian atas halaman dengan rincian kedua perusahaan dan selisih menitnya. Banner tetap tampil meski filter status lain dipilih. |  Lolos |
| **8** | **Checklist & Refresh** | Buka detail lamaran, tambah 2 tugas persiapan, centang 1 tugas, lalu tekan refresh halaman (F5). | Seluruh data checklist, status centang, dan progress bar $X/Y$ tetap tersimpan utuh berkat custom hook `useLocalStorage`. |  Lolos |
| **9** | **Timer Cleanup** | Buka Latihan Interview, klik Mulai timer 02:00, lalu tutup modal sebelum waktu habis dan buka kembali. | Tidak ada error kebocoran memori pada console browser, dan detik timer berjalan normal (tidak bergerak 2x lebih cepat). |  Lolos |
| **10** | **Undo & Comparator** | Hapus 1 lamaran, lalu klik tombol *Undo* pada Toast dalam kurun < 5 detik. Setelah itu pastikan minimal ada 2 lamaran berstatus OFFER dan buka tab *Bandingkan Offer*. | Lamaran kembali utuh ke pipeline saat Undo diklik. Pada tab komparator, skor normalisasi gaji, mode kerja, dan skill match dihitung akurat dengan penanda "Rekomendasi Terbaik". |  Lolos |

---

##  Cara Menjalankan Aplikasi

### 1. Prasyarat
Pastikan komputer telah terinstal Node.js (versi 18+ disarankan).

### 2. Jalankan Mode Development
```bash
npm run dev
```
Aplikasi akan aktif di `http://localhost:5173`.

### 3. Pengecekan Type-Check & Build
Pastikan kedua perintah berikut lolos tanpa galat (zero error):
```bash
# 1. Type Check strict TypeScript
npx tsc --noEmit

# 2. Production Build
npm run build
```
