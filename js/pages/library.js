// OTR — Page: Library
// Skeleton (Phase 1). Grid 78 kartu + search/filter dibangun di Phase 9,
// di atas data domain dari Phase 2.

import { emptyStateHTML } from "../components/empty-state.js";

function template() {
  return `
    <section class="stack gap-5">
      <div>
        <p class="eyebrow">Library</p>
        <h1 class="font-display">Ensiklopedia Tarot</h1>
      </div>
      ${emptyStateHTML({
        title: "Data kartu belum dimuat",
        message: "78 kartu (22 Major + 56 Minor Arcana) akan tampil di sini setelah Phase 2 & 9 selesai.",
      })}
    </section>
  `;
}

export default {
  render(container) {
    container.innerHTML = template();
  },
};
