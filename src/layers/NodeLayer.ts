import {ScatterplotLayer} from '@deck.gl/layers'
import NodeView from '../models/NodeView'

const DEFAULTS = {
  highlightColor: [255, 0, 0],
  radiusScale: 0.05,
  radiusMinPixels: 1,
  radiusMaxPixels: 100
}

/**
 * Create new
 *
 * @param nodeViewMap - Key-value pair for node views.  Key is ID of view
 */
const createNodeLayer = (nodeViews: NodeView[]): object => {
  return new ScatterplotLayer({
    data: nodeViews,
    getPosition: (d: NodeView): number[] => [d.position[0], d.position[1]],
    getColor: (d: NodeView): [number, number, number, number?] | undefined =>
      d.selected ? [0, 0, 255, 255] : d.color,
    getRadius: (d: NodeView): number => (d.size ? d.size : 1),
    pickable: true,
    updateTriggers: {
      getColor: nodeViews ? nodeViews[0] : null
    },
    // autoHighlight: true,
    highlightColor: DEFAULTS.highlightColor,
    radiusScale: DEFAULTS.radiusScale,
    radiusMinPixels: DEFAULTS.radiusMinPixels,
    radiusMaxPixels: DEFAULTS.radiusMaxPixels
  })
}

export {createNodeLayer}
