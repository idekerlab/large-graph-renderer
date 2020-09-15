import {CompositeLayer, LayerProps} from '@deck.gl/core'
import {createNodeLayer} from './NodeLayer'
import {createEdgeLayer} from './EdgeLayer'
import {createLabelLayer} from './LabelLayer'
import GraphLayerProps from './GraphLayerProps'

// const getLayers = (edgeViews: EdgeView[]): EdgeView[] => {
//   const edgeCount = edgeViews.length
//   const evs = [...edgeViews.values()]

//   let idx = 0

//   const layer1: EdgeView[] = []
//   const layer2: EdgeView[] = []

//   while (idx < edgeCount) {
//     const ev = evs[idx]
//     if (idx % 2 === 0) {
//       layer1.push(ev)
//     } else {
//       layer2.push(ev)
//     }
//     idx++
//   }
//   return [layer1, layer2]
// }

const selected = ''

class GraphLayer extends CompositeLayer<GraphLayerProps> {
  constructor(props: GraphLayerProps) {
    super(props)
  }

  onClick(info) {
    console.log('22Graph Click+++++++++++++++++', info)
    return info
  }

  getPickingInfo(pickingInfo) {
    const currentProps = this['props']
    const {mode, info} = pickingInfo

    // @ts-ignore
    const {onNodeClick, onEdgeClick} = currentProps.eventHandlers

    if (mode === 'query') {
      // console.log('* Click: Query obj = ', info.object)
      const isNode = info.object.position ? true : false

      console.log()
      if (isNode) {
        onNodeClick(info.object)
        info.object.selected = true
      } else {
        onEdgeClick(info.object)
        info.object.selected = true
      }
    } else {
      // @ts-ignore
      this.props.eventHandlers.onNodeMouseover(info)
    }
    return info
  }

  renderLayers(): any[] {
    // @ts-ignore
    const {graphView, showEdges, showLabels, render3d} = this.props
    const {nodeViews, edgeViews} = graphView
    const nodeLayer = createNodeLayer([...nodeViews.values()])
    const nodeLabelLayer = createLabelLayer(nodeViews, showLabels)
    const edgeLayer = createEdgeLayer([...edgeViews.values()], nodeViews, render3d, showEdges)

    return [edgeLayer, nodeLayer, nodeLabelLayer]
  }
}

export default GraphLayer
