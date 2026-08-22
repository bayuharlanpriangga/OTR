// OTR — Component: JournalEditor (Phase 11 — Journal, Master Spec §26 & §54)
// §54 mendaftarkan JournalEditor sebagai reusable component tersendiri —
// dan beda dari SearchInput/Select di history.js (Phase 10, sengaja
// dibiarkan inline karena cuma dipakai 1 tempat), JournalEditor dipakai di
// 2 halaman sungguhan: js/pages/result.js (create, langsung setelah reading
// disimpan) dan js/pages/journal.js (edit entry yang sudah ada). Itu yang
// bikin ekstraksi di sini masuk akal, bukan prematur.
//
// "Keep editor simple. Do not build a full Notion clone." (§26) — sengaja
// cuma textarea polos, tanpa toolbar/format/markdown apa pun.

function escapeHTML(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/**
 * @param {{ content?: string, saveLabel?: string }} opts
 */
export function journalEditorHTML({ content = "", saveLabel = "Simpan" } = {}) {
  return `
    <div class="card journal-editor stack gap-3" data-journal-editor>
      <p class="eyebrow">Apa yang reading ini buat kamu sadari?</p>
      <textarea
        data-journal-content
        rows="5"
        placeholder="Tulis pemikiranmu..."
        class="card"
        style="resize:vertical; font-family:var(--font-body); font-size:var(--fs-base);"
      >${escapeHTML(content)}</textarea>
      <div class="row gap-2">
        <button type="button" class="btn btn--primary" data-journal-save>${escapeHTML(saveLabel)}</button>
        <button type="button" class="btn btn--ghost" data-journal-cancel>Batal</button>
      </div>
    </div>
  `;
}

/**
 * Pasang event listener ke editor yang sudah ter-render di dalam `root`.
 * onSave(content) cuma dipanggil kalau textarea tidak kosong setelah
 * di-trim — pemanggil tidak perlu validasi ulang. Tidak melakukan apa pun
 * ke DOM sendiri (tidak menghapus/menyembunyikan editor) — itu tanggung
 * jawab pemanggil lewat callback onSave/onCancel, supaya komponen ini tidak
 * perlu tahu bagaimana host page mengatur layout-nya.
 *
 * @param {HTMLElement} root
 * @param {{ onSave: (content: string) => void, onCancel?: () => void }} handlers
 */
export function bindJournalEditor(root, { onSave, onCancel }) {
  const editor = root.querySelector("[data-journal-editor]");
  if (!editor) return;

  const textarea = editor.querySelector("[data-journal-content]");

  editor.querySelector("[data-journal-save]")?.addEventListener("click", () => {
    const content = textarea.value.trim();
    if (!content) {
      textarea.focus();
      return;
    }
    onSave(content);
  });

  editor.querySelector("[data-journal-cancel]")?.addEventListener("click", () => {
    onCancel?.();
  });
}
