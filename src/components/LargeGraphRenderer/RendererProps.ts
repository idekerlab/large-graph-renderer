import GraphView from '../../models/GraphView'

interface RendererProps {
  // Graph view data
  graphView: GraphView

  // Optional: Rendering mode (2D or 3D)
  render3d?: boolean

  // Optional: Event Handlers
  onNodeClick?: Function
  onEdgeClick?: Function
  onBackgroundClick?: Function
  onNodeMouseover?: Function
  onEdgeMouseover?: Function

  // TODO: how should this handle command, such as "fit content??"

  //taskRunner?: object

  // Optional: Background color for the network
  backgroundColor?: string

  // Optional: pickable or not
  pickable?: boolean
}

export default RendererProps
