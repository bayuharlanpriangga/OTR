// OTR — Page: Reading
// Skeleton (Phase 1). Flow Select → Shuffle → Draw → Reveal → Result
// akan dibangun di Phase 5 (Reading MVP) di atas Tarot Engine (Phase 3).

function template() {
  return `
    <section class="stack gap-5">
      <div>
        <p class="eyebrow">Reading</p>
        <h1 class="font-display">Pilih Jenis Reading</h1>
      </div>

      <div class="grid-cards" style="grid-template-columns:repeat(auto-fill,minmax(240px,1fr));">
        <div class="card card--interactive stack gap-2">
          <h3>One Card</h3>
          <p class="text-sm text-muted">Satu kartu untuk fokus cepat.</p>
          <span class="badge">Belum aktif</span>
        </div>
        <div class="card card--interactive stack gap-2">
          <h3>Three Card</h3>
          <p class="text-sm text-muted">Masa lalu, sekarang, masa depan.</p>
          <span class="badge">Belum aktif</span>
        </div>
      </div>

      <div class="empty-state weave">
        <h3>Tarot engine belum tersambung</h3>
        <p class="text-muted">Shuffle &amp; draw akan tersedia setelah Phase 3 &amp; 5 selesai.</p>
      </div>
    </section>
  `;
}

export default {
  render(container) {
    container.innerHTML = template();
  },
};
