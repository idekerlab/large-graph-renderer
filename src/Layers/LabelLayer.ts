import {TextLayer} from '@deck.gl/layers'

import NodeView from '../models/NodeView'
import EdgeView from '../models/EdgeView'

const createLabelLayer = (nodeViewMap: Map<string, NodeView>, showLabels: boolean): object => {
  const nodeViews: NodeView[] = Array.from(nodeViewMap.values())

  return new TextLayer({
    id: 'text-layer',
    data: nodeViews,
    pickable: false,
    getPosition: (d: NodeView) => [d.position[0], d.position[1]],
    getText: (d) => d.label,
    getSize: (d) => d.fontSize,
    getColor: [250, 250, 250, 200],
    getAngle: 0,
    sizeScale: 1,
    sizeMinPixels: 3,
    getTextAnchor: 'middle',
    getAlignmentBaseline: 'center',
    visible: showLabels
  })
}

export {createLabelLayer}
