import React, {VFC, useState, useEffect, useRef, useMemo, useCallback} from 'react'
import DeckGL from '@deck.gl/react'
import {OrthographicView, OrbitView, LinearInterpolator} from '@deck.gl/core'
import GraphLayer from '../../layers/GraphLayer'
import GraphLayerProps from '../../layers/GraphLayerProps'
import RendererProps from './RendererProps'
import EventHandlers from '../../layers/EventHandlers'
import {createMultipleLayers} from '../../layers/EdgeLayer'

import NodeView from '../../models/NodeView'
import EdgeView from '../../models/EdgeView'
import GraphView from '../../models/GraphView'
import CommandProxy from './CommandProxy'
import {getArea, SpatialIndices, initSpatialIndex} from '../../utils/selection-util'
import {Bounds, getBounds} from '../../utils/bounds-util'
import {DEF_EVENT_HANDLER} from './EventHandlers'

// Background color when it is not available
const DEF_BG_COLOR = '#555555'

// Padding to be used when executing fit function
const PADDING = 50

// Style for the area for network view
const baseStyle = {
  backgroundColor: DEF_BG_COLOR,
  position: 'relative'
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
const LargeGraphRenderer: VFC<RendererProps> = ({
  graphView,
  render3d,
  onNodeClick,
  onEdgeClick,
  onBackgroundClick,
  onNodeMouseover,
  onEdgeMouseover,
  onSelect,
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
    const {nodeViews} = graphView
    const nodeViewList: NodeView[] = [...nodeViews.values()]

    const bounds: Bounds = getBounds(nodeViewList)
    setBounds(bounds)

    fitContent2()
    commandProxy(proxy)
  }

  const handleResize = (): void => {
    if (bounds !== null) {
      const bounds: Bounds = getBounds(nodeViewList)
      setBounds(bounds)
    }
  }

  baseStyle.backgroundColor = backgroundColor

  const [disableClick, setDisableClick] = useState<boolean>(false)
  //
  const [dataUpdated, setDataUpdated] = useState<boolean>(false)
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set<string>())
  const [selectedEdges, setSelectedEdges] = useState<Set<string>>(new Set<string>())
  // For performance, show/hide edges/labels dynamically

  const [showEdges, setShowEdges] = useState(true)
  const [showLabels, setShowLabels] = useState(false)
  const [edgeLayerDepth, setEdgeLayerDepth] = useState(1)

  const [selectionStart, setSelectionStart] = useState<[number, number]>([0, 0])
  const [selectionPoint, setSelectionPoint] = useState<[number, number]>([0, 0])
  const [selectionBounds, setSelectionBounds] = useState<[number, number, number, number] | null>(
    null
  )

  // const [isBoxSelection, setIsBoxSelection] = useState<boolean>(false)

  const [isShiftDown, setIsShiftDown] = useState<boolean>(false)

  const emptyLayers: EdgeView[][] = []
  const [edgeLayerGroups, setEdgeLayerGroups] = useState(emptyLayers)

  const [spatialIndex, setSpatialIndex] = useState(null)
  const [edgeSourceIndex, setEdgeSourceIndex] = useState(null)
  const [edgeTargetIndex, setEdgeTargetIndex] = useState(null)

  useEffect(() => {
    const deckGlRef = deck.current
    if (deckGlRef !== null && deckGlRef !== undefined) {
      setDeckRef(deckGlRef)
    }
  }, [deck])

  // Executed once after initialization
  useEffect(() => {
    // Create layer groups here.
    const {edgeViews} = graphView
    const edgeViewList = edgeViews === undefined ? [] : edgeViews.values()

    const eLayers = createMultipleLayers([...edgeViewList])

    setEdgeLayerGroups(eLayers)

    // Watch keyup event for selection
    addEventListener('keydown', _handleKeyDown)
    addEventListener('keyup', _handleKeyUp)
  }, [])

  const _handleViewStateChange = (state): void => {
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
      onEdgeMouseover === undefined ? DEF_EVENT_HANDLER.onEdgeMouseover : onEdgeMouseover,
    onSelect:
      onSelect === undefined ? DEF_EVENT_HANDLER.onSelect : onSelect
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
    multipleSelection: isShiftDown,
    selectedNodes: selectedNodes,
    selectedEdges: selectedEdges,
    updated: dataUpdated,
    disableClick
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

  const _handleKeyDown = (event) => {
    console.log('Key DOWN', event)
    if (event.key === 'Shift') {
      setIsShiftDown(true)
    }
  }

  const _handleKeyUp = (event) => {
    console.log('Key UP', event)
    if (event.key === 'Shift') {
      setIsShiftDown(false)
    }
  }

  const _handleBoxSelect = () => {}

  return (
    <DeckGL
      ref={deck}
      width="100%"
      height="100%"
      style={baseStyle}
      initialViewState={initialViewState2}
      controller={true}
      views={view}
      layers={layers}
      onDragStart={(info) => {
        setDisableClick(true)
        if (!isShiftDown) {
          return
        }
        const startPoint: [number, number] = info.coordinate
        setSelectionStart(startPoint)
        setSelectionPoint([info.x, info.y])
      }}
      onDrag={(info, event) => {
        if (!isShiftDown) {
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
        setDisableClick(false)

        if (!isShiftDown) {
          return
        }
        const x1: number = selectionPoint[0]
        const y1: number = selectionPoint[1]
        const x2: number = info.x
        const y2: number = info.y

        const area = getArea(x1, y1, x2, y2)
        const {x, y, width, height} = area

        const {viewport} = info
        const {nodeViews, edgeViews} = graphView
        const nvList: NodeView[] = [...nodeViews.values()]
        const evList: EdgeView[] = [...edgeViews.values()]
        const p1 = viewport.unproject([x, y])
        const p2 = viewport.unproject([x + width, y + height])
        let result = spatialIndex.search(p1[0], p1[1], p2[0], p2[1]).map((i) => nvList[i])
        const edgeS = edgeSourceIndex.search(p1[0], p1[1], p2[0], p2[1]).map((i) => evList[i])
        const edgeT = edgeTargetIndex.search(p1[0], p1[1], p2[0], p2[1]).map((i) => evList[i])

        const nodeIds: Set<string> = new Set<string>(result.map((node) => node.id))
        const allEdges: EdgeView[] = [...edgeS, ...edgeT]

        const selectedEdges = new Set()
        allEdges.forEach((e) => {
          if (nodeIds.has(e.s) && nodeIds.has(e.t)) {
            selectedEdges.add(e)
          }
        })
        result = [...result, ...selectedEdges]
        console.log('nodesIN5===', nodeIds, allEdges, result, info)
        // const newSelection = deckRef.pickObjects({x, y, width, height})

        // let selectedLen = newSelection.length
        let selectedLen = result.length
        // console.log('---------->>>>End Selection: end len', selectedLen, x2, y2, area)

        const selectedN = new Set<NodeView>()
        const selectedE = new Set<EdgeView>()
        const nId = new Set<string>()
        const eId = new Set<string>()
        while (selectedLen--) {
          const item = result[selectedLen]
          if (item.position !== undefined) {
            selectedN.add(item)
            nId.add(item.id)
          } else {
            selectedE.add(item)
            eId.add(item.id)
          }
        }
        const nvArray: NodeView[] = [...selectedN]
        const evArray: EdgeView[] = [...selectedE]
        eventHandlers.onSelect(nvArray, evArray)
        
        setSelectedNodes(nId)
        setSelectedEdges(eId)

        // console.log(
        //   '---------->>>>Selected 2',
        //   layerProps.edgeViews,
        //   selectedNodeIds,
        //   selectedEdgeIds
        //   // newSelection
        // )
        setSelectionBounds(null)
        setIsShiftDown(false)

        // Set dirty flag
        setDataUpdated(!dataUpdated)
      }}
      onViewStateChange={(state) => {
        _handleViewStateChange(state)
      }}
      onClick={(layer, object) => {
        _handleClick(layer, object)

        setShowLabels(false)
        setSelectionBounds(null)
        setSelectedNodes(new Set<string>())
        setSelectedEdges(new Set<string>())

        // Toggle flag to clear selection in the view
        setDataUpdated(!dataUpdated)
      }}
      onDblClick={(layer, object) => {
        console.log('## DBL:', layer, object)
        setSelectionBounds(null)
      }}
      onResize={(size) => {
        handleResize()
      }}
      onLoad={() => {
        console.log('------------------ Loaded ------------', graphView)
        const indices: SpatialIndices = initSpatialIndex(graphView, nodeViews)
        setSpatialIndex(indices.nodeIndex)
        setEdgeSourceIndex(indices.edgeSourceIndex)
        setEdgeTargetIndex(indices.edgeTargetIndex)

        handleLoad(deckRef, graphView)
      }}
      onAfterRender={() => {}}
    >
      {({x, y, width, height, viewState, viewport}) => {}}
    </DeckGL>
  )
}

export default LargeGraphRenderer
