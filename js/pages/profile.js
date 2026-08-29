// OTR — Page: Profile (Phase 18 — Profile, Roadmap Phase 18, Master Spec §35)
//
// Sebelumnya skeleton Phase 1 (avatar kosong + "Guest" + 2 angka dummy "0").
// Field yang diminta Roadmap: Avatar, Name, Joined Date, Reading Count,
// Journal Count, Favorite Card, Streak. Master Spec §35 catatan penting:
// "Avoid deterministic personality claims based solely on tarot statistics"
// -- halaman ini SENGAJA cuma menampilkan angka & fakta apa adanya, TIDAK
// ADA teks generatif macam "kamu tipe The Fool" dari data ini.
//
// Reading Count/Journal Count/Streak SENGAJA reuse service yang sudah ada
// (bukan dihitung ulang di sini):
//   - Reading Count & Streak -> statistics-service.js (Phase 17)
//     getStatistics().totalReadings / .readingStreak
//   - Journal Count -> journal-service.js listJournalEntries().length
//   - Favorite Card -> favorite-service.js getLatestFavoriteEntityId("card")
//     (Phase 18, BARU -- lihat komentar lengkap di service itu kenapa ini
//     BEDA dari "Most Drawn Card" Phase 17: favorit eksplisit, bukan yang
//     paling sering ditarik)
// Ketiganya SUDAH dual-backend (guest lewat localStorage / login lewat
// Supabase) tanpa halaman ini perlu tahu bedanya -- sama seperti kenapa
// Statistics (Phase 17) tidak perlu cek state.user sendiri.
//
// Avatar & Display Name & Joined Date TETAP cloud-only (profiles table
// cuma ada untuk user login, lihat komentar di profile-service.js) --
// guest melihat kartu CTA "Masuk/Daftar" yang sama gayanya dengan Settings
// (Phase 13), BUKAN placeholder avatar kosong yang dulu dipakai skeleton.

import { getState } from "../core/state.js";
import { getProfile, updateProfile } from "../services/profile-service.js";
import { resolveDisplayName } from "../services/auth-service.js";
import { getStatistics } from "../services/statistics-service.js";
import { listJournalEntries } from "../services/journal-service.js";
import { getLatestFavoriteEntityId } from "../services/favorite-service.js";
import { getCardById } from "../../data/tarot-cards.js";
import { formatDate } from "../core/utils.js";
import { openModal } from "../components/modal.js";
import { showToast } from "../components/toast.js";
import { icon } from "../components/icons.js";

function escapeHTML(str = "") {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function initial(label) {
  return (label || "?").trim().charAt(0).toUpperCase() || "?";
}

function avatarHTML(avatarUrl, label, modifierClass = "") {
  if (avatarUrl) {
    return `<div class="avatar ${modifierClass}"><img src="${escapeHTML(avatarUrl)}" alt="" /></div>`;
  }
  return `<div class="avatar ${modifierClass}" aria-hidden="true">${escapeHTML(initial(label))}</div>`;
}

// ---- Header: guest vs logged-in --------------------------------------

function guestHeaderHTML() {
  return `
    <div class="card stack gap-4">
      <div class="row gap-4" style="align-items:center;">
        ${avatarHTML(null, "Tamu")}
        <div class="stack gap-1">
          <h3>Tamu</h3>
          <p class="text-sm text-muted">Reading & journal kamu cuma tersimpan di perangkat ini.</p>
        </div>
      </div>
      <div class="row gap-3">
        <a class="btn btn--primary" href="#/login">Masuk</a>
        <a class="btn btn--secondary" href="#/register">Daftar</a>
      </div>
    </div>
  `;
}

function loggedInHeaderHTML(user, profile) {
  const label = resolveDisplayName(user, profile);
  return `
    <div class="card row gap-4" style="align-items:center; justify-content:space-between; flex-wrap:wrap;">
      <div class="row gap-4" style="align-items:center; min-width:0;">
        ${avatarHTML(profile?.avatarUrl, label)}
        <div class="stack gap-1" style="min-width:0;">
          <h3 style="overflow-wrap:anywhere;">${escapeHTML(label)}</h3>
          ${user.email ? `<p class="text-sm text-muted" style="overflow-wrap:anywhere;">${escapeHTML(user.email)}</p>` : ""}
          ${profile?.createdAt ? `<p class="text-sm text-muted">Bergabung sejak ${escapeHTML(formatDate(profile.createdAt))}</p>` : ""}
        </div>
      </div>
      <button type="button" class="btn btn--secondary" data-edit-profile-btn>
        ${icon("edit", { size: 16 })} Edit Profil
      </button>
    </div>
  `;
}

// ---- Stats grid (reuse .stat-card dari Phase 17 dashboard.css) --------

function statCardHTML(value, label) {
  return `
    <div class="card stat-card stack gap-2">
      <span class="stat-card__value font-mono">${escapeHTML(String(value))}</span>
      <span class="stat-card__label text-sm text-muted">${escapeHTML(label)}</span>
    </div>
  `;
}

// ---- Favorite Card (reuse .stat-highlight dari Phase 17 dashboard.css) --

function favoriteCardSectionHTML(favoriteCard) {
  if (favoriteCard) {
    return `
      <a class="card stat-highlight row gap-4" href="#/library/${escapeHTML(favoriteCard.id)}" style="text-decoration:none; color:inherit;">
        <span class="stat-highlight__icon" aria-hidden="true">${icon("star", { size: 22 })}</span>
        <div class="stack gap-1" style="min-width:0;">
          <p class="eyebrow">Favorite Card</p>
          <h3 class="stat-highlight__name">${escapeHTML(favoriteCard.name)}</h3>
          <p class="text-sm text-muted">Lihat detail kartu</p>
        </div>
      </a>
    `;
  }
  return `
    <div class="card stack gap-2">
      <p class="eyebrow">Favorite Card</p>
      <p class="text-sm text-muted">Belum ada kartu favorit. Tandai kartu di <a href="#/library">Tarot Library</a>.</p>
    </div>
  `;
}

function template({ user, profile, stats, journalCount, favoriteCard }) {
  return `
    <section class="stack gap-5">
      <div>
        <p class="eyebrow">Profile</p>
        <h1 class="font-display">Profil Kamu</h1>
      </div>

      <div data-profile-header>${user ? loggedInHeaderHTML(user, profile) : guestHeaderHTML()}</div>

      <div class="grid-cards" style="grid-template-columns:repeat(auto-fill,minmax(140px,1fr));">
        ${statCardHTML(stats.totalReadings, "Reading")}
        ${statCardHTML(journalCount, "Journal")}
        ${statCardHTML(`${stats.readingStreak} hari`, "Streak")}
      </div>

      ${favoriteCardSectionHTML(favoriteCard)}
    </section>
  `;
}

// ---- Edit Profil modal --------------------------------------------------

const fieldStyle = "font-family:var(--font-body); font-size:var(--fs-base); padding:var(--space-3) var(--space-4);";

function openEditProfileModal({ user, profile, onSaved }) {
  const currentName = profile?.displayName ?? "";
  const currentAvatar = profile?.avatarUrl ?? "";

  const bodyHTML = `
    <form class="stack gap-4" data-edit-profile-form novalidate>
      <label class="stack gap-2">
        <span class="text-sm">Nama Tampilan</span>
        <input type="text" name="displayName" value="${escapeHTML(currentName)}" maxlength="80" class="card" style="${fieldStyle}" />
      </label>
      <label class="stack gap-2">
        <span class="text-sm">URL Avatar <span class="text-muted">(opsional)</span></span>
        <input type="url" name="avatarUrl" value="${escapeHTML(currentAvatar)}" placeholder="https://..." class="card" style="${fieldStyle}" />
        <span class="text-sm text-muted">Tempel link gambar (mis. dari Google Drive/Imgur). Upload foto langsung belum didukung.</span>
      </label>
    </form>
  `;

  const actionsHTML = `
    <button type="button" class="btn btn--ghost" data-modal-cancel>Batal</button>
    <button type="button" class="btn btn--primary" data-edit-profile-submit>Simpan</button>
  `;

  const modal = openModal({ title: "Edit Profil", bodyHTML, actionsHTML });
  const outlet = document.getElementById("modal-outlet");
  const form = outlet.querySelector("[data-edit-profile-form]");
  const submitBtn = outlet.querySelector("[data-edit-profile-submit]");
  const cancelBtn = outlet.querySelector("[data-modal-cancel]");

  cancelBtn?.addEventListener("click", () => modal?.close());

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(form);
    const displayName = String(formData.get("displayName") || "").trim();
    const avatarUrl = String(formData.get("avatarUrl") || "").trim();

    submitBtn.disabled = true;
    try {
      const updated = await updateProfile(user.id, {
        displayName: displayName || null,
        avatarUrl: avatarUrl || null,
      });
      showToast("Profil berhasil diperbarui.", "default");
      modal?.close();
      onSaved(updated);
    } catch (err) {
      console.error("[profile] gagal memperbarui profil", err);
      showToast("Gagal menyimpan profil. Coba lagi.", "danger");
      submitBtn.disabled = false;
    }
  }

  // Tombol "Simpan" ada di actionsHTML (elemen SIBLING dari <form>, bukan di
  // dalamnya -- modal.js merender bodyHTML & actionsHTML sebagai dua blok
  // terpisah), jadi type="submit" tanpa atribut form="id-form" TIDAK akan
  // memicu event submit form ini secara native. Disambungkan manual lewat
  // click di kedua tombol (submit eksplisit + tekan Enter di input teks)
  // supaya Enter di keyboard tetap berfungsi seperti form pada umumnya.
  form?.addEventListener("submit", handleSubmit);
  submitBtn?.addEventListener("click", handleSubmit);
}

// ---- Render ---------------------------------------------------------------

async function loadData(user) {
  // Promise.all -- 3-4 pemanggilan independen (profil kalau login, statistik,
  // journal count, favorite card), sama pola dengan journal.js membangun
  // readingsById + listJournalEntries() sekaligus, supaya tidak nunggu
  // network call bergantian satu-satu.
  const [profile, stats, journalEntries, favoriteCardId] = await Promise.all([
    user ? getProfile(user.id) : Promise.resolve(null),
    getStatistics(),
    listJournalEntries(),
    getLatestFavoriteEntityId("card"),
  ]);

  return {
    profile,
    stats,
    journalCount: journalEntries.length,
    favoriteCard: favoriteCardId ? getCardById(favoriteCardId) : null,
  };
}

export default {
  async render(container) {
    container.innerHTML = `<div class="row" style="justify-content:center; padding:var(--space-8) 0;"><span class="spinner" aria-label="Memuat"></span></div>`;

    const user = getState().user;
    let data;
    try {
      data = await loadData(user);
    } catch (err) {
      console.error("[profile] gagal memuat profil", err);
      showToast("Gagal memuat profil.", "danger");
      container.innerHTML = `
        <section class="stack gap-5">
          <div>
            <p class="eyebrow">Profile</p>
            <h1 class="font-display">Profil Kamu</h1>
          </div>
          <p class="text-sm text-muted">Terjadi kesalahan saat memuat data profil. Coba muat ulang halaman ini.</p>
        </section>
      `;
      return;
    }

    container.innerHTML = template({ user, ...data });

    if (!user) return; // guest: tidak ada tombol Edit Profil untuk disambungkan

    // Fungsi bernama (bukan arrow inline) supaya bisa dipanggil ulang dari
    // dalam onSaved() sendiri setelah header di-render ulang -- tombol Edit
    // yang lama sudah lenyap bareng innerHTML lama, tombol yang baru butuh
    // listener baru juga.
    function bindEditButton() {
      container.querySelector("[data-edit-profile-btn]")?.addEventListener("click", () => {
        openEditProfileModal({
          user,
          profile: data.profile,
          onSaved: (updatedProfile) => {
            data.profile = updatedProfile;
            const header = container.querySelector("[data-profile-header]");
            if (header) header.innerHTML = loggedInHeaderHTML(user, updatedProfile);
            bindEditButton();
            // Nama akun di Settings (Phase 13) memakai resolveDisplayName()
            // dari state.user langsung, bukan cache halaman ini -- tidak
            // perlu disinkronkan manual di sini, akan otomatis benar lain
            // kali Settings dirender (state.user.user_metadata tidak
            // berubah dari sini, cuma profiles.display_name -- lihat
            // prioritas 1 vs 2 di komentar resolveDisplayName()).
          },
        });
      });
    }

    bindEditButton();
  },
};
