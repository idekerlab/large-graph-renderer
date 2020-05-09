import GraphView from '../models/GraphView'
import EventHandlers from './EventHandlers'

type GraphLayerProps = {
  graphView: GraphView
  showEdges: boolean
  showLabels: boolean
  render3d: boolean
  eventHandlers: EventHandlers
}

export default GraphLayerProps
