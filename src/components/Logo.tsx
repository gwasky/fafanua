// The id of the <symbol> holding the logo's artwork. vite.config.ts
// (logoSymbol, LOGO_SYMBOL_ID) puts it at the start of every page's
// <body>, built from public/fafanua-logo.svg, so no path data is in the
// JavaScript (#86).
const LOGO_SYMBOL = 'fafanua-logo-art'

// The header logo (#86): an inline, fixed-size SVG rather than an image,
// because WebKit counts it towards the first paint as soon as it is laid
// out, where an image only counted once it had loaded (#85). Its fills
// come from --color-logo-mark and --color-logo-wordmark, which .on-dark
// and a light forced-colours theme switch (tokens.css, global.css), so
// the positive and reversed artwork need no script. The size and the
// accessible name are those of the <img> it replaces.
function Logo({ className }: { className: string }) {
  return (
    <svg
      className={className}
      role="img"
      aria-label="Fafanua Technologies"
      viewBox="0 0 5046 714"
      width="296"
      height="42"
      focusable="false"
    >
      <use href={`#${LOGO_SYMBOL}`} />
    </svg>
  )
}

export default Logo
