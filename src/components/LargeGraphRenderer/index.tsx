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
import {getArea} from '../../utils/selection-util'

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
  console.log('Dummy proxy function called:', proxy)
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
    const networkWidth: number = bounds.maxX - bounds.minX
    const networkHeight: number = bounds.maxY - bounds.minY
    const wRatio: number = (networkWidth + PADDING) / width
    const hRatio: number = (networkHeight + PADDING) / height

    // Case 1: width is larger than height of network --> Fit to width
    let scalingFactor = 0
    if (networkWidth >= networkHeight) {
      scalingFactor = -Math.log2(wRatio)
    } else {
      // Case 2: height is larger than width --> fit to height
      scalingFactor = -Math.log2(hRatio)
    }

    const deltaX = (Math.abs(bounds.maxX) - Math.abs(bounds.minX)) / 2
    const deltaY = (Math.abs(bounds.maxY) - Math.abs(bounds.minY)) / 2

    setInitialViewState2({
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
    const newZoomLevel: number = viewState.zoom + increment
    const newTarget = viewState.target
    viewState.zoom = newZoomLevel

    // if (deckRef.viewports[0] !== undefined) {
    //   const newBounds = deckRef.viewports[0].getBounds()
    //   console.log('Zoom2::', newBounds)
    //   newTarget = [-(newBounds[2] - newBounds[0]) / 2, -(newBounds[3] - newBounds[1]) / 2, 0]
    // }
    setInitialViewState2({
      target: newTarget,
      zoom: newZoomLevel,
      minZoom: -8,
      maxZoom: 8,
      transitionInterpolator: new LinearInterpolator({
        transitionProps: ['target', 'zoom']
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
    commandProxy(proxy)
  }

  // Viewport size
  const [viewportSize, setViewportSize] = useState<ViewportSize>({width: 0, height: 0})

  const handleResize = (size: ViewportSize, nodeViews: NodeView[]): void => {
    if (bounds !== null) {
      setViewportSize(size)
      const bounds: Bounds = getBounds(nodeViewList)
      setBounds(bounds)
    }
  }

  baseStyle.backgroundColor = backgroundColor

  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set<string>())
  // For performance, show/hide edges/labels dynamically

  const [showEdges, setShowEdges] = useState(true)
  const [showLabels, setShowLabels] = useState(false)
  const [edgeLayerDepth, setEdgeLayerDepth] = useState(1)

  const [selectionStart, setSelectionStart] = useState<[number, number]>([0, 0])
  const [selectionPoint, setSelectionPoint] = useState<[number, number]>([0, 0])
  const [selectionBounds, setSelectionBounds] = useState<[number, number, number, number] | null>(
    null
  )

  const [isBoxSelection, setIsBoxSelection] = useState<boolean>(false)

  const [multipleSelection, setMultipleSelection] = useState<boolean>(false)

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

    // Watch keyup event for selection
    addEventListener('keyup', logKey)
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
      // setPickableLocal(false)
    } else {
      setEdgeLayerDepth(1)
      // setPickableLocal(true)
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
    edgePickable: pickable,
    bounds: selectionBounds,
    multipleSelection: multipleSelection,
    selectedNodes: selectedNodes,
    selectedEdges: selectedNodes
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
  }

  const _handleKeyPress = (event) => {
    console.log('Key Event press here! ', event.key)
    if (event.key === 'Enter') {
      console.log('enter press here! ')
    }
  }

  class GraphController extends OrthographicController {
    handleEvent(event) {
      if (event.type === 'keydown') {
        if (event.key === 'Shift') {
          // console.log('Shift KEY EVV! ', event)
          setIsBoxSelection(true)
        }
        super.handleEvent(event)
      } else {
        super.handleEvent(event)
      }
    }
  }

  function logKey(e) {
    console.log('Key UP', e)
  }

  const getSelectedEdges = () => {}

  return (
    <DeckGL
      ref={deck}
      width="100%"
      height="100%"
      style={baseStyle}
      initialViewState={initialViewState2}
      controller={GraphController}
      views={view}
      layers={layers}
      onDragStart={(info) => {
        if (!isBoxSelection) {
          console.log('---------->>>>No', info)
          return
        }

        setMultipleSelection(true)
        // setShowEdges(false)
        console.log('---------->>>>Start', info)
        const startPoint: [number, number] = info.coordinate
        setSelectionStart(startPoint)
        setSelectionPoint([info.x, info.y])
      }}
      onDrag={(info, event) => {
        if (!isBoxSelection) {
          return
        }
        const endPoint: [number, number] = info.coordinate
        if (
          selectionStart === undefined ||
          selectionStart === null ||
          endPoint === undefined ||
          endPoint === undefined
        ) {
          return
        }

        const selectedBound: [number, number, number, number] = [
          selectionStart[0],
          selectionStart[1],
          endPoint[0],
          endPoint[1]
        ]
        setSelectionBounds(selectedBound)
      }}
      onDragEnd={(info) => {
        if (!isBoxSelection) {
          return
        }
        const x1: number = selectionPoint[0]
        const y1: number = selectionPoint[1]
        const x2: number = info.x
        const y2: number = info.y

        const area = getArea(x1, y1, x2, y2)
        const {x, y, width, height} = area
        const layerIds: string[] = ['node-layer']
        const newSelection = deckRef.pickObjects({x, y, width, height})

        let selectedLen = newSelection.length
        console.log('---------->>>>End Selection: start', x1, y1)
        console.log('---------->>>>End Selection: end len', selectedLen, x2, y2, area)

        const selectedId = new Set<string>()
        while (selectedLen--) {
          const item = newSelection[selectedLen].object
          // item.selected = true
          selectedId.add(item.id)
        }
        setSelectedNodes(selectedId)

        console.log('---------->>>>Selected', selectedId, newSelection)
        setSelectionBounds(null)

        setTimeout(() => {
          setMultipleSelection(false)
        }, 100)
        // setShowEdges(true)
        setIsBoxSelection(false)
      }}
      onViewStateChange={(state) => {
        _handleViewStateChange(state)
      }}
      onClick={(layer, object) => {
        _handleClick(layer, object)

        setShowLabels(false)
        console.log('## CLR:', layer, object)
        setSelectionBounds(null)
        setSelectedNodes(new Set<string>())
      }}
      onDblClick={(layer, object) => {
        console.log('## DBL:', layer, object)
        setSelectionBounds(null)
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
