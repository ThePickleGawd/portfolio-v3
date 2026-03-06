const BLOG_URL = 'https://blog.dylanlu.com'

export interface BlogPost {
  title: string
  url: string
  date: string
  excerpt: string
}

export async function getRecentPosts(limit = 5): Promise<BlogPost[]> {
  try {
    const res = await fetch(`${BLOG_URL}/rss/`, { next: { revalidate: 3600 } })
    if (!res.ok) return []

    const xml = await res.text()

    const items: BlogPost[] = []
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    let match

    while ((match = itemRegex.exec(xml)) !== null && items.length < limit) {
      const item = match[1]
      const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1]
        ?? item.match(/<title>(.*?)<\/title>/)?.[1]
        ?? ''
      const link = item.match(/<link>(.*?)<\/link>/)?.[1] ?? ''
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? ''
      const desc = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1]
        ?? item.match(/<description>(.*?)<\/description>/)?.[1]
        ?? ''

      // Format date like "Nov 2025"
      const d = new Date(pubDate)
      const formatted = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })

      // Strip HTML tags from description and truncate
      const excerpt = desc.replace(/<[^>]*>/g, '').slice(0, 120).trim()

      items.push({
        title,
        url: link,
        date: formatted,
        excerpt: excerpt ? excerpt + '...' : '',
      })
    }

    return items
  } catch {
    return []
  }
}
