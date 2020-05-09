import {Deck} from '@deck.gl/core'

// Pure JS version of the script

const INITIAL_VIEW_STATE = {
  latitude: 37.8,
  longitude: -122.45,
  zoom: 15
}

class LGR {
  static createLGR = () => {
    return new Deck({
      initialViewState: INITIAL_VIEW_STATE,
      controller: true,
      layers: []
    })
  }
}
export default LGR
