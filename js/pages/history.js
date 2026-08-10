// OTR — Page: History
// Skeleton (Phase 1). Search/filter/sort dibangun di Phase 10.

import { emptyStateHTML } from "../components/empty-state.js";

function template() {
  return `
    <section class="stack gap-5">
      <div>
        <p class="eyebrow">History</p>
        <h1 class="font-display">Riwayat Reading</h1>
      </div>
      ${emptyStateHTML({
        title: "Belum ada reading tersimpan",
        message: "Reading yang kamu simpan akan muncul di sini.",
        actionLabel: "Mulai Reading",
        actionHref: "#/reading",
      })}
    </section>
  `;
}

export default {
  render(container) {
    container.innerHTML = template();
  },
};
