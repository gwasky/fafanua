import { servicePages } from '../data/services.ts'
import { solutions } from '../data/solutions.ts'
import { serviceName, servicePath, solutionPath } from '../pages.ts'
import LandingSection from './LandingSection.tsx'
import './LandingPage.css'

// The page the Worker serves, with a 404 status, for any path that matches
// no file (#67). It says so plainly and offers the homepage and every
// service and solution page, so a mistyped or outdated link is not a dead
// end. Its HTML is marked noindex and it is not in sitemap.xml.
function NotFoundPage() {
  return (
    <>
      <div className="landing-intro">
        <div className="container">
          <h1 className="landing-intro__heading">Page not found</h1>
          <p className="landing-intro__lead">
            The page you were looking for does not exist or has moved.
          </p>
          <p className="landing-intro__text">
            <a href="/">Go to the Fafanua homepage</a>
          </p>
        </div>
      </div>

      <LandingSection id="all-services" heading="Services">
        <ul className="landing-links" role="list">
          {servicePages.map((page) => (
            <li key={page.key}>
              <a href={servicePath(page.key)}>{serviceName(page.key)}</a>
            </li>
          ))}
        </ul>
      </LandingSection>

      <LandingSection id="all-solutions" heading="Solutions">
        <ul className="landing-links" role="list">
          {solutions.map((solution) => (
            <li key={solution.id}>
              <a href={solutionPath(solution.id)}>{solution.page.heading}</a>
            </li>
          ))}
        </ul>
      </LandingSection>
    </>
  )
}

export default NotFoundPage
