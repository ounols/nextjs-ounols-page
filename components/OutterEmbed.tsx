import Head from 'next/head'
import * as React from 'react'

import * as types from 'lib/types'
import * as config from 'lib/config'

export const OutterEmbed: React.FC<
  types.PageProps & {
    html_string?: string
  }
> = ({ html_string }) => {

  return (
    <div id = "outter_embeded" dangerouslySetInnerHTML={{__html: html_string}}/>
  )
}
