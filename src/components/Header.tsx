import { useState } from 'react'
import { navigation } from '../data'
import { Icon } from './Icon'

type HeaderProps = {
  currentPath: string
  onNavigate: (path: string) => void
}

export function Header({ currentPath, onNavigate }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleNavigate = (path: string) => {
    setIsMenuOpen(false)
    onNavigate(path)
  }

  return (
    <header className="site-header">
      <div className="shell site-header__inner">
        <a className="wordmark" href="/" aria-label="Project Timeless home" onClick={(event) => { event.preventDefault(); handleNavigate('/') }}>
          <span className="wordmark__mark" aria-hidden="true"><span /></span>
          <span className="wordmark__text">Timeless</span>
        </a>

        <button
          className="menu-toggle"
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="primary-navigation"
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <Icon name={isMenuOpen ? 'close' : 'menu'} size={21} />
        </button>

        <nav id="primary-navigation" className={`primary-nav ${isMenuOpen ? 'is-open' : ''}`} aria-label="Primary navigation">
          <div className="primary-nav__links">
            {navigation.map((item) => (
              <a
                key={item.href}
                className={`nav-link ${currentPath === item.href ? 'is-active' : ''}`}
                href={item.href}
                aria-current={currentPath === item.href ? 'page' : undefined}
                onClick={(event) => { event.preventDefault(); handleNavigate(item.href) }}
              >
                {item.label}
              </a>
            ))}
          </div>
          <button className="button button--small button--outline" type="button" onClick={() => handleNavigate('/share')}>
            Preserve a Story <Icon name="arrow-up-right" size={15} />
          </button>
        </nav>
      </div>
    </header>
  )
}
