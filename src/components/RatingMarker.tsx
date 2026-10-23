import type { Marker } from '../data/solutionPages.ts'

// A rating's or chip's marker (#93): a teal dot, an amber dot (the
// caveats) or a hollow ring. Drawn with borders, so forced-colours mode
// keeps it; decorative, as its text label always follows it.
function RatingMarker({ marker }: { marker: Marker }) {
  return <span className={`rating-marker rating-marker--${marker}`} aria-hidden="true" />
}

export default RatingMarker
