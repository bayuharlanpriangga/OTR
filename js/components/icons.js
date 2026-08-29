// OTR — Icon set
// Inline SVG minimal (stroke-based, 1.5px), currentColor supaya ikut warna teks.
// Sengaja kecil & datar — bukan ikon mistis berlebihan (spec: "Do not prioritize
// excessive mystical decorations").

const ICONS = {
  home: '<path d="M4 11.5 12 5l8 6.5"/><path d="M6 10v9h12v-9"/>',
  cards: '<rect x="5" y="4" width="9" height="14" rx="1.5"/><rect x="12" y="7" width="9" height="14" rx="1.5" transform="rotate(8 16.5 14)"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>',
  book: '<path d="M5 4.5A2.5 2.5 0 0 1 7.5 3H19v16H7.5A2.5 2.5 0 0 0 5 21.5V4.5Z"/><path d="M5 19V4.5"/>',
  feather: '<path d="M20 4c-6 0-14 4-14 13 0 1 1 2 2 2 9 0 13-8 13-15Z"/><path d="M9 19 20 4"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3v2.2M12 18.8V21M21 12h-2.2M5.2 12H3M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6M18.4 18.4l-1.6-1.6M7.2 7.2 5.6 5.6"/>',
  user: '<circle cx="12" cy="8.5" r="3.5"/><path d="M5 20c1.2-3.8 4-5.5 7-5.5s5.8 1.7 7 5.5"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  bookmark: '<path d="M6 3.5h12v17l-6-4-6 4v-17Z"/>',
  sparkle: '<path d="M12 3v5M12 16v5M3 12h5M16 12h5M6.5 6.5l2.5 2.5M15 15l2.5 2.5M17.5 6.5 15 9M9 15l-2.5 2.5"/>',
  trash: '<path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M7 7l1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13"/>',
  star: '<path d="M12 3.5l2.6 5.4 5.9.6-4.4 4 1.2 5.9L12 16.4l-5.3 3-1.2-5.9-4.4-4 5.9-.6L12 3.5Z"/>',
  logout: '<path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3"/><path d="M15 16l4-4-4-4"/><path d="M19 12H9"/>',
  // Phase 18 — Profile: tombol "Edit Profil".
  edit: '<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/><path d="M14.5 5.5l3 3"/>',
};

export function icon(name, { size = 18, className = "" } = {}) {
  const path = ICONS[name] || ICONS.home;
  return `<svg class="${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}

// Ikon Google (brand mark 4-warna resmi) -- sengaja TERPISAH dari icon()
// di atas karena set ICONS itu semuanya stroke-only/currentColor, sedangkan
// logo Google butuh warna tetap (fill) supaya tetap dikenali penggunanya.
export function googleIcon(size = 18) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.81Z"/>
    <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.92l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.27v3.1A12 12 0 0 0 12 24Z"/>
    <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28v-3.1H1.27A12 12 0 0 0 0 12c0 1.94.46 3.77 1.27 5.38l4-3.1Z"/>
    <path fill="#EA4335" d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.27 6.62l4 3.1c.95-2.84 3.6-4.95 6.73-4.95Z"/>
  </svg>`;
}
