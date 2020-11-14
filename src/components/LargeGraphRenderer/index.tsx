import React, {useState, useEffect, useRef} from 'react'
import DeckGL from '@deck.gl/react'
import {
  OrthographicView,
  OrbitView,
  WebMercatorViewport,
  LinearInterpolator,
  FlyToInterpolator
} from '@deck.gl/core'
import GraphLayer from '../../layers/GraphLayer'
import GraphLayerProps from '../../layers/GraphLayerProps'
import RendererProps from './RendererProps'
import EventHandlers from '../../layers/EventHandlers'
import {createMultipleLayers} from '../../layers/EdgeLayer'

import NodeView from '../../models/NodeView'
import EdgeView from '../../models/EdgeView'
import GraphView from '../../models/GraphView'

const DEF_BG_COLOR = '#555555'

const baseStyle = {
  backgroundColor: DEF_BG_COLOR,
  position: 'relative'
}

const INITIAL_VIEW_STATE = {
  target: [0, 0, 0],
  zoom: -1,
  minZoom: -8,
  maxZoom: 8
}

type Bounds = {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

const getBounds = (nodeViews: NodeView[]): Bounds => {
  let minX: number = Number.POSITIVE_INFINITY
  let minY: number = Number.POSITIVE_INFINITY
  let maxX: number = Number.NEGATIVE_INFINITY
  let maxY: number = Number.NEGATIVE_INFINITY

  let idx: number = nodeViews.length
  while (idx--) {
    const nv: NodeView = nodeViews[idx]
    const x = nv.position[0]
    const y = nv.position[1]

    if (x <= minX) {
      minX = x
    }
    if (y <= minY) {
      minY = y
    }
    if (x >= maxX) {
      maxX = x
    }
    if (y >= maxY) {
      maxY = y
    }
  }

  const newBopunds: Bounds = {
    minX,
    minY,
    maxX,
    maxY
  }

  return newBopunds
}

// const fitContent = (nodeViews: NodeView[], width: number, height: number): NodeView[] => {
//   const size = width > height ? width : height
//   // Find min/max
//   return nodeViews
// }

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

type ViewportSize = {
  width: number
  height: number
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
  pickable = true,
  setDeckglReference = (deckRef) => {
    console.log('Deck.gl instance', deckRef)
  }
}: RendererProps) => {
  // For using low-level API
  const deck = useRef(null)
  const [deckRef, setDeckRef] = useState(null)
  const [bounds, setBounds] = useState<Bounds | null>(null)

  const handleLoad = (deckRef, graphView: GraphView) => {
    const deckGlInstance = deckRef.deck
    console.log('$ON LOAD', deckGlInstance)
    const {width, height} = deckGlInstance
    const {nodeViews} = graphView
    const nodeViewList: NodeView[] = [...nodeViews.values()]

    const bounds: Bounds = getBounds(nodeViewList)
    setBounds(bounds)
    console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&4', bounds, width, height)
  }

  // Viewport size
  const [viewportSize, setViewportSize] = useState<ViewportSize>({width: 0, height: 0})

  const handleResize = (size: ViewportSize, nodeViews: NodeView[]): void => {
    console.log('WH !!!!!!!!!!! $Handle Resize', size)
    if (bounds !== null) {
      setViewportSize(size)

      const nvs: NodeView[] = fitContent(size, bounds, nodeViews)

      console.log('INITIALIZED6 !!!!!!!!!!! $Handle Resize', nvs, size, bounds)
    }
  }

  const fitContent = (viewportSize: ViewportSize, bounds: Bounds, nodeViews: NodeView[]) => {
    const originalWidth = bounds.maxX - bounds.minX
    const originalHeight = bounds.maxY - bounds.minY

    const ratioX = originalWidth / viewportSize.width

    let idx = nodeViews.length
    while (idx--) {
      const nv = nodeViews[idx]
      const x = nv.position[0]
      const y = nv.position[1]
      nv.position[0] = x * 0.1
      nv.position[1] = y * 0.1
      nodeViews[idx] = nv
    }

    return nodeViewList
  }

  baseStyle.backgroundColor = backgroundColor

  // For performance, show/hide edges/labels dynamically
  const [pickableLocal, setPickableLocal] = useState(false)
  const [showEdges, setShowEdges] = useState(true)
  const [showLabels, setShowLabels] = useState(false)
  const [edgeLayerDepth, setEdgeLayerDepth] = useState(1)

  const emptyLayers: EdgeView[][] = []
  const [edgeLayerGroups, setEdgeLayerGroups] = useState(emptyLayers)

  useEffect(() => {
    const deckGlRef = deck.current
    console.log('## Effect: Deck.gl instance2', deckGlRef)

    if (deckGlRef !== null) {
      setDeckRef(deckGlRef)
      // @ts-ignore
      const deck = deckGlRef.deck
      // @ts-ignore
      const viewports = deckGlRef.viewports
      console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&', deck)
    }
  }, [deck])

  useEffect(() => {
    // Create layer groups here.
    const {edgeViews} = graphView
    const edgeViewList = edgeViews === undefined ? [] : edgeViews.values()

    const eLayers = createMultipleLayers([...edgeViewList])

    setEdgeLayerGroups(eLayers)
  }, [])

  const _handleViewStateChange = (state) => {
    const {viewState, interactionState} = state
    const {zoom} = viewState
    const {isZooming, isPanning} = interactionState

    if (zoom > 1) {
      setShowLabels(true)
    } else {
      setTimeout(() => {
        if (showLabels) {
          setShowLabels(false)
        }
      }, 100)
    }

    if (zoom > 1.5 || zoom < -2) {
      setEdgeLayerDepth(2)
      setPickableLocal(false)
    } else {
      setEdgeLayerDepth(1)
      setPickableLocal(true)
    }

    if (isZooming || isPanning) {
      setShowEdges(false)
      setTimeout(() => {
        if (showEdges !== false) {
          setShowEdges(true)
        }
      }, 300)
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

  const {nodeViews} = graphView
  const nodeViewList: NodeView[] = [...nodeViews.values()]

  const layerProps: GraphLayerProps = {
    nodeViews: nodeViewList,
    nodeViewMap: nodeViews,
    edgeViews: edgeLayerGroups,
    showEdges,
    showLabels,
    edgeLayerDepth,
    render3d: render3d === undefined ? false : render3d,
    eventHandlers,
    nodePickable: pickable,
    edgePickable: pickable && pickableLocal ? true : false
  }

  const layers = [new GraphLayer(layerProps)]
  let view = new OrthographicView()
  if (render3d) {
    view = new OrbitView()
  }

  const _handleClick = (layer, object) => {
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
      ref={deck}
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
        // const {viewport} = layer.context
        console.log('## SINGLE4:', layer, object, deck)

        // @ts-ignore
        deckRef.deck.setProps({
          initialViewState: {
            target: [0, 0, 0],
            zoom: -1,
            transitionDuration: 0,
            // transitionInterpolator: new FlyToInterpolator()
            transitionInterpolator: new LinearInterpolator(['target', 'zoom'])
          }
        })

        // @ts-ignore
        deckRef.deck.setProps({
          initialViewState: {
            target: [0, 0, 0],
            zoom: -1,
            transitionDuration: 0,
            // transitionInterpolator: new FlyToInterpolator()
            transitionInterpolator: new LinearInterpolator(['target', 'zoom'])
          }
        })
        setShowLabels(false)
        // deckRef.pickMultipleObjects({x: 0, y: 0, radius: 1000})
      }}
      onDblClick={(layer, object) => {
        console.log('## DBL:', layer, object)
      }}
      onResize={(size) => {
        handleResize(size, nodeViewList)
      }}
      onLoad={() => {
        handleLoad(deckRef, graphView)
      }}
      onAfterRender={() => {
        // console.log('after rend---------------------', deckRef)
      }}
    >
      {({x, y, width, height, viewState, viewport}) => {
        console.log('---------DGL ref', x, y, width, height, viewport, viewState, nodeViewList)
      }}
    </DeckGL>
  )
}

export default LargeGraphRenderer
