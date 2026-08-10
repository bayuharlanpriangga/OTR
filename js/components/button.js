// OTR — Button
// Styling tombol sudah didefinisikan lewat class .btn/.btn--* di components.css.
// Helper ini hanya untuk generate markup tombol secara konsisten dari JS
// (dipakai page-page yang merender list/aksi secara dinamis).

/**
 * @param {{ label:string, variant?: "primary"|"secondary"|"ghost"|"danger", href?:string, attrs?:string }} opts
 */
export function buttonHTML({ label, variant = "primary", href, attrs = "" }) {
  const classes = `btn btn--${variant}`;
  if (href) {
    return `<a class="${classes}" href="${href}" ${attrs}>${label}</a>`;
  }
  return `<button class="${classes}" ${attrs}>${label}</button>`;
}
