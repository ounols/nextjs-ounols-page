import * as React from 'react'
import * as types from 'lib/types'

export const OuterEmbed: React.FC<
  types.PageProps & {
    html_string?: string
  }
> = ({ html_string }) => {

  return (
    <div id = "outer_embeded" dangerouslySetInnerHTML={{__html: html_string}}/>
  )
}
