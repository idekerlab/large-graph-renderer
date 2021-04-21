import React, {useState, useEffect, useRef, useMemo, useCallback} from 'react'
import DeckGL from '@deck.gl/react'
import {
  OrthographicView,
  OrbitView,
  LinearInterpolator,
  OrthographicController
} from '@deck.gl/core'
import GraphLayer from '../../layers/GraphLayer'
import GraphLayerProps from '../../layers/GraphLayerProps'
import RendererProps from './RendererProps'
import EventHandlers from '../../layers/EventHandlers'
import {createMultipleLayers} from '../../layers/EdgeLayer'

import NodeView from '../../models/NodeView'
import EdgeView from '../../models/EdgeView'
import GraphView from '../../models/GraphView'
import CommandProxy from './CommandProxy'

const DEF_BG_COLOR = '#555555'

const baseStyle = {
  backgroundColor: DEF_BG_COLOR,
  position: 'relative'
}

const PADDING = 50

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

  const newBounds: Bounds = {
    minX,
    minY,
    maxX,
    maxY
  }

  return newBounds
}

// const scaleToAspectRatio = (boundingBox: Bounds, width: number, height: number): Bounds => {
//   const currentWidth = boundingBox.maxX - boundingBox.minX
//   const currentHeight = boundingBox.maxY - boundingBox.minY

//   let newWidth = currentWidth
//   let newHeight = currentHeight

//   if (currentWidth / currentHeight < width / height) {
//     // expand bounding box width
//     newWidth = (width / height) * currentHeight
//   } else {
//     newHeight = (height / width) * currentWidth
//   }

//   if (newWidth < width) {
//     newWidth = width
//     newHeight = height
//   }

//   const xCenter = (xMax + xMin) / 2
//   const yCenter = (yMax + yMin) / 2

//   return [
//     xCenter - newWidth / 2,
//     yCenter - newHeight / 2,
//     xCenter + newWidth / 2,
//     yCenter + newHeight / 2
//   ]
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

const DUMMY_PROXY = (proxy) => {
  console.log('Dummy proxy', proxy)
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
  },
  commandProxy = DUMMY_PROXY
}: RendererProps) => {
  // For using low-level API
  const deck = useRef(null)
  const [deckRef, setDeckRef] = useState(null)
  const [bounds, setBounds] = useState<Bounds>({minX: 0, minY: 0, maxX: 0, maxY: 0})

  const initialViewState = useMemo(() => {
    if (deckRef !== null) {
      const deckGlInstance = deckRef.deck
      const {width, height} = deckGlInstance
      console.log(deckGlInstance)
      const originalWidth: number = bounds.maxX - bounds.minX
      const originalHeight: number = bounds.maxY - bounds.minY
      const wRatio: number = originalWidth / width
      const hRatio: number = originalHeight / height

      let zoomLevel = 0

      if (originalHeight < originalWidth) {
        zoomLevel = wRatio
      } else {
        zoomLevel = hRatio
      }
      const centerX: number = originalWidth / 2
      const centerY: number = originalHeight / 2
      const newVS = {
        target: [0, 0, 0],
        zoom: -4,
        minZoom: -8,
        maxZoom: 8
      }
      console.log('VS &&&&&&&&&&&&&4', bounds, newVS, width, height, zoomLevel)

      return newVS
    }
  }, [bounds])

  const [initialViewState2, setInitialViewState2] = useState({
    target: [6000, 0, 0],
    zoom: -3.5,
    minZoom: -8,
    maxZoom: 8,
    transitionInterpolator: new LinearInterpolator({
      transitionProps: ['target', 'zoom']
    })
  })

  const fitContent2 = () => {
    const deckGlInstance = deckRef.deck
    const {width, height} = deckGlInstance
    console.log(deckGlInstance)
    const networkWidth: number = bounds.maxX - bounds.minX
    const networkHeight: number = bounds.maxY - bounds.minY
    const wRatio: number = (networkWidth + PADDING) / width
    const hRatio: number = (networkHeight + PADDING) / height

    console.log(
      '-------------fit2-F------------',
      bounds,
      networkWidth,
      networkHeight,
      width,
      wRatio
    )

    // Case 1: width is larger than height of network --> Fit to width
    let scalingFactor = 0
    if (networkWidth >= networkHeight) {
      scalingFactor = -Math.log2(wRatio)
    } else {
      // Case 2: height is larger than width --> fit to height
      scalingFactor = -Math.log2(hRatio)
    }

    const deltaX = (Math.abs(bounds.maxX) - Math.abs(bounds.minX)) / 2
    // const deltaY = 0
    const deltaY = (Math.abs(bounds.maxY) - Math.abs(bounds.minY)) / 2

    setInitialViewState2({
      // target: [0, 0, 0],
      target: [deltaX, deltaY, 0],
      zoom: scalingFactor,
      minZoom: -8,
      maxZoom: 8,
      transitionInterpolator: new LinearInterpolator({
        transitionProps: ['target', 'zoom']
      })
    })
  }

  const _handleZoom = (increment: number): void => {
    const deckGlInstance = deckRef.deck
    const {viewState} = deckGlInstance
    console.log('Zoom::', increment, viewState)
    const newZoomLevel: number = viewState.zoom + increment
    const target = viewState.target
    viewState.zoom = newZoomLevel
    console.log('Zoom2::', newZoomLevel, deckRef)
    // const newState = Object.assign({}, viewState)
    // setInitialViewState2(newState)
    const {width, height} = deckGlInstance

    setInitialViewState2({
      target: target,
      zoom: newZoomLevel,
      minZoom: -8,
      maxZoom: 8,
      transitionInterpolator: new LinearInterpolator({
        transitionProps: ['target', 'zoom'],
        around: [width / 2, height / 2]
      })
    })
  }

  const proxy = new CommandProxy(fitContent2, _handleZoom)

  const handleLoad = (deckRef, graphView: GraphView) => {
    const deckGlInstance = deckRef.deck

    console.log('$ON LOAD', deckGlInstance)
    const {width, height} = deckGlInstance
    const {nodeViews} = graphView
    const nodeViewList: NodeView[] = [...nodeViews.values()]

    const bounds: Bounds = getBounds(nodeViewList)
    setBounds(bounds)

    fitContent2()
    console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%$ON LOAD OK2', proxy)
    commandProxy(proxy)
  }

  // Viewport size
  const [viewportSize, setViewportSize] = useState<ViewportSize>({width: 0, height: 0})

  const handleResize = (size: ViewportSize, nodeViews: NodeView[]): void => {
    console.log('WH !!!!!!!!!!! $Handle Resize', size)
    if (bounds !== null) {
      setViewportSize(size)
      const bounds: Bounds = getBounds(nodeViewList)
      setBounds(bounds)

      // const nvs: NodeView[] = fitContent(size, bounds, nodeViews)

      // console.log('INITIALIZED6 !!!!!!!!!!! $Handle Resize', nvs, size, bounds)
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
    if (deckGlRef !== null && deckGlRef !== undefined) {
      setDeckRef(deckGlRef)
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
    if (layer) {
      const {viewport} = layer
      const b1: [number, number, number, number] = viewport.getBounds()
      console.log('------------- VP----', viewport)
      console.log('------------- bound----', b1)

      const pj1 = viewport.project([bounds.minX, 0, 0])
      console.log('------------- test1 pj1----', pj1)
      // fitContent2(b1, viewport)
    }
  }

  class CustomController extends OrthographicController {
    constructor(options = {}) {
      super(options)
      // this.events = ['pointermove']
    }

    handleEvent(event) {
      if (event.type === 'pan') {
        // do something
        console.log('PN----------')
      } else {
        super.handleEvent(event)
      }
    }
  }

  return (
    <DeckGL
      ref={deck}
      width="100%"
      height="100%"
      style={baseStyle}
      initialViewState={initialViewState2}
      controller={{type: CustomController}}
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
      onAfterRender={() => {}}
    >
      {({x, y, width, height, viewState, viewport}) => {}}
    </DeckGL>
  )
}

export default LargeGraphRenderer
