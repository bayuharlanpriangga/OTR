// OTR — Global config
// Konstanta yang dipakai lintas modul. Tidak ada logic di sini.

export const APP_NAME = "OTR";
export const APP_FULL_NAME = "Orias Tarot Reading";

export const STORAGE_KEYS = {
  GUEST_READINGS: "otr_guest_readings",
  GUEST_JOURNAL: "otr_guest_journal",
  SETTINGS: "otr_settings",
  FAVORITES: "otr_favorites",
};

export const ROUTES = [
  { path: "/", redirect: "/home" },
  { path: "/home", title: "Home" },
  { path: "/reading", title: "Reading" },
  { path: "/result", title: "Result" },
  { path: "/daily", title: "Daily" },
  { path: "/library", title: "Library" },
  { path: "/history", title: "History" },
  { path: "/journal", title: "Journal" },
  { path: "/statistics", title: "Statistics" },
  { path: "/settings", title: "Settings" },
  { path: "/profile", title: "Profile" },
];

// Route yang tampil di sidebar / bottom nav (subset dari ROUTES, punya ikon)
export const NAV_ITEMS = [
  { path: "/home", label: "Home", icon: "home" },
  { path: "/reading", label: "Reading", icon: "cards" },
  { path: "/daily", label: "Daily", icon: "sun" },
  { path: "/library", label: "Library", icon: "book" },
  { path: "/journal", label: "Journal", icon: "feather" },
];

// Item tambahan yang hanya muncul di sidebar (tidak di bottom nav — batasi 5 utama)
export const NAV_ITEMS_SECONDARY = [
  { path: "/history", label: "History", icon: "clock" },
  { path: "/statistics", label: "Statistics", icon: "chart" },
  { path: "/settings", label: "Settings", icon: "gear" },
  { path: "/profile", label: "Profile", icon: "user" },
];
