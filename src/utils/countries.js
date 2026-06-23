import { isValidPhoneNumber } from "libphonenumber-js";

export const COUNTRIES = [
  {
    code: "AF",
    name: "Afghanistan",
    nationality: "Afghan",
    dialCode: "+93",
    flag: "🇦🇫",
  },
  {
    code: "AL",
    name: "Albania",
    nationality: "Albanian",
    dialCode: "+355",
    flag: "🇦🇱",
  },
  {
    code: "DZ",
    name: "Algeria",
    nationality: "Algerian",
    dialCode: "+213",
    flag: "🇩🇿",
  },
  {
    code: "AR",
    name: "Argentina",
    nationality: "Argentine",
    dialCode: "+54",
    flag: "🇦🇷",
  },
  {
    code: "AU",
    name: "Australia",
    nationality: "Australian",
    dialCode: "+61",
    flag: "🇦🇺",
  },
  {
    code: "AT",
    name: "Austria",
    nationality: "Austrian",
    dialCode: "+43",
    flag: "🇦🇹",
  },
  {
    code: "BD",
    name: "Bangladesh",
    nationality: "Bangladeshi",
    dialCode: "+880",
    flag: "🇧🇩",
  },
  {
    code: "BE",
    name: "Belgium",
    nationality: "Belgian",
    dialCode: "+32",
    flag: "🇧🇪",
  },
  {
    code: "BR",
    name: "Brazil",
    nationality: "Brazilian",
    dialCode: "+55",
    flag: "🇧🇷",
  },
  {
    code: "BG",
    name: "Bulgaria",
    nationality: "Bulgarian",
    dialCode: "+359",
    flag: "🇧🇬",
  },
  {
    code: "CA",
    name: "Canada",
    nationality: "Canadian",
    dialCode: "+1",
    flag: "🇨🇦",
  },
  {
    code: "CN",
    name: "China",
    nationality: "Chinese",
    dialCode: "+86",
    flag: "🇨🇳",
  },
  {
    code: "CO",
    name: "Colombia",
    nationality: "Colombian",
    dialCode: "+57",
    flag: "🇨🇴",
  },
  {
    code: "HR",
    name: "Croatia",
    nationality: "Croatian",
    dialCode: "+385",
    flag: "🇭🇷",
  },
  {
    code: "CU",
    name: "Cuba",
    nationality: "Cuban",
    dialCode: "+53",
    flag: "🇨🇺",
  },
  {
    code: "CY",
    name: "Cyprus",
    nationality: "Cypriot",
    dialCode: "+357",
    flag: "🇨🇾",
  },
  {
    code: "CZ",
    name: "Czechia",
    nationality: "Czech",
    dialCode: "+420",
    flag: "🇨🇿",
  },
  {
    code: "DK",
    name: "Denmark",
    nationality: "Danish",
    dialCode: "+45",
    flag: "🇩🇰",
  },
  {
    code: "EG",
    name: "Egypt",
    nationality: "Egyptian",
    dialCode: "+20",
    flag: "🇪🇬",
  },
  {
    code: "EE",
    name: "Estonia",
    nationality: "Estonian",
    dialCode: "+372",
    flag: "🇪🇪",
  },
  {
    code: "ET",
    name: "Ethiopia",
    nationality: "Ethiopian",
    dialCode: "+251",
    flag: "🇪🇹",
  },
  {
    code: "FI",
    name: "Finland",
    nationality: "Finnish",
    dialCode: "+358",
    flag: "🇫🇮",
  },
  {
    code: "FR",
    name: "France",
    nationality: "French",
    dialCode: "+33",
    flag: "🇫🇷",
  },
  {
    code: "DE",
    name: "Germany",
    nationality: "German",
    dialCode: "+49",
    flag: "🇩🇪",
  },
  {
    code: "GH",
    name: "Ghana",
    nationality: "Ghanaian",
    dialCode: "+233",
    flag: "🇬🇭",
  },
  {
    code: "GR",
    name: "Greece",
    nationality: "Greek",
    dialCode: "+30",
    flag: "🇬🇷",
  },
  {
    code: "HK",
    name: "Hong Kong",
    nationality: "Hong Konger",
    dialCode: "+852",
    flag: "🇭🇰",
  },
  {
    code: "HU",
    name: "Hungary",
    nationality: "Hungarian",
    dialCode: "+36",
    flag: "🇭🇺",
  },
  {
    code: "IS",
    name: "Iceland",
    nationality: "Icelandic",
    dialCode: "+354",
    flag: "🇮🇸",
  },
  {
    code: "IN",
    name: "India",
    nationality: "Indian",
    dialCode: "+91",
    flag: "🇮🇳",
  },
  {
    code: "ID",
    name: "Indonesia",
    nationality: "Indonesian",
    dialCode: "+62",
    flag: "🇮🇩",
  },
  {
    code: "IR",
    name: "Iran",
    nationality: "Iranian",
    dialCode: "+98",
    flag: "🇮🇷",
  },
  {
    code: "IQ",
    name: "Iraq",
    nationality: "Iraqi",
    dialCode: "+964",
    flag: "🇮🇶",
  },
  {
    code: "IE",
    name: "Ireland",
    nationality: "Irish",
    dialCode: "+353",
    flag: "🇮🇪",
  },
  {
    code: "IL",
    name: "Israel",
    nationality: "Israeli",
    dialCode: "+972",
    flag: "🇮🇱",
  },
  {
    code: "IT",
    name: "Italy",
    nationality: "Italian",
    dialCode: "+39",
    flag: "🇮🇹",
  },
  {
    code: "JM",
    name: "Jamaica",
    nationality: "Jamaican",
    dialCode: "+1",
    flag: "🇯🇲",
  },
  {
    code: "JP",
    name: "Japan",
    nationality: "Japanese",
    dialCode: "+81",
    flag: "🇯🇵",
  },
  {
    code: "JO",
    name: "Jordan",
    nationality: "Jordanian",
    dialCode: "+962",
    flag: "🇯🇴",
  },
  {
    code: "KE",
    name: "Kenya",
    nationality: "Kenyan",
    dialCode: "+254",
    flag: "🇰🇪",
  },
  {
    code: "KW",
    name: "Kuwait",
    nationality: "Kuwaiti",
    dialCode: "+965",
    flag: "🇰🇼",
  },
  {
    code: "LV",
    name: "Latvia",
    nationality: "Latvian",
    dialCode: "+371",
    flag: "🇱🇻",
  },
  {
    code: "LB",
    name: "Lebanon",
    nationality: "Lebanese",
    dialCode: "+961",
    flag: "🇱🇧",
  },
  {
    code: "LT",
    name: "Lithuania",
    nationality: "Lithuanian",
    dialCode: "+370",
    flag: "🇱🇹",
  },
  {
    code: "LU",
    name: "Luxembourg",
    nationality: "Luxembourgish",
    dialCode: "+352",
    flag: "🇱🇺",
  },
  {
    code: "MY",
    name: "Malaysia",
    nationality: "Malaysian",
    dialCode: "+60",
    flag: "🇲🇾",
  },
  {
    code: "MT",
    name: "Malta",
    nationality: "Maltese",
    dialCode: "+356",
    flag: "🇲🇹",
  },
  {
    code: "MX",
    name: "Mexico",
    nationality: "Mexican",
    dialCode: "+52",
    flag: "🇲🇽",
  },
  {
    code: "MA",
    name: "Morocco",
    nationality: "Moroccan",
    dialCode: "+212",
    flag: "🇲🇦",
  },
  {
    code: "NP",
    name: "Nepal",
    nationality: "Nepali",
    dialCode: "+977",
    flag: "🇳🇵",
  },
  {
    code: "NL",
    name: "Netherlands",
    nationality: "Dutch",
    dialCode: "+31",
    flag: "🇳🇱",
  },
  {
    code: "NZ",
    name: "New Zealand",
    nationality: "New Zealander",
    dialCode: "+64",
    flag: "🇳🇿",
  },
  {
    code: "NG",
    name: "Nigeria",
    nationality: "Nigerian",
    dialCode: "+234",
    flag: "🇳🇬",
  },
  {
    code: "NO",
    name: "Norway",
    nationality: "Norwegian",
    dialCode: "+47",
    flag: "🇳🇴",
  },
  {
    code: "PK",
    name: "Pakistan",
    nationality: "Pakistani",
    dialCode: "+92",
    flag: "🇵🇰",
  },
  {
    code: "PS",
    name: "Palestine",
    nationality: "Palestinian",
    dialCode: "+970",
    flag: "🇵🇸",
  },
  {
    code: "PH",
    name: "Philippines",
    nationality: "Filipino",
    dialCode: "+63",
    flag: "🇵🇭",
  },
  {
    code: "PL",
    name: "Poland",
    nationality: "Polish",
    dialCode: "+48",
    flag: "🇵🇱",
  },
  {
    code: "PT",
    name: "Portugal",
    nationality: "Portuguese",
    dialCode: "+351",
    flag: "🇵🇹",
  },
  {
    code: "QA",
    name: "Qatar",
    nationality: "Qatari",
    dialCode: "+974",
    flag: "🇶🇦",
  },
  {
    code: "RO",
    name: "Romania",
    nationality: "Romanian",
    dialCode: "+40",
    flag: "🇷🇴",
  },
  {
    code: "RU",
    name: "Russia",
    nationality: "Russian",
    dialCode: "+7",
    flag: "🇷🇺",
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    nationality: "Saudi",
    dialCode: "+966",
    flag: "🇸🇦",
  },
  {
    code: "RS",
    name: "Serbia",
    nationality: "Serbian",
    dialCode: "+381",
    flag: "🇷🇸",
  },
  {
    code: "SG",
    name: "Singapore",
    nationality: "Singaporean",
    dialCode: "+65",
    flag: "🇸🇬",
  },
  {
    code: "SK",
    name: "Slovakia",
    nationality: "Slovak",
    dialCode: "+421",
    flag: "🇸🇰",
  },
  {
    code: "SI",
    name: "Slovenia",
    nationality: "Slovenian",
    dialCode: "+386",
    flag: "🇸🇮",
  },
  {
    code: "ZA",
    name: "South Africa",
    nationality: "South African",
    dialCode: "+27",
    flag: "🇿🇦",
  },
  {
    code: "KR",
    name: "South Korea",
    nationality: "South Korean",
    dialCode: "+82",
    flag: "🇰🇷",
  },
  {
    code: "ES",
    name: "Spain",
    nationality: "Spanish",
    dialCode: "+34",
    flag: "🇪🇸",
  },
  {
    code: "LK",
    name: "Sri Lanka",
    nationality: "Sri Lankan",
    dialCode: "+94",
    flag: "🇱🇰",
  },
  {
    code: "SE",
    name: "Sweden",
    nationality: "Swedish",
    dialCode: "+46",
    flag: "🇸🇪",
  },
  {
    code: "CH",
    name: "Switzerland",
    nationality: "Swiss",
    dialCode: "+41",
    flag: "🇨🇭",
  },
  {
    code: "SY",
    name: "Syria",
    nationality: "Syrian",
    dialCode: "+963",
    flag: "🇸🇾",
  },
  {
    code: "TW",
    name: "Taiwan",
    nationality: "Taiwanese",
    dialCode: "+886",
    flag: "🇹🇼",
  },
  {
    code: "TZ",
    name: "Tanzania",
    nationality: "Tanzanian",
    dialCode: "+255",
    flag: "🇹🇿",
  },
  {
    code: "TH",
    name: "Thailand",
    nationality: "Thai",
    dialCode: "+66",
    flag: "🇹🇭",
  },
  {
    code: "TN",
    name: "Tunisia",
    nationality: "Tunisian",
    dialCode: "+216",
    flag: "🇹🇳",
  },
  {
    code: "TR",
    name: "Turkey",
    nationality: "Turkish",
    dialCode: "+90",
    flag: "🇹🇷",
  },
  {
    code: "UG",
    name: "Uganda",
    nationality: "Ugandan",
    dialCode: "+256",
    flag: "🇺🇬",
  },
  {
    code: "UA",
    name: "Ukraine",
    nationality: "Ukrainian",
    dialCode: "+380",
    flag: "🇺🇦",
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    nationality: "Emirati",
    dialCode: "+971",
    flag: "🇦🇪",
  },
  {
    code: "GB",
    name: "United Kingdom",
    nationality: "British",
    dialCode: "+44",
    flag: "🇬🇧",
  },
  {
    code: "US",
    name: "United States",
    nationality: "American",
    dialCode: "+1",
    flag: "🇺🇸",
  },
  {
    code: "VN",
    name: "Vietnam",
    nationality: "Vietnamese",
    dialCode: "+84",
    flag: "🇻🇳",
  },
  {
    code: "YE",
    name: "Yemen",
    nationality: "Yemeni",
    dialCode: "+967",
    flag: "🇾🇪",
  },
  {
    code: "ZM",
    name: "Zambia",
    nationality: "Zambian",
    dialCode: "+260",
    flag: "🇿🇲",
  },
  {
    code: "ZW",
    name: "Zimbabwe",
    nationality: "Zimbabwean",
    dialCode: "+263",
    flag: "🇿🇼",
  },
];

/** Alphabetical list of nationality strings (e.g. for a <select>). */
export const NATIONALITIES = COUNTRIES.map((c) => c.nationality).sort((a, b) =>
  a.localeCompare(b),
);

/** Look up a country by its ISO alpha-2 code. */
export function getCountryByCode(code) {
  if (!code) return null;
  const up = String(code).toUpperCase();
  return COUNTRIES.find((c) => c.code === up) || null;
}

/** Look up a country by nationality/demonym (case-insensitive). */
export function getCountryByNationality(nationality) {
  if (!nationality) return null;
  const lc = String(nationality).toLowerCase();
  return COUNTRIES.find((c) => c.nationality.toLowerCase() === lc) || null;
}

/** Look up a country by dial code (e.g. "+44"). First match wins (+1 → US). */
export function getCountryByDialCode(dialCode) {
  if (!dialCode) return null;
  const dc = String(dialCode).trim();
  const withPlus = dc.startsWith("+") ? dc : `+${dc}`;
  return COUNTRIES.find((c) => c.dialCode === withPlus) || null;
}

/** Sorted list of country names (e.g. for a Country <select>). */
export const COUNTRY_NAMES = COUNTRIES.map((c) => c.name).sort((a, b) =>
  a.localeCompare(b),
);

/** Default dial code (UK) — sensible default for a UK-based CRM. */
export const DEFAULT_COUNTRY = "GB";

/**
 * Validate a phone number given a separate dial code + national number,
 * using libphonenumber-js for strict per-country rules.
 *
 * @param {string} dialCode  e.g. "+44"
 * @param {string} national  local digits the user typed, e.g. "7911123456"
 * @returns {boolean} true when the combined number is valid for that region.
 */
export function isValidPhone(dialCode, national) {
  const digits = String(national || "").replace(/[^\d]/g, "");
  if (!digits) return false;
  const country = getCountryByDialCode(dialCode);
  try {
    // Prefer region-based validation; fall back to E.164 string.
    if (country) return isValidPhoneNumber(digits, country.code);
    const e164 = `${String(dialCode || "").trim()}${digits}`;
    return isValidPhoneNumber(e164);
  } catch {
    return false;
  }
}
