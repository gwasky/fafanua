import {
  contactButtonLabel,
  contactHeading,
  contactText,
  email,
} from '../data/contact.ts'
import './Contact.css'

// The closing call to action: the plan's heading and supporting copy, then
// two plain mailto links, read from src/data/contact.ts. The button says
// what the link does and the text link shows the address, which visitors
// with no mail app can select and copy. The id matches the "Contact" entry
// in src/data/navigation.ts. There is no form in this release.
function Contact() {
  const href = `mailto:${email}`

  return (
    <section
      id="contact"
      className="contact surface-alt"
      aria-labelledby="contact-heading"
    >
      <div className="container">
        <h2 id="contact-heading">{contactHeading}</h2>
        <p className="contact__text">{contactText}</p>
        <div className="contact__actions">
          <a className="button" href={href}>
            {contactButtonLabel}
          </a>
          <a className="contact__email" href={href}>
            {email}
          </a>
        </div>
      </div>
    </section>
  )
}

export default Contact
