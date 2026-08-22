// OTR — Page: Journal (Phase 11 — Journal, Roadmap Phase 11 / Master Spec §25-26)
// "Create Journal" terjadi di js/pages/result.js (langsung setelah reading
// disimpan — lihat komentar di sana soal urutan SAVE -> JOURNAL di §81).
// Halaman ini adalah "View Journal" dari Roadmap: daftar semua entry, plus
// Edit & Delete per entry (2 fitur lain yang eksplisit diminta Phase 11).
// Tidak ada Search/Filter/Sort di sini — Roadmap Phase 11 cuma minta
// Create/Edit/Delete/View, beda dari History (Phase 10) yang eksplisit
// minta ketiganya.
//
// Journal entry (§25 schema) tidak menyimpan konteks reading-nya sendiri
// (cuma readingId) — nama spread/pertanyaan di-resolve lewat
// getGuestReadingById() saat render, sama seperti history-detail.js
// me-resolve data kartu penuh dari id.

import { emptyStateHTML } from "../components/empty-state.js";
import { journalEditorHTML, bindJournalEditor } from "../components/journal-editor.js";
import { openModal, closeModal } from "../components/modal.js";
import { showToast } from "../components/toast.js";
import { icon } from "../components/icons.js";
import { formatDate } from "../core/utils.js";
import {
  listGuestJournalEntries,
  saveGuestJournalEntry,
  deleteGuestJournalEntry,
  getGuestReadingById,
} from "../core/storage.js";

function escapeHTML(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function sortByUpdatedDesc(entries) {
  return [...entries].sort((a, b) => new Date(b.updatedAt ?? 0) - new Date(a.updatedAt ?? 0));
}

function entryHTML(entry) {
  const reading = getGuestReadingById(entry.readingId);

  return `
    <div class="card journal-entry stack gap-3" data-journal-item="${escapeHTML(entry.id)}">
      <div class="row gap-3" style="justify-content:space-between; align-items:flex-start;">
        ${
          reading
            ? `<a href="#/history/${escapeHTML(reading.id)}" class="stack gap-1" style="text-decoration:none; color:inherit; min-width:0;">
                <p class="eyebrow">${escapeHTML(reading.spreadName)}</p>
                <h3>${reading.question ? `“${escapeHTML(reading.question)}”` : "Tanpa pertanyaan spesifik"}</h3>
              </a>`
            : `<div class="stack gap-1">
                <p class="eyebrow">Reading tidak ditemukan</p>
                <h3 class="text-muted">Reading ini mungkin sudah dihapus</h3>
              </div>`
        }
        <div class="row gap-2" style="flex-shrink:0;">
          <button type="button" class="btn btn--ghost" data-edit-journal="${escapeHTML(entry.id)}" aria-label="Edit journal ini">
            ${icon("feather", { size: 16 })}
          </button>
          <button type="button" class="btn btn--ghost" data-delete-journal="${escapeHTML(entry.id)}" aria-label="Hapus journal ini">
            ${icon("trash", { size: 16 })}
          </button>
        </div>
      </div>

      <p class="text-sm journal-entry__content">${escapeHTML(entry.content)}</p>
      <p class="text-sm text-muted font-mono">${escapeHTML(formatDate(entry.updatedAt))}</p>

      <div data-journal-edit-slot></div>
    </div>
  `;
}

function template(entries) {
  return `
    <section class="stack gap-5">
      <div>
        <p class="eyebrow">Journal</p>
        <h1 class="font-display">Refleksi</h1>
        ${entries.length ? `<p class="text-sm text-muted">${entries.length} catatan tersimpan.</p>` : ""}
      </div>

      <div data-journal-list></div>
    </section>
  `;
}

function confirmDelete(onConfirm) {
  openModal({
    title: "Hapus journal ini?",
    bodyHTML: `<p class="text-muted">Tindakan ini tidak bisa dibatalkan.</p>`,
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

export default {
  render(container) {
    let entries = sortByUpdatedDesc(listGuestJournalEntries());

    container.innerHTML = template(entries);
    const listEl = container.querySelector("[data-journal-list]");

    function renderList() {
      listEl.innerHTML = entries.length
        ? `<div class="stack gap-3">${entries.map(entryHTML).join("")}</div>`
        : emptyStateHTML({
            // Master Spec §65 (Empty States — Journal), diterjemahkan.
            title: "Belum ada journal",
            message: "Refleksimu akan muncul di sini setelah kamu menyimpan journal entry pertama.",
            actionLabel: "Mulai Reading",
            actionHref: "#/reading",
          });
    }

    container.addEventListener("click", (e) => {
      const editBtn = e.target.closest("[data-edit-journal]");
      if (editBtn) {
        const id = editBtn.dataset.editJournal;
        const entry = entries.find((j) => j.id === id);
        if (!entry) return;

        const itemEl = container.querySelector(`[data-journal-item="${id}"]`);
        const slot = itemEl?.querySelector("[data-journal-edit-slot]");
        if (!slot) return;

        slot.innerHTML = journalEditorHTML({ content: entry.content, saveLabel: "Simpan Perubahan" });
        bindJournalEditor(slot, {
          onSave: (content) => {
            const saved = saveGuestJournalEntry({ readingId: entry.readingId, content });
            if (!saved) {
              showToast("Gagal menyimpan journal. Coba lagi.", "danger");
              return;
            }
            entries = entries.map((j) => (j.id === saved.id ? saved : j));
            entries = sortByUpdatedDesc(entries);
            showToast("Journal diperbarui.", "success");
            renderList();
          },
          onCancel: () => {
            slot.innerHTML = "";
          },
        });
        return;
      }

      const delBtn = e.target.closest("[data-delete-journal]");
      if (delBtn) {
        e.preventDefault();
        const id = delBtn.dataset.deleteJournal;
        confirmDelete(() => {
          const ok = deleteGuestJournalEntry(id);
          if (!ok) {
            showToast("Gagal menghapus journal.", "danger");
            return;
          }
          entries = entries.filter((j) => j.id !== id);
          showToast("Journal dihapus.", "default");
          renderList();
        });
      }
    });

    renderList();
  },
};
