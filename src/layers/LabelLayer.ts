import {TextLayer} from '@deck.gl/layers'

import NodeView from '../models/NodeView'

const createLabelLayer = (nodeViewMap: Map<string, NodeView>, showLabels: boolean): object => {
  const nodeViews: NodeView[] = Array.from(nodeViewMap.values())

  return new TextLayer({
    id: 'text-layer',
    data: nodeViews,
    pickable: false,
    getPosition: (d: NodeView) => [d.position[0], d.position[1]],
    getText: (d) => d.label,
    getSize: (d) => d.labelFontSize,
    getColor: (d: NodeView): [number, number, number, number?] =>
      d.labelColor ? d.labelColor : [0, 0, 0],
    getAngle: 0,
    sizeScale: 1,
    sizeMinPixels: 10,
    getTextAnchor: 'middle',
    getAlignmentBaseline: 'center',
    visible: showLabels
  })
}

export {createLabelLayer}
