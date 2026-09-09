// OTR — Page: Custom Spread Builder (Phase 19 — Custom Spread, Roadmap
// Phase 19, Master Spec §69 "Custom Spread Builder")
//
// DONE WHEN Roadmap: user dapat Create, Edit, Delete, Use custom spread.
// "Use" ditangani js/pages/reading.js (tipe "Custom Spread" di Step 1) --
// halaman ini fokus ke Create/Edit/Delete + daftar spread milik user.
//
// State halaman ini SELALU sinkron dengan registry di js/tarot/spreads.js
// (bukan array lokal terpisah) -- setiap create/update/delete langsung
// memanggil registerCustomSpread()/unregisterCustomSpread() di sana, supaya
// Reading Step 2 (tipe "Custom") melihat perubahan seketika tanpa perlu
// reload halaman atau refetch, walau user berpindah dari halaman ini ke
// Reading dalam satu sesi SPA yang sama.
//
// KEPUTUSAN SCOPE (lihat juga komentar lengkap di custom-spread-service.js):
// Edit TIDAK mengizinkan menambah/menghapus/reorder posisi -- jumlah posisi
// terkunci sejak Create supaya reading lama yang sudah memakai spread ini
// tidak desinkron. Form Edit di bawah SENGAJA tidak menampilkan tombol
// "+ Tambah Posisi"/hapus posisi (beda dari form Create).

import {
  listCustomSpreads,
  createCustomSpread,
  updateCustomSpread,
  deleteCustomSpread,
} from "../services/custom-spread-service.js";
import { registerCustomSpread, unregisterCustomSpread } from "../tarot/spreads.js";
import { openModal, closeModal } from "../components/modal.js";
import { showToast } from "../components/toast.js";
import { emptyStateHTML } from "../components/empty-state.js";
import { icon } from "../components/icons.js";

const CATEGORY_LABELS = {
  general: "Umum",
  love: "Cinta",
  career: "Karier",
  spiritual: "Spiritual",
};

const MAX_POSITIONS = 10; // konsisten dengan custom-spread-service.js#MAX_POSITIONS
const MIN_POSITIONS = 1;

const fieldStyle = "font-family:var(--font-body); font-size:var(--fs-base); padding:var(--space-3) var(--space-4);";

function escapeHTML(str = "") {
  return String(str).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// ---- List view -----------------------------------------------------------

function spreadCardHTML(s) {
  return `
    <div class="card stack gap-3" data-spread-card="${s.id}">
      <div class="row gap-3" style="justify-content:space-between; align-items:baseline;">
        <h3>${escapeHTML(s.name)}</h3>
        <div class="row gap-2">
          <span class="badge">${escapeHTML(CATEGORY_LABELS[s.category] ?? "Umum")}</span>
          <span class="badge">${s.cardCount} kartu</span>
        </div>
      </div>
      ${s.description ? `<p class="text-sm text-muted">${escapeHTML(s.description)}</p>` : ""}
      <div class="row gap-2" style="flex-wrap:wrap;">
        ${s.positions.map((p) => `<span class="badge">${escapeHTML(p.name)}</span>`).join("")}
      </div>
      <div class="row gap-3">
        <button type="button" class="btn btn--secondary" data-edit-spread="${s.id}">${icon("edit", { size: 16 })} Edit</button>
        <button type="button" class="btn btn--ghost" data-delete-spread="${s.id}" style="color:var(--otr-oxblood);">${icon("trash", { size: 16 })} Hapus</button>
      </div>
    </div>
  `;
}

function listTemplate(spreads) {
  return `
    <section class="stack gap-5">
      <div class="row gap-3" style="justify-content:space-between; align-items:flex-start; flex-wrap:wrap;">
        <div>
          <p class="eyebrow">Custom Spread</p>
          <h1 class="font-display">Spread Buatanmu</h1>
          <p class="text-sm text-muted" style="margin-top:var(--space-2);">Buat tata letak sendiri untuk reading — jumlah posisi bebas.</p>
        </div>
        <button type="button" class="btn btn--primary" data-new-spread>${icon("plus", { size: 16 })} Buat Spread Baru</button>
      </div>

      <div class="stack gap-3" data-spread-list>
        ${
          spreads.length
            ? spreads.map(spreadCardHTML).join("")
            : emptyStateHTML({
                title: "Belum ada custom spread",
                message: "Buat spread pertamamu — mis. \"My Decision Spread\" dengan posisi What I want / What I fear / Path A / Path B.",
              })
        }
      </div>
    </section>
  `;
}

// ---- Form view (Create & Edit berbagi template, beda `locked`) -----------

function positionRowHTML(pos, index, locked) {
  return `
    <div class="card stack gap-2" data-position-row="${index}">
      <div class="row gap-3" style="justify-content:space-between; align-items:center;">
        <span class="text-sm text-muted">Posisi ${index + 1}</span>
        ${
          locked
            ? ""
            : `<button type="button" class="btn btn--ghost" data-remove-position="${index}" aria-label="Hapus posisi" style="color:var(--otr-oxblood);">${icon("close", { size: 14 })}</button>`
        }
      </div>
      <input
        type="text"
        name="position-name-${index}"
        placeholder="Nama posisi, mis. What I fear"
        value="${escapeHTML(pos.name ?? "")}"
        maxlength="60"
        class="card"
        style="${fieldStyle}"
      />
      <input
        type="text"
        name="position-description-${index}"
        placeholder="Deskripsi singkat (opsional)"
        value="${escapeHTML(pos.description ?? "")}"
        maxlength="160"
        class="card"
        style="${fieldStyle}"
      />
    </div>
  `;
}

function formTemplate({ mode, name, category, description, positions }) {
  const locked = mode === "edit";
  return `
    <section class="stack gap-5" style="max-width:60ch;">
      <div class="row gap-3" style="justify-content:space-between; align-items:flex-start;">
        <div>
          <p class="eyebrow">Custom Spread</p>
          <h1 class="font-display">${mode === "edit" ? "Edit Spread" : "Buat Spread Baru"}</h1>
        </div>
        <button type="button" class="btn btn--ghost" data-cancel-form">&larr; Kembali</button>
      </div>

      <form class="stack gap-5" data-spread-form novalidate>
        <label class="stack gap-2">
          <span class="text-sm">Nama Spread</span>
          <input type="text" name="name" value="${escapeHTML(name)}" maxlength="60" required class="card" style="${fieldStyle}" />
        </label>

        <label class="stack gap-2">
          <span class="text-sm">Kategori</span>
          <select name="category" class="card" style="${fieldStyle}">
            ${Object.entries(CATEGORY_LABELS)
              .map(([value, label]) => `<option value="${value}" ${category === value ? "selected" : ""}>${label}</option>`)
              .join("")}
          </select>
        </label>

        <label class="stack gap-2">
          <span class="text-sm">Deskripsi <span class="text-muted">(opsional)</span></span>
          <textarea name="description" rows="2" maxlength="200" class="card" style="${fieldStyle} resize:vertical;">${escapeHTML(description)}</textarea>
        </label>

        <div class="stack gap-3">
          <div class="row gap-3" style="justify-content:space-between; align-items:center;">
            <span class="text-sm">Posisi ${locked ? "" : `(min ${MIN_POSITIONS}, maks ${MAX_POSITIONS})`}</span>
            ${
              locked
                ? `<span class="text-sm text-muted">Jumlah posisi terkunci saat edit</span>`
                : `<button type="button" class="btn btn--secondary" data-add-position ${positions.length >= MAX_POSITIONS ? "disabled" : ""}>${icon("plus", { size: 14 })} Tambah Posisi</button>`
            }
          </div>
          <div class="stack gap-3" data-position-list>
            ${positions.map((p, i) => positionRowHTML(p, i, locked)).join("")}
          </div>
          ${locked ? `<p class="text-sm text-muted">Mau ubah jumlah posisi? Buat spread baru — reading lama yang memakai spread ini tetap aman.</p>` : ""}
        </div>

        <div class="row gap-3">
          <button type="submit" class="btn btn--primary" data-submit-spread>Simpan Spread</button>
          <button type="button" class="btn btn--ghost" data-cancel-form-2>Batal</button>
        </div>
      </form>
    </section>
  `;
}

// ---- Delete confirmation (pola sama dengan history.js#confirmDelete) ----

function confirmDeleteSpread(spread, onConfirm) {
  openModal({
    title: `Hapus "${spread.name}"?`,
    bodyHTML: `<p class="text-muted">Spread yang sudah dihapus tidak bisa dikembalikan. Kalau spread ini masih dipakai reading yang tersimpan, penghapusan akan ditolak.</p>`,
    actionsHTML: `
      <button type="button" class="btn btn--secondary" data-cancel-delete>Batal</button>
      <button type="button" class="btn btn--danger" data-confirm-delete>Hapus</button>
    `,
  });

  const outlet = document.getElementById("modal-outlet");
  outlet?.querySelector("[data-cancel-delete]")?.addEventListener("click", () => closeModal());
  outlet?.querySelector("[data-confirm-delete]")?.addEventListener("click", () => {
    closeModal();
    onConfirm();
  });
}

// ---- Controller ------------------------------------------------------------

export default {
  async render(container) {
    container.innerHTML = `<div class="row" style="justify-content:center; padding:var(--space-8) 0;"><span class="spinner" aria-label="Memuat"></span></div>`;

    let spreads;
    try {
      // listCustomSpreads() langsung (BUKAN lewat registry spreads.js) --
      // halaman ini adalah SUMBER KEBENARAN untuk data custom spread
      // (bukan konsumen seperti reading.js), jadi selalu tarik data segar
      // dari service tiap kali halaman ini dibuka, lalu SETIAP hasilnya
      // di-registerCustomSpread() satu-satu supaya registry spreads.js ikut
      // sinkron -- kalau ternyata sudah lebih baru (mis. baru saja
      // dihapus/diedit dari sesi/tab lain), halaman ini yang menang.
      spreads = await listCustomSpreads();
      spreads.forEach(registerCustomSpread);
    } catch (err) {
      console.error("[custom-spreads] gagal memuat custom spread", err);
      showToast("Gagal memuat custom spread.", "danger");
      spreads = [];
    }

    function renderList() {
      container.innerHTML = listTemplate(spreads);
      container.querySelector("[data-new-spread]")?.addEventListener("click", () => renderForm({ mode: "create" }));

      container.querySelectorAll("[data-edit-spread]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const spread = spreads.find((s) => s.id === btn.dataset.editSpread);
          if (spread) renderForm({ mode: "edit", spread });
        });
      });

      container.querySelectorAll("[data-delete-spread]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const spread = spreads.find((s) => s.id === btn.dataset.deleteSpread);
          if (!spread) return;
          confirmDeleteSpread(spread, async () => {
            try {
              await deleteCustomSpread(spread.id);
              unregisterCustomSpread(spread.id);
              spreads = spreads.filter((s) => s.id !== spread.id);
              showToast("Spread berhasil dihapus.", "default");
              renderList();
            } catch (err) {
              console.error("[custom-spreads] gagal menghapus spread", err);
              showToast(err?.message || "Gagal menghapus spread.", "danger");
            }
          });
        });
      });
    }

    function renderForm({ mode, spread = null }) {
      const positions = spread
        ? spread.positions.map((p) => ({ name: p.name, description: p.description }))
        : [{ name: "", description: "" }, { name: "", description: "" }];

      const formState = {
        name: spread?.name ?? "",
        category: spread?.category ?? "general",
        description: spread?.description ?? "",
        positions,
      };

      container.innerHTML = formTemplate({ mode, ...formState });

      const backToList = () => renderList();
      container.querySelector("[data-cancel-form]")?.addEventListener("click", backToList);
      container.querySelector("[data-cancel-form-2]")?.addEventListener("click", backToList);

      const positionListEl = container.querySelector("[data-position-list]");
      const addBtn = container.querySelector("[data-add-position]");

      function syncAddButtonState() {
        if (!addBtn) return;
        addBtn.disabled = formState.positions.length >= MAX_POSITIONS;
      }

      // Form Create bersifat "uncontrolled" (baca langsung dari DOM saat
      // submit, lihat handleSubmit) -- addBtn cuma menambah baris kosong
      // baru ke DOM, tidak perlu re-render seluruh form tiap kali (supaya
      // input yang sudah diisi user di baris lain tidak ikut ke-reset).
      addBtn?.addEventListener("click", () => {
        if (formState.positions.length >= MAX_POSITIONS) return;
        const index = formState.positions.length;
        formState.positions.push({ name: "", description: "" });
        positionListEl.insertAdjacentHTML("beforeend", positionRowHTML({ name: "", description: "" }, index, false));
        syncAddButtonState();
      });

      positionListEl?.addEventListener("click", (e) => {
        const removeBtn = e.target.closest("[data-remove-position]");
        if (!removeBtn) return;
        if (formState.positions.length <= MIN_POSITIONS) {
          showToast(`Spread butuh minimal ${MIN_POSITIONS} posisi.`, "danger");
          return;
        }
        // Baca ulang SEMUA baris dari DOM dulu (supaya edit yang sudah
        // diketik user di baris LAIN tidak ikut hilang), baru buang baris
        // yang benar-benar diklik (bukan selalu baris terakhir) --
        // dicocokkan lewat data-position-row, bukan asumsi urutan.
        const indexToRemove = Number(removeBtn.closest("[data-position-row]")?.dataset.positionRow);
        const currentValues = [...positionListEl.querySelectorAll("[data-position-row]")]
          .map((row) => ({
            name: row.querySelector('input[name^="position-name-"]').value,
            description: row.querySelector('input[name^="position-description-"]').value,
          }))
          .filter((_, i) => i !== indexToRemove);

        formState.positions = currentValues;
        positionListEl.innerHTML = currentValues.map((p, i) => positionRowHTML(p, i, false)).join("");
        syncAddButtonState();
      });

      const form = container.querySelector("[data-spread-form]");
      const submitBtn = container.querySelector("[data-submit-spread]");

      form?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const data = new FormData(form);
        const name = String(data.get("name") || "").trim();
        const category = String(data.get("category") || "general");
        const description = String(data.get("description") || "").trim();

        const rows = [...positionListEl.querySelectorAll("[data-position-row]")];
        const positionsInput = rows.map((row, i) => ({
          name: String(data.get(`position-name-${i}`) || "").trim(),
          description: String(data.get(`position-description-${i}`) || "").trim(),
        }));

        if (!name) {
          showToast("Nama spread wajib diisi.", "danger");
          return;
        }
        if (positionsInput.some((p) => !p.name)) {
          showToast("Semua posisi wajib punya nama.", "danger");
          return;
        }

        submitBtn.disabled = true;
        try {
          let saved;
          if (mode === "edit") {
            saved = await updateCustomSpread(spread.id, { name, category, description, positions: positionsInput });
            spreads = spreads.map((s) => (s.id === saved.id ? saved : s));
          } else {
            saved = await createCustomSpread({ name, category, description, positions: positionsInput });
            spreads = [saved, ...spreads];
          }
          registerCustomSpread(saved);
          showToast(mode === "edit" ? "Spread berhasil diperbarui." : "Spread berhasil dibuat.", "default");
          renderList();
        } catch (err) {
          console.error("[custom-spreads] gagal menyimpan spread", err);
          showToast(err?.message || "Gagal menyimpan spread.", "danger");
          submitBtn.disabled = false;
        }
      });

      const heading = container.querySelector("h1");
      if (heading) {
        heading.setAttribute("tabindex", "-1");
        heading.focus();
      }
    }

    renderList();
  },
};
