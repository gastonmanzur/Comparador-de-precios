export const featureFlags = {
  billing: import.meta.env.VITE_FEATURE_BILLING === 'true'
} as const;
