// OTR — Default Spread Catalog
// AUTO-GENERATED (Phase 2 — Tarot Data Foundation). Katalog spread MVP sesuai
// Master Spec §13. Schema tiap spread mengikuti Master Spec §12.
//
// { id, name, category, description, cardCount, positions: [{ id, index, name, description }] }

export const DEFAULT_SPREADS = [
  {
    "id": "card_of_the_day",
    "name": "Card of the Day",
    "category": "daily",
    "description": "Satu kartu yang mewarnai energi hari ini.",
    "cardCount": 1,
    "positions": [
      {
        "id": "card",
        "index": 0,
        "name": "Kartu Hari Ini",
        "description": "Apa energi utama yang mewarnai harimu?"
      }
    ]
  },
  {
    "id": "quick_insight",
    "name": "Quick Insight",
    "category": "general",
    "description": "Satu kartu untuk mendapatkan sudut pandang cepat atas sebuah situasi.",
    "cardCount": 1,
    "positions": [
      {
        "id": "insight",
        "index": 0,
        "name": "Insight",
        "description": "Apa yang paling perlu kamu sadari saat ini?"
      }
    ]
  },
  {
    "id": "single_advice",
    "name": "Advice",
    "category": "general",
    "description": "Satu kartu berisi nasihat singkat untuk langkah selanjutnya.",
    "cardCount": 1,
    "positions": [
      {
        "id": "advice",
        "index": 0,
        "name": "Nasihat",
        "description": "Langkah apa yang sebaiknya kamu ambil?"
      }
    ]
  },
  {
    "id": "past_present_future",
    "name": "Past / Present / Future",
    "category": "general",
    "description": "Tiga kartu untuk melihat benang merah dari masa lalu ke masa depan.",
    "cardCount": 3,
    "positions": [
      {
        "id": "past",
        "index": 0,
        "name": "Masa Lalu",
        "description": "Apa yang membentuk situasi ini dari belakang?"
      },
      {
        "id": "present",
        "index": 1,
        "name": "Saat Ini",
        "description": "Bagaimana kondisi yang sedang dijalani sekarang?"
      },
      {
        "id": "future",
        "index": 2,
        "name": "Masa Depan",
        "description": "Ke arah mana ini kemungkinan menuju?"
      }
    ]
  },
  {
    "id": "three_card_situation",
    "name": "Situation / Challenge / Advice",
    "category": "general",
    "description": "Spread tiga kartu sederhana untuk memahami sebuah situasi.",
    "cardCount": 3,
    "positions": [
      {
        "id": "situation",
        "index": 0,
        "name": "Situation",
        "description": "Apa yang sedang terjadi saat ini?"
      },
      {
        "id": "challenge",
        "index": 1,
        "name": "Challenge",
        "description": "Apa yang membuat ini terasa sulit?"
      },
      {
        "id": "advice",
        "index": 2,
        "name": "Advice",
        "description": "Apa yang sebaiknya dipertimbangkan?"
      }
    ]
  },
  {
    "id": "mind_body_spirit",
    "name": "Mind / Body / Spirit",
    "category": "spiritual",
    "description": "Tiga kartu untuk melihat keselarasan antara pikiran, tubuh, dan jiwa.",
    "cardCount": 3,
    "positions": [
      {
        "id": "mind",
        "index": 0,
        "name": "Mind",
        "description": "Apa yang sedang mendominasi pikiranmu?"
      },
      {
        "id": "body",
        "index": 1,
        "name": "Body",
        "description": "Bagaimana kondisi fisik dan energimu saat ini?"
      },
      {
        "id": "spirit",
        "index": 2,
        "name": "Spirit",
        "description": "Apa yang sedang dibutuhkan jiwamu?"
      }
    ]
  },
  {
    "id": "problem_cause_solution",
    "name": "Problem / Cause / Solution",
    "category": "general",
    "description": "Tiga kartu untuk mengurai sebuah masalah sampai ke akarnya.",
    "cardCount": 3,
    "positions": [
      {
        "id": "problem",
        "index": 0,
        "name": "Problem",
        "description": "Apa masalah yang sebenarnya sedang dihadapi?"
      },
      {
        "id": "cause",
        "index": 1,
        "name": "Cause",
        "description": "Apa akar penyebab dari masalah ini?"
      },
      {
        "id": "solution",
        "index": 2,
        "name": "Solution",
        "description": "Apa arah solusi yang paling masuk akal?"
      }
    ]
  },
  {
    "id": "you_them_relationship",
    "name": "You / Them / Relationship",
    "category": "love",
    "description": "Tiga kartu untuk memahami dinamika antara kamu, orang lain, dan hubungannya.",
    "cardCount": 3,
    "positions": [
      {
        "id": "you",
        "index": 0,
        "name": "You",
        "description": "Apa yang sedang kamu bawa ke dalam hubungan ini?"
      },
      {
        "id": "them",
        "index": 1,
        "name": "Them",
        "description": "Apa yang sedang dibawa orang lain ke dalam hubungan ini?"
      },
      {
        "id": "relationship",
        "index": 2,
        "name": "Relationship",
        "description": "Bagaimana dinamika di antara kalian saat ini?"
      }
    ]
  },
  {
    "id": "career_path",
    "name": "Career Path",
    "category": "career",
    "description": "Lima kartu untuk memetakan arah karier secara lebih menyeluruh.",
    "cardCount": 5,
    "positions": [
      {
        "id": "current_situation",
        "index": 0,
        "name": "Current Situation",
        "description": "Bagaimana kondisi karier saat ini?"
      },
      {
        "id": "strength",
        "index": 1,
        "name": "Strength",
        "description": "Apa kekuatan utama yang kamu miliki?"
      },
      {
        "id": "challenge",
        "index": 2,
        "name": "Challenge",
        "description": "Apa tantangan terbesar yang dihadapi?"
      },
      {
        "id": "opportunity",
        "index": 3,
        "name": "Opportunity",
        "description": "Peluang apa yang bisa dimanfaatkan?"
      },
      {
        "id": "advice",
        "index": 4,
        "name": "Advice",
        "description": "Langkah apa yang sebaiknya diambil selanjutnya?"
      }
    ]
  },
  {
    "id": "love_reading",
    "name": "Love Reading",
    "category": "love",
    "description": "Lima kartu untuk membaca energi dan potensi dalam hubungan asmara.",
    "cardCount": 5,
    "positions": [
      {
        "id": "your_energy",
        "index": 0,
        "name": "Your Energy",
        "description": "Energi apa yang sedang kamu bawa dalam hubungan ini?"
      },
      {
        "id": "their_energy",
        "index": 1,
        "name": "Their Energy",
        "description": "Energi apa yang sedang dibawa pasangan/orang tersebut?"
      },
      {
        "id": "relationship_dynamic",
        "index": 2,
        "name": "Relationship Dynamic",
        "description": "Bagaimana dinamika di antara kalian?"
      },
      {
        "id": "challenge",
        "index": 3,
        "name": "Challenge",
        "description": "Apa tantangan yang sedang dihadapi bersama?"
      },
      {
        "id": "potential",
        "index": 4,
        "name": "Potential",
        "description": "Ke arah mana potensi hubungan ini menuju?"
      }
    ]
  }
];

/** @returns {object|undefined} */
export function getSpreadById(id) {
  return DEFAULT_SPREADS.find((s) => s.id === id);
}

/** @param {"daily"|"general"|"love"|"career"|"spiritual"} category */
export function getSpreadsByCategory(category) {
  return DEFAULT_SPREADS.filter((s) => s.category === category);
}

export function getAllSpreads() {
  return DEFAULT_SPREADS;
}
