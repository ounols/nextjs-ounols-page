import type { GetServerSideProps } from 'next'

import { host } from '@/lib/config'
import { getSiteMap } from '@/lib/get-site-map'
import type { SiteMap } from '@/lib/types'

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  if (req.method !== 'GET') {
    res.statusCode = 405
    res.setHeader('Content-Type', 'application/json')
    res.write(JSON.stringify({ error: 'method not allowed' }))
    res.end()
    return {
      props: {}
    }
  }

  const siteMap = await getSiteMap()

  // cache for up to 8 hours
  res.setHeader(
    'Cache-Control',
    'public, max-age=28800, stale-while-revalidate=28800'
  )
  res.setHeader('Content-Type', 'text/xml')
  res.write(createSitemap(siteMap))
  res.end()

  return {
    props: {}
  }
}

const createSitemap = (siteMap: SiteMap) =>
  `<?xml version="1.0" encoding="UTF-8"?>
  <urlset
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
    <url>
      <loc>${host}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <priority>1.00</priority>
    </url>

    <url>
      <loc>${host}/</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <priority>1.00</priority>
    </url>

    ${Object.keys(siteMap.canonicalPageMap)
      .map((canonicalPagePath) =>
        `
        <url>
          <loc>${host}/${canonicalPagePath}</loc>
          <lastmod>${new Date().toISOString()}</lastmod>
          <priority>0.80</priority>
        </url>

        `.trim()
      )
      .join('')}

  </urlset>
`

export default () => null
