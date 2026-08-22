// OTR — Page: Login (Phase 13 — Authentication, Roadmap Phase 13, Master Spec §47)
// Email + Password saja (MVP auth per §47 -- Google/Apple/Magic Link "Future").
// Setelah sign-in sukses: sinkronkan state.user, jalankan Guest Migration
// kalau ada data tamu, lalu navigasi ke Home.

import { signInWithEmail } from "../services/auth-service.js";
import { migrateGuestDataToCloud } from "../services/migration-service.js";
import { setState } from "../core/state.js";
import { navigate } from "../router.js";
import { showToast } from "../components/toast.js";
import { listGuestReadings } from "../core/storage.js";

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
