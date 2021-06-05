import {ScatterplotLayer} from '@deck.gl/layers'
import NodeView from '../models/NodeView'

const DEFAULTS = {
  highlightColor: [255, 0, 0],
  radiusScale: 0.1,
  radiusMinPixels: 1,
  radiusMaxPixels: 1200
}

/**
 * Create new node layer
 *
 * @param nodeViewMap - Key-value pair for node views.  Key is ID of view
 */
const createNodeLayer = (
  nodeViews: NodeView[],
  pickable = true,
  selectedNodes: Set<string>
): object => {
  return new ScatterplotLayer({
    id: 'node-layer',
    data: nodeViews,
    getPosition: (d: NodeView): number[] => [d.position[0], d.position[1]],
    getFillColor: (d: NodeView): [number, number, number, number?] | undefined =>
      selectedNodes.has(d.id) ? [255, 2, 2, 255] : d.color,
    getRadius: (d: NodeView): number => (d.size ? d.size : 3),
    pickable,
    updateTriggers: {
      getFillColor: selectedNodes
    },
    autoHighlight: true,
    highlightColor: DEFAULTS.highlightColor,
    radiusScale: DEFAULTS.radiusScale,
    radiusMinPixels: DEFAULTS.radiusMinPixels,
    radiusMaxPixels: DEFAULTS.radiusMaxPixels
  })
}

export {createNodeLayer}
