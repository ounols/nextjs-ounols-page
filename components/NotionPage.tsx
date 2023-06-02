import * as React from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'

import cs from 'classnames'
import { PageBlock } from 'notion-types'
import { formatDate, getBlockTitle, getPageProperty } from 'notion-utils'
import BodyClassName from 'react-body-classname'
import { NotionRenderer } from 'react-notion-x'
import TweetEmbed from 'react-tweet-embed'
import { useSearchParam } from 'react-use'

import * as config from '@/lib/config'
import * as types from '@/lib/types'
import { mapImageUrl } from '@/lib/map-image-url'
import { getCanonicalPageUrl, mapPageUrl } from '@/lib/map-page-url'
import { searchNotion } from '@/lib/search-notion'
import { useDarkMode } from '@/lib/use-dark-mode'

import { Footer } from './Footer'
import { GitHubShareButton } from './GitHubShareButton'
import { Loading } from './Loading'
import { NotionPageHeader } from './NotionPageHeader'
import { Page404 } from './Page404'
import { PageAside } from './PageAside'
import { PageHead } from './PageHead'
import styles from './styles.module.css'
import {OuterEmbed} from './OuterEmbed'

// -----------------------------------------------------------------------------
// dynamic imports for optional components
// -----------------------------------------------------------------------------

const Code = dynamic(() =>
  import('react-notion-x/build/third-party/code').then(async (m) => {
    // add / remove any prism syntaxes here
    await Promise.all([
      import('prismjs/components/prism-markup-templating.js'),
      import('prismjs/components/prism-markup.js'),
      import('prismjs/components/prism-bash.js'),
      import('prismjs/components/prism-c.js'),
      import('prismjs/components/prism-cpp.js'),
      import('prismjs/components/prism-csharp.js'),
      import('prismjs/components/prism-docker.js'),
      import('prismjs/components/prism-java.js'),
      import('prismjs/components/prism-js-templates.js'),
      import('prismjs/components/prism-coffeescript.js'),
      import('prismjs/components/prism-diff.js'),
      import('prismjs/components/prism-git.js'),
      import('prismjs/components/prism-go.js'),
      import('prismjs/components/prism-graphql.js'),
      import('prismjs/components/prism-handlebars.js'),
      import('prismjs/components/prism-less.js'),
      import('prismjs/components/prism-makefile.js'),
      import('prismjs/components/prism-markdown.js'),
      import('prismjs/components/prism-objectivec.js'),
      import('prismjs/components/prism-ocaml.js'),
      import('prismjs/components/prism-python.js'),
      import('prismjs/components/prism-reason.js'),
      import('prismjs/components/prism-rust.js'),
      import('prismjs/components/prism-sass.js'),
      import('prismjs/components/prism-scss.js'),
      import('prismjs/components/prism-solidity.js'),
      import('prismjs/components/prism-sql.js'),
      import('prismjs/components/prism-stylus.js'),
      import('prismjs/components/prism-swift.js'),
      import('prismjs/components/prism-wasm.js'),
      import('prismjs/components/prism-yaml.js')
    ])
    return m.Code
  })
)

const Collection = dynamic(() =>
  import('react-notion-x/build/third-party/collection').then(
    (m) => m.Collection
  )
)
const Equation = dynamic(() =>
  import('react-notion-x/build/third-party/equation').then((m) => m.Equation)
)
const Pdf = dynamic(
  () => import('react-notion-x/build/third-party/pdf').then((m) => m.Pdf),
  {
    ssr: false
  }
)
const Modal = dynamic(
  () =>
    import('react-notion-x/build/third-party/modal').then((m) => {
      m.Modal.setAppElement('.notion-viewport')
      return m.Modal
    }),
  {
    ssr: false
  }
)

const Tweet = ({id}: { id: string }) => {
  return <TweetEmbed tweetId={id}/>
}

const propertyLastEditedTimeValue = (
  {block, pageHeader},
  defaultFn: () => React.ReactNode
) => {
  if (pageHeader && block?.last_edited_time) {
    return `Last updated ${formatDate(block?.last_edited_time, {
      month: 'long'
    })}`
  }

  return defaultFn()
}

const propertyDateValue = (
  {data, schema, pageHeader},
  defaultFn: () => React.ReactNode
) => {
  if (pageHeader && schema?.name?.toLowerCase() === 'published') {
    const publishDate = data?.[0]?.[1]?.[0]?.[1]?.start_date

    if (publishDate) {
      return `${formatDate(publishDate, {
        month: 'long'
      })}`
    }
  }

  return defaultFn()
}

const propertyTextValue = (
  {schema, pageHeader},
  defaultFn: () => React.ReactNode
) => {
  if (pageHeader && schema?.name?.toLowerCase() === 'author') {
    return <b>{defaultFn()}</b>
  }

  return defaultFn()
}

export const NotionPage: React.FC<types.PageProps> = ({
                                                        site,
                                                        recordMap,
                                                        error,
                                                        pageId
                                                      }) => {
  const router = useRouter()
  const lite = useSearchParam('lite')

  const components = React.useMemo(
    () => ({
      nextImage: Image,
      nextLink: Link,
      Code,
      Collection,
      Equation,
      Pdf,
      Modal,
      Tweet,
      Header: NotionPageHeader,
      propertyLastEditedTimeValue,
      propertyTextValue,
      propertyDateValue
    }),
    []
  )

  // lite mode is for oembed
  const isLiteMode = lite === 'true'

  const {isDarkMode} = useDarkMode()

  const siteMapPageUrl = React.useMemo(() => {
    const params: any = {}
    if (lite) params.lite = lite

    const searchParams = new URLSearchParams(params)
    return mapPageUrl(site, recordMap, searchParams)
  }, [site, recordMap, lite])

  const keys = Object.keys(recordMap?.block || {})
  const block = recordMap?.block?.[keys[0]]?.value

  // const isRootPage =
  //   parsePageId(block?.id) === parsePageId(site?.rootNotionPageId)
  const isBlogPost =
    block?.type === 'page' && block?.parent_table === 'collection'

  const showTableOfContents = !!isBlogPost
  const minTableOfContentsItems = 3

  const pageAside = React.useMemo(
    () => (
      <PageAside block={block} recordMap={recordMap} isBlogPost={isBlogPost}/>
    ),
    [block, recordMap, isBlogPost]
  )

  const footer = React.useMemo(() => <Footer/>, [])

  if (router.isFallback) {
    return <Loading/>
  }

  if (error || !site || !block) {
    return <Page404 site={site} pageId={pageId} error={error}/>
  }

  const title = getBlockTitle(block, recordMap) || site.name
  let head_html = "";
  const code: React.ReactChild = (
    <NotionRenderer
      recordMap={recordMap}
      components={components}
    />
  )

  Object.entries(code.props.recordMap.block).map(([id, value]) => {
    console.log(id, '=')

    let current_value: any = (value as any);
    // console.log('(before)', id, '=', current_value)
    if (current_value.role === 'none') return;
    if (current_value.value != undefined) {
      current_value = current_value.value;
    }

    if (current_value.type === 'code' && current_value.properties.language[0][0] === 'BASIC') {
      console.log('converting...');

      console.log(current_value.properties.language);


      current_value.type = 'embed';
      try {
        const embed_size = current_value.properties.caption[0][0].split(',');
        Object.assign(current_value, {
          format: {
            block_width: (embed_size[0]),
            block_height: (embed_size[1]),
          }
        })
      } catch (error) {
        Object.assign(current_value, {
          format: {
            block_width: '100%',
            block_height: '300px',
          }
        })
      }
      
      current_value.properties.title.unshift(['data:text/html;charset=utf-8,']);
      current_value.properties = {source: [[current_value.properties.title.join('')]]};

      // console.log('(after)', id, '=', current_value)
    }

    if (current_value.type === 'code' && current_value.properties.language[0][0] === 'Visual Basic') {
      console.log('converting...');

      const context = current_value.properties.title.join();
      head_html += context;
      // console.log("context = ", context);

      current_value.type = 'untype';
    }

    if (current_value.type === 'code' && current_value.properties.language[0][0] === 'C++') {
      console.log('converting...', current_value.properties.language[0]);

      current_value.properties.language[0][0] = 'cpp';

      // console.log('(after)', id, '=', current_value.properties.language[0][0]);
    }

    if (current_value.type === 'embed' && current_value.properties !== undefined) {
      // console.log('embed properties = ', current_value.properties);
    }

    if (current_value.type === 'toggle' && current_value.properties.title[0][0] === '__HIDE__') {
      current_value.type = 'untype';
    }
  })

  // console.log('notion page', {
  //   isDev: config.isDev,
  //   title,
  //   pageId,
  //   rootNotionPageId: site.rootNotionPageId,
  //   recordMap
  // })

  if (!config.isServer) {
    // add important objects to the window global for easy debugging
    const g = window as any
    g.pageId = pageId
    g.recordMap = recordMap
    g.block = block
  }

  const canonicalPageUrl =
    !config.isDev && getCanonicalPageUrl(site, recordMap)(pageId)

  const socialImage = mapImageUrl(
    getPageProperty<string>('Social Image', block, recordMap) ||
    (block as PageBlock).format?.page_cover ||
    config.defaultPageCover,
    block
  )

  const socialDescription =
    getPageProperty<string>('Description', block, recordMap) ||
    config.description

  // console.log("result = ", head_html);
  return (
    <>
      <PageHead
        pageId={pageId}
        site={site}
        title={title}
        description={socialDescription}
        image={socialImage}
        url={canonicalPageUrl}
      />

      <meta name="naver-site-verification" content="f8af2e08972a74eb2d60b8070175c2ca22cf69ea" />

      {isLiteMode && <BodyClassName className='notion-lite'/>}
      {isDarkMode && <BodyClassName className='light-mode'/>}

      <NotionRenderer
        bodyClassName={cs(
          styles.notion,
          pageId === site.rootNotionPageId && 'index-page'
        )}
        darkMode={isDarkMode}
        components={components}
        recordMap={recordMap}
        rootPageId={site.rootNotionPageId}
        rootDomain={site.domain}
        fullPage={!isLiteMode}
        previewImages={!!recordMap.preview_images}
        showCollectionViewDropdown={false}
        showTableOfContents={showTableOfContents}
        minTableOfContentsItems={minTableOfContentsItems}
        defaultPageIcon={config.defaultPageIcon}
        defaultPageCover={config.defaultPageCover}
        defaultPageCoverPosition={config.defaultPageCoverPosition}
        mapPageUrl={siteMapPageUrl}
        mapImageUrl={mapImageUrl}
        searchNotion={config.isSearchEnabled ? searchNotion : null}
        pageAside={pageAside}
        footer={footer}
      />
      
      <OuterEmbed
        html_string={head_html}
      />
    </>
  )
}
