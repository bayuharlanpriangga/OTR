// OTR — Page: Statistics
// Skeleton (Phase 1). Metrik dihitung dari reading history di Phase 17.

const METRICS = [
  { label: "Total Readings", value: "—" },
  { label: "Cards Drawn", value: "—" },
  { label: "Upright %", value: "—" },
  { label: "Reading Streak", value: "—" },
];

function template() {
  return `
    <section class="stack gap-5">
      <div>
        <p class="eyebrow">Statistics</p>
        <h1 class="font-display">Statistik Personal</h1>
      </div>
      <div class="grid-cards" style="grid-template-columns:repeat(auto-fill,minmax(160px,1fr));">
        ${METRICS.map(
          (m) => `
          <div class="card stack gap-2">
            <span class="font-mono" style="font-size:var(--fs-xl); color:var(--otr-gold);">${m.value}</span>
            <span class="text-sm text-muted">${m.label}</span>
          </div>`
        ).join("")}
      </div>
      <p class="text-muted text-sm">Angka akan terisi otomatis setelah Phase 17 selesai.</p>
    </section>
  `;
}

export default {
  render(container) {
    container.innerHTML = template();
  },
};
