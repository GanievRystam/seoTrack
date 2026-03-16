export const CHECK_FREQUENCIES = [
    "DISABLED",
    "HOURLY",
    "EVERY_6_HOURS",
    "EVERY_12_HOURS",
    "DAILY",
    "WEEKLY",
    "MONTHLY",
  ] as const;

  export type CheckFrequencyEnum = (typeof CHECK_FREQUENCIES)[number];