// OTR — Page: Register (Phase 13 — Authentication, Roadmap Phase 13, Master Spec §47)
// Email + Password (+ display name opsional, disimpan lewat auth metadata ->
// trigger handle_new_user() Phase 12 yang auto-insert baris profiles).
// Plus Google OAuth (lihat catatan §47 "Future" di login.js/auth-service.js
// -- sama-sama berlaku di sini). Google skip alur "Confirm email" di bawah
// sepenuhnya (Supabase treat email dari Google sebagai sudah terverifikasi),
// jadi selalu dapat session langsung.
//
// Supabase project bisa dikonfigurasi wajib konfirmasi email atau tidak
// ("Confirm email" toggle di Dashboard) -- signUp() mengembalikan session
// langsung HANYA kalau konfirmasi email dimatikan. Halaman ini menangani
// dua-duanya:
//   - Ada session langsung -> anggap user sudah login, jalankan Guest
//     Migration seperti login.js, navigasi ke Home.
//   - Tidak ada session -> tampilkan pesan "cek email", JANGAN migrasi
//     (belum authenticated), user migrasi nanti otomatis saat login.js
//     dipanggil pertama kali setelah konfirmasi.

import { signUpWithEmail, signInWithGoogle } from "../services/auth-service.js";
import { migrateGuestDataToCloud } from "../services/migration-service.js";
// Phase 14 — Cloud Sync: lihat komentar yang sama di login.js. Untuk akun
// baru, syncFromCloud() akan mengambil jalur "belum ada baris cloud" --
// meng-upload cache lokal (settings default/guest) sebagai titik awal.
import { syncFromCloud, applyMotionPreference } from "../services/settings-service.js";
import { setState } from "../core/state.js";
import { navigate } from "../router.js";
import { showToast } from "../components/toast.js";
import { listGuestReadings } from "../core/storage.js";
import { googleIcon } from "../components/icons.js";

function focusHeading(container) {
  const heading = container.querySelector("h1, h2");
  if (heading) {
    heading.setAttribute("tabindex", "-1");
    heading.focus();
  }
}

function mapAuthError(error) {
  const msg = error?.message ?? "";
  if (/already registered|already exists/i.test(msg)) return "Email ini sudah terdaftar. Coba masuk saja.";
  if (/password.*(least|characters)/i.test(msg)) return "Kata sandi terlalu pendek (minimal 6 karakter).";
  return msg || "Gagal mendaftar. Coba lagi.";
}

const fieldStyle = "font-family:var(--font-body); font-size:var(--fs-base); padding:var(--space-3) var(--space-4);";

function template() {
  const guestCount = listGuestReadings().length;
  return `
    <section class="stack gap-5" style="max-width:44ch; margin-inline:auto;">
      <div>
        <p class="eyebrow">Akun</p>
        <h1 class="font-display">Buat Akun</h1>
        ${
          guestCount > 0
            ? `<p class="text-sm text-muted">Kamu punya ${guestCount} reading tersimpan sebagai tamu di perangkat ini — daftar untuk memindahkannya ke akunmu.</p>`
            : ""
        }
      </div>

      <div class="stack gap-4">
        <button type="button" class="btn btn--secondary btn--full row gap-2" style="justify-content:center; align-items:center;" data-google-btn>
          ${googleIcon(18)} Daftar dengan Google
        </button>
        <div class="row gap-3" style="align-items:center;">
          <span style="flex:1; height:1px; background:var(--otr-gold-dim);"></span>
          <span class="text-sm text-muted">atau</span>
          <span style="flex:1; height:1px; background:var(--otr-gold-dim);"></span>
        </div>
      </div>

      <form class="stack gap-4" data-register-form novalidate>
        <label class="stack gap-2">
          <span class="text-sm">Nama Tampilan <span class="text-muted">(opsional)</span></span>
          <input type="text" name="displayName" autocomplete="nickname" class="card" style="${fieldStyle}" />
        </label>
        <label class="stack gap-2">
          <span class="text-sm">Email</span>
          <input type="email" name="email" required autocomplete="email" class="card" style="${fieldStyle}" />
        </label>
        <label class="stack gap-2">
          <span class="text-sm">Kata Sandi</span>
          <input type="password" name="password" required minlength="6" autocomplete="new-password" class="card" style="${fieldStyle}" />
        </label>
        <label class="stack gap-2">
          <span class="text-sm">Ulangi Kata Sandi</span>
          <input type="password" name="confirmPassword" required minlength="6" autocomplete="new-password" class="card" style="${fieldStyle}" />
        </label>

        <p class="text-sm" data-register-error style="color:var(--otr-danger); display:none;" role="alert"></p>
        <p class="text-sm" data-register-success style="color:var(--otr-success); display:none;"></p>

        <button type="submit" class="btn btn--primary btn--full" data-register-submit>Daftar</button>
      </form>

      <p class="text-sm text-muted" style="text-align:center;">
        Sudah punya akun? <a href="#/login">Masuk</a>
      </p>
    </section>
  `;
}

export default {
  render(container) {
    container.innerHTML = template();
    focusHeading(container);

    const form = container.querySelector("[data-register-form]");
    const errorEl = container.querySelector("[data-register-error]");
    const successEl = container.querySelector("[data-register-success]");
    const submitBtn = container.querySelector("[data-register-submit]");
    const googleBtn = container.querySelector("[data-google-btn]");

    googleBtn?.addEventListener("click", async () => {
      googleBtn.disabled = true;
      const { error } = await signInWithGoogle();
      // Sama seperti login.js -- sukses langsung redirect, jadi lanjut
      // ke sini berarti gagal.
      if (error) {
        googleBtn.disabled = false;
        errorEl.textContent = error.message || "Gagal membuka Google Sign-In. Coba lagi.";
        errorEl.style.display = "block";
      }
    });

    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      errorEl.style.display = "none";
      successEl.style.display = "none";

      const data = new FormData(form);
      const displayName = String(data.get("displayName") ?? "").trim();
      const email = String(data.get("email") ?? "").trim();
      const password = String(data.get("password") ?? "");
      const confirmPassword = String(data.get("confirmPassword") ?? "");

      if (password !== confirmPassword) {
        errorEl.textContent = "Kata sandi dan pengulangannya tidak cocok.";
        errorEl.style.display = "block";
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Memproses…";

      const { data: signUpData, error } = await signUpWithEmail(email, password, {
        displayName: displayName || undefined,
      });

      if (error) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Daftar";
        errorEl.textContent = mapAuthError(error);
        errorEl.style.display = "block";
        return;
      }

      const user = signUpData?.user ?? null;
      const session = signUpData?.session ?? null;

      if (!session) {
        // Project ini masih mewajibkan konfirmasi email -- belum
        // authenticated, jadi belum bisa migrasi guest data sekarang.
        submitBtn.disabled = false;
        submitBtn.textContent = "Daftar";
        form.reset();
        successEl.textContent = "Akun dibuat. Cek email kamu untuk konfirmasi, lalu masuk.";
        successEl.style.display = "block";
        showToast("Cek email kamu untuk konfirmasi akun.", "success");
        return;
      }

      setState({ user });
      showToast("Akun berhasil dibuat.", "success");

      if (user?.id) {
        syncFromCloud(user.id)
          .then(({ settings, changed }) => {
            if (changed) applyMotionPreference(settings);
          })
          .catch((err) => console.warn("[register] gagal menyinkronkan settings ke cloud", err));
      }

      if (user?.id && listGuestReadings().length > 0) {
        const result = await migrateGuestDataToCloud(user.id);
        if (result.ok && result.migratedReadings > 0) {
          showToast(`${result.migratedReadings} reading tamu berhasil dipindahkan ke akunmu.`, "success");
        } else if (!result.ok) {
          showToast(
            "Sebagian reading tamu belum berhasil dipindahkan — data lokal aman, akan dicoba lagi lain kali.",
            "danger"
          );
        }
      }

      navigate("/home");
    });
  },
};
