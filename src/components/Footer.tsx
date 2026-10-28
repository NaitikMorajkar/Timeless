import { navigation } from '../data'
import { Icon } from './Icon'

type FooterProps = {
  onNavigate: (path: string) => void
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="site-footer">
      <div className="shell">
        <div className="site-footer__top">
          <div className="footer-intro">
            <a className="wordmark wordmark--footer" href="/" onClick={(event) => { event.preventDefault(); onNavigate('/') }}>
              <span className="wordmark__mark" aria-hidden="true"><span /></span>
              <span className="wordmark__text">Timeless</span>
            </a>
            <p>Preserve wisdom. Connect generations. Empower humanity.</p>
          </div>
          <div className="footer-links">
            <span className="footer-label">Navigate</span>
            {navigation.slice(1).map((item) => (
              <a key={item.href} href={item.href} onClick={(event) => { event.preventDefault(); onNavigate(item.href) }}>
                {item.label} <Icon name="arrow-up-right" size={13} />
              </a>
            ))}
          </div>
          <div className="footer-note">
            <span className="footer-label">Foundation preview</span>
            <p>Designed for the stories that should outlive us.</p>
          </div>
        </div>
        <div className="site-footer__bottom">
          <span>Project Timeless · Step 1</span>
          <span>© {new Date().getFullYear()} Timeless Archive</span>
        </div>
      </div>
    </footer>
  )
}
