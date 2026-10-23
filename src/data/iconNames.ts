// The names of the solution landing pages' icons (#93, section 2a of
// _docs/fafanua-public-sector-landing-page-plan.md), which Icon.tsx draws.
// A type of its own, so the pages' data can name icons without importing
// a component. The Health page (#94) adds hospital, flask and pill.
export type IconName =
  | 'book'
  | 'chart'
  | 'list'
  | 'ledger'
  | 'card'
  | 'alert'
  | 'check'
  | 'gauge'
  | 'shield'
  | 'link'
  | 'map'
  | 'score'
  | 'tick'
