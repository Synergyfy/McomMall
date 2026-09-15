/**
 * Shared tier levels for every plan family.
 * One row per level is seeded (STANDARD / PRO / PRO_PLUS);
 * admins never create these — they are auto-attached to each plan.
 */
export enum PlanTier {
  STANDARD = 'STANDARD',
  PRO = 'PRO',
  PRO_PLUS = 'PRO_PLUS',
}
