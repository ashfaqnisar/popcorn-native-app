import { connect } from 'react-redux'

import * as HomeActions from '../Home/HomeActions'
import * as HomeSelectors from '../Home/HomeSelectors'

import MyEpisodes from './MyEpisodesScreen'

export const mapStateToProps = state => ({
  modes      : HomeSelectors.getModes(state),
  isLoading  : HomeSelectors.getIsLoading(state),
  hasInternet: HomeSelectors.getHasInternet(state),
})

export default connect(mapStateToProps, HomeActions)(MyEpisodes)
