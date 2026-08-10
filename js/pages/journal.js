// OTR — Page: Journal
// Skeleton (Phase 1). Create/edit/delete reflection dibangun di Phase 11.

import { emptyStateHTML } from "../components/empty-state.js";

function template() {
  return `
    <section class="stack gap-5">
      <div>
        <p class="eyebrow">Journal</p>
        <h1 class="font-display">Refleksi</h1>
      </div>
      ${emptyStateHTML({
        title: "Belum ada catatan",
        message: "Tulis refleksi setelah menyelesaikan sebuah reading.",
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
