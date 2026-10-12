import { managedServices, services } from '../data/services.ts'
import { servicePages, type ServicePage as ServicePageCopy } from '../data/servicePages.ts'
import { solutions } from '../data/solutions.ts'
import { serviceName, servicePath, serviceStage, solutionPath } from '../pages.ts'
import Breadcrumbs from './Breadcrumbs.tsx'
import LandingSection from './LandingSection.tsx'
import SectionEyebrow from './SectionEyebrow.tsx'
import './LandingPage.css'

// A service landing page (SEO plan §17, #67), in the plan's order: the
// h1 and the commercial proposition (the approved description, then the
// page's intro), the problems the service solves, what Fafanua delivers,
// its operational activation where it has one, the Typical engagements
// (the card's list, or the managed panel's capabilities), the outcomes,
// where it fits in the lifecycle, the relevant sectors and related
// services. PageLayout adds the closing call to action. All copy comes
// from servicePages, services and managedServices in services.ts.
function ServicePage({ page }: { page: ServicePageCopy }) {
  const name = serviceName(page.key)
  const stage = serviceStage(page.key)
  const service = services.find((item) => item.id === page.key)
  const description = service?.description ?? managedServices.description
  const engagements = service?.engagements ?? managedServices.capabilities

  return (
    <>
      <div className="landing-intro">
        <div className="container">
          <Breadcrumbs
            trail={[
              { label: 'Home', href: '/' },
              { label: 'Services', href: '/#services' },
            ]}
            current={name}
          />
          <SectionEyebrow number={stage.number} label={stage.label} />
          <h1 className="landing-intro__heading">{page.heading}</h1>
          <p className="landing-intro__lead">{description}</p>
          <p className="landing-intro__text">{page.intro}</p>
        </div>
      </div>

      <LandingSection id="problems" heading="Problems this service solves">
        <ul className="landing-list" role="list">
          {page.problems.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      </LandingSection>

      <LandingSection id="delivers" heading="What Fafanua delivers">
        <ul className="landing-cards" role="list">
          {page.delivers.map((item) => (
            <li key={item.title} className="landing-card">
              <h3 className="landing-card__title">{item.title}</h3>
              <p className="landing-card__text">{item.text}</p>
            </li>
          ))}
        </ul>
      </LandingSection>

      {page.activation && (
        <LandingSection id="activation" heading={page.activation.heading}>
          <p className="landing-text">{page.activation.text}</p>
          <ul className="landing-list" role="list">
            {page.activation.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </LandingSection>
      )}

      <LandingSection id="typical-engagements" heading="Typical engagements">
        <ul className="landing-list landing-list--columns" role="list">
          {engagements.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </LandingSection>

      <LandingSection id="outcomes" heading="Business outcomes">
        <ul className="landing-list" role="list">
          {page.outcomes.map((outcome) => (
            <li key={outcome}>{outcome}</li>
          ))}
        </ul>
      </LandingSection>

      <LandingSection id="lifecycle" heading="Where it fits in the Fafanua lifecycle">
        <p className="landing-text">{page.fit}</p>
        <ol className="landing-lifecycle" role="list">
          {servicePages.map((other) => {
            const otherStage = serviceStage(other.key)
            const current = other.key === page.key
            return (
              <li
                key={other.key}
                className={`landing-lifecycle__item${current ? ' landing-lifecycle__item--current' : ''}`}
                aria-current={current ? 'page' : undefined}
              >
                <span className="landing-lifecycle__stage">{otherStage.label}</span>
                {current ? (
                  <span className="landing-lifecycle__name">{serviceName(other.key)}</span>
                ) : (
                  <a className="landing-lifecycle__name" href={servicePath(other.key)}>
                    {serviceName(other.key)}
                  </a>
                )}
              </li>
            )
          })}
        </ol>
      </LandingSection>

      <LandingSection id="sectors" heading="Relevant sectors">
        <ul className="landing-links" role="list">
          {page.solutions.map((id) => {
            const solution = solutions.find((item) => item.id === id)!
            return (
              <li key={id}>
                <a href={solutionPath(id)}>{solution.heading}</a>
                <p>{solution.summary.join(', ')}</p>
              </li>
            )
          })}
        </ul>
      </LandingSection>

      <LandingSection id="related-services" heading="Related services">
        <ul className="landing-links" role="list">
          {page.related.map((link) => (
            <li key={link.service}>
              <a href={servicePath(link.service)}>{link.label}</a>
              <p>{link.text}</p>
            </li>
          ))}
        </ul>
      </LandingSection>
    </>
  )
}

export default ServicePage
