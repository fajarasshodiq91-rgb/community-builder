# Testing Guide — Community Builder

Panduan praktis untuk menguji aplikasi **Community Builder** secara lokal maupun live di server Discord dalam beberapa hari ke depan.

---

## 1. Menjalankan Aplikasi Secara Lokal

1. **Clone & Install Dependensi:**
   ```bash
   git clone https://github.com/fajarasshodiq91-rgb/community-builder.git
   cd community-builder
   npm install
   ```

2. **Jalankan Development Server:**
   ```bash
   npm run dev
   ```
   Buka browser di `http://localhost:3000`.

3. **Jalankan Automated Tests:**
   ```bash
   npm test
   npm run typecheck
   npm run lint
   ```

---

## 2. Dua Mode Pengujian

### Mode A: Safe Simulator Mode (Tanpa Setup Bot — Langsung Bisa Dicoba!)
Kamu tidak perlu memasukkan token apa pun. Cukup jalankan wizard konsultasi, review rekomendasi, modifikasi denah blueprint, dan tekan tombol **Execute Approved Plan**.
- Simulator akan mengecek collision secara virtual.
- Menghasilkan **Audit Log** lengkap detik per detik.
- Menjamin kepatuhan prinsip *Zero Deletions* dan *Idempotency*.

### Mode B: Live Discord Mode (Bikin Kamar Beneran di Server Discord!)
Hanya butuh 3 menit setup:
1. Buka [Discord Developer Portal](https://discord.com/developers/applications).
2. Klik **New Application** (beri nama misal: `Community Builder Test`).
3. Masuk ke menu **Bot** (di sidebar kiri):
   - Klik **Reset Token**, lalu salin Token Bot kamu.
4. Masuk ke menu **OAuth2 → URL Generator**:
   - Di bagian **Scopes**: centang `bot`.
   - Di bagian **Bot Permissions**: centang `Manage Channels`, `Manage Roles`, `View Channels`.
   - Salin link yang dihasilkan di bawah, buka di browser, lalu invite bot ke Server Discord pengujian kamu.
5. Dapatkan **Server ID**:
   - Di Discord, buka *Settings → Advanced → Enable Developer Mode*.
   - Klik kanan nama Server Discord kamu → pilih **Copy Server ID**.
6. **Mulai Testing:**
   - Masukkan Server ID dan Bot Token di layar eksekusi, lalu klik **Execute Approved Plan**.
   - Buka Discord kamu dan lihat kategori, kanal, serta peran (*roles*) langsung terbuat secara otomatis!

---

## 3. Skenario Pengujian yang Disarankan

### Skenario 1: Kreator Hobi / Gaming (Chat Cepat, $0 Budget)
- **Niche:** Gaming / Tech.
- **Audience:** <500 (Just Starting).
- **Goal:** Casual Hangout & Social Hub.
- **Access:** Open Public.
- **Interaction:** Active Real-Time Chat.
- **Moderation:** Solo Moderate (1-3 jam/minggu).
- **Budget:** $0 Free Only.
- **Hasil yang Diharapkan:** Rekomendasi Discord 90%+, denah kanal simpel tanpa paywall/gerbang ribet.

### Skenario 2: Kreator Kursus / Komunitas Berbayar (VIP Gated)
- **Niche:** Education & Mentorship.
- **Audience:** 5,000 - 25,000 (Growing).
- **Goal:** Exclusive Inner Circle / VIP.
- **Access:** Gated Access (Course / Sub) + Require Onboarding Verification.
- **Interaction:** Focused Asynchronous Topics.
- **Moderation:** Team Moderated.
- **Budget:** Standard ($30-$100/mo) + Freemium / Paid Membership.
- **Hasil yang Diharapkan:** Muncul kanal `#landing-gate`, forum diskusi terstruktur, peran *Inner Circle VIP*, dan panduan onboarding berlapis.

### Skenario 3: Uji Coba Auto-Save Draft
1. Mulai isi kuesioner sampai Step 4.
2. Tutup tab browser atau refresh halaman.
3. Buka kembali `http://localhost:3000/onboarding`.
4. Perhatikan notifikasi draft dipulihkan otomatis dari browser `localStorage`.

### Skenario 4: Uji Coba Idempotency (Anti-Duplikat)
1. Jalankan eksekusi blueprint pada server Discord.
2. Jalankan eksekusi kedua kalinya pada server yang sama.
3. Periksa Audit Log: kanal yang sudah ada otomatis diberi status `skipped`, sehingga **tidak terjadi pembuatan kanal ganda**.
