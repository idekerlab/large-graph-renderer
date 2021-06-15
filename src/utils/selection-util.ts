import GraphView from '../models/GraphView'
import NodeView from '../models/NodeView'
import EdgeView from '../models/EdgeView'
import Flatbush from 'flatbush'

type Area = {
  x: number
  y: number
  width: number
  height: number
}

export const getArea = (startX: number, startY: number, endX: number, endY: number): Area => {
  const positions: [number, number, number, number] = getPoints(startX, startY, endX, endY)
  const xLeftTop = positions[0]
  const yLeftTop = positions[1]
  const xRightBottom = positions[2]
  const yRightBottom = positions[3]

  const width: number = Math.abs(xRightBottom - xLeftTop)
  const height: number = Math.abs(yRightBottom - yLeftTop)

  const area: Area = {x: xLeftTop, y: yLeftTop, width, height}

  return area
}

const getPoints = (
  startX: number,
  startY: number,
  endX: number,
  endY: number
): [number, number, number, number] => {
  if (startX < endX && startY < endY) {
    console.log('!!!base select:', startX, startY, endX, endY)
    return [startX, startY, endX, endY]
  } else if (startX < endX && startY > endY) {
    console.log('!!!base select case2:', startX, startY, endX, endY)
    return [startX, endY, endX, startY]
  } else if (startX > endX && startY > endY) {
    console.log('!!!base select case3:', startX, startY, endX, endY)
    return [endX, endY, startX, startY]
  } else {
    console.log('!!!base select case4:', startX, startY, endX, endY)
    return [endX, startY, startX, endY]
  }
}

export type SpatialIndices = {
  nodeIndex: any
  edgeSourceIndex: any
  edgeTargetIndex: any
}

export const initSpatialIndex = (
  graphView: GraphView,
  nodeViewMap: Map<string, NodeView>
): SpatialIndices => {
  const {nodeViews, edgeViews} = graphView
  const nodeViewList: NodeView[] = [...nodeViews.values()]
  const edgeViewList: EdgeView[] = [...edgeViews.values()]

  const nodeIndex = initNodeIndex(nodeViewList)
  const edgeIndices = initEdgeIndex(nodeViewMap, edgeViewList)

  const indices: SpatialIndices = {
    nodeIndex,
    edgeSourceIndex: edgeIndices[0],
    edgeTargetIndex: edgeIndices[1]
  }

  return indices
}

const initNodeIndex = (nodeViews: NodeView[]): any => {
  const numNodes = nodeViews.length
  // Spatial Index
  const index = new Flatbush(numNodes)

  for (let i = 0; i < numNodes; i++) {
    const nv: NodeView = nodeViews[i]
    const x: number = nv.position[0]
    const y: number = nv.position[1]
    const size: number = nv.size
    const delta: number = size / 2
    index.add(x - delta, y - delta, x + delta, y + delta)
  }
  index.finish()

  return index
}

const initEdgeIndex = (
  nodeViewMap: Map<string, NodeView>,
  edgeViews: EdgeView[]
): [any, any] => {
  const numEdges = edgeViews.length
  // Spatial Index
  const sIndex = new Flatbush(numEdges)
  const tIndex = new Flatbush(numEdges)

  for (let i = 0; i < numEdges; i++) {
    const ev: EdgeView = edgeViews[i]
    const sourceNodeId = ev.s
    const targetNodeId = ev.s
    const sourceNode: NodeView = nodeViewMap.get(sourceNodeId)
    const targetNode: NodeView = nodeViewMap.get(targetNodeId)
    const sx: number = sourceNode.position[0]
    const sy: number = sourceNode.position[1]
    const tx: number = targetNode.position[0]
    const ty: number = targetNode.position[1]
    sIndex.add(sx, sy, sx, sy)
    tIndex.add(tx, ty, tx, ty)
  }
  sIndex.finish()
  tIndex.finish()

  return [sIndex, tIndex]
}
