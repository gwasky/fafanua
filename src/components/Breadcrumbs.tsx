import './Breadcrumbs.css'

type Crumb = { readonly label: string; readonly href: string }

type BreadcrumbsProps = {
  /** The links before the current page, from the homepage down. */
  trail: readonly Crumb[]
  /** The current page's name, shown last and not linked. */
  current: string
}

// The landing pages' breadcrumb trail (#67): a labelled nav holding an
// ordered list, the current page last with aria-current. The separators
// are drawn in Breadcrumbs.css, so they are never announced.
function Breadcrumbs({ trail, current }: BreadcrumbsProps) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol className="breadcrumbs__list" role="list">
        {trail.map((crumb) => (
          <li key={crumb.href} className="breadcrumbs__item">
            <a href={crumb.href}>{crumb.label}</a>
          </li>
        ))}
        <li className="breadcrumbs__item" aria-current="page">
          {current}
        </li>
      </ol>
    </nav>
  )
}

export default Breadcrumbs
