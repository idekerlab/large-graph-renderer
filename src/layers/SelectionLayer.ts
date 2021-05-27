import {PolygonLayer} from '@deck.gl/layers'

const data = [
  {
    bound: [
      [0, 0],
      [0, 500],
      [500, 500],
      [500, 0]
    ]
  }
]
const createSelectionLayer = () => {
  return new PolygonLayer({
    id: 'polygon-layer',
    data,
    pickable: true,
    stroked: true,
    filled: true,
    wireframe: false,
    lineWidthMinPixels: 1,
    getPolygon: (d) => d.bound,
    getElevation: 0,
    getFillColor: [100, 0, 0, 100],
    getLineColor: [80, 80, 80],
    getLineWidth: 1
  })
}

export {createSelectionLayer}
