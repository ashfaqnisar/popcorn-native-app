import React from 'react'
import { useQuery } from '@apollo/react-hooks'

import i18n from 'modules/i18n'
import MyEpisodesQuery from 'modules/GraphQL/MyEpisodesQuery'

import EpisodesSlider from 'components/MyEpisodesSlider'

export const MyEpisodesSlider = () => {
  const { loading, data, fetchMore } = useQuery(
    MyEpisodesQuery,
    {
      variables: {
        offset: 0,
      },
    },
  )

  return (
    <EpisodesSlider
      title={i18n.t('My Episodes')}
      items={!data || !data.episodes ? [] : data.episodes.filter(episode => !episode.watched.complete)}
      loading={loading}
      // onEndReached={fetchMoreUpdateQuery('episodes', data, fetchMore)}
    />
  )
}

MyEpisodesSlider.propTypes = {}

export default MyEpisodesSlider
