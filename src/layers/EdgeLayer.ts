import {LineLayer, ArcLayer} from '@deck.gl/layers'

import EdgeView from '../models/EdgeView'
import NodeView from '../models/NodeView'

const create2DLayer = (
  edgeViews: EdgeView[],
  nodeViewMap: Map<string, NodeView>,
  showEdges: boolean,
  pickable: boolean
): object =>
  new LineLayer({
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
    getColor: (e) => (e.color ? e.color : [100, 100, 100, 200]),
    strokeWidth: (e: EdgeView) => (e.width ? e.width : 1),
    visible: showEdges,
    pickable,
    widthScale: 1,
    autoHighlight: true,
    highlightColor: [255, 0, 0]
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
    highlightColor: [255, 0, 0]
  })

const createEdgeLayer = (edgeViews: EdgeView[], nodeViewMap, render3d, showEdges, pickable) => {
  if (render3d) {
    return create3DLayer(edgeViews, nodeViewMap, showEdges, pickable)
  } else {
    return create2DLayer(edgeViews, nodeViewMap, showEdges, pickable)
  }
}

export {createEdgeLayer}
