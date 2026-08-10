// OTR — Empty State
// Dipakai di History/Journal/Library saat data kosong. Selalu berikan
// arah tindakan (bukan cuma "tidak ada data").

/**
 * @param {{ title:string, message:string, actionLabel?:string, actionHref?:string }} opts
 */
export function emptyStateHTML({ title, message, actionLabel, actionHref }) {
  return `
    <div class="empty-state weave">
      <h3>${title}</h3>
      <p class="text-muted">${message}</p>
      ${actionLabel && actionHref ? `<a class="btn btn--primary" href="${actionHref}">${actionLabel}</a>` : ""}
    </div>
  `;
}
