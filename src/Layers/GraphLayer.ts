import {CompositeLayer, LayerProps} from '@deck.gl/core'
import {createNodeLayer} from './NodeLayer'
import {createEdgeLayer} from './EdgeLayer'
import {createLabelLayer} from './LabelLayer'
import EdgeView from '../model/EdgeView'
import GraphView from '../model/GraphView'
import GraphLayerProps from './GraphLayerProps'

const getLayers = (edgeViews: EdgeView[]): EdgeView[] => {
  const edgeCount = edgeViews.size
  const evs = [...edgeViews.values()]

  let idx = 0

  const layer1: EdgeView[] = []
  const layer2: EdgeView[] = []

  while (idx < edgeCount) {
    const ev = evs[idx]
    if (idx % 2 === 0) {
      layer1.push(ev)
    } else {
      layer2.push(ev)
    }
    idx++
  }
  return [layer1, layer2]
}

class GraphLayer extends CompositeLayer<GraphLayerProps> {
  constructor(props: GraphLayerProps) {
    super(props)
    console.log('PROPS create##########', props, super.props, this)
  }

  getPickingInfo(pickingInfo): void {
    const {mode, info} = pickingInfo

    // @ts-ignore
    const {setSelectedNode, setSelectedEdge} = this.props
    if (mode === 'query') {
      console.log('Selection::', pickingInfo)
      setSelectedNode(info.object)
      setSelectedEdge(info.object)
    }
  }

  renderLayers(): any[] {
    // @ts-ignore
    const {graphView, showEdges, showLabels, render3d} = this.props
    const {nodeViews, edgeViews} = graphView

    const t0 = performance.now()
    const nodeLayer = createNodeLayer(nodeViews)
    const nodeLabelLayer = createLabelLayer(nodeViews, showLabels)

    // const eLayers = getLayers(edgeViews)
    const edgeLayer = createEdgeLayer([...edgeViews.values()], nodeViews, render3d, showEdges)

    console.log('Graph Layer created.  E count = ', edgeViews.size, performance.now() - t0)
    return [edgeLayer, nodeLayer, nodeLabelLayer]
  }
}

export default GraphLayer
