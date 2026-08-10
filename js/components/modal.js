// OTR — Modal
// Modal reusable, satu instance aktif dalam satu waktu, dikontrol lewat
// #modal-outlet yang sudah disiapkan app-shell.

let previouslyFocused = null;

/**
 * @param {{title:string, bodyHTML:string, actionsHTML?:string, onClose?:()=>void}} opts
 */
export function openModal({ title, bodyHTML, actionsHTML = "", onClose }) {
  const outlet = document.getElementById("modal-outlet");
  if (!outlet) return;

  previouslyFocused = document.activeElement;

  outlet.innerHTML = `
    <div class="modal-backdrop" data-modal-backdrop>
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal__header">
          <h2 id="modal-title">${title}</h2>
          <button class="modal__close" data-modal-close aria-label="Tutup">&times;</button>
        </div>
        <div class="modal__body">${bodyHTML}</div>
        ${actionsHTML ? `<div class="modal__actions row gap-3" style="margin-top:1rem; justify-content:flex-end;">${actionsHTML}</div>` : ""}
      </div>
    </div>
  `;

  const backdrop = outlet.querySelector("[data-modal-backdrop]");
  const closeBtn = outlet.querySelector("[data-modal-close]");

  function close() {
    outlet.innerHTML = "";
    document.removeEventListener("keydown", onKeydown);
    previouslyFocused?.focus?.();
    onClose?.();
  }

  function onKeydown(e) {
    if (e.key === "Escape") close();
  }

  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) close();
  });
  closeBtn.addEventListener("click", close);
  document.addEventListener("keydown", onKeydown);

  outlet.querySelector(".modal")?.focus();

  return { close };
}

export function closeModal() {
  const outlet = document.getElementById("modal-outlet");
  if (outlet) outlet.innerHTML = "";
}
