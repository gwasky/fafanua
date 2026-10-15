// The problem block's copy, between the hero and the assessment (#79,
// _docs/fafanua-data-trust-assessment-homepage-enhancement.md): the
// eyebrow and the framing paragraph (its §5), the problem statement (the
// V2 refinement plan §3, #63, unchanged), and the bridge line into the
// assessment (its §6). W10 in _docs/fafanua-trust-lineage-positioning-plan.md
// (#80) sets the statement in two tones, so it is stored as its two
// sentences, the lead and the challenge, and positioningProblem joins them
// with one space: still the plan's quote, character for character. The
// eyebrow is stored in sentence case, as every eyebrow is, and CSS shows
// it in capitals. positioning.plan.test.ts checks each against its plan.
// Fafanua's response was removed because it restated the hero (W3, #70).
// Positioning.tsx reads this copy from here and nowhere else.

export const positioningEyebrow = 'The problem'

export const positioningFraming =
  'Organisations rarely lack data. The challenge is knowing whether the numbers used to run the business are connected, consistent and trustworthy.'

export const positioningProblemLead =
  'Most organisations already have data, reporting and operational systems.'

export const positioningProblemChallenge =
  'The challenge is making the information flowing through them connected, consistent and trusted.'

export const positioningProblem = `${positioningProblemLead} ${positioningProblemChallenge}`

export const positioningTransition =
  'That is why Fafanua starts by tracing the numbers leadership relies on most back to their source.'
