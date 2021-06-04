import NodeView from '../models/NodeView'
import EdgeView from '../models/EdgeView'
import EventHandlers from './EventHandlers'

type GraphLayerProps = {
  nodeViews: NodeView[]
  nodeViewMap: Map<string, NodeView>
  edgeViews: EdgeView[][]
  showEdges: boolean
  showLabels: boolean
  edgeLayerDepth: number
  render3d: boolean
  eventHandlers: EventHandlers
  nodePickable?: boolean
  edgePickable?: boolean
  bounds: [number, number, number, number] | null
  multipleSelection: boolean
  selectedNodes: Set<string>
  selectedEdges: Set<string>
  test: boolean
}

export default GraphLayerProps
