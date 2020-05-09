import NodeView from './NodeView'
import EdgeView from './EdgeView'

/**
 * Base graph view model
 */
type GraphView = {
  name?: string
  nodeViews: Map<string, NodeView>
  edgeViews?: Map<string, EdgeView>
}

export default GraphView
