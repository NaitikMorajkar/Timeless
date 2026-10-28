export type Story = {
  title: string
  excerpt: string
  category: string
  place: string
  year: string
  accent: string
}

export const stories: Story[] = [
  {
    title: 'The patience of a hand plane',
    excerpt: 'A quiet lesson in reading the grain, listening to the tool and letting the work set the pace.',
    category: 'Craft & Making',
    place: 'Example story · Kyoto, Japan',
    year: '1978',
    accent: 'amber',
  },
  {
    title: 'Tea at the edge of winter',
    excerpt: 'How one family kept a table warm through a changing season, one shared cup at a time.',
    category: 'Ritual & Culture',
    place: 'Example story · Leh, India',
    year: '1964',
    accent: 'rose',
  },
  {
    title: 'What the river taught us',
    excerpt: 'A field guide to noticing weather, water and the small signs that help a community prepare.',
    category: 'Land & Stewardship',
    place: 'Example story · Delta State, Nigeria',
    year: '1989',
    accent: 'sage',
  },
]

export const navigation = [
  { label: 'Home', href: '/' },
  { label: 'Explore Archive', href: '/archive' },
  { label: 'Share a Story', href: '/share' },
  { label: 'Ask the Archive', href: '/ask' },
]

export const pageContent = {
  '/archive': {
    eyebrow: 'Prepared layout · future step',
    title: 'A living index of what matters.',
    copy: 'The archive will bring lived experience, cultural knowledge and practical wisdom into view without flattening the stories that hold them.',
    note: 'Archive browsing is not connected in this foundation preview.',
    cta: 'Return home',
  },
  '/share': {
    eyebrow: 'Share a Story · local capture',
    title: 'Make room for what you know.',
    copy: 'A considered space for people to pass on the details, rituals and hard-won lessons that rarely fit inside a search result.',
    note: 'Story capture works locally in this preview. Entries are held in your browser and are not yet stored on a server.',
    cta: 'Return home',
  },
  '/ask': {
    eyebrow: 'Ask the Archive · live model',
    title: 'Questions deserve context.',
    copy: 'Ask the Archive will help future generations find thoughtful guidance grounded in lived experience, with care for where every answer came from.',
    note: 'General AI guidance is available through Nebius Token Factory. Responses are not yet grounded in verified archived stories.',
    cta: 'Return home',
  },
} as const
