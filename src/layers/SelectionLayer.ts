import {PolygonLayer} from '@deck.gl/layers'

const getBounds = (bound: [number, number, number, number] | null) => {
  if (bound === null) {
    return [
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0]
    ]
  } else {
    return [
      [bound[0], bound[1]],
      [bound[0], bound[3]],
      [bound[2], bound[3]],
      [bound[2], bound[1]]
    ]
  }
}

const createSelectionLayer = (points: [number, number, number, number]) => {
  return new PolygonLayer({
    id: 'polygon-layer',
    data: [
      {
        bound: getBounds(points)
      }
    ],
    pickable: true,
    stroked: true,
    filled: true,
    wireframe: true,
    lineWidthMinPixels: 1,
    getPolygon: (d) => d.bound,
    getElevation: 0,
    getFillColor: [200, 0, 0, 150],
    getLineColor: [80, 80, 80],
    getLineWidth: 1
  })
}

export {createSelectionLayer}
