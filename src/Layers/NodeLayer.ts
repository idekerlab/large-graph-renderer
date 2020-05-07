import {ScatterplotLayer} from '@deck.gl/layers'
import NodeView from '../model/NodeView'

const DEFAULTS = {
  highlightColor: [255, 0, 0],
  radiusScale: 0.05,
  radiusMinPixels: 1,
  radiusMaxPixels: 100
}

const createNodeLayer = (nodeViewMap: Map<string, NodeView>): object => {
  const nodeViews: NodeView[] = Array.from(nodeViewMap.values())

  return new ScatterplotLayer({
    data: nodeViews,
    getPosition: (d: NodeView): number[] => [d.position[0], d.position[1]],
    getColor: (d: NodeView): [number, number, number, number?] | undefined => d.color,
    getRadius: (d: NodeView): number => (d.size ? d.size : 1),
    pickable: true,
    autoHighlight: true,
    highlightColor: DEFAULTS.highlightColor,
    radiusScale: DEFAULTS.radiusScale,
    radiusMinPixels: DEFAULTS.radiusMinPixels,
    radiusMaxPixels: DEFAULTS.radiusMaxPixels
  })
}

export {createNodeLayer}
