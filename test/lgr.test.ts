import LGR from '../src/components/LGR'
import {GraphView, GraphViewFactory} from '../src/index'
import {Deck} from '@deck.gl/core'
import {ScatterplotLayer} from '@deck.gl/layers'

const lgr = LGR.createLGR()

test('create lgr', () => {
  expect(lgr).toBeInstanceOf(Deck)
})

test('check lgr state', () => {
  const deckProps = lgr.props
  expect(deckProps === null).toBeFalsy()
  const layer1 = new ScatterplotLayer({data: []})

  lgr.setProps({layers: [layer1]})

  const deckProps2 = lgr.props
  expect(deckProps2.layers.length).toBe(1)
})

test('create graph', () => {
  const graph = {
    nodeViews: [],
    edgeViews: []
  }
//   expect(lgr).toBeInstanceOf(Deck)
})
