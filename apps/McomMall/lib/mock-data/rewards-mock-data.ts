export interface RewardDetails {
  id: string;
  title: string;
  brand: string;
  category: string;
  cost: number;
  expiryText: string;
  description: string;
  image: string;
  badgeIcon: 'workspace_premium' | 'confirmation_number' | 'flash_on' | 'coffee';
  isHot?: boolean;
  longDescription: string;
}

export const REWARDS_MOCK_DATA: Record<string, RewardDetails> = {
  "coffee-duo": {
    id: "coffee-duo",
    title: "Artisan Coffee Duo",
    brand: "Grounded Cafe",
    category: "Available",
    cost: 500,
    expiryText: "Exp. in 2 days",
    description: "Two free premium beverages at any Grounded Cafe branch.",
    image: "https://lh3.googleusercontent.com/aida/AP1WRLsJoL2j41rPDG8AEWLNiVNSz4dQQvhmzX8XfsIOVykpxjqsB5Dymprj7ucVK8ixVpaKPIc9cG-b8EnPexKSHgfREuIv2lj30524j2bblzysf09c5J8GXOd1O35F6Z-7DtIqCQaZq1Mfzqlaq9CcM0g5HvMCNbEVzmgRRjeRpRzcBuwXnBENHt1RFC_0SwTWEfFPEqlAUD5MfZV_S5UhzqcxxLRzsBEL0F8eh1UtADT7JNZrayj2yqUKM5v9",
    badgeIcon: "workspace_premium",
    longDescription: "Indulge in our signature beverages, handcrafted to perfection. This reward is valid for any two specialty coffee, tea, or blended drinks at any Grounded Cafe location within the MCOM Mall. Excludes retail merchandise."
  },
  "mall-voucher": {
    id: "mall-voucher",
    title: "$20 Mall Voucher",
    brand: "MCOM Retail",
    category: "Available",
    cost: 1200,
    expiryText: "Exp. in 15 days",
    description: "Valid at all participating fashion and lifestyle retailers in MCOM Mall.",
    image: "https://lh3.googleusercontent.com/aida/AP1WRLt3G68y76ETxF9Y3JwbDncDXieIjIQZuMXUqR3GxN-l6QnVzcq2ZgWeQAjivHISy43wMmI5JjmFXWsVHfoO5vzCJXOiocLpOUfdhiAL_665zU6nsdponIxLsoEokVosVhHTuOeC1sBDtF_TasjMPEiAYGLfzKc5mUlCOPuGOxauIKkGoRh4lpXU0w6Xb91Ln5bukYkwpHwas5XQVCFJQ7rR8i2hhSk6niWda4PIsMRzVXAIICuhzwp7sTaE",
    badgeIcon: "confirmation_number",
    longDescription: "Receive $20 off your next purchase at any participating fashion, accessories, or lifestyle boutique in MCOM Mall. Combine this with existing merchant sales for ultimate savings."
  },
  "fitness-pass": {
    id: "fitness-pass",
    title: "Premium Fitness Pass",
    brand: "Zenith Wellness",
    category: "Available",
    cost: 2000,
    expiryText: "Limited Edition",
    description: "Gain 7-day unlimited access to the Zenith Wellness Studio. Includes one personal trainer consultation.",
    image: "https://lh3.googleusercontent.com/aida/AP1WRLuvXDsDRqGEO0TtRIF51l0Ut12tx3hR-mfN5EJYB6F0zInDeRVcm3aAkeGP_-vPebmuAMEDyiZp1Qu2RD7652rbi_lS0HBoRjBURHAXsSU938nYr8hN5B0bd36OlT_9FJQsMN3MrRxmMQNSJ7HW3gNrHfFQPHncfY4t2lfPX2ngbuQ4rZL0GgYSR8d5bmMHI0y9rCIbLVWCN8LZuige0KWNqdXd8lXGzZ5LpmBCURksCgzHJr6G3uco50U",
    badgeIcon: "flash_on",
    isHot: true,
    longDescription: "Experience unlimited access to state-of-the-art yoga, fitness classes, and high-end gym equipment for 7 consecutive days. Also includes a 45-minute 1-on-1 consultation with a certified wellness coach."
  },
  "signature-coffee": {
    id: "signature-coffee",
    title: "Signature Craft Coffee",
    brand: "Artisan Brew",
    category: "Available",
    cost: 200,
    expiryText: "Expires in 3 days",
    description: "Indulge in our Signature Craft Coffee, roasted in small batches to ensure complex flavor.",
    image: "https://lh3.googleusercontent.com/aida/AP1WRLsIDKv5UKmzhbNjFxrVOUmcCcVPt7GgJKW1QZqS0O9RWClVjgN9CtAON5CXL5u5WfHg01UMMq6cUd67amU7jhSnCcau1j6rPAVUv_boWOom1Q1eTacJf1_FNb65t_prI3mrIlxSHBOKFnPA1XTsmf8AV8-d355_lkZi_Zg0w0AMV5te1qTwSn9UG7nR8IfvvHg9pdn4BYCatv6BJAfWXrhjkvqKkxj7y-4kh8qF5nx5bhm41sFAVDFKadA",
    badgeIcon: "coffee",
    longDescription: "Indulge in our Signature Craft Coffee, meticulously roasted in small batches to ensure a flavor profile that is both robust and complex. This reward is redeemable for any large handcrafted coffee beverage at any Artisan Brew kiosk within the MCOM Mall ecosystem."
  }
};
