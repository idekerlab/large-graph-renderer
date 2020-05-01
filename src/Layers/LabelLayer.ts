import {TextLayer} from '@deck.gl/layers'

import NodeView from '../model/NodeView'


const createLabelLayer = (nodeViewMap: Map<string, NodeView>, showLabels: boolean) => {
  const nodeViews: NodeView[] = Array.from(nodeViewMap.values())

  return new TextLayer({
    id: 'text-layer',
    data: nodeViews,
    pickable: false,
    getPosition: d => [d.position[0], d.position[1]],
    getText: d => d.label,
    getSize: 12,
    getColor: [250, 250, 250, 200],
    getAngle: 0,
    sizeScale: 2,
    sizeMinPixels: 3,
    getTextAnchor: 'middle',
    getAlignmentBaseline: 'center',
    visible: showLabels
  })
}

export {createLabelLayer}
