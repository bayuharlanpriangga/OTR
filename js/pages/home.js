// OTR — Page: Home
// Skeleton (Phase 1). Belum functional — tarot engine belum ada.

function template() {
  return `
    <section class="stack gap-6">
      <div class="card weave">
        <p class="eyebrow">Selamat datang di</p>
        <h1 class="font-display">Orias Tarot Reading</h1>
        <p style="max-width:52ch; margin-top:var(--space-3);">
          Ruang tenang untuk bertanya, menarik kartu, dan merefleksikan jawabannya.
          Reading engine akan aktif di fase berikutnya.
        </p>
        <div class="row gap-3" style="margin-top:var(--space-5);">
          <a class="btn btn--primary" href="#/reading">Mulai Reading</a>
          <a class="btn btn--secondary" href="#/daily">Kartu Hari Ini</a>
        </div>
      </div>

      <div class="grid-cards" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr));">
        <a class="card card--interactive" href="#/library">
          <h3>Library</h3>
          <p class="text-sm text-muted">Jelajahi 78 kartu tarot.</p>
        </a>
        <a class="card card--interactive" href="#/history">
          <h3>History</h3>
          <p class="text-sm text-muted">Lihat reading yang sudah tersimpan.</p>
        </a>
        <a class="card card--interactive" href="#/journal">
          <h3>Journal</h3>
          <p class="text-sm text-muted">Tulis refleksi dari reading-mu.</p>
        </a>
      </div>
    </section>
  `;
}

export default {
  render(container) {
    container.innerHTML = template();
  },
};
