import GraphView from '../../model/GraphView'

interface RendererProps {
  graphView: GraphView
  setSelectedNode: Function
  setSelectedEdge: Function
  render3d?: boolean
  onNodeClick?: Function
  onEdgeClick?: Function
  onBackgroundClick?: Function
  onNodeMouseover?: Function
  onEdgeMouseover?: Function
}

export default RendererProps
