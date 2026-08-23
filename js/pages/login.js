// OTR — Page: Login (Phase 13 — Authentication, Roadmap Phase 13, Master Spec §47)
// Email + Password, plus Google OAuth (§47 menandai Google sebagai "Future"
// tanpa mengikatnya ke nomor phase manapun -- ditambah di luar urutan phase
// numbered, bukan mendahului fase yang sudah dijadwalkan; lihat auth-service.js).
// Setelah sign-in sukses (baik email maupun Google): sinkronkan state.user,
// jalankan Guest Migration kalau ada data tamu, lalu navigasi ke Home.

import { signInWithEmail, signInWithGoogle } from "../services/auth-service.js";
import { migrateGuestDataToCloud } from "../services/migration-service.js";
// Phase 14 — Cloud Sync: sinkronkan Reduced Motion ke/dari cloud tepat
// setelah login sukses (BUKAN nunggu buka Settings dulu) — pola yang sama
// dengan Guest Migration di bawah: dipicu eksplisit sekali dari sini, bukan
// dari subscribeAuthChanges() di app.js (lihat komentar migration-service.js
// soal kenapa).
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

/** Pesan error Supabase Auth umum diterjemahkan ke Indonesia; selain itu
 *  tampilkan pesan asli daripada menyembunyikan info yang mungkin berguna. */
function mapAuthError(error) {
  const msg = error?.message ?? "";
  if (/invalid login credentials/i.test(msg)) return "Email atau kata sandi salah.";
  if (/email not confirmed/i.test(msg)) return "Email belum dikonfirmasi. Cek inbox kamu.";
  return msg || "Gagal masuk. Coba lagi.";
}

const fieldStyle = "font-family:var(--font-body); font-size:var(--fs-base); padding:var(--space-3) var(--space-4);";

function template() {
  const guestCount = listGuestReadings().length;
  return `
    <section class="stack gap-5" style="max-width:44ch; margin-inline:auto;">
      <div>
        <p class="eyebrow">Akun</p>
        <h1 class="font-display">Masuk</h1>
        ${
          guestCount > 0
            ? `<p class="text-sm text-muted">Kamu punya ${guestCount} reading tersimpan sebagai tamu di perangkat ini — masuk untuk memindahkannya ke akunmu.</p>`
            : ""
        }
      </div>

      <div class="stack gap-4">
        <button type="button" class="btn btn--secondary btn--full row gap-2" style="justify-content:center; align-items:center;" data-google-btn>
          ${googleIcon(18)} Lanjutkan dengan Google
        </button>
        <div class="row gap-3" style="align-items:center;">
          <span style="flex:1; height:1px; background:var(--otr-gold-dim);"></span>
          <span class="text-sm text-muted">atau</span>
          <span style="flex:1; height:1px; background:var(--otr-gold-dim);"></span>
        </div>
      </div>

      <form class="stack gap-4" data-login-form novalidate>
        <label class="stack gap-2">
          <span class="text-sm">Email</span>
          <input type="email" name="email" required autocomplete="email" class="card" style="${fieldStyle}" />
        </label>
        <label class="stack gap-2">
          <span class="text-sm">Kata Sandi</span>
          <input type="password" name="password" required autocomplete="current-password" class="card" style="${fieldStyle}" />
        </label>

        <p class="text-sm" data-login-error style="color:var(--otr-danger); display:none;" role="alert"></p>

        <button type="submit" class="btn btn--primary btn--full" data-login-submit>Masuk</button>
      </form>

      <div class="stack gap-2" style="text-align:center;">
        <a class="text-sm" href="#/forgot-password">Lupa kata sandi?</a>
        <p class="text-sm text-muted">Belum punya akun? <a href="#/register">Daftar</a></p>
        <a class="text-sm text-muted" href="#/home">Lanjutkan sebagai tamu</a>
      </div>
    </section>
  `;
}

export default {
  render(container) {
    container.innerHTML = template();
    focusHeading(container);

    const form = container.querySelector("[data-login-form]");
    const errorEl = container.querySelector("[data-login-error]");
    const submitBtn = container.querySelector("[data-login-submit]");
    const googleBtn = container.querySelector("[data-google-btn]");

    googleBtn?.addEventListener("click", async () => {
      googleBtn.disabled = true;
      const { error } = await signInWithGoogle();
      // Sukses TIDAK sampai sini -- signInWithGoogle() langsung me-redirect
      // browser ke Google. Kalau kode lanjut jalan berarti gagal (mis.
      // provider belum aktif di Dashboard, atau popup/redirect diblokir).
      if (error) {
        googleBtn.disabled = false;
        errorEl.textContent = error.message || "Gagal membuka Google Sign-In. Coba lagi.";
        errorEl.style.display = "block";
      }
    });

    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      errorEl.style.display = "none";

      const data = new FormData(form);
      const email = String(data.get("email") ?? "").trim();
      const password = String(data.get("password") ?? "");

      submitBtn.disabled = true;
      submitBtn.textContent = "Memproses…";

      const { data: signInData, error } = await signInWithEmail(email, password);

      if (error) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Masuk";
        errorEl.textContent = mapAuthError(error);
        errorEl.style.display = "block";
        return;
      }

      const user = signInData?.user ?? null;
      setState({ user });
      showToast(`Selamat datang kembali${user?.email ? ", " + user.email : ""}.`, "success");

      if (user?.id) {
        syncFromCloud(user.id)
          .then(({ settings, changed }) => {
            if (changed) applyMotionPreference(settings);
          })
          .catch((err) => console.warn("[login] gagal menyinkronkan settings dari cloud", err));
      }

      // Guest Migration (Master Spec §48) -- cuma jalan kalau memang ada
      // reading tamu tersimpan. Kegagalan migrasi TIDAK membatalkan login
      // (user tetap masuk); data lokal dipertahankan utuh kalau gagal
      // (lihat migration-service.js), jadi aman dicoba lagi login berikutnya.
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
