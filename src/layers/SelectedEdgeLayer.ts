import {LineLayer, ArcLayer} from '@deck.gl/layers'

import EdgeView from '../models/EdgeView'
import NodeView from '../models/NodeView'

const createSelectedEdgeLayer = (
  edgeViews: EdgeView[],
  nodeViewMap: Map<string, NodeView>,
  showEdges: boolean,
  pickable: boolean,
  selectedEdges: Set<string>,
  test: boolean
): any =>
  new LineLayer({
    id: 'selected-edge-layer',
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

    getColor: (e: EdgeView) => (test ? [255, 2, 2, 255] : [0, 0, 200, 20]),
    updateTriggers: {
      getColor: selectedEdges
    },
    getWidth: (e: EdgeView) => (test ? 1 : 12),
    visible: showEdges,
    pickable,
    widthScale: 1,
    autoHighlight: true,
    highlightColor: [255, 5, 0]
  })

export {createSelectedEdgeLayer}
