import {ScatterplotLayer} from '@deck.gl/layers'
import NodeView from '../models/NodeView'

const DEFAULTS = {
  highlightColor: [255, 0, 0],
  radiusScale: 0.1,
  radiusMinPixels: 1,
  radiusMaxPixels: 1200
}

/**
 * Create new
 *
 * @param nodeViewMap - Key-value pair for node views.  Key is ID of view
 */
const createNodeLayer = (nodeViews: NodeView[], pickable = true): object => {
  return new ScatterplotLayer({
    id: 'node-layer',
    data: nodeViews,
    getPosition: (d: NodeView): number[] => [d.position[0], d.position[1]],
    getColor: (d: NodeView): [number, number, number, number?] | undefined =>
      d.selected ? [0, 0, 255, 255] : d.color,
    getRadius: (d: NodeView): number => (d.size ? d.size : 1),
    pickable,
    updateTriggers: {
      getColor: nodeViews ? nodeViews[0] : null
    },
    autoHighlight: true,
    highlightColor: DEFAULTS.highlightColor,
    radiusScale: DEFAULTS.radiusScale,
    radiusMinPixels: DEFAULTS.radiusMinPixels,
    radiusMaxPixels: DEFAULTS.radiusMaxPixels
  })
}

export {createNodeLayer}
