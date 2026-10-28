import type { SVGProps } from 'react'

type IconName = 'arrow-up-right' | 'arrow-down' | 'menu' | 'close' | 'spark' | 'bookmark' | 'layers' | 'quote'

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName
  size?: number
}

export function Icon({ name, size = 18, ...props }: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    ...props,
  }

  if (name === 'arrow-up-right') {
    return <svg {...common}><path d="M5 19 19 5" /><path d="M8 5h11v11" /></svg>
  }
  if (name === 'arrow-down') {
    return <svg {...common}><path d="M12 4v16" /><path d="m6 14 6 6 6-6" /></svg>
  }
  if (name === 'menu') {
    return <svg {...common}><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></svg>
  }
  if (name === 'close') {
    return <svg {...common}><path d="m6 6 12 12" /><path d="M18 6 6 18" /></svg>
  }
  if (name === 'spark') {
    return <svg {...common}><path d="m12 3 1.35 5.65L19 10l-5.65 1.35L12 17l-1.35-5.65L5 10l5.65-1.35L12 3Z" /><path d="m19 16 .45 1.55L21 18l-1.55.45L19 20l-.45-1.55L17 18l1.55-.45L19 16Z" /></svg>
  }
  if (name === 'bookmark') {
    return <svg {...common}><path d="M6 4.75A1.75 1.75 0 0 1 7.75 3h8.5A1.75 1.75 0 0 1 18 4.75V21l-6-3.5L6 21V4.75Z" /></svg>
  }
  if (name === 'layers') {
    return <svg {...common}><path d="m12 3 8.5 4.75L12 12.5 3.5 7.75 12 3Z" /><path d="m3.5 12.25 8.5 4.75 8.5-4.75" /><path d="m3.5 16.75 8.5 4.75 8.5-4.75" /></svg>
  }
  return <svg {...common}><path d="M6 5.5h12v13H6z" /><path d="M9 9h6" /><path d="M9 13h4" /></svg>
}
