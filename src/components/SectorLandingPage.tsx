import type { SectorLandingPage as SectorLandingPageCopy } from '../data/solutionPages.ts'
import AudienceCard from './AudienceCard.tsx'
import BadgeCard from './BadgeCard.tsx'
import Checklist from './Checklist.tsx'
import ClosingPanel from './ClosingPanel.tsx'
import DeliverableCards from './DeliverableCards.tsx'
import LandingHero from './LandingHero.tsx'
import LearnerJourney from './LearnerJourney.tsx'
import PairedCards from './PairedCards.tsx'
import PromiseStrip from './PromiseStrip.tsx'
import RatingMarker from './RatingMarker.tsx'
import ReconciliationCards from './ReconciliationCards.tsx'
import ServiceCards from './ServiceCards.tsx'
import StagesList from './StagesList.tsx'
import './SectorLanding.css'

// A solution landing page on the shared landing-page foundation (#93,
// section 2a of _docs/fafanua-public-sector-landing-page-plan.md), top to
// bottom: the hero with the trace diagram, the challenge and approach,
// the promise strip where the page has one (#98), who we work with, the
// Data Trust Assessment (#assessment), the learner journey where the page
// has one (issue 100), the reconciliation cards where the page has them (#98),
// Delivered in stages where the page has them, the
// AI (or readiness) and handling cards, the service cards and the closing
// panel (#contact). Who we work with may show segment cards, and the
// readiness card an eyebrow and no chips (Retail & Distribution, issue 101). PageLayout puts it in
// main.sector-landing, which scopes every style in SectorLanding.css, and
// leaves out the Contact section. All copy comes from the page's entry in
// solutionPages.ts, and the call to action from contact.ts.
function SectorLandingPage({ page }: { page: SectorLandingPageCopy }) {
  return (
    <>
      <LandingHero
        hero={page.hero}
        diagram={page.diagram}
        breadcrumb={page.breadcrumb}
        trail={[
          { label: 'Home', href: '/' },
          { label: 'Solutions', href: '/#solutions' },
        ]}
        assessmentId="assessment"
      />
      <PairedCards>
        <BadgeCard {...page.challenge} tone="amber" layout="inline" />
        <BadgeCard {...page.approach} layout="inline" />
      </PairedCards>
      {page.promise && <PromiseStrip promise={page.promise} />}
      <AudienceCard audience={page.audience} />
      <DeliverableCards assessment={page.assessment} id="assessment" />
      {page.journey && <LearnerJourney journey={page.journey} />}
      {page.reconciliation && <ReconciliationCards reconciliation={page.reconciliation} />}
      {page.stages && <StagesList stages={page.stages} />}
      <PairedCards>
        <BadgeCard
          heading={page.ai.heading}
          text={page.ai.text}
          label={page.ai.label}
          icon={page.ai.icon}
          layout="stacked"
        >
          {page.ai.chips && (
            <ul className="chips" role="list">
              {page.ai.chips.map((chip) => (
                <li key={chip.label} className="chip">
                  <RatingMarker marker={chip.marker} />
                  <span>{chip.label}</span>
                </li>
              ))}
            </ul>
          )}
        </BadgeCard>
        <BadgeCard heading={page.handling.heading} icon={page.handling.icon} layout="stacked">
          <Checklist items={page.handling.items} />
        </BadgeCard>
      </PairedCards>
      <ServiceCards services={page.services} />
      <ClosingPanel closing={page.closing} />
    </>
  )
}

export default SectorLandingPage
