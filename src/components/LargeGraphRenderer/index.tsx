import React, {useState} from 'react'
import DeckGL from '@deck.gl/react'
import {OrthographicView, OrbitView} from '@deck.gl/core'
import GraphLayer from '../../layers/GraphLayer'
import GraphLayerProps from '../../layers/GraphLayerProps'
import RendererProps from './RendererProps'
import EventHandlers from '../../layers/EventHandlers'

const DEF_BG_COLOR = '#555555'

const baseStyle = {
  backgroundColor: DEF_BG_COLOR,
  position: 'relative'
}

const INITIAL_VIEW_STATE = {
  target: [0, 0, 0],
  zoom: 0,
  minZoom: -10,
  maxZoom: 10
}

const DEF_EVENT_HANDLER: EventHandlers = {
  onNodeClick: (event, x, y): void => {
    console.log('* Default click handler: node', event, x, y)
  },
  onEdgeClick: (event, x, y): void => {
    console.log('* Default click handler: edge', event, x, y)
  },
  onNodeMouseover: (event): void => {
    // console.log('* Mouse over: node', event)
  },
  onEdgeMouseover: (event): void => {
    // console.log('* Mouse over: edge', event)
  },
  onBackgroundClick: (event): void => {
    console.log('* BG click event')
  }
}

/**
 * Functional React component for large graph rendering using Deck.gl
 */
const LargeGraphRenderer: React.FunctionComponent<RendererProps> = ({
  graphView,
  render3d,
  onNodeClick,
  onEdgeClick,
  onBackgroundClick,
  onNodeMouseover,
  onEdgeMouseover,
  backgroundColor = DEF_BG_COLOR,
  pickable = true
}: RendererProps) => {
  baseStyle.backgroundColor = backgroundColor

  // For performance, show/hide edges/labels dynamically
  const [showEdges, setShowEdges] = useState(true)
  const [showLabels, setShowLabels] = useState(false)

  const _handleViewStateChange = (state) => {
    const {viewState, interactionState} = state
    const {zoom, target} = viewState
    const {isZooming} = interactionState

    // console.log('Zoom level = ', zoom)
    // console.log('Full state = ', state)

    if (zoom > 1) {
      setShowLabels(true)
    } else {
      setTimeout(() => {
        if (showLabels) {
          setShowLabels(false)
        }
      }, 100)
    }

    if (isZooming) {
      setShowEdges(false)
      setTimeout(() => {
        if (showEdges !== false) {
          setShowEdges(true)
        }
      }, 300)
    } else {
    }
  }

  const eventHandlers: EventHandlers = {
    onNodeClick: onNodeClick === undefined ? DEF_EVENT_HANDLER.onNodeClick : onNodeClick,
    onEdgeClick: onEdgeClick === undefined ? DEF_EVENT_HANDLER.onEdgeClick : onEdgeClick,
    onBackgroundClick:
      onBackgroundClick === undefined ? DEF_EVENT_HANDLER.onBackgroundClick : onBackgroundClick,
    onNodeMouseover:
      onNodeMouseover === undefined ? DEF_EVENT_HANDLER.onNodeMouseover : onNodeMouseover,
    onEdgeMouseover:
      onEdgeMouseover === undefined ? DEF_EVENT_HANDLER.onEdgeMouseover : onEdgeMouseover
  }

  const layerProps: GraphLayerProps = {
    graphView,
    showEdges,
    showLabels,
    render3d: render3d === undefined ? false : render3d,
    eventHandlers,
    pickable
  }

  const layers = [new GraphLayer(layerProps)]
  let view = new OrthographicView()
  if (render3d) {
    view = new OrbitView()
  }

  const _handleClick = (layer, object) => {
    // console.log('Handling click OBJ::--------------------', object, bgClick)
    const bgHandler = eventHandlers.onBackgroundClick
    if (bgHandler !== undefined) {
      bgHandler(layer, object)
    }

    // Fit content

    // const {viewport} = view.makeViewport({'100%', '100%', viewState})
    // if (layer) {
    //   const {longitude, latitude, zoom} = viewport.fitBounds([
    //     [object.minLng, object.minLat],
    //     [object.maxLng, object.maxLat]
    //   ])
    //   // Zoom to the object
    //   // deck.setProps({
    //   //   viewState: {longitude, latitude, zoom}
    // }
  }

  return (
    <DeckGL
      width="100%"
      height="100%"
      style={baseStyle}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      views={view}
      layers={layers}
      onDragStart={(info) => {
        setShowEdges(false)
      }}
      onDragEnd={(info) => {
        setShowEdges(true)
      }}
      onViewStateChange={(state) => {
        _handleViewStateChange(state)
      }}
      onClick={(layer, object) => {
        _handleClick(layer, object)
      }}
    />
  )
}

export default LargeGraphRenderer
