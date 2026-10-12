import { solutions, type Solution } from '../data/solutions.ts'
import { activationIntro, type SolutionPage as SolutionPageCopy } from '../data/solutionPages.ts'
import { servicePath, solutionPath } from '../pages.ts'
import Breadcrumbs from './Breadcrumbs.tsx'
import LandingSection from './LandingSection.tsx'
import SectionEyebrow from './SectionEyebrow.tsx'
import './LandingPage.css'

// A solution landing page (SEO plan §18, #67), in the plan's order: the
// sector's h1 and who it is for, the sector context (with its audiences,
// for Health), the common data problems, the relevant Fafanua services,
// each linked, the reporting and analytics use cases (the sector's
// themes), data quality and governance, operational activation, and the
// other sectors. PageLayout adds the closing call to action. All copy
// comes from solutions.ts: the row data and the sector's solutionPages copy.
function SolutionPage({ solution, page }: { solution: Solution; page: SolutionPageCopy }) {
  return (
    <>
      <div className="landing-intro">
        <div className="container">
          <Breadcrumbs
            trail={[
              { label: 'Home', href: '/' },
              { label: 'Solutions', href: '/#solutions' },
            ]}
            current={solution.title}
          />
          <SectionEyebrow label="Solutions" />
          <h1 className="landing-intro__heading">{solution.heading}</h1>
          <p className="landing-intro__lead">{page.lead}</p>
        </div>
      </div>

      <LandingSection id="context" heading="Sector context">
        {page.context.map((paragraph) => (
          <p key={paragraph} className="landing-text">
            {paragraph}
          </p>
        ))}
        {page.audiences && (
          <ul className="landing-cards" role="list">
            {page.audiences.map((audience) => (
              <li key={audience.heading} className="landing-card">
                <h3 className="landing-card__title">{audience.heading}</h3>
                <p className="landing-card__text">{audience.text}</p>
                <ul className="landing-card__list" role="list">
                  {audience.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </LandingSection>

      <LandingSection id="problems" heading="Common data problems">
        <ul className="landing-list" role="list">
          {page.problems.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      </LandingSection>

      <LandingSection id="how-fafanua-helps" heading="How Fafanua helps">
        <ul className="landing-links" role="list">
          {page.services.map((link) => (
            <li key={link.service}>
              <a href={servicePath(link.service)}>{link.label}</a>
              <p>{link.text}</p>
            </li>
          ))}
        </ul>
      </LandingSection>

      <LandingSection id="use-cases" heading="Reporting and analytics use cases">
        <ul className="landing-list landing-list--columns" role="list">
          {solution.themes.map((theme) => (
            <li key={theme}>{theme}</li>
          ))}
        </ul>
      </LandingSection>

      <LandingSection id="governance" heading="Data quality and governance">
        <ul className="landing-list" role="list">
          {page.governance.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </LandingSection>

      <LandingSection id="activation" heading="Operational activation">
        <p className="landing-text">
          {activationIntro.before}
          <a href={servicePath('data-engineering-and-integration')}>{activationIntro.link}</a>
          {activationIntro.after}
        </p>
        <ul className="landing-list" role="list">
          {page.activation.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </LandingSection>

      <LandingSection id="other-sectors" heading="Other sectors">
        <ul className="landing-links" role="list">
          {solutions
            .filter((other) => other.id !== solution.id)
            .map((other) => (
              <li key={other.id}>
                <a href={solutionPath(other.id)}>{other.heading}</a>
                <p>{other.summary.join(', ')}</p>
              </li>
            ))}
        </ul>
      </LandingSection>
    </>
  )
}

export default SolutionPage
