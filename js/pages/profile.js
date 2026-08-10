// OTR — Page: Profile
// Skeleton (Phase 1). Terhubung ke authenticated user di Phase 18.

function template() {
  return `
    <section class="stack gap-5">
      <div>
        <p class="eyebrow">Profile</p>
        <h1 class="font-display">Profil Kamu</h1>
      </div>

      <div class="card row gap-4" style="align-items:center;">
        <div style="width:56px; height:56px; border-radius:50%; background:var(--otr-plum); border:1px solid var(--otr-gold-dim);"></div>
        <div>
          <h3>Guest</h3>
          <p class="text-sm text-muted">Belum login</p>
        </div>
      </div>

      <div class="grid-cards" style="grid-template-columns:repeat(auto-fill,minmax(140px,1fr));">
        <div class="card stack gap-1">
          <span class="font-mono" style="color:var(--otr-gold); font-size:var(--fs-lg);">0</span>
          <span class="text-sm text-muted">Reading</span>
        </div>
        <div class="card stack gap-1">
          <span class="font-mono" style="color:var(--otr-gold); font-size:var(--fs-lg);">0</span>
          <span class="text-sm text-muted">Journal</span>
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
