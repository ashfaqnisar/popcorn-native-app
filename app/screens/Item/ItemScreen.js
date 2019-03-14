import React from 'react'
import { StyleSheet, View, Linking, BackHandler, InteractionManager } from 'react-native'
import Orientation from 'react-native-orientation'
import { Constants } from 'popcorn-sdk'

import i18n from 'modules/i18n'
import colors from 'modules/colors'
import dimensions from 'modules/dimensions'

import ScrollViewWithStatusBar from 'components/ScrollViewWithStatusBar'
import IconButton from 'components/IconButton'

import BasicInfo from './BasicInfo'
import QualitySelector from 'components/QualitySelector'
import ItemOrRecommendations from './ItemOrRecommendations'

const styles = StyleSheet.create({

  root: {
    flex           : 1,
    backgroundColor: colors.BACKGROUND,
  },

  iconsContainer: {
    display      : 'flex',
    flexDirection: 'row',
    marginLeft   : dimensions.UNIT * 2,
    marginRight  : dimensions.UNIT * 2,
    marginBottom : dimensions.UNIT * 2,

    minHeight: 70,
  },

  icon: {
    minWidth : 80,
    textAlign: 'center',
  },

})

export default class Item extends React.PureComponent {

  state = {
    selectFromTorrents: null,
    episodeToPlay     : null,
  }

  static getDerivedStateFromProps(props, state) {
    const { episodeToPlay, selectFromTorrents } = state

    if (episodeToPlay && selectFromTorrents) {
      const { item } = props

      const season = item.seasons.find(season => season.number === episodeToPlay.season)
      const newEpisode = season.episodes.find(episode => episode.number === episodeToPlay.number)

      return {
        selectFromTorrents: newEpisode ? newEpisode.torrents : selectFromTorrents,
      }
    }

    return {}
  }

  componentDidMount() {
    Orientation.lockToPortrait()

    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress)

    // Fetch data after the component is done navigation
    InteractionManager.runAfterInteractions(() => {
      this.getItem()
    })
  }

  componentWillUnmount() {
    const { clearItem } = this.props

    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress)

    clearItem()
  }

  handleBackPress = () => {
    const { selectFromTorrents } = this.state

    if (selectFromTorrents !== null) {
      this.setState({
        selectFromTorrents: null,
      })

      return true
    }

    return false
  }

  handleToggleBookmarks = () => {
    const { item, addToBookmarks, removeFromBookmarks } = this.props

    if (item.bookmarked) {
      removeFromBookmarks(item)

    } else {
      addToBookmarks(item)
    }
  }

  handleToggleWatched = () => {
    const { item, markWatched, markUnwatched } = this.props

    if (item.watched.complete) {
      markUnwatched(item)

    } else {
      markWatched(item)
    }
  }

  getItem = (fetchThisItem = null) => {
    const { clearItem, getItem, navigation: { state: { params: item } } } = this.props

    if (fetchThisItem) {
      clearItem()
    }

    getItem(fetchThisItem || item).then(({ payload: { type, seasons } }) => {
      if (type === Constants.TYPE_SHOW && seasons.length > 0) {
        this.setState({
          activeSeason: seasons[seasons.length - 1].number,
        })
      }
    })
  }

  handleTrailer = () => {
    const { item } = this.props

    if (item.trailer) {
      Linking.openURL(item.trailer)
    }
  }

  playItem = (torrent) => {
    const { navigation: { navigate }, item } = this.props
    const { episodeToPlay } = this.state

    this.setState({
      selectFromTorrents: null,
    })

    let playItem = item

    if (episodeToPlay) {
      playItem = {
        ...episodeToPlay,
        show: playItem,
      }
    }

    navigate('Player', {
      torrent,
      item: playItem,
    })
  }

  selectQuality = (torrents, episode = null) => {
    this.setState({
      selectFromTorrents: torrents,

      episodeToPlay: episode,
    })
  }

  cancelQualitySelect = () => {
    this.setState({
      selectFromTorrents: null,
    })
  }

  render() {
    const { item, isLoading } = this.props
    const { selectFromTorrents, episodeToPlay } = this.state

    return (
      <View style={styles.root}>

        <ScrollViewWithStatusBar>

          <BasicInfo
            item={item}
            onPlay={this.selectQuality} />

          {item && (
            <View style={styles.iconsContainer}>
              {!isLoading && (
                <IconButton
                  animatable={{
                    animation      : 'fadeIn',
                    useNativeDriver: true,
                  }}
                  style={styles.icon}
                  onPress={this.handleToggleBookmarks}
                  name={item.bookmarked ? 'check' : 'plus'}
                  color={colors.ICON_COLOR}
                  size={dimensions.ITEM_ICONS}>
                  {i18n.t('My List')}
                </IconButton>
              )}

              {item && item.type === Constants.TYPE_MOVIE && (
                <IconButton
                  animatable={{
                    animation      : 'fadeIn',
                    useNativeDriver: true,
                  }}
                  style={[styles.icon, { minWidth: 95 }]}
                  onPress={this.handleToggleWatched}
                  name={item.watched.complete ? 'eye-off-outline' : 'eye-outline'}
                  color={colors.ICON_COLOR}
                  size={dimensions.ITEM_ICONS}>
                  {i18n.t(item.watched.complete ? 'Mark Unwatched' : 'Mark Watched')}
                </IconButton>
              )}

              {item && item.trailer && (
                <IconButton
                  animatable={{
                    animation      : 'fadeIn',
                    useNativeDriver: true,
                  }}
                  style={styles.icon}
                  onPress={this.handleTrailer}
                  name={'youtube'}
                  color={colors.ICON_COLOR}
                  size={dimensions.ITEM_ICONS}>
                  {i18n.t('Trailer')}
                </IconButton>
              )}
            </View>
          )}

          {item && item.type === Constants.TYPE_SHOW && item.seasons.length > 0 && (
            <ItemOrRecommendations
              item={item}
              playItem={this.selectQuality}
              getItem={this.getItem}
            />
          )}

        </ScrollViewWithStatusBar>

        <QualitySelector
          item={item}
          episodeToPlay={episodeToPlay}
          cancel={this.cancelQualitySelect}
          torrents={selectFromTorrents}
          playItem={this.playItem} />

      </View>
    )
  }

}
