import {LayerProps, LineLayer, ArcLayer} from '@deck.gl/layers'
import EdgeView from '../model/EdgeView'
import NodeView from '../model/NodeView'

const get2DLayer = (
  edgeViews: EdgeView[],
  nodeViewMap: Map<string, NodeView>,
  showEdges: boolean
) =>
  new LineLayer({
    id: `edge-layer`,
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
    getColor: (e) => e.color,
    strokeWidth: 1,
    visible: showEdges,
    pickable: true,
    widthScale: 2,
    autoHighlight: true,
    highlightColor: [255, 0, 0]
  })

const get3DLayer = (
  edgeViews: EdgeView[],
  nodeViewMap: Map<string, NodeView>,
  showEdges: boolean
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
    strokeWidth: 1,
    visible: showEdges,
    pickable: true,
    widthScale: 1,
    autoHighlight: true,
    highlightColor: [255, 0, 0]
  })

const createEdgeLayer = (edgeViews: EdgeView[], nodeViewMap, render3d, showEdges) => {
  if (render3d) {
    return get3DLayer(edgeViews, nodeViewMap, showEdges)
  } else {
    return get2DLayer(edgeViews, nodeViewMap, showEdges)
  }
}

export {createEdgeLayer}
