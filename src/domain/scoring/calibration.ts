export const CALIBRATION_VERSION = 2 as const;

export const TIME_ERROR_WORST_MS = 1500;
export const TIME_STDDEV_WORST_MS = 1000;
export const CENTER_DISTANCE_WORST = 0.25;
export const CENTER_DISPERSION_WORST = 0.15;
export const BALANCE_ERROR_WORST = 0.2;
export const BALANCE_DISPERSION_WORST = 0.1;
export const CONTROL_ERROR_WORST = 0.25;
export const CONTROL_DISPERSION_WORST = 0.15;
export const FOCUS_RT_WORST_MS = 4000;
export const SPATIAL_MEMORY_DISTANCE_WORST = 0.35;
export const STABILITY_STDDEV_WORST = 0.35;
export const ACCURACY_WEIGHT = 0.75;
export const CONSISTENCY_WEIGHT = 0.25;
export const DAILY_SCORE_DELTA_CAP = 8;
export const PREFINAL_WEIGHT = 0.8;
export const FINAL_CALIBRATION_WEIGHT = 0.2;
export const FINAL_SCORE_DELTA_CAP = 6;
export const PROFILE_SWITCH_MARGIN = 6;
export const IMPROVEMENT_DISPLAY_MIN_DELTA = 3;
export const TENDENCY_DISPLAY_THRESHOLD = 0.15;
export const CONDITION_SENSITIVITY_DISPLAY_THRESHOLD = 0.1;
export const CERTIFICATION_THRESHOLDS = {
  special: 95,
  grade1: 85,
  grade2: 70,
  grade3: 55,
  observer: 0,
} as const;

// CALIBRATION_VERSION 2 uses condition-centered DAILY modifiers. Values remain provisional until pilot testing.
export const STABILITY_CLASS_STABLE_MIN = 0.75;
export const STABILITY_CLASS_VARIABLE_MAX = 0.45;
