/**
 * NodeHunt 2026 — Master Passcode & Security Configuration
 * 
 * Edit this file to alter:
 * 1. Invigilator SUCCESS codes (approves solutions, awards points, unlocks path)
 * 2. Invigilator STRIKE codes (records wrong attempt, decrements attempts left)
 */

export const PASSCODE_CONFIG = {
  // Codes typed by room volunteers to approve a participant's solution
  // Case-insensitive. You can add or change any codes here.
  SUCCESS_PASSCODES: [
    "verified26",
    "solved",
    "sunsunsunday",
    "nodehunt",
    "siamvit",
  ],

  // Codes typed by room volunteers to issue a strike / failed attempt
  // Case-insensitive.
  STRIKE_PASSCODES: [
    "strike26",
    "retry",
    "wrong",
    "strike",
  ],
};
