import NodeView from '../models/NodeView'

export type Bounds = {
  minX: number
  minY: number
  maxX: number
  maxY: number
}

export const getBounds = (nodeViews: NodeView[]): Bounds => {
  let minX: number = Number.POSITIVE_INFINITY
  let minY: number = Number.POSITIVE_INFINITY
  let maxX: number = Number.NEGATIVE_INFINITY
  let maxY: number = Number.NEGATIVE_INFINITY

  let idx: number = nodeViews.length
  while (idx--) {
    const nv: NodeView = nodeViews[idx]
    const x = nv.position[0]
    const y = nv.position[1]

    if (x <= minX) {
      minX = x
    }
    if (y <= minY) {
      minY = y
    }
    if (x >= maxX) {
      maxX = x
    }
    if (y >= maxY) {
      maxY = y
    }
  }

  const newBounds: Bounds = {
    minX,
    minY,
    maxX,
    maxY
  }

  return newBounds
}
