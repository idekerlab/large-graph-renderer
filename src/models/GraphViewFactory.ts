import NodeView from './NodeView'
import EdgeView from './EdgeView'
import GraphView from './GraphView'
import ViewModel from './ViewModel'

const createViewMap = <T extends ViewModel>(views: T[]): Map<string, T> => {
  const viewMap = new Map<string, T>()

  let idx = views.length
  while (idx--) {
    const v: T = views[idx]
    if (v !== null) {
      viewMap.set(v.id, v)
    }
  }
  return viewMap
}

/**
 * View model factory for the entire graph
 */
class GraphViewFactory {
  static createGraphView = (nodeViews, edgeViews): GraphView => {
    const nvMap = createViewMap<NodeView>(nodeViews)
    const evMap = createViewMap<EdgeView>(edgeViews)

    const gv: GraphView = {
      nodeViews: nvMap,
      edgeViews: evMap
    }
    return gv
  }
}

export default GraphViewFactory
