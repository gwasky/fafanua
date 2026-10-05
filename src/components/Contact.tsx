import {
  contactButtonLabel,
  contactHeading,
  contactText,
  email,
  phone,
  phoneHref,
} from '../data/contact.ts'
import './Contact.css'

// The closing call to action (plan V2 §16): the heading and supporting
// copy, then the primary button, which opens an email to the address, and
// the address and phone number as plain links, all read from
// src/data/contact.ts. The button says what the link does, with an arrow
// hidden from assistive technology, so its name is the label alone; the
// address and number are shown, so visitors with no mail app or phone can
// select and copy them. The hero's "Discuss your data needs" shares the
// button's name and purpose, starting the conversation, but lands here.
// The id matches the "Contact" entry in src/data/navigation.ts. There is
// no form in this release.
function Contact() {
  const href = `mailto:${email}`

  return (
    <section
      id="contact"
      className="contact surface-alt"
      aria-labelledby="contact-heading"
    >
      <div className="container">
        <h2 id="contact-heading" className="contact__heading">
          {contactHeading}
        </h2>
        <p className="contact__text">{contactText}</p>
        <div className="contact__actions">
          <a className="button" href={href}>
            {contactButtonLabel}
            <span className="button__arrow" aria-hidden="true">
              →
            </span>
          </a>
          <div className="contact__direct">
            <a className="contact__email" href={href}>
              {email}
            </a>
            <a className="contact__phone" href={phoneHref}>
              {phone}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact
