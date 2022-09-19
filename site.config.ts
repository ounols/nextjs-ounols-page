import { siteConfig } from './lib/site-config'

export default siteConfig({
  // the site's root Notion page (required)
  rootNotionPageId: 'f76197a2521241d99dc6de8dfd6b6b4c',

  // if you want to restrict pages to a single notion workspace (optional)
  // (this should be a Notion ID; see the docs for how to extract this)
  rootNotionSpaceId: 'ounols',

  // basic site info (required)
  name: 'ounols',
  domain: 'ounols.kr',
  author: 'ounols',

  // open graph metadata (optional)
  description: 'ounols.kr',

  // social usernames (optional)
  // twitter: 'transitive_bs',
  github: 'ounols',
  // linkedin: 'fisch2',
  // newsletter: '#', // optional newsletter URL
  youtube: 'ounols', // optional youtube channel name or `channel/UCGbXXXXXXXXXXXXXXXXXXXXXX`

  // default notion icon and cover images for site-wide consistency (optional)
  // page-specific values will override these site-wide defaults
  defaultPageIcon: null,
  defaultPageCover: null,
  defaultPageCoverPosition: 0.5,

  // whether or not to enable support for LQIP preview images (optional)
  isPreviewImageSupportEnabled: true,

  // whether or not redis is enabled for caching generated preview images (optional)
  // NOTE: if you enable redis, you need to set the `REDIS_HOST` and `REDIS_PASSWORD`
  // environment variables. see the readme for more info
  isRedisEnabled: false,

  // map of notion page IDs to URL paths (optional)
  // any pages defined here will override their default URL paths
  // example:
  //
  // pageUrlOverrides: {
  //   '/foo': '067dd719a912471ea9a3ac10710e7fdf',
  //   '/bar': '0be6efce9daf42688f65c76b89f8eb27'
  // }
  pageUrlOverrides: {
    '/ko': '28b6b04bbda740cc9f279b2874cdf46f',
    '/CSEngine-en': '0ac013d495534455a7742ee7928742db',
    '/Angpang-en': '520e130e40d340b8a9f856abced64f3d',
    '/remix': '99b7939d3381482c8242efbae4a2f1df',
  },

  // whether to use the default notion navigation style or a custom one with links to
  // important pages
  navigationStyle: 'default'
  // navigationStyle: 'custom',
  // navigationLinks: [
  //   {
  //     title: 'About',
  //     pageId: 'f1199d37579b41cbabfc0b5174f4256a'
  //   },
  //   {
  //     title: 'Contact',
  //     pageId: '6a29ebcb935a4f0689fe661ab5f3b8d1'
  //   }
  // ]
})
