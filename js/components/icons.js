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
};

export function icon(name, { size = 18, className = "" } = {}) {
  const path = ICONS[name] || ICONS.home;
  return `<svg class="${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}
