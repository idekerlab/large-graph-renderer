import GraphView from '../../model/GraphView'

interface RendererProps {
  setSelectedNode: Function
  setSelectedEdge: Function
  graphView: GraphView | null
  render3d: boolean
}

export default RendererProps
