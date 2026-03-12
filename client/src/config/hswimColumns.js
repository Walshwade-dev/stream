// Column definitions for HSWIM hourly table (Table 1)
export const HOURLY_COLUMNS = [
  { key: "time", label: "Time",                    rotated: true },
  { key: "D",    label: "Multi\nDeck\n[D]",        rotated: true },
  { key: "S",    label: "Single\nAxle\n[S]",       rotated: true },
  { key: "M",    label: "Manually\n[M]",           rotated: true },
  { key: "H",    label: "HSWIM\nTotal\n[H]",       rotated: true },
  { key: "Q",    label: "HSWIM\nCleared\n[Q]",     rotated: true },
  { key: "X",    label: "Total\nWeighed\n[X]",     rotated: true },
  { key: "C",    label: "Called\nIn\n[C]",         rotated: true },
  { key: "A",    label: "Warned\nTrucks\n[A]",     rotated: true },
  { key: "Z",    label: "Charged\nIn Court\n[Z]",  rotated: true },
  { key: "G",    label: "Special\nRelease\n[G]",   rotated: true },
  { key: "R",    label: "Redistri-\nbuted\n[R]",   rotated: true },
  { key: "P",    label: "Impounded\n& Prohib.\n[P]", rotated: true },
  { key: "Y",    label: "Total\nOverloaded\n[Y]",  rotated: true },
  { key: "E",    label: "Exempt\nPermits\nNot Weighed", rotated: true },
];

// Graph table columns (Table 2)
export const GRAPH_COLUMNS = [
  { key: "time", label: "Time" },
  { key: "N",    label: "Multideck\nScale [N]" },
  { key: "M",    label: "Manually\n[M]" },
  { key: "Q",    label: "HSWIM\nCleared [Q]" },
  { key: "X",    label: "Total\nWeighed [X]" },
];

// Summary fields for Table 4
export const SUMMARY_FIELDS = [
  { key: "Q",          label: "HSWIM Cleared [Q]" },
  { key: "N",          label: "Multideck Scale [N]" },
  { key: "M",          label: "Manually [M]" },
  { key: "X",          label: "Total Weighed [X]" },
  { key: "T",          label: "Total Traffic [T]" },
  { key: "Y",          label: "Total Overloaded [Y]" },
  { key: "A",          label: "Warned Trucks [A]" },
  { key: "Z",          label: "Charged In Court [Z]" },
  { key: "G",          label: "Special Release [G]" },
  { key: "R",          label: "Redistributed [R]" },
  { key: "P",          label: "Impounded & Prohibited [P]" },
  { key: "B",          label: "Cases Cleared In Court [B]" },
  { key: "L",          label: "Transgressions [L]" },
  { key: "E",          label: "Exempt Permits Not Weighed [E]" },
  { key: "F",          label: "Exempt Permits Weighed [F]" },
  { key: "exemptTotal",label: "Total Exemptions [E+F]" },
];

// Census fields for Table 3
export const CENSUS_FIELDS = [
  { key: "buses",         label: "Buses ≥3500kg" },
  { key: "veh3500to7000", label: "Vehicles ≥3500kg <7000kg (excl. buses)" },
  { key: "veh7000plus",   label: "Vehicles ≥7000kg (excl. buses)" },
  { key: "K",             label: "Total Census [K]" },
  { key: "E",             label: "Exempt Permits Not Weighed [E]" },
  { key: "X",             label: "Total Weighed [X]" },
  { key: "T",             label: "Total Traffic [T]" },
];