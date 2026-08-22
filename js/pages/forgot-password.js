// OTR — Page: Forgot Password (Phase 13 — Authentication, Roadmap Phase 13)
// Cuma kirim email reset lewat Supabase Auth (resetPasswordForEmail).
// Tidak ada halaman "set new password" terpisah di scope Phase 13 -- link
// di email membawa user ke flow default Supabase.

import { resetPasswordForEmail } from "../services/auth-service.js";

function focusHeading(container) {
  const heading = container.querySelector("h1, h2");
  if (heading) {
    heading.setAttribute("tabindex", "-1");
    heading.focus();
  }
}

const fieldStyle = "font-family:var(--font-body); font-size:var(--fs-base); padding:var(--space-3) var(--space-4);";

function template() {
  return `
    <section class="stack gap-5" style="max-width:44ch; margin-inline:auto;">
      <div>
        <p class="eyebrow">Akun</p>
        <h1 class="font-display">Lupa Kata Sandi</h1>
        <p class="text-sm text-muted">Masukkan email akunmu — kami kirim tautan untuk mengatur ulang kata sandi.</p>
      </div>

      <form class="stack gap-4" data-forgot-form novalidate>
        <label class="stack gap-2">
          <span class="text-sm">Email</span>
          <input type="email" name="email" required autocomplete="email" class="card" style="${fieldStyle}" />
        </label>

        <p class="text-sm" data-forgot-error style="color:var(--otr-danger); display:none;" role="alert"></p>
        <p class="text-sm" data-forgot-success style="color:var(--otr-success); display:none;"></p>

        <button type="submit" class="btn btn--primary btn--full" data-forgot-submit>Kirim Tautan Reset</button>
      </form>

      <p class="text-sm text-muted" style="text-align:center;">
        Ingat kata sandimu? <a href="#/login">Masuk</a>
      </p>
    </section>
  `;
}

export default {
  render(container) {
    container.innerHTML = template();
    focusHeading(container);

    const form = container.querySelector("[data-forgot-form]");
    const errorEl = container.querySelector("[data-forgot-error]");
    const successEl = container.querySelector("[data-forgot-success]");
    const submitBtn = container.querySelector("[data-forgot-submit]");

    form?.addEventListener("submit", async (e) => {
      e.preventDefault();
      errorEl.style.display = "none";
      successEl.style.display = "none";

      const data = new FormData(form);
      const email = String(data.get("email") ?? "").trim();

      submitBtn.disabled = true;
      submitBtn.textContent = "Mengirim…";

      const { error } = await resetPasswordForEmail(email);

      submitBtn.disabled = false;
      submitBtn.textContent = "Kirim Tautan Reset";

      if (error) {
        errorEl.textContent = error.message || "Gagal mengirim tautan reset. Coba lagi.";
        errorEl.style.display = "block";
        return;
      }

      form.reset();
      successEl.textContent = "Kalau email itu terdaftar, tautan reset sudah dikirim. Cek inbox (dan folder spam).";
      successEl.style.display = "block";
    });
  },
};
