import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: number
}

export function Reveal({ children, className = '', delay = 0 }: RevealProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -24px' },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const style = { '--reveal-delay': `${delay}ms` } as CSSProperties

  return (
    <div ref={elementRef} className={`reveal ${isVisible ? 'is-visible' : ''} ${className}`} style={style}>
      {children}
    </div>
  )
}
