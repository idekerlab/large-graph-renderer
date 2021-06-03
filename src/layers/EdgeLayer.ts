import {LineLayer, ArcLayer} from '@deck.gl/layers'

import EdgeView from '../models/EdgeView'
import NodeView from '../models/NodeView'

const create2DLayer = (
  edgeViews: EdgeView[],
  nodeViewMap: Map<string, NodeView>,
  showEdges: boolean,
  pickable: boolean,
  selectedEdges: Set<string>
): object =>
  new LineLayer({
    id: 'edge-layer',
    data: edgeViews,
    getSourcePosition: (e: EdgeView) => {
      const s = nodeViewMap.get(e.s)
      if (!s) {
        return [0, 0, 0]
      }
      return [s.position[0], s.position[1]]
    },
    getTargetPosition: (e: EdgeView) => {
      const t = nodeViewMap.get(e.t)
      if (!t) {
        return [0, 0, 0]
      }
      return [t.position[0], t.position[1]]
    },

    getColor: (e) => (selectedEdges.has(e.id) ? [255, 50, 50, 250] : [100, 100, 100, 150]),
    updateTriggers: {
      getColor: edgeViews ? edgeViews[0] : null
      // getColor: selectedEdges
    },
    strokeWidth: (e: EdgeView) => (e.width ? e.width : 0.7),
    visible: showEdges,
    pickable,
    widthScale: 1,
    autoHighlight: true,
    highlightedObjectIndex: 1,
    highlightColor: [0, 255, 0]
  })

const create3DLayer = (
  edgeViews: EdgeView[],
  nodeViewMap: Map<string, NodeView>,
  showEdges: boolean,
  pickable: boolean
) =>
  new ArcLayer({
    id: `edge-layer-3d`,
    data: edgeViews,

    getSourcePosition: (e: EdgeView) => {
      const s = nodeViewMap.get(e.s)
      if (!s) {
        return [0, 0, 0]
      }
      return [s.position[0], s.position[1]]
    },
    getTargetPosition: (e: EdgeView) => {
      const t = nodeViewMap.get(e.t)
      if (!t) {
        return [0, 0, 0]
      }
      return [t.position[0], t.position[1]]
    },
    getSourceColor: (e) => e.color,
    getTargetColor: (e) => e.color,
    strokeWidth: 0.1,
    visible: showEdges,
    pickable,
    widthScale: 0.1,
    autoHighlight: true,
    highlightColor: [0, 255, 0]
  })

const createEdgeLayers = (
  edgeViews: EdgeView[][],
  nodeViewMap,
  render3d: boolean,
  showEdges: boolean,
  pickable: boolean,
  depth: number,
  selectedEdges: Set<string>
): object[] => {
  if (render3d) {
    const layers3D = [create3DLayer(edgeViews[0], nodeViewMap, showEdges, pickable)]
    return layers3D
  } else {
    const layers: object[] = []
    edgeViews.forEach((viewGroup: EdgeView[]) => {
      const newLayer = create2DLayer(viewGroup, nodeViewMap, showEdges, pickable, selectedEdges)
      layers.push(newLayer)
    })
    return layers
  }
}

const createMultipleLayers = (edgeViews: EdgeView[]): EdgeView[][] => {
  let idx = edgeViews.length
  const layers: EdgeView[][] = []

  while (idx--) {
    const ev = edgeViews[idx]
    const layerId: number | undefined = ev.layer
    if (layerId === undefined) {
      let defLayer = layers[0]
      if (defLayer === undefined) {
        defLayer = [ev]
        layers[0] = defLayer
      } else {
        defLayer.push(ev)
      }
    } else {
      let targetLayer = layers[layerId.toString()]
      if (targetLayer === undefined) {
        targetLayer = [ev]
        layers[layerId.toString()] = targetLayer
      } else {
        targetLayer.push(ev)
      }
    }
  }

  console.log('************ Layers:', layers)

  return layers
}

export {createEdgeLayers, createMultipleLayers}
