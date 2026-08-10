// OTR — Page: Daily
// Skeleton (Phase 1). Daily Card logic (konsisten per hari) dibangun di Phase 15.

function template() {
  return `
    <section class="stack gap-5">
      <div>
        <p class="eyebrow">Daily</p>
        <h1 class="font-display">Kartu Hari Ini</h1>
      </div>

      <div class="card row gap-5" style="align-items:flex-start;">
        <div class="weave" style="width:120px; aspect-ratio: var(--card-ratio); border-radius: var(--radius-md); border:1px solid var(--otr-hairline); flex-shrink:0;"></div>
        <div class="stack gap-2">
          <h3>Belum ditarik</h3>
          <p class="text-muted text-sm">Daily card akan aktif setelah Phase 15 (Daily Card) selesai.</p>
        </div>
      </div>
    </section>
  `;
}

export default {
  render(container) {
    container.innerHTML = template();
  },
};
