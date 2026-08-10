// OTR — Page: Settings
// Skeleton (Phase 1). Persist ke otr_settings di Phase 8.

function template() {
  return `
    <section class="stack gap-5">
      <div>
        <p class="eyebrow">Settings</p>
        <h1 class="font-display">Pengaturan</h1>
      </div>

      <div class="card stack gap-4">
        <div class="row" style="justify-content:space-between;">
          <div>
            <h3>Reduced Motion</h3>
            <p class="text-sm text-muted">Kurangi animasi di seluruh aplikasi.</p>
          </div>
          <span class="badge">Segera</span>
        </div>
        <div class="row" style="justify-content:space-between;">
          <div>
            <h3>Bahasa</h3>
            <p class="text-sm text-muted">Indonesia (default)</p>
          </div>
          <span class="badge">Segera</span>
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
