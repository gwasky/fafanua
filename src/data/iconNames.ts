// The names of the solution landing pages' icons (#93, section 2a of
// _docs/fafanua-public-sector-landing-page-plan.md), which Icon.tsx draws.
// A type of its own, so the pages' data can name icons without importing
// a component. The Health page (#94) added hospital, flask and pill, the
// Financial Services page (#98) swap, the Education page (issue 100) cap,
// and the Retail & Distribution page (issue 101) box and truck.
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
  | 'hospital'
  | 'flask'
  | 'pill'
  | 'swap'
  | 'cap'
  | 'box'
  | 'truck'
