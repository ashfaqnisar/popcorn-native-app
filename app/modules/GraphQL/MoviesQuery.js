import gql from 'graphql-tag'

import movieFragment, { movieMinimalFragment } from './fragments/movieFragment'

export const MoviesModeQuery = gql`
  query movies($offset: Float!, $query: String) {
    movies(limit: 25, offset: $offset, query: $query) {
      ...movieMinimal
    }
  }

  ${movieMinimalFragment}
`

export const RelatedMoviesQuery = gql`
  query relatedMovies($_id: String!) {
    relatedMovies(_id: $_id) {
      ...movieMinimal
    }
  }

  ${movieMinimalFragment}
`

export default gql`
  query movies($offset: Float!, $query: String) {
    movies(limit: 25, offset: $offset, query: $query) {
      ...movie
    }
  }

  ${movieFragment}
`
