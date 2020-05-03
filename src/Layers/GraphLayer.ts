import {CompositeLayer} from '@deck.gl/core'
import {createNodeLayer} from './NodeLayer'
import {createEdgeLayer} from './EdgeLayer'
import {createLabelLayer} from './LabelLayer'
import EdgeView from '../model/EdgeView'

const HIGHLIGHT_COLOR = [255, 0, 0, 255]

const _handleSelectNode = (selection) => {
  console.log('**Update node selection:', selection)
}

const getLayers = (edgeViews) => {
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

class GraphLayer extends CompositeLayer {
  constructor(props) {
    super(props)
  }

  getPickingInfo(pickingInfo) {
    const {mode, info} = pickingInfo
    const {setSelectedNode, setSelectedEdge} = super.props
    if (mode === 'query') {
      console.log('Selection::', pickingInfo)
      setSelectedNode(info.object)
      setSelectedEdge(info.object)
    }
  }

  renderLayers() {
    const {graphView, showEdges, showLabels, render3d} = super.props
    const {nodeViews, edgeViews} = graphView

    const t0 = performance.now()

    const nodeLayer = createNodeLayer(nodeViews)
    const nodeLabelLayer = createLabelLayer(nodeViews, showLabels)

    const eLayers = getLayers(edgeViews)
    const edgeLayer = createEdgeLayer(eLayers[0], nodeViews, render3d, showEdges)

    console.log('Graph Layer created.  E count = ', edgeViews.size, performance.now() - t0)
    return [edgeLayer, nodeLayer, nodeLabelLayer]
  }
}

export default GraphLayer
